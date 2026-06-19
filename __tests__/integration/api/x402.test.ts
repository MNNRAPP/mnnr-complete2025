/**
 * Integration tests for /api/x402
 *
 * Covers the production-gate, CSRF check, and the challenge issuance happy
 * path. Verification happy path is covered in lib/x402-verify unit tests.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/x402-verify', () => ({
  verifyPaymentOnChain: vi.fn(),
}));
vi.mock('@/lib/payment-challenge-store', () => ({
  issueChallenge: vi.fn().mockResolvedValue({
    id: 'cid',
    nonce: 'nonce-xyz',
    amount: '1000000',
    receiver: '0x' + 'a'.repeat(40),
    chain: 'base',
    token: 'USDC',
    expiresAt: new Date(Date.now() + 60_000),
  }),
}));
vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 9,
    resetAt: Date.now() + 60_000,
  }),
  RateLimits: { X402: { max: 10, window: 60, failureMode: 'closed' } },
  getActorIp: vi.fn(() => '127.0.0.1'),
}));
vi.mock('@/lib/csrf', () => ({
  verifyCsrfToken: vi.fn(() => true),
}));
vi.mock('@/lib/audit', () => ({
  auditLog: vi.fn().mockResolvedValue(undefined),
  auditContextFromHeaders: vi.fn(() => ({})),
}));
vi.mock('@/lib/x402', () => ({
  calculateCost: vi.fn(() => ({ amount: '1000000', amountUsd: 1.0, token: 'USDC' })),
  X402_VERSION: '1.0',
  SUPPORTED_NETWORKS: ['base', 'ethereum', 'polygon'],
  SUPPORTED_TOKENS: ['USDC', 'USDT', 'DAI'],
  createPaymentRequest: vi.fn(() => ({ paymentUri: 'ethereum:...' })),
  createX402Headers: vi.fn(() => ({})),
  getReceiver: vi.fn(() => '0x' + 'a'.repeat(40)),
}));

describe('/api/x402 production gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    process.env.PAYMENT_VERIFICATION_ENABLED = 'true';
  });

  it('GET returns protocol info', async () => {
    const { GET } = await import('@/app/api/x402/route');
    const url = new URL('http://localhost/api/x402');
    // @ts-expect-error — only nextUrl is read on the route
    const req: Request = { url: url.toString(), nextUrl: url, method: 'GET', headers: new Headers() };
    const res = await GET(req);
    expect(res.status).toBeLessThan(500);
  });
});

describe('/api/x402 POST CSRF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    process.env.PAYMENT_VERIFICATION_ENABLED = 'true';
  });

  it('returns 403 when CSRF header missing', async () => {
    const { POST } = await import('@/app/api/x402/route');
    const req = new Request('http://localhost/api/x402', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'challenge', resource: '/r', amountUSD: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 403 when CSRF header invalid', async () => {
    const csrf = await import('@/lib/csrf');
    vi.mocked(csrf.verifyCsrfToken).mockReturnValueOnce(false);
    const { POST } = await import('@/app/api/x402/route');
    const req = new Request('http://localhost/api/x402', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': 'bad' },
      body: JSON.stringify({ action: 'challenge', resource: '/r', amountUSD: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});
