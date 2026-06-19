// app/status/page.tsx
//
// Real (non-fabricated) public status page. Server component — runs all checks
// at request time, returns a tiny HTML view.
//
// Design rules (per the task spec, do not relax):
//   - No secrets leak: never render env-var VALUES, never render a full
//     commit SHA (short SHA only), never render internal connection strings
//     or hostnames.
//   - Public access — no auth required. Status pages must be reachable when
//     the app itself is degraded.
//   - All checks have hard timeouts so a hanging dependency cannot pin the
//     page open.
//
// Checks performed:
//   1. Postgres (Neon)            — `SELECT 1` via Prisma
//   2. Redis (Upstash)            — `PING` (graceful skip if env unset)
//   3. Sentry tunnel              — reachable HEAD on /api/sentry-tunnel (or
//                                   on /api/health as a substitute)
//   4. API keys route             — HEAD /api/keys should return 401 (proves
//                                   the route is wired + auth gate works)
//   5. Newsletter route           — HEAD /api/newsletter should return 401/405
//                                   (route is reachable)

import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// Build / deploy metadata. Short SHA only — never render the full hash.
// ---------------------------------------------------------------------------
const BUILD_SHA = (
  process.env.NEXT_PUBLIC_BUILD_SHA ||
  process.env.COMMIT_REF || // Netlify
  process.env.VERCEL_GIT_COMMIT_SHA || // Vercel
  ''
).slice(0, 7);

const DEPLOY_TIME =
  process.env.NEXT_PUBLIC_BUILD_TIME ||
  process.env.BUILD_TIME ||
  '';

// ---------------------------------------------------------------------------
// Check primitives.
// ---------------------------------------------------------------------------
type CheckStatus = 'ok' | 'degraded' | 'down' | 'skipped';

interface CheckResult {
  name: string;
  status: CheckStatus;
  detail: string;
  latencyMs?: number;
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);
}

async function checkPostgres(): Promise<CheckResult> {
  const name = 'Postgres (Neon)';
  if (!process.env.NEON_DATABASE_URL) {
    return { name, status: 'skipped', detail: 'NEON_DATABASE_URL not set' };
  }
  const start = Date.now();
  try {
    // Lazy import so a missing Prisma client doesn't crash the page.
    const { db } = await import('@/lib/db');
    await withTimeout(db.$queryRaw`SELECT 1`, 3000, 'postgres');
    return {
      name,
      status: 'ok',
      detail: 'SELECT 1 ok',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'down',
      detail: err instanceof Error ? err.message.slice(0, 120) : 'unknown error',
      latencyMs: Date.now() - start,
    };
  }
}

async function checkRedis(): Promise<CheckResult> {
  const name = 'Redis (Upstash)';
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { name, status: 'skipped', detail: 'Upstash env not set (memory fallback in use)' };
  }
  const start = Date.now();
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    const res = await withTimeout(redis.ping(), 3000, 'redis');
    return {
      name,
      status: res === 'PONG' || res === 'pong' ? 'ok' : 'degraded',
      detail: `PING ${res}`,
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'down',
      detail: err instanceof Error ? err.message.slice(0, 120) : 'unknown error',
      latencyMs: Date.now() - start,
    };
  }
}

async function checkSelfRoute(
  name: string,
  path: string,
  expectedStatuses: number[],
  baseUrl: string,
): Promise<CheckResult> {
  const start = Date.now();
  try {
    const res = await withTimeout(
      fetch(`${baseUrl}${path}`, { method: 'HEAD', cache: 'no-store' }),
      3000,
      name,
    );
    const ok = expectedStatuses.includes(res.status);
    return {
      name,
      status: ok ? 'ok' : 'degraded',
      detail: `HEAD ${path} -> ${res.status}` + (ok ? '' : ` (expected ${expectedStatuses.join('/')})`),
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name,
      status: 'down',
      detail: err instanceof Error ? err.message.slice(0, 120) : 'unknown error',
      latencyMs: Date.now() - start,
    };
  }
}

async function checkSentry(baseUrl: string): Promise<CheckResult> {
  const name = 'Sentry tunnel';
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN && !process.env.SENTRY_DSN) {
    return { name, status: 'skipped', detail: 'Sentry DSN not configured' };
  }
  // We don't actually fire an event — we just confirm the tunnel route is
  // reachable. If the project doesn't have a tunnel, fall back to /api/health.
  return checkSelfRoute(name, '/api/sentry-tunnel', [200, 204, 405, 404], baseUrl).then(
    (r) =>
      r.status === 'down' || r.detail.includes('404')
        ? checkSelfRoute(name, '/api/health', [200], baseUrl)
        : r,
  );
}

// ---------------------------------------------------------------------------
// Page.
// ---------------------------------------------------------------------------
export default async function StatusPage() {
  const h = headers();
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  const baseUrl = `${proto}://${host}`;

  // Fan out concurrently — total page time bounded by slowest check (~3s).
  const [pg, redis, sentry, apiKeys, newsletter] = await Promise.all([
    checkPostgres(),
    checkRedis(),
    checkSentry(baseUrl),
    checkSelfRoute('API keys route', '/api/keys', [401, 405], baseUrl),
    checkSelfRoute('Newsletter route', '/api/newsletter', [401, 405, 400], baseUrl),
  ]);

  const apiChecks = [apiKeys, newsletter];
  const apiHealthy = apiChecks.filter((c) => c.status === 'ok').length;

  const allChecks: CheckResult[] = [pg, redis, sentry, apiKeys, newsletter];
  const downCount = allChecks.filter((c) => c.status === 'down').length;
  const degradedCount = allChecks.filter((c) => c.status === 'degraded').length;

  const overall: { label: string; color: string } =
    downCount > 0
      ? { label: 'Partial Outage', color: '#ef4444' }
      : degradedCount > 0
        ? { label: 'Degraded Performance', color: '#eab308' }
        : { label: 'All Systems Operational', color: '#10b981' };

  const iconFor = (s: CheckStatus): string =>
    s === 'ok' ? '✅' : s === 'degraded' ? '⚠️' : s === 'down' ? '❌' : '➖';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#fff',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          mnnr.app Status
        </h1>
        <p
          style={{
            display: 'inline-block',
            background: `${overall.color}22`,
            border: `1px solid ${overall.color}55`,
            color: overall.color,
            padding: '6px 14px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 32,
          }}
        >
          ● {overall.label}
        </p>

        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, opacity: 0.8 }}>
          Services
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32 }}>
          {allChecks.map((c) => (
            <li
              key={c.name}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              <span>
                <span style={{ marginRight: 10 }}>{iconFor(c.status)}</span>
                <strong>{c.name}</strong>
                <span style={{ opacity: 0.5, marginLeft: 8 }}>— {c.detail}</span>
              </span>
              {typeof c.latencyMs === 'number' && (
                <span style={{ opacity: 0.6, fontFamily: 'monospace', fontSize: 12 }}>
                  {c.latencyMs}ms
                </span>
              )}
            </li>
          ))}
        </ul>

        <div style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.7 }}>
          <div>
            API endpoints: {apiHealthy}/{apiChecks.length} healthy
          </div>
          {BUILD_SHA && <div>Build: {BUILD_SHA}</div>}
          {DEPLOY_TIME && <div>Last deploy: {DEPLOY_TIME}</div>}
          <div>Checked at: {new Date().toISOString()}</div>
        </div>

        <p style={{ marginTop: 40, fontSize: 12, opacity: 0.4 }}>
          This page runs live health checks against Postgres, Redis, Sentry, and
          two representative API routes on every request. No metrics are cached.
        </p>
      </div>
    </div>
  );
}
