/**
 * x402 On-Chain Verification
 *
 * Performs FULL verification of an x402 payment proof against a server-issued
 * challenge before any paid action runs. This module replaces the old
 * "trust the proof after basic checks" TODO in lib/x402.ts.
 *
 * VERIFICATION CHAIN (fail-closed at every step):
 *   1. Startup config validated (receiver != zero, RPC URLs present).
 *   2. Challenge lookup (must exist, not expired, not consumed).
 *   3. Proof <-> challenge binding (nonce, chain, token, receiver, amount).
 *   4. On-chain tx lookup via JSON-RPC eth_getTransactionByHash.
 *   5. On-chain receipt via eth_getTransactionReceipt (status == 0x1).
 *   6. Tx `to` == ERC-20 token contract OR native receiver (depending on flow).
 *   7. ERC-20 transfer decode: recipient == challenge.receiver,
 *      amount >= challenge.amount. (Reads `Transfer` event log or input data.)
 *   8. Confirmation depth: (latest_block - tx_block) >= MIN_CONFIRMATIONS.
 *   9. Replay protection: txHash MUST be unique across (chain, tx_hash).
 *
 * The on-chain calls use raw JSON-RPC `fetch` — no ethers/viem dependency added.
 *
 * SECURITY: This is high-stakes code. Every condition is explicit, every
 * failure returns a structured reason, no silent passes. Read carefully
 * before modifying.
 */

import { TOKEN_ADDRESSES, type Network, type Token } from '@/lib/x402';
import { consumeChallenge, getChallenge } from '@/lib/payment-challenge-store';

// ---------------------------------------------------------------------------
// Configuration — validated EAGERLY at startup, not lazily per request.
// ---------------------------------------------------------------------------

const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

/** Per-chain RPC endpoints. Populate via env. */
const RPC_URLS: Partial<Record<Network, string | undefined>> = {
  base: process.env.RPC_URL_BASE,
  ethereum: process.env.RPC_URL_MAINNET,
  polygon: process.env.RPC_URL_POLYGON,
};

/** Per-chain canonical receiver addresses (where MNNR receives funds). */
const RECEIVERS: Record<Network, string | undefined> = {
  base: process.env.X402_RECEIVER_ADDRESS_BASE || process.env.X402_RECEIVER_ADDRESS,
  ethereum: process.env.X402_RECEIVER_ADDRESS_ETHEREUM || process.env.X402_RECEIVER_ADDRESS,
  polygon: process.env.X402_RECEIVER_ADDRESS_POLYGON || process.env.X402_RECEIVER_ADDRESS,
};

/** Confirmation depth per chain. L2s are fast-final; L1 needs more depth. */
const MIN_CONFIRMATIONS: Record<Network, number> = {
  base: Number(process.env.X402_CONFIRMATIONS_BASE ?? 1),
  ethereum: Number(process.env.X402_CONFIRMATIONS_ETHEREUM ?? 12),
  polygon: Number(process.env.X402_CONFIRMATIONS_POLYGON ?? 64),
};

/**
 * Eager startup validation. Called once on module init AND can be invoked
 * by route handlers to short-circuit a 503 if anything is misconfigured.
 *
 * In production with PAYMENT_VERIFICATION_ENABLED=true, missing config
 * MUST THROW — better to fail to boot than to serve paid actions blindly.
 */
export interface StartupConfigError {
  message: string;
  field: string;
}

export function validateStartupConfig(opts?: { throwOnError?: boolean }): {
  ok: boolean;
  errors: StartupConfigError[];
} {
  const errors: StartupConfigError[] = [];

  for (const chain of ['base', 'ethereum', 'polygon'] as const) {
    const recv = RECEIVERS[chain];
    if (!recv) {
      errors.push({
        field: `X402_RECEIVER_ADDRESS[_${chain.toUpperCase()}]`,
        message: `receiver address for ${chain} is missing`,
      });
    } else if (recv.toLowerCase() === ZERO_ADDR) {
      errors.push({
        field: `X402_RECEIVER_ADDRESS[_${chain.toUpperCase()}]`,
        message: `receiver address for ${chain} is the zero address — refusing`,
      });
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(recv)) {
      errors.push({
        field: `X402_RECEIVER_ADDRESS[_${chain.toUpperCase()}]`,
        message: `receiver address for ${chain} is not a valid 0x-hex address`,
      });
    }

    if (!RPC_URLS[chain]) {
      errors.push({
        field: `RPC_URL_${chain === 'ethereum' ? 'MAINNET' : chain.toUpperCase()}`,
        message: `RPC URL for ${chain} is missing`,
      });
    }
  }

  if (errors.length > 0 && opts?.throwOnError) {
    throw new Error(
      `[x402-verify] startup config invalid: ${errors.map((e) => `${e.field}: ${e.message}`).join('; ')}`
    );
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Throws on first import if PAYMENT_VERIFICATION_ENABLED is true. Otherwise
 * keeps validation soft so that disabled environments don't crash.
 */
if (process.env.PAYMENT_VERIFICATION_ENABLED === 'true' && process.env.NODE_ENV === 'production') {
  validateStartupConfig({ throwOnError: true });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type VerificationFailureReason =
  | 'verification_disabled'
  | 'tx_not_found'
  | 'tx_not_mined'
  | 'tx_reverted'
  | 'wrong_receiver'
  | 'wrong_token_contract'
  | 'insufficient_amount'
  | 'wrong_chain'
  | 'insufficient_confirmations'
  | 'replay_detected'
  | 'challenge_not_found'
  | 'challenge_expired'
  | 'challenge_already_consumed'
  | 'malformed_tx'
  | 'rpc_error'
  | 'config_error';

export interface VerifyOk {
  ok: true;
  txHash: string;
  blockNumber: number;
  confirmations: number;
  amountPaid: string;
  receiver: string;
  chain: Network;
}

export interface VerifyErr {
  ok: false;
  reason: VerificationFailureReason;
  detail?: string;
}

export type VerifyResult = VerifyOk | VerifyErr;

/**
 * Full verification: challenge binding + on-chain truth + replay-protect.
 *
 * On success the challenge is MARKED CONSUMED and the txHash is registered in
 * `used_tx_hashes`. Caller may now safely execute the paid action.
 */
export async function verifyPaymentOnChain(args: {
  nonce: string;
  txHash: string;
  chain: Network;
}): Promise<VerifyResult> {
  // 0. Production gate.
  if (process.env.PAYMENT_VERIFICATION_ENABLED !== 'true') {
    return { ok: false, reason: 'verification_disabled', detail: 'PAYMENT_VERIFICATION_ENABLED is not true' };
  }

  // 0a. Config recheck (cheap, idempotent).
  const cfg = validateStartupConfig();
  if (!cfg.ok) {
    return {
      ok: false,
      reason: 'config_error',
      detail: cfg.errors.map((e) => `${e.field}: ${e.message}`).join('; '),
    };
  }

  // 1. Challenge lookup.
  const challenge = await getChallenge(args.nonce);
  if (!challenge) return { ok: false, reason: 'challenge_not_found' };
  if (challenge.consumed || challenge.consumedAt) {
    return { ok: false, reason: 'challenge_already_consumed' };
  }
  // expiresAt is a Date from the Prisma-backed store.
  const expiresMs =
    challenge.expiresAt instanceof Date
      ? challenge.expiresAt.getTime()
      : Number(challenge.expiresAt) * 1000;
  if (expiresMs < Date.now()) return { ok: false, reason: 'challenge_expired' };

  // 2. Bind chain.
  if (challenge.chain !== args.chain) {
    return { ok: false, reason: 'wrong_chain', detail: `challenge chain=${challenge.chain}, proof chain=${args.chain}` };
  }

  // 2a. Token binding MUST have been recorded at issue time. The Prisma-backed
  // store encodes it into the resource string; if it's missing we cannot prove
  // which token contract to verify the Transfer against, so fail closed.
  if (!challenge.token) {
    return {
      ok: false,
      reason: 'config_error',
      detail: 'challenge has no token binding; refusing to verify against unknown token contract',
    };
  }

  const txHash = args.txHash.toLowerCase();
  if (!/^0x[0-9a-f]{64}$/.test(txHash)) {
    return { ok: false, reason: 'malformed_tx', detail: 'txHash is not a valid 0x + 64-hex string' };
  }

  // 3. On-chain tx lookup.
  let tx: RpcTx | null;
  let receipt: RpcReceipt | null;
  let latestBlock: number;
  try {
    [tx, receipt, latestBlock] = await Promise.all([
      rpcCall<RpcTx | null>(args.chain, 'eth_getTransactionByHash', [txHash]),
      rpcCall<RpcReceipt | null>(args.chain, 'eth_getTransactionReceipt', [txHash]),
      rpcCall<string>(args.chain, 'eth_blockNumber', []).then((hex) => hexToNumber(hex)),
    ]);
  } catch (e) {
    return { ok: false, reason: 'rpc_error', detail: (e as Error).message };
  }

  if (!tx) return { ok: false, reason: 'tx_not_found' };
  if (!receipt || !receipt.blockNumber) return { ok: false, reason: 'tx_not_mined' };
  if (receipt.status !== '0x1') return { ok: false, reason: 'tx_reverted' };

  // 4. The tx MUST be a call to the token contract for the challenge's token+chain.
  // (challenge.token guaranteed non-null by the binding check above.)
  const expectedTokenContract = TOKEN_ADDRESSES[args.chain][challenge.token!].toLowerCase();
  if (!tx.to || tx.to.toLowerCase() !== expectedTokenContract) {
    return {
      ok: false,
      reason: 'wrong_token_contract',
      detail: `tx.to=${tx.to ?? 'null'}, expected token contract=${expectedTokenContract} (${challenge.token} on ${challenge.chain})`,
    };
  }

  // 5. Decode the ERC-20 Transfer from the receipt logs.
  //    Topic0 = keccak256("Transfer(address,address,uint256)")
  const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  const expectedReceiver = challenge.receiver.toLowerCase();
  const requiredAmount = BigInt(challenge.amount);

  let amountPaid: bigint = BigInt(0);
  let receiverMatchedAny = false;
  let foundTransfer = false;

  for (const log of receipt.logs ?? []) {
    if (!log.topics || log.topics.length < 3) continue;
    if (log.topics[0].toLowerCase() !== TRANSFER_TOPIC) continue;
    if (log.address.toLowerCase() !== expectedTokenContract) continue;

    foundTransfer = true;
    const logReceiver = topicToAddress(log.topics[2]);
    if (logReceiver !== expectedReceiver) continue;

    receiverMatchedAny = true;
    const value = BigInt(log.data); // data is 32-byte big-endian uint256 hex
    amountPaid += value;
  }

  if (!foundTransfer) {
    return {
      ok: false,
      reason: 'malformed_tx',
      detail: `no ERC-20 Transfer log emitted by ${expectedTokenContract}`,
    };
  }
  if (!receiverMatchedAny) {
    return {
      ok: false,
      reason: 'wrong_receiver',
      detail: `no Transfer log paid to challenge receiver ${expectedReceiver}`,
    };
  }
  if (amountPaid < requiredAmount) {
    return {
      ok: false,
      reason: 'insufficient_amount',
      detail: `paid=${amountPaid.toString()}, required=${requiredAmount.toString()}`,
    };
  }

  // 6. Confirmation depth.
  const txBlock = hexToNumber(receipt.blockNumber);
  const confirmations = latestBlock - txBlock + 1;
  const minConf = MIN_CONFIRMATIONS[args.chain];
  if (confirmations < minConf) {
    return {
      ok: false,
      reason: 'insufficient_confirmations',
      detail: `have=${confirmations}, need=${minConf}`,
    };
  }

  // 7. Replay-protect + consume. (consumeChallenge is the atomic gate.)
  const consume = await consumeChallenge(args.nonce, txHash, args.chain);
  if (!consume.ok) {
    if (consume.reason === 'replay_detected') return { ok: false, reason: 'replay_detected' };
    if (consume.reason === 'challenge_expired') return { ok: false, reason: 'challenge_expired' };
    if (consume.reason === 'challenge_not_found') return { ok: false, reason: 'challenge_not_found' };
    if (consume.reason === 'challenge_already_consumed') return { ok: false, reason: 'challenge_already_consumed' };
    return { ok: false, reason: 'rpc_error', detail: 'store_error during consume' };
  }

  return {
    ok: true,
    txHash,
    blockNumber: txBlock,
    confirmations,
    amountPaid: amountPaid.toString(),
    receiver: expectedReceiver,
    chain: args.chain,
  };
}

// ---------------------------------------------------------------------------
// Configured-receiver helper for createPaymentRequest at issue time
// ---------------------------------------------------------------------------

export function getConfiguredReceiver(chain: Network): string {
  const recv = RECEIVERS[chain];
  if (!recv || recv.toLowerCase() === ZERO_ADDR) {
    throw new Error(
      `[x402-verify] X402_RECEIVER_ADDRESS for ${chain} is missing or zero — refusing to issue challenge`
    );
  }
  return recv;
}

// ---------------------------------------------------------------------------
// Raw JSON-RPC plumbing (no ethers/viem dep)
// ---------------------------------------------------------------------------

interface RpcTx {
  hash: string;
  to: string | null;
  from: string;
  blockNumber: string | null;
  input: string;
  value: string;
}
interface RpcLog {
  address: string;
  topics: string[];
  data: string;
}
interface RpcReceipt {
  transactionHash: string;
  blockNumber: string;
  status: string; // '0x1' or '0x0'
  logs: RpcLog[];
}

async function rpcCall<T>(chain: Network, method: string, params: any[]): Promise<T> {
  const url = RPC_URLS[chain];
  if (!url) throw new Error(`no RPC URL configured for ${chain}`);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(`RPC error: ${json.error.message}`);
  return json.result as T;
}

function hexToNumber(hex: string): number {
  return Number(BigInt(hex));
}

/** Convert a 32-byte ABI-encoded topic into a lowercase 0x-prefixed address. */
function topicToAddress(topic: string): string {
  // Topic is left-padded to 32 bytes; address = last 20 bytes (40 hex chars).
  return ('0x' + topic.slice(-40)).toLowerCase();
}
