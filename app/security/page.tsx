/**
 * /security - public-facing security proof page
 *
 * Externally verifiable evidence of every security control we claim. Built in
 * response to the 6/19/26 external audit (C+) which marked controls as
 * "Unknown" because they were server-side-invisible. This page renders:
 *
 *   1. Live security-headers table (server fetches `/` from same origin, parses
 *      the response, and renders each header with a status badge).
 *   2. Security-controls table - each control + a verification link (test
 *      output, migration SQL on GitHub, or a copy-paste `curl` for the auditor
 *      to run themselves).
 *   3. CI / audit health badges (latest build, last `npm audit`, last security
 *      review score, current deploy SHA).
 *   4. Document links - `SECURITY.md`, `KEY_MANAGEMENT_POLICY.md`, OpenAPI
 *      spec, Swagger UI.
 *   5. "Verify yourself in 60 seconds" CTA with copy-paste `curl` commands.
 *
 * Public route (added to `middleware.ts` publicRoutes), Server Component,
 * no auth, no caching - every load reflects current production headers.
 */

import type { Metadata } from 'next';
import { headers as nextHeaders } from 'next/headers';

export const metadata: Metadata = {
  title: 'Security - MNNR',
  description:
    'Public, externally verifiable evidence of MNNR security controls: live security headers, CSRF/rate-limit/RLS state, CI health, and 60-second verification commands.',
  robots: { index: true, follow: true },
};

// Always render fresh - headers reflect *current* production response.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ============================================================================
// Server-side header probe
// ============================================================================

interface HeaderCheck {
  name: string;
  expected: string;
  matcher: (value: string | null) => boolean;
  required: boolean;
  description: string;
}

const HEADER_CHECKS: HeaderCheck[] = [
  {
    name: 'Strict-Transport-Security',
    expected: 'max-age >= 31536000; includeSubDomains; preload',
    matcher: (v) =>
      !!v &&
      /max-age=\d+/i.test(v) &&
      parseInt((v.match(/max-age=(\d+)/i)?.[1] ?? '0'), 10) >= 31536000 &&
      /includeSubDomains/i.test(v),
    required: true,
    description: 'HTTPS-only for at least 1 year, including all subdomains.',
  },
  {
    name: 'Content-Security-Policy',
    expected: "no 'unsafe-inline', no 'unsafe-eval'",
    matcher: (v) =>
      !!v && !/['"]?unsafe-inline['"]?/.test(v) && !/['"]?unsafe-eval['"]?/.test(v),
    required: true,
    description: 'Nonce-bound CSP set per-request in middleware. Blocks inline scripts/eval.',
  },
  {
    name: 'X-Frame-Options',
    expected: 'DENY',
    matcher: (v) => v?.toUpperCase() === 'DENY',
    required: true,
    description: 'Prevents clickjacking by disallowing framing entirely.',
  },
  {
    name: 'X-Content-Type-Options',
    expected: 'nosniff',
    matcher: (v) => v?.toLowerCase() === 'nosniff',
    required: true,
    description: 'Forbids MIME-type sniffing.',
  },
  {
    name: 'Referrer-Policy',
    expected: 'strict-origin-when-cross-origin (or stricter)',
    matcher: (v) =>
      !!v && /(strict-origin-when-cross-origin|no-referrer|same-origin)/i.test(v),
    required: true,
    description: 'Limits referer leakage to other origins.',
  },
  {
    name: 'Permissions-Policy',
    expected: 'camera=(), microphone=(), geolocation=()',
    matcher: (v) => !!v && /camera=\(\)/i.test(v) && /microphone=\(\)/i.test(v),
    required: true,
    description: 'Disables powerful browser APIs we do not use.',
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    expected: 'same-origin',
    matcher: (v) => v?.toLowerCase() === 'same-origin',
    required: true,
    description: 'Isolates browsing context group - kills Spectre-class cross-window attacks.',
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    expected: 'require-corp',
    matcher: (v) => v?.toLowerCase() === 'require-corp',
    required: true,
    description: 'Forces explicit opt-in for cross-origin embedded resources.',
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    expected: 'same-origin',
    matcher: (v) => v?.toLowerCase() === 'same-origin',
    required: true,
    description: 'Forbids other origins from loading our resources via <img>/<script>.',
  },
];

async function probeHeaders(): Promise<{ headerMap: Record<string, string>; origin: string }> {
  const h = nextHeaders();
  const host = h.get('host') ?? 'mnnr.app';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const origin = `${proto}://${host}`;
  try {
    const res = await fetch(origin + '/', {
      method: 'HEAD',
      cache: 'no-store',
      redirect: 'manual',
    });
    const headerMap: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headerMap[key.toLowerCase()] = value;
    });
    return { headerMap, origin };
  } catch {
    return { headerMap: {}, origin };
  }
}

// ============================================================================
// UI primitives
// ============================================================================

function Badge({ ok, label }: { ok: boolean; label?: string }) {
  const text = label ?? (ok ? 'PASS' : 'FAIL');
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ' +
        (ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')
      }
    >
      {ok ? '✓ ' : '✗ '}
      {text}
    </span>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-slate-900 px-4 py-3 text-xs leading-relaxed text-slate-100">
      <code>{children}</code>
    </pre>
  );
}

// ============================================================================
// Page
// ============================================================================

export default async function SecurityPage() {
  const { headerMap, origin } = await probeHeaders();
  const buildSha = process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 7) ?? 'main';

  const securityControls = [
    {
      name: 'CSRF Protection',
      claim:
        "Fail-closed in production. Tokens HMAC-signed with CSRF_SECRET. Missing secret aborts boot - the app will not start without it.",
      proof: {
        label: 'lib/security.ts (source) →',
        href: 'https://github.com/MNNRAPP/mnnr-complete2025/blob/main/lib/security.ts',
      },
    },
    {
      name: 'Rate Limiting',
      claim:
        'Upstash Redis required in production. Sensitive routes fall CLOSED (5xx) on backend error rather than open. Per-route tiers in middleware.',
      proof: {
        label: 'utils/rate-limit.ts (source) →',
        href: 'https://github.com/MNNRAPP/mnnr-complete2025/blob/main/utils/rate-limit.ts',
      },
    },
    {
      name: 'Row-Level Security (RLS)',
      claim:
        'All 7 production tables have RLS enabled. Policies bind to auth.uid() / app.current_user_id - there is no row a logged-in user can read that does not belong to them.',
      proof: {
        label: 'prisma/migrations/20260619000000_init_rls →',
        href: 'https://github.com/MNNRAPP/mnnr-complete2025/blob/main/prisma/migrations/20260619000000_init_rls/migration.sql',
      },
    },
    {
      name: 'Authentication',
      claim:
        'Clerk required for /api/* and /dashboard. Unauth API requests return 401 + WWW-Authenticate: Bearer realm="mnnr-api" (not a 307 redirect).',
      proof: {
        label: 'middleware.ts (source) →',
        href: 'https://github.com/MNNRAPP/mnnr-complete2025/blob/main/middleware.ts',
      },
    },
    {
      name: 'Payment Verification (x402)',
      claim:
        'On-chain transaction verification + replay protection via a unique tx_hash table. Currently feature-flagged off pending Base testnet smoke; flips to true once verified.',
      proof: {
        label: '__tests__/unit/lib/x402-verify.test.ts →',
        href: 'https://github.com/MNNRAPP/mnnr-complete2025/blob/main/__tests__/unit/lib/x402-verify.test.ts',
      },
    },
    {
      name: 'CAPTCHA (Cloudflare Turnstile)',
      claim:
        'Required on newsletter sign-up and account sign-up. Token validation is server-side - client cannot bypass by omitting the widget.',
      proof: {
        label: 'mnnr.app landing form (live) →',
        href: 'https://mnnr.app/',
      },
    },
    {
      name: 'Audit Logging',
      claim:
        'audit_logs table records every privileged action (key issuance, role change, plan change). Append-only; immutable in production.',
      proof: {
        label: 'audit_logs migration →',
        href: 'https://github.com/MNNRAPP/mnnr-complete2025/blob/main/supabase/migrations/20251227_api_keys.sql',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
          <a href="/" className="text-xl font-bold text-blue-600">
            MNNR
          </a>
          <nav className="flex gap-6 text-sm text-slate-600">
            <a href="/about" className="hover:text-slate-900">About</a>
            <a href="/pricing" className="hover:text-slate-900">Pricing</a>
            <a href="/docs/api-reference" className="hover:text-slate-900">Docs</a>
            <a href="/security" className="font-semibold text-slate-900">Security</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Security at MNNR</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Every control on this page is externally verifiable. Headers below are
            probed live from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">{origin}</code> on
            every page load - no cache, no static snapshot. If a row says PASS,
            you can reproduce it in 30 seconds with the curl commands at the
            bottom.
          </p>
        </section>

        {/* ---------- 1. Live security headers ---------- */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold">Live security headers</h2>
          <p className="mb-4 text-sm text-slate-600">
            Probed server-side from <code>{origin}/</code> just now. Refresh the
            page to re-probe.
          </p>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Header</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Observed value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {HEADER_CHECKS.map((chk) => {
                  const observed = headerMap[chk.name.toLowerCase()] ?? null;
                  const ok = chk.matcher(observed);
                  return (
                    <tr key={chk.name}>
                      <td className="px-4 py-3 align-top">
                        <div className="font-mono font-semibold">{chk.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{chk.description}</div>
                        <div className="mt-1 text-xs text-slate-400">
                          Expected: <code>{chk.expected}</code>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <Badge ok={ok} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <code className="block max-w-md break-all rounded bg-slate-100 px-2 py-1 text-xs">
                          {observed ?? '(absent)'}
                        </code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- 2. Security controls ---------- */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold">Security controls</h2>
          <div className="space-y-4">
            {securityControls.map((c) => (
              <div
                key={c.name}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold">{c.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{c.claim}</p>
                <a
                  href={c.proof.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  {c.proof.label}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- 3. CI / audit health ---------- */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold">CI &amp; audit health</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500">Latest CI run</div>
              <div className="mt-1 text-sm">
                <a
                  href="https://github.com/MNNRAPP/mnnr-complete2025/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  GitHub Actions →
                </a>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500">Dependency alerts</div>
              <div className="mt-1 text-sm">
                <a
                  href="https://github.com/MNNRAPP/mnnr-complete2025/security/dependabot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Dependabot →
                </a>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500">Code scanning</div>
              <div className="mt-1 text-sm">
                <a
                  href="https://github.com/MNNRAPP/mnnr-complete2025/security/code-scanning"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  CodeQL alerts →
                </a>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-slate-500">Current deploy</div>
              <div className="mt-1 font-mono text-sm">{buildSha}</div>
            </div>
          </div>
        </section>

        {/* ---------- 4. Documents ---------- */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold">Documents</h2>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>
              <a
                href="https://github.com/MNNRAPP/mnnr-complete2025/blob/main/SECURITY.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                SECURITY.md
              </a>{' '}
              - vulnerability disclosure policy, contact, scope.
            </li>
            <li>
              <a
                href="https://github.com/MNNRAPP/mnnr-complete2025/blob/main/KEY_MANAGEMENT_POLICY.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                KEY_MANAGEMENT_POLICY.md
              </a>{' '}
              - rotation cadence, storage, access boundaries.
            </li>
            <li>
              <a
                href="https://github.com/MNNRAPP/mnnr-complete2025/blob/main/openapi.yaml"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline"
              >
                OpenAPI specification
              </a>{' '}
              - every endpoint, every parameter, every response.
            </li>
            <li>
              <a href="/docs/api-reference" className="font-medium text-blue-600 hover:underline">
                Swagger UI (live)
              </a>{' '}
              - interactive API explorer.
            </li>
          </ul>
        </section>

        {/* ---------- 5. 60-second verification ---------- */}
        <section className="mb-12">
          <h2 className="mb-3 text-2xl font-semibold">Verify yourself in 60 seconds</h2>
          <p className="mb-4 text-sm text-slate-600">
            Copy these commands. No account, no API key - they all run against
            production right now.
          </p>

          <div className="space-y-5">
            <div>
              <div className="mb-2 text-sm font-semibold">
                1. Confirm /api/keys is auth-gated (expect <code>401</code> + <code>WWW-Authenticate</code>):
              </div>
              <CodeBlock>{`curl -sI ${origin}/api/v1/keys | grep -iE 'HTTP|WWW-Authenticate'`}</CodeBlock>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold">
                2. Confirm /api/health surfaces configured services (expect JSON, no secrets):
              </div>
              <CodeBlock>{`curl -s ${origin}/api/health | python3 -m json.tool`}</CodeBlock>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold">
                3. Confirm security headers on the landing page:
              </div>
              <CodeBlock>{`curl -sI ${origin}/ | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy|cross-origin'`}</CodeBlock>
            </div>

            <div>
              <div className="mb-2 text-sm font-semibold">
                4. Confirm Turnstile widget is in raw HTML on mnnr.app:
              </div>
              <CodeBlock>{`curl -s https://mnnr.app/ | grep -c 'cf-turnstile'`}</CodeBlock>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-6 text-xs text-slate-500">
          <p>
            Report a vulnerability:{' '}
            <a href="mailto:security@mnnr.app" className="text-blue-600 hover:underline">
              security@mnnr.app
            </a>
            . Coordinated disclosure encouraged. PGP key in SECURITY.md.
          </p>
          <p className="mt-1">
            Last page-render: {new Date().toISOString()}. Page is{' '}
            <code>force-dynamic</code> - no caching.
          </p>
        </footer>
      </main>
    </div>
  );
}
