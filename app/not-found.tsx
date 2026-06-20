import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page not found | mnnr',
  description:
    "The page you're looking for doesn't exist. Return to mnnr — the governance layer for agentic payments.",
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">
        404 &middot; Not found
      </p>
      <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
        That page isn&rsquo;t here.
      </h1>
      <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-400">
        The URL may have changed, or the resource was retired. Here are the
        things people are usually looking for.
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <Link
          href="/"
          className="rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900/70"
        >
          <div className="mb-1 text-sm font-semibold text-white">Home</div>
          <div className="text-xs text-slate-400">
            The mnnr governance-layer overview.
          </div>
        </Link>

        <Link
          href="/docs/api-reference"
          className="rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900/70"
        >
          <div className="mb-1 text-sm font-semibold text-white">
            API reference
          </div>
          <div className="text-xs text-slate-400">
            Swagger UI &middot; live endpoints &middot; OpenAPI spec.
          </div>
        </Link>

        <Link
          href="/sign-in"
          className="rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900/70"
        >
          <div className="mb-1 text-sm font-semibold text-white">Sign in</div>
          <div className="text-xs text-slate-400">
            Dashboard, API keys, usage events.
          </div>
        </Link>

        <Link
          href="/status"
          className="rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900/70"
        >
          <div className="mb-1 text-sm font-semibold text-white">Status</div>
          <div className="text-xs text-slate-400">
            Live service health &middot; recent incidents.
          </div>
        </Link>

        <Link
          href="/security"
          className="rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900/70"
        >
          <div className="mb-1 text-sm font-semibold text-white">Security</div>
          <div className="text-xs text-slate-400">
            Post-quantum keys, audit trail, compliance posture.
          </div>
        </Link>

        <a
          href="https://mnnr.app/"
          className="rounded-lg border border-white/10 bg-slate-900/40 p-4 transition hover:border-emerald-400/40 hover:bg-slate-900/70"
        >
          <div className="mb-1 text-sm font-semibold text-white">
            Landing (mnnr.app)
          </div>
          <div className="text-xs text-slate-400">
            Pricing, briefs, A50 Emergency Retrofit.
          </div>
        </a>
      </div>

      <p className="mt-10 text-xs text-slate-500">
        If you arrived here from an outside link, please email{' '}
        <a
          href="mailto:hello@mnnr.app"
          className="text-emerald-400 hover:text-emerald-300"
        >
          hello@mnnr.app
        </a>{' '}
        so we can fix the reference.
      </p>
    </main>
  );
}
