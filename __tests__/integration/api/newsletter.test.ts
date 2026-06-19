/**
 * Integration tests for /api/newsletter
 *
 * Covers the enumeration-resistant success shape across multiple failure paths:
 * missing turnstile token, invalid email, existing-pending email, etc.
 * All responses MUST return the same generic body.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const newsletterSubscriber = {
  findUnique: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
};

vi.mock('@/lib/db', () => ({
  db: { newsletterSubscriber },
}));

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 99,
    resetAt: Date.now() + 60000,
  }),
  RateLimits: {
    NEWSLETTER: { max: 3, window: 600, failureMode: 'closed' },
  },
  getActorIp: vi.fn(() => '127.0.0.1'),
}));

vi.mock('@/lib/audit', () => ({
  auditLog: vi.fn().mockResolvedValue(undefined),
  auditContextFromHeaders: vi.fn(() => ({ userAgent: 'test' })),
  hashPii: vi.fn((s: string) => `hash-${s}`),
}));

vi.mock('resend', () => {
  // Must be a real constructor — `new Resend(apiKey)` is called in the route.
  class Resend {
    apiKey: string;
    emails = { send: vi.fn().mockResolvedValue({ error: null }) };
    constructor(apiKey: string) {
      this.apiKey = apiKey;
    }
  }
  return { Resend };
});

describe('/api/newsletter POST — enumeration-resistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    newsletterSubscriber.findUnique.mockResolvedValue(null);
    newsletterSubscriber.create.mockResolvedValue({});
    newsletterSubscriber.update.mockResolvedValue({});
    // Default: development mode so Turnstile bypass kicks in.
    process.env.NODE_ENV = 'test';
    process.env.RESEND_API_KEY = 're_test';
    delete process.env.TURNSTILE_SECRET_KEY;
  });

  async function postJson(body: unknown) {
    const { POST } = await import('@/app/api/newsletter/route');
    const req = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    });
    return POST(req);
  }

  it('returns generic 200 for malformed JSON body', async () => {
    const { POST } = await import('@/app/api/newsletter/route');
    const req = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: 'this is not json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.message).toMatch(/confirmation message/i);
  });

  it('returns generic 200 for invalid email format', async () => {
    const res = await postJson({ email: 'not-an-email', turnstileToken: 'tok' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/confirmation message/i);
  });

  it('returns generic 200 when caller supplies a brand-new email', async () => {
    newsletterSubscriber.findUnique.mockResolvedValueOnce(null);
    const res = await postJson({
      email: 'new@example.com',
      turnstileToken: 'tok',
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/confirmation message/i);
  });

  it('returns generic 200 when caller supplies an already-confirmed email', async () => {
    newsletterSubscriber.findUnique.mockResolvedValueOnce({
      email: 'old@example.com',
      status: 'confirmed',
    });
    const res = await postJson({
      email: 'old@example.com',
      turnstileToken: 'tok',
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/confirmation message/i);
    expect(newsletterSubscriber.update).not.toHaveBeenCalled();
  });

  it('returns generic 200 when caller supplies an unsubscribed email', async () => {
    newsletterSubscriber.findUnique.mockResolvedValueOnce({
      email: 'gone@example.com',
      status: 'unsubscribed',
    });
    const res = await postJson({
      email: 'gone@example.com',
      turnstileToken: 'tok',
    });
    expect(res.status).toBe(200);
    expect(newsletterSubscriber.create).not.toHaveBeenCalled();
    expect(newsletterSubscriber.update).not.toHaveBeenCalled();
  });
});

describe('/api/newsletter POST — rate-limit propagation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 429 when rate-limiter denies', async () => {
    const rl = await import('@/lib/rate-limit');
    vi.mocked(rl.enforceRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
      reason: 'rate_limited',
    });
    const { POST } = await import('@/app/api/newsletter/route');
    const req = new NextRequest('http://localhost/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'x@y.com', turnstileToken: 'tok' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
