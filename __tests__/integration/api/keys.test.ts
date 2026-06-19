/**
 * Integration tests for /api/keys — complements the existing __tests__/api/keys.test.ts
 *
 * Focus on cross-user isolation + rate-limit propagation paths.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/utils/supabase/server', () => ({ createClient: vi.fn() }));
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

function makeSupabase(user: { id: string } | null, fromImpl?: () => unknown) {
  return {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue(user ? { data: { user }, error: null } : { data: { user: null }, error: new Error('no user') }),
    },
    from: vi.fn().mockImplementation(fromImpl ?? (() => ({}))),
  };
}

describe('/api/keys cross-user isolation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET filters by authenticated user ID via .eq("user_id", user.id)', async () => {
    const eqSpy = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    const sb = makeSupabase({ id: 'user-A' }, () => ({
      select: vi.fn().mockReturnValue({ eq: eqSpy }),
    }));
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockReturnValue(sb as never);

    const { GET } = await import('@/app/api/keys/route');
    const req = new NextRequest('http://localhost/api/keys');
    const res = await GET(req);
    expect(res.status).toBe(200);
    // Critical assertion: ownership predicate is applied.
    expect(eqSpy).toHaveBeenCalledWith('user_id', 'user-A');
  });

  it('audit + 401 when unauthenticated', async () => {
    const sb = makeSupabase(null);
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockReturnValue(sb as never);
    const audit = await import('@/lib/audit-trail');
    const { GET } = await import('@/app/api/keys/route');
    const req = new NextRequest('http://localhost/api/keys');
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(audit.logAuditEvent).toHaveBeenCalled();
  });
});

describe('/api/keys rate-limit propagation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET returns rate-limit response when limiter denies', async () => {
    const sb = makeSupabase({ id: 'user-rl' });
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockReturnValue(sb as never);
    const rl = await import('@/lib/rate-limit');
    // Build a NextResponse-like object whose .status is exposed.
    const { NextResponse } = await import('next/server');
    const denied = NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    vi.mocked(rl.rateLimit).mockResolvedValueOnce(denied);
    const { GET } = await import('@/app/api/keys/route');
    const req = new NextRequest('http://localhost/api/keys');
    const res = await GET(req);
    expect(res.status).toBe(429);
  });
});
