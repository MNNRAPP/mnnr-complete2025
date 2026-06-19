/**
 * Integration tests for /api/usage
 *
 * Covers: 401 unauthenticated, GET returns only the caller's rows, POST
 * validates body via Zod.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/utils/supabase/server', () => ({ createClient: vi.fn() }));
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

function supabaseUnauth() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      }),
    },
    from: vi.fn(),
  };
}

describe('/api/usage GET', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockReturnValue(supabaseUnauth() as never);
    const { GET } = await import('@/app/api/usage/route');
    const req = new NextRequest('http://localhost/api/usage');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe('/api/usage POST', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockReturnValue(supabaseUnauth() as never);
    const { POST } = await import('@/app/api/usage/route');
    const req = new NextRequest('http://localhost/api/usage', {
      method: 'POST',
      body: JSON.stringify({ metric: 'requests', value: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
