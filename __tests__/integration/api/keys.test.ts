/**
 * Integration tests for /api/keys — Clerk + Prisma (post-migration #40).
 *
 * Focus on cross-user isolation + rate-limit propagation + unauthenticated
 * paths now that the route uses Clerk's auth() and Prisma's withUserContext.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Clerk auth — auth() is the sync server helper used by app/api/keys/route.ts
const authMock = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
  currentUser: vi.fn(),
}));

// Local user bridge — getOrCreateUser maps Clerk session to a local User row;
// unauthorized() returns the canonical 401 NextResponse with WWW-Authenticate.
const getOrCreateUserMock = vi.fn();
vi.mock('@/lib/user', async () => {
  const { NextResponse } = await import('next/server');
  return {
    getOrCreateUser: getOrCreateUserMock,
    unauthorized: () =>
      NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="mnnr-api"' } },
      ),
  };
});

// RLS context wrapper — withUserContext(userId, fn) opens a Prisma tx with
// SET LOCAL app.current_user_id. For tests we just invoke fn with a stub tx.
const findManyMock = vi.fn();
const createMock = vi.fn();
const updateManyMock = vi.fn();
vi.mock('@/lib/rls', () => ({
  withUserContext: vi.fn((_userId: string, fn: (tx: unknown) => unknown) =>
    fn({
      apiKey: {
        findMany: findManyMock,
        create: createMock,
        updateMany: updateManyMock,
      },
    }),
  ),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => Promise.resolve(null)),
  rateLimiters: { apiKeys: {} },
  getClientIdentifier: vi.fn(() => 'test-user'),
}));
vi.mock('@/lib/csrf', () => ({ csrfProtection: vi.fn(() => Promise.resolve(null)) }));
vi.mock('@/lib/audit-trail', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
  AuditEventType: {
    SECURITY_BREACH_ATTEMPT: 'breach',
    SECURITY_RATE_LIMIT_EXCEEDED: 'rl',
    DATA_ACCESSED: 'data_accessed',
    DATA_CREATED: 'data_created',
    DATA_DELETED: 'data_deleted',
  },
  AuditSeverity: { INFO: 'info', WARNING: 'warn', ERROR: 'error' },
}));
vi.mock('@/utils/api-keys', () => ({
  generateApiKey: vi.fn(() => ({
    key: 'sk_live_abc123',
    prefix: 'sk_live_',
    hash: 'hash_xyz',
  })),
}));

const UUID_A = '11111111-1111-4111-8111-111111111111';

describe('/api/keys cross-user isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findManyMock.mockReset();
    createMock.mockReset();
    updateManyMock.mockReset();
  });

  it('GET scopes findMany to authenticated user.id (RLS predicate)', async () => {
    authMock.mockReturnValue({ userId: 'clerk_A' });
    getOrCreateUserMock.mockResolvedValue({ id: UUID_A, clerkId: 'clerk_A' });
    findManyMock.mockResolvedValue([]);

    const { GET } = await import('@/app/api/keys/route');
    const req = new NextRequest('http://localhost/api/keys');
    const res = await GET(req);
    expect(res.status).toBe(200);
    // Critical assertion: ownership predicate is applied in the Prisma where clause.
    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: UUID_A }) }),
    );
  });

  it('audit + 401 when unauthenticated (no Clerk session)', async () => {
    authMock.mockReturnValue({ userId: null });
    const audit = await import('@/lib/audit-trail');
    const { GET } = await import('@/app/api/keys/route');
    const req = new NextRequest('http://localhost/api/keys');
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(audit.logAuditEvent).toHaveBeenCalled();
  });
});

describe('/api/keys rate-limit propagation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findManyMock.mockReset();
  });

  it('GET returns rate-limit response when limiter denies', async () => {
    authMock.mockReturnValue({ userId: 'clerk_rl' });
    getOrCreateUserMock.mockResolvedValue({ id: UUID_A, clerkId: 'clerk_rl' });

    const rl = await import('@/lib/rate-limit');
    const { NextResponse } = await import('next/server');
    const denied = NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    vi.mocked(rl.rateLimit).mockResolvedValueOnce(denied);

    const { GET } = await import('@/app/api/keys/route');
    const req = new NextRequest('http://localhost/api/keys');
    const res = await GET(req);
    expect(res.status).toBe(429);
  });
});
