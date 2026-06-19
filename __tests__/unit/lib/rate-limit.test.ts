/**
 * Unit tests for lib/rate-limit.ts
 *
 * Strategy: drive the legacy `rateLimit()` shim + the new `enforceRateLimit()`
 * options API through the in-memory fallback path (no Upstash configured in
 * the dev branch). Then exercise the production-throws branch with
 * vi.resetModules() + missing UPSTASH_* env.
 *
 * We mock @upstash/ratelimit + @upstash/redis to keep the module loadable
 * without hitting the network; we also mock @/lib/audit-trail so denials
 * don't try to write to Postgres.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

vi.mock('@/lib/audit-trail', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
  AuditEventType: { SECURITY_RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded' },
  AuditSeverity: { WARNING: 'warn', ERROR: 'error' },
}));

// Hoist mocks for @upstash/redis + @upstash/ratelimit so module load doesn't
// pull in the real packages (which transitively require an uncrypto build that
// isn't installed in every dev environment). The in-memory dev branch is the
// happy path here, so we just need the imports to RESOLVE — they shouldn't
// be exercised unless a test explicitly opts in (see "Upstash error handling"
// describe block below for that path).
vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: () => ({}) },
}));
vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_opts: unknown) {}
    async limit() {
      return { success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 };
    }
    static slidingWindow() {
      return {};
    }
  }
  return { Ratelimit };
});

const baselineEnv = { ...process.env };

function resetToInMemoryDev() {
  for (const k of Object.keys(process.env)) {
    if (!(k in baselineEnv)) delete process.env[k];
  }
  for (const [k, v] of Object.entries(baselineEnv)) {
    if (v !== undefined) process.env[k] = v;
  }
  // Force dev + no Redis so we hit the in-memory fallback
  process.env.NODE_ENV = 'test';
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
}

describe('lib/rate-limit (in-memory dev fallback)', () => {
  let mod: typeof import('@/lib/rate-limit');

  beforeEach(async () => {
    vi.resetModules();
    resetToInMemoryDev();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mod = await import('@/lib/rate-limit');
    warn.mockRestore();
  });

  afterAll(() => {
    resetToInMemoryDev();
  });

  it('RateLimits presets are exported with the expected shape', () => {
    expect(mod.RateLimits.AUTH_LOGIN).toEqual({
      max: 5,
      window: 60,
      failureMode: 'closed',
    });
    expect(mod.RateLimits.NEWSLETTER.failureMode).toBe('closed');
    expect(mod.RateLimits.PUBLIC_GET.failureMode).toBe('degraded');
  });

  it('enforceRateLimit allows requests under the limit', async () => {
    const route = `/api/test/${Math.random()}`;
    const r1 = await mod.enforceRateLimit({
      key: 'user-1',
      route,
      max: 3,
      window: 60,
      dimension: 'user',
    });
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBeGreaterThanOrEqual(0);
  });

  it('enforceRateLimit denies once the limit is exceeded', async () => {
    const route = `/api/test/${Math.random()}`;
    const opts = {
      key: 'user-burst',
      route,
      max: 2,
      window: 60,
      dimension: 'user' as const,
    };
    await mod.enforceRateLimit(opts);
    await mod.enforceRateLimit(opts);
    const r3 = await mod.enforceRateLimit(opts);
    expect(r3.allowed).toBe(false);
    expect(r3.reason).toBe('rate_limited');
  });

  it('composite keys: same key but different routes are independent buckets', async () => {
    const opts = { key: 'u', max: 1, window: 60 };
    const a1 = await mod.enforceRateLimit({
      ...opts,
      route: '/a',
      dimension: 'user',
    });
    const b1 = await mod.enforceRateLimit({
      ...opts,
      route: '/b',
      dimension: 'user',
    });
    expect(a1.allowed).toBe(true);
    expect(b1.allowed).toBe(true);
    // Second hit on /a busts the limit, /b stays untouched.
    const a2 = await mod.enforceRateLimit({
      ...opts,
      route: '/a',
      dimension: 'user',
    });
    expect(a2.allowed).toBe(false);
  });

  it('composite keys: same route but different dimensions are independent', async () => {
    const route = `/api/dim/${Math.random()}`;
    const a = await mod.enforceRateLimit({
      key: '1.1.1.1',
      route,
      max: 1,
      window: 60,
      dimension: 'ip',
    });
    const b = await mod.enforceRateLimit({
      key: 'user-x',
      route,
      max: 1,
      window: 60,
      dimension: 'user',
    });
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
  });

  it('legacy rateLimit() shim returns null when under limit', async () => {
    // Legacy registry returns null in dev (no Redis) — the shim takes that path
    // and uses the in-memory fallback.
    const resp = await mod.rateLimit('user:legacy-A', mod.rateLimiters.api);
    expect(resp).toBeNull();
  });

  it('legacy rateLimit() shim returns 429 NextResponse once limit reached', async () => {
    const identifier = `user:legacy-burst-${Math.random()}`;
    // In dev with no Redis, ALL four legacy limiters are constructed as `null`,
    // so `(l === limiter)` matches the FIRST null entry (apiKeys, max=10) when
    // looking up metadata. Pump 11 calls to guarantee the limit trips
    // regardless of which bucket the shim resolves to (max 10 for apiKeys is
    // the largest of the security-sensitive buckets).
    for (let i = 0; i < 10; i++) {
      await mod.rateLimit(identifier, mod.rateLimiters.apiKeys);
    }
    const blocked = await mod.rateLimit(identifier, mod.rateLimiters.apiKeys);
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
    const body = await blocked!.json();
    expect(body.error).toMatch(/Rate limit exceeded/i);
  });

  it('getClientIdentifier prefers userId, falls back to IP', () => {
    expect(mod.getClientIdentifier('u-1')).toBe('user:u-1');
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '5.5.5.5, 6.6.6.6' },
    });
    expect(mod.getClientIdentifier(undefined, req)).toBe('ip:5.5.5.5');
    const req2 = new Request('http://localhost');
    expect(mod.getClientIdentifier(undefined, req2)).toBe('ip:unknown');
  });

  it('getActorIp reads forwarded chain, falls back to x-real-ip / unknown', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' },
    });
    expect(mod.getActorIp(req)).toBe('1.1.1.1');
    const req2 = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(mod.getActorIp(req2)).toBe('9.9.9.9');
    const req3 = new Request('http://localhost');
    expect(mod.getActorIp(req3)).toBe('unknown');
    expect(mod.getActorIp(undefined)).toBe('unknown');
  });
});

describe('lib/rate-limit production fail-closed (missing Redis)', () => {
  afterAll(() => {
    resetToInMemoryDev();
  });

  it('throws at module load when production has no UPSTASH_* env', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    await expect(import('@/lib/rate-limit')).rejects.toThrow(/UPSTASH_REDIS_REST/);
    resetToInMemoryDev();
  });
});

describe('lib/rate-limit Upstash error handling', () => {
  beforeEach(() => {
    vi.resetModules();
    resetToInMemoryDev();
  });

  afterAll(() => {
    vi.unmock('@upstash/ratelimit');
    vi.unmock('@upstash/redis');
    resetToInMemoryDev();
  });

  it('failureMode: "closed" denies when backend errors', async () => {
    // Inject Upstash env so the module wires the Redis path...
    process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'unit-token';
    // ...and stub @upstash/ratelimit so `limit()` throws.
    vi.doMock('@upstash/redis', () => ({
      Redis: { fromEnv: () => ({}) },
    }));
    vi.doMock('@upstash/ratelimit', () => {
      class Ratelimit {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        constructor(_opts: unknown) {}
        async limit() {
          throw new Error('boom');
        }
        static slidingWindow() {
          return {};
        }
      }
      return { Ratelimit };
    });
    const fresh = await import('@/lib/rate-limit');
    const r = await fresh.enforceRateLimit({
      key: 'u',
      route: '/closed',
      max: 10,
      window: 60,
      failureMode: 'closed',
    });
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('backend_error_failclosed');
  });

  it('failureMode: "degraded" falls back to memory + allows', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'unit-token';
    vi.doMock('@upstash/redis', () => ({
      Redis: { fromEnv: () => ({}) },
    }));
    vi.doMock('@upstash/ratelimit', () => {
      class Ratelimit {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        constructor(_opts: unknown) {}
        async limit() {
          throw new Error('boom');
        }
        static slidingWindow() {
          return {};
        }
      }
      return { Ratelimit };
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const fresh = await import('@/lib/rate-limit');
    const r = await fresh.enforceRateLimit({
      key: 'u',
      route: '/degraded',
      max: 10,
      window: 60,
      failureMode: 'degraded',
    });
    expect(r.allowed).toBe(true);
    expect(r.reason).toBe('degraded_inmem');
    warn.mockRestore();
    error.mockRestore();
  });
});
