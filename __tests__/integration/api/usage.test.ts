/**
 * Integration tests for /api/usage — Clerk + Prisma (post-migration #40).
 *
 * Covers: 401 unauthenticated for both GET and POST.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const authMock = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
  currentUser: vi.fn(),
}));

vi.mock('@/lib/user', async () => {
  const { NextResponse } = await import('next/server');
  return {
    getOrCreateUser: vi.fn(),
    unauthorized: () =>
      NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="mnnr-api"' } },
      ),
  };
});

vi.mock('@/lib/rls', () => ({
  withUserContext: vi.fn((_userId: string, fn: (tx: unknown) => unknown) =>
    fn({ usageEvent: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() } }),
  ),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => Promise.resolve(null)),
  rateLimiters: { api: {} },
  getClientIdentifier: vi.fn(() => 'test-user'),
}));
vi.mock('@/lib/csrf', () => ({ csrfProtection: vi.fn(() => Promise.resolve(null)) }));
vi.mock('@/lib/audit-trail', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
  AuditEventType: {
    SECURITY_BREACH_ATTEMPT: 'breach',
    DATA_ACCESSED: 'data_accessed',
    DATA_CREATED: 'data_created',
    SECURITY_RATE_LIMIT_EXCEEDED: 'rl',
  },
  AuditSeverity: { INFO: 'info', WARNING: 'warn', ERROR: 'error' },
}));

describe('/api/usage GET', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    authMock.mockReturnValue({ userId: null });
    const { GET } = await import('@/app/api/usage/route');
    const req = new NextRequest('http://localhost/api/usage');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe('/api/usage POST', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    authMock.mockReturnValue({ userId: null });
    const { POST } = await import('@/app/api/usage/route');
    const req = new NextRequest('http://localhost/api/usage', {
      method: 'POST',
      body: JSON.stringify({ metric: 'requests', value: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
