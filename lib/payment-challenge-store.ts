/**
 * Payment Challenge Store — Neon / Prisma backend
 *
 * Server-side issuance + lookup of x402 payment challenges, and replay
 * protection via the `used_tx_hashes` table.
 *
 * SECURITY MODEL
 * --------------
 * - Every paid action begins by issuing a challenge bound to:
 *     { nonce, amount, resource, receiver, chain, expiration, user/session }
 * - The client pays on-chain referencing the challenge's nonce/receiver/amount
 *   on the correct chain (token is conveyed at issue time and verified by the
 *   x402-verify layer using the bound (chain, token) tuple).
 * - When the client returns the txHash, the server (a) looks up the challenge
 *   by nonce, (b) confirms it hasn't been consumed or expired, (c) verifies
 *   the on-chain transfer matches the binding, (d) records the txHash in
 *   `used_tx_hashes` in the SAME transaction as marking the challenge consumed
 *   (replay-safe + atomic).
 *
 * Failure-mode bias: fail-closed everywhere. If we cannot prove the payment,
 * we DO NOT execute the paid action.
 *
 * TOKEN BINDING NOTE
 * ------------------
 * The Prisma `PaymentChallenge` model intentionally does NOT carry a token
 * column. The (chain, token) pair is encoded into `resource` as
 * `"<actual-resource>::token=<TOKEN>"` so that token binding survives store
 * round-trips without a schema migration. Helpers `encodeResource` and
 * `decodeResource` are exported for callers that want to read/write the token
 * cleanly.
 *
 * BACK-COMPAT
 * -----------
 * The two prior call shapes both keep working:
 *   1. New shape (spec): `issueChallenge({ amount, resource, receiver, chain, ... })`
 *   2. Legacy shape (used by `lib/x402-verify.ts`):
 *        `issueChallenge({ resource, chain, token, receiver, amount, amountUsd, ... })`
 *        `consumeChallenge(nonce, txHash, chain)`
 *        `getChallenge(nonce)` returns `{ chain, token, receiver, amount, expiresAt, consumedAt }`
 * The legacy `token` and `amountUsd` fields are persisted in `resource` and
 * surfaced back through `getChallenge` for the verify layer.
 */

import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type { Network, Token } from '@/lib/x402';

// ---------------------------------------------------------------------------
// Types — both new (spec) and legacy shapes
// ---------------------------------------------------------------------------

export interface IssueChallengeOptions {
  userId?: string | null;
  sessionId?: string | null;
  amount: string; // big-num as string (token base units)
  resource: string; // resource being paid for
  receiver: string; // expected receiver wallet
  chain: Network | string; // 'mainnet' | 'base' | 'ethereum' | 'polygon' | ...
  /** Optional token binding ('USDC' | 'USDT' | 'DAI'). Encoded into resource. */
  token?: Token;
  /** Optional USD price at issue time. Encoded into resource for audit. */
  amountUsd?: number;
  /** Default 600s (10 min). Legacy callers pass `validitySeconds`. */
  ttlSeconds?: number;
  /** Legacy alias for ttlSeconds — preserved for x402-verify.ts call sites. */
  validitySeconds?: number;
}

export interface PaymentChallenge {
  /** UUID row id. */
  id: string;
  nonce: string;
  userId?: string | null;
  sessionId?: string | null;
  amount: string;
  /** USD price at issue time, if encoded. */
  amountUsd?: number;
  resource: string;
  receiver: string; // lowercased
  chain: Network;
  /** Token binding ('USDC' | 'USDT' | 'DAI'), if encoded at issue time. */
  token?: Token;
  expiresAt: Date;
  consumed: boolean;
  consumedAt?: Date | null;
  consumedTxHash?: string | null;
}

export type ConsumeResult =
  | { ok: true; challenge: PaymentChallenge }
  | {
      ok: false;
      reason:
        | 'replay_detected'
        | 'challenge_not_found'
        | 'challenge_expired'
        | 'challenge_already_consumed'
        | 'consume_failed'
        | 'store_error';
    };

// ---------------------------------------------------------------------------
// Resource encoding helpers (token + amountUsd survive without a schema change)
// ---------------------------------------------------------------------------

const RESOURCE_META_SEP = '::';

export function encodeResource(
  baseResource: string,
  meta: { token?: Token; amountUsd?: number },
): string {
  const parts: string[] = [];
  if (meta.token) parts.push(`token=${meta.token}`);
  if (typeof meta.amountUsd === 'number' && Number.isFinite(meta.amountUsd)) {
    parts.push(`usd=${meta.amountUsd}`);
  }
  if (parts.length === 0) return baseResource;
  return `${baseResource}${RESOURCE_META_SEP}${parts.join('&')}`;
}

export function decodeResource(encoded: string): {
  resource: string;
  token?: Token;
  amountUsd?: number;
} {
  const idx = encoded.indexOf(RESOURCE_META_SEP);
  if (idx === -1) return { resource: encoded };
  const resource = encoded.slice(0, idx);
  const metaStr = encoded.slice(idx + RESOURCE_META_SEP.length);
  const out: { resource: string; token?: Token; amountUsd?: number } = { resource };
  for (const kv of metaStr.split('&')) {
    const [k, v] = kv.split('=');
    if (!k || v === undefined) continue;
    if (k === 'token') out.token = v as Token;
    else if (k === 'usd') {
      const n = Number(v);
      if (Number.isFinite(n)) out.amountUsd = n;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Issue
// ---------------------------------------------------------------------------

/**
 * Issue a fresh challenge. The returned nonce is what the client signs into
 * its on-chain payment reference (or otherwise echoes back when submitting
 * the txHash for verification).
 */
export async function issueChallenge(opts: IssueChallengeOptions): Promise<PaymentChallenge> {
  const nonce = randomBytes(32).toString('hex');
  const ttl = opts.ttlSeconds ?? opts.validitySeconds ?? 600;
  const expiresAt = new Date(Date.now() + ttl * 1000);
  const receiver = opts.receiver.toLowerCase();
  const encodedResource = encodeResource(opts.resource, {
    token: opts.token,
    amountUsd: opts.amountUsd,
  });
  // Defensive: drop non-UUID userIds before handing to Prisma (column is @db.Uuid).
  const userId =
    opts.userId && isUuid(opts.userId) ? opts.userId : null;

  let row;
  try {
    row = await db.paymentChallenge.create({
      data: {
        nonce,
        amount: opts.amount,
        resource: encodedResource,
        receiver,
        chain: opts.chain,
        userId,
        sessionId: opts.sessionId ?? null,
        expiresAt,
      },
    });
  } catch (err) {
    throw new Error(
      `[payment-challenge-store] failed to insert challenge: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const decoded = decodeResource(row.resource);
  return {
    id: row.id,
    nonce: row.nonce,
    userId: row.userId,
    sessionId: row.sessionId,
    amount: row.amount,
    amountUsd: decoded.amountUsd,
    resource: decoded.resource,
    receiver: row.receiver,
    chain: row.chain as Network,
    token: decoded.token,
    expiresAt: row.expiresAt,
    consumed: row.consumed,
    consumedAt: row.consumedAt,
    consumedTxHash: row.consumedTxHash,
  };
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

export async function getChallenge(nonce: string): Promise<PaymentChallenge | null> {
  const row = await db.paymentChallenge.findUnique({ where: { nonce } });
  if (!row) return null;
  const decoded = decodeResource(row.resource);
  return {
    id: row.id,
    nonce: row.nonce,
    userId: row.userId,
    sessionId: row.sessionId,
    amount: row.amount,
    amountUsd: decoded.amountUsd,
    resource: decoded.resource,
    receiver: row.receiver,
    chain: row.chain as Network,
    token: decoded.token,
    expiresAt: row.expiresAt,
    consumed: row.consumed,
    consumedAt: row.consumedAt,
    consumedTxHash: row.consumedTxHash,
  };
}

// ---------------------------------------------------------------------------
// Consume (atomic: mark consumed + register txHash in one transaction)
// ---------------------------------------------------------------------------

/**
 * Atomically consume a challenge against a txHash.
 *
 * Atomic semantics:
 *   - Both the challenge update (`consumed=true`) AND the `used_tx_hashes`
 *     insert happen inside one Prisma transaction.
 *   - If either fails (e.g. replay collision on the UsedTxHash PK), the whole
 *     transaction rolls back — the challenge remains unconsumed, no half-state.
 *
 * Replay safety:
 *   - `UsedTxHash.txHash` is the table PK in `prisma/schema.prisma`. A second
 *     attempt with the same txHash raises Prisma error code P2002 (unique
 *     constraint violation) and we surface it as `replay_detected`.
 *
 * The 3-arg signature `(nonce, txHash, chain)` matches the legacy call site
 * in `lib/x402-verify.ts`; `chain` is optional for new callers because it's
 * pulled from the challenge row anyway.
 */
export async function consumeChallenge(
  nonce: string,
  txHash: string,
  chain?: Network | string,
): Promise<ConsumeResult> {
  const txHashLower = txHash.toLowerCase();

  // Pre-check so we can return rich, distinguishable reasons before risking
  // the atomic transaction.
  const existing = await db.paymentChallenge.findUnique({ where: { nonce } });
  if (!existing) return { ok: false, reason: 'challenge_not_found' };
  if (existing.consumed) return { ok: false, reason: 'challenge_already_consumed' };
  if (existing.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: 'challenge_expired' };
  }
  // (chain mismatch is upstream's responsibility — but we honor it if passed)
  if (chain && existing.chain !== chain) {
    return { ok: false, reason: 'challenge_not_found' };
  }

  try {
    await db.$transaction(
      async (tx) => {
        // (1) Insert into used_tx_hashes FIRST. `txHash` is the PRIMARY KEY of
        //     UsedTxHash in schema.prisma — a second attempt with the same
        //     txHash throws P2002 and aborts the whole transaction (so the
        //     challenge update below never lands either: no half-state).
        await tx.usedTxHash.create({
          data: {
            txHash: txHashLower,
            chain: existing.chain,
            challengeId: existing.id,
          },
        });

        // (2) Conditional update: updateMany filters on `consumed: false` so
        //     a racing consumer that already flipped the flag loses the race
        //     (count === 0 → we throw and roll back the txHash insertion too).
        const upd = await tx.paymentChallenge.updateMany({
          where: { nonce, consumed: false },
          data: {
            consumed: true,
            consumedAt: new Date(),
            consumedTxHash: txHashLower,
          },
        });
        if (upd.count === 0) {
          // No row updated → racing consumer won. Force the transaction to
          // roll back so we don't end up with a usedTxHash row paired with
          // a still-unconsumed challenge.
          throw new RaceLostError();
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (e) {
    if (e instanceof RaceLostError) {
      return { ok: false, reason: 'challenge_already_consumed' };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') return { ok: false, reason: 'replay_detected' };
      if (e.code === 'P2025') return { ok: false, reason: 'challenge_already_consumed' };
    }
     
    console.error('[payment-challenge-store] consume transaction failed', e);
    return { ok: false, reason: 'consume_failed' };
  }

  const decoded = decodeResource(existing.resource);
  return {
    ok: true,
    challenge: {
      id: existing.id,
      nonce,
      userId: existing.userId,
      sessionId: existing.sessionId,
      amount: existing.amount,
      amountUsd: decoded.amountUsd,
      resource: decoded.resource,
      receiver: existing.receiver,
      chain: existing.chain as Network,
      token: decoded.token,
      expiresAt: existing.expiresAt,
      consumed: true,
      consumedAt: new Date(),
      consumedTxHash: txHashLower,
    },
  };
}

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------

/**
 * Optional: prune expired & unconsumed challenges. Cron can call this.
 */
export async function pruneExpiredChallenges(olderThanSeconds = 3600): Promise<number> {
  const cutoff = new Date(Date.now() - olderThanSeconds * 1000);
  const result = await db.paymentChallenge.deleteMany({
    where: {
      expiresAt: { lt: cutoff },
      consumed: false,
    },
  });
  return result.count;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(v: string): boolean {
  return typeof v === 'string' && UUID_RE.test(v);
}

/** Sentinel thrown inside the consume transaction when a racing consumer wins. */
class RaceLostError extends Error {
  constructor() {
    super('payment_challenge_race_lost');
    this.name = 'RaceLostError';
  }
}
