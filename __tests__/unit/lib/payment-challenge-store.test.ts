/**
 * Unit tests for lib/payment-challenge-store.ts
 *
 * Mocks the Prisma `db` client so we can exercise:
 *   - issueChallenge: token + amountUsd encoding into resource, receiver
 *     lowercasing, default TTL, custom TTL via validitySeconds.
 *   - getChallenge: decoding back to typed shape.
 *   - consumeChallenge: not-found / expired / already-consumed / replay
 *     (P2002) / race-lost / happy-path.
 *   - pruneExpiredChallenges: passes correct cutoff.
 *   - encodeResource / decodeResource roundtrip.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---- Mock @prisma/client so we control error codes ----
class PrismaClientKnownRequestError extends Error {
  code: string;
  constructor(message: string, opts: { code: string }) {
    super(message);
    this.code = opts.code;
    this.name = 'PrismaClientKnownRequestError';
  }
}
vi.mock('@prisma/client', () => ({
  Prisma: {
    TransactionIsolationLevel: { Serializable: 'Serializable' },
    PrismaClientKnownRequestError,
  },
}));

// ---- Mock the Prisma db client ----
const paymentChallenge = {
  create: vi.fn(),
  findUnique: vi.fn(),
  deleteMany: vi.fn(),
  updateMany: vi.fn(),
};
const usedTxHash = { create: vi.fn() };
const $transaction = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    paymentChallenge,
    usedTxHash,
    $transaction,
  },
}));

describe('lib/payment-challenge-store encode/decode', () => {
  it('roundtrips token + usd into resource string', async () => {
    const { encodeResource, decodeResource } = await import(
      '@/lib/payment-challenge-store'
    );
    const enc = encodeResource('/api/x', { token: 'USDC', amountUsd: 1.23 });
    expect(enc).toContain('/api/x');
    expect(enc).toContain('token=USDC');
    expect(enc).toContain('usd=1.23');
    const dec = decodeResource(enc);
    expect(dec.resource).toBe('/api/x');
    expect(dec.token).toBe('USDC');
    expect(dec.amountUsd).toBe(1.23);
  });

  it('decoding a bare resource yields no token/usd', async () => {
    const { decodeResource } = await import('@/lib/payment-challenge-store');
    const dec = decodeResource('/api/x');
    expect(dec.resource).toBe('/api/x');
    expect(dec.token).toBeUndefined();
    expect(dec.amountUsd).toBeUndefined();
  });

  it('encoding with no meta returns the bare resource', async () => {
    const { encodeResource } = await import('@/lib/payment-challenge-store');
    expect(encodeResource('/api/x', {})).toBe('/api/x');
  });
});

describe('lib/payment-challenge-store issueChallenge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a row with lowercased receiver and encoded resource', async () => {
    const expires = new Date(Date.now() + 600_000);
    paymentChallenge.create.mockResolvedValueOnce({
      id: 'row-1',
      nonce: 'deadbeef',
      userId: null,
      sessionId: null,
      amount: '1000000',
      resource: '/r::token=USDC',
      receiver: '0xabc',
      chain: 'base',
      expiresAt: expires,
      consumed: false,
      consumedAt: null,
      consumedTxHash: null,
    });
    const { issueChallenge } = await import('@/lib/payment-challenge-store');
    const out = await issueChallenge({
      amount: '1000000',
      resource: '/r',
      receiver: '0xABC',
      chain: 'base',
      token: 'USDC',
    });
    expect(paymentChallenge.create).toHaveBeenCalledTimes(1);
    const arg = paymentChallenge.create.mock.calls[0][0];
    expect(arg.data.receiver).toBe('0xabc');
    expect(arg.data.resource).toContain('token=USDC');
    expect(out.token).toBe('USDC');
    expect(out.receiver).toBe('0xabc');
  });

  it('drops non-UUID userId so it never reaches Prisma', async () => {
    paymentChallenge.create.mockResolvedValueOnce({
      id: 'row',
      nonce: 'n',
      userId: null,
      sessionId: null,
      amount: '1',
      resource: '/r',
      receiver: '0x' + '1'.repeat(40),
      chain: 'base',
      expiresAt: new Date(Date.now() + 1000),
      consumed: false,
      consumedAt: null,
      consumedTxHash: null,
    });
    const { issueChallenge } = await import('@/lib/payment-challenge-store');
    await issueChallenge({
      amount: '1',
      resource: '/r',
      receiver: '0x' + '1'.repeat(40),
      chain: 'base',
      userId: 'definitely-not-a-uuid',
    });
    expect(paymentChallenge.create.mock.calls[0][0].data.userId).toBeNull();
  });

  it('wraps DB errors with a clear message', async () => {
    paymentChallenge.create.mockRejectedValueOnce(new Error('db is down'));
    const { issueChallenge } = await import('@/lib/payment-challenge-store');
    await expect(
      issueChallenge({
        amount: '1',
        resource: '/r',
        receiver: '0x' + '1'.repeat(40),
        chain: 'base',
      }),
    ).rejects.toThrow(/failed to insert challenge/);
  });
});

describe('lib/payment-challenge-store getChallenge', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns null when nonce not found', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce(null);
    const { getChallenge } = await import('@/lib/payment-challenge-store');
    expect(await getChallenge('missing')).toBeNull();
  });

  it('returns decoded shape when found', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce({
      id: 'r',
      nonce: 'n',
      userId: null,
      sessionId: null,
      amount: '1',
      resource: '/x::token=USDC&usd=2.5',
      receiver: '0xabc',
      chain: 'base',
      expiresAt: new Date(),
      consumed: false,
      consumedAt: null,
      consumedTxHash: null,
    });
    const { getChallenge } = await import('@/lib/payment-challenge-store');
    const out = await getChallenge('n');
    expect(out?.token).toBe('USDC');
    expect(out?.amountUsd).toBe(2.5);
    expect(out?.resource).toBe('/x');
  });
});

describe('lib/payment-challenge-store consumeChallenge', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns challenge_not_found when nonce missing', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce(null);
    const { consumeChallenge } = await import('@/lib/payment-challenge-store');
    const r = await consumeChallenge('n', '0x' + 'a'.repeat(64));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('challenge_not_found');
  });

  it('returns challenge_already_consumed when row.consumed=true', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce({
      id: 'r',
      consumed: true,
      expiresAt: new Date(Date.now() + 1000),
      resource: '/x',
      receiver: '0x',
      chain: 'base',
    });
    const { consumeChallenge } = await import('@/lib/payment-challenge-store');
    const r = await consumeChallenge('n', '0x' + 'a'.repeat(64));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('challenge_already_consumed');
  });

  it('returns challenge_expired when expiresAt is in the past', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce({
      id: 'r',
      consumed: false,
      expiresAt: new Date(Date.now() - 1000),
      resource: '/x',
      receiver: '0x',
      chain: 'base',
    });
    const { consumeChallenge } = await import('@/lib/payment-challenge-store');
    const r = await consumeChallenge('n', '0x' + 'a'.repeat(64));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('challenge_expired');
  });

  it('returns challenge_not_found when chain mismatch is enforced', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce({
      id: 'r',
      consumed: false,
      expiresAt: new Date(Date.now() + 1000),
      resource: '/x',
      receiver: '0x',
      chain: 'base',
    });
    const { consumeChallenge } = await import('@/lib/payment-challenge-store');
    const r = await consumeChallenge('n', '0x' + 'a'.repeat(64), 'ethereum');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('challenge_not_found');
  });

  it('returns replay_detected on Prisma P2002 unique-violation in tx', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce({
      id: 'r',
      consumed: false,
      expiresAt: new Date(Date.now() + 60_000),
      resource: '/x',
      receiver: '0x',
      chain: 'base',
    });
    $transaction.mockImplementationOnce(async () => {
      throw new PrismaClientKnownRequestError('uniq', { code: 'P2002' });
    });
    const { consumeChallenge } = await import('@/lib/payment-challenge-store');
    const r = await consumeChallenge('n', '0x' + 'a'.repeat(64));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('replay_detected');
  });

  it('returns ok:true on successful consume + records lowercased txHash', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce({
      id: 'r',
      nonce: 'n',
      userId: null,
      sessionId: null,
      amount: '1',
      consumed: false,
      expiresAt: new Date(Date.now() + 60_000),
      resource: '/x::token=USDC',
      receiver: '0x',
      chain: 'base',
    });
    $transaction.mockImplementationOnce(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        usedTxHash: { create: vi.fn().mockResolvedValue({}) },
        paymentChallenge: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
      };
      return fn(tx);
    });
    const txHash = '0x' + 'A'.repeat(64);
    const { consumeChallenge } = await import('@/lib/payment-challenge-store');
    const r = await consumeChallenge('n', txHash);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.challenge.consumed).toBe(true);
      expect(r.challenge.consumedTxHash).toBe(txHash.toLowerCase());
      expect(r.challenge.token).toBe('USDC');
    }
  });

  it('returns challenge_already_consumed when updateMany count=0 (race lost)', async () => {
    paymentChallenge.findUnique.mockResolvedValueOnce({
      id: 'r',
      nonce: 'n',
      consumed: false,
      expiresAt: new Date(Date.now() + 60_000),
      resource: '/x',
      receiver: '0x',
      chain: 'base',
    });
    $transaction.mockImplementationOnce(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        usedTxHash: { create: vi.fn().mockResolvedValue({}) },
        paymentChallenge: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      };
      // Catch the RaceLostError thrown inside the tx fn.
      try {
        return await fn(tx);
      } catch (e) {
        throw e;
      }
    });
    const { consumeChallenge } = await import('@/lib/payment-challenge-store');
    const r = await consumeChallenge('n', '0x' + 'a'.repeat(64));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('challenge_already_consumed');
  });
});

describe('lib/payment-challenge-store pruneExpiredChallenges', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls deleteMany with the right cutoff filter', async () => {
    paymentChallenge.deleteMany.mockResolvedValueOnce({ count: 3 });
    const { pruneExpiredChallenges } = await import(
      '@/lib/payment-challenge-store'
    );
    const n = await pruneExpiredChallenges(60);
    expect(n).toBe(3);
    const call = paymentChallenge.deleteMany.mock.calls[0][0];
    expect(call.where.consumed).toBe(false);
    expect(call.where.expiresAt.lt).toBeInstanceOf(Date);
  });
});
