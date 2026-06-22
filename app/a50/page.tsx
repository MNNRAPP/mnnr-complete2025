/**
 * /a50 — Article 50 readiness wedge (deliberately sparse, evidence-gated).
 *
 * Claims-register mapping (see claims_register.md):
 *   - Intro uses the softened CLM-001 wording ("designed to support ... Article 50
 *     transparency obligations") + required caveat. CLM-001 is Pending counsel;
 *     this page therefore does NOT assert "Article 50 compliant" or the Aug-2-2026
 *     applicability/deadline (CLM-002, Pending Legal Review).
 *   - Offer block uses CLM-005 (Approved with Caveat) wording + caveat.
 *   - Retrofit scope mirrors the pilot SOW deliverables, framed as technical scope
 *     (not a compliance warranty); CLM-004/008/009/010 caveats applied.
 *
 * Cal.com booking URL is a placeholder pending Tohid. Public route.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Article 50 Readiness — MNNR',
  description:
    'MNNR provides technical controls designed to support EU AI Act Article 50 transparency obligations for agentic payment flows. A50 Emergency Retrofit: €15,000 flat, five-day scope.',
  robots: { index: true, follow: true },
};

export const dynamic = 'force-static';

// Booking link — replace with the real Cal.com URL before this CTA goes live.
const BOOKING_URL = '[Cal.com link]';

const RETROFIT_SCOPE = [
  'Deploy the MNNR governance layer to your staging or sandbox environment.',
  'Integrate one policy-check call into one agreed payment-initiation flow.',
  'Enable AI-actor self-identification tagging for the agreed test flow.',
  'Enable mandate-bound policy logging for the agreed test flow.',
  'Deliver one sample audit export (CSV or JSON).',
  'Provide one implementation runbook and a two-hour handover session.',
];

export default function A50Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-gray-200">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white">
          Article 50 readiness for agentic payments
        </h1>
        <p className="mt-3 text-base leading-relaxed text-gray-300">
          MNNR provides technical controls designed to support EU AI Act Article
          50 transparency obligations for agentic payment flows — AI-actor
          self-identification, mandate binding, policy enforcement, and audit
          exports.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Not legal advice. Customer remains responsible for its own compliance
          determination. Applicability depends on role, system, and
          implementation context.
        </p>
      </header>

      <section className="mt-10 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <h2 className="text-xl font-semibold text-white">
          A50 Emergency Retrofit
        </h2>
        <p className="mt-2 text-2xl font-bold text-emerald-300">
          €15,000 flat
          <span className="ml-2 align-middle text-sm font-normal text-gray-400">
            for one agreed five-day technical scope
          </span>
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Scope exclusions apply. Customer access and a test environment are
          required. Timeline depends on customer access and sandbox readiness.
          No compliance warranty.
        </p>
        <div className="mt-5">
          <Link
            href={BOOKING_URL}
            className="inline-block rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Book a scoping call
          </Link>
          <span className="ml-3 text-xs text-gray-500">
            or email{' '}
            <Link
              href="mailto:security@mnnr.app"
              className="text-emerald-300 underline hover:text-emerald-200"
            >
              security@mnnr.app
            </Link>
          </span>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">
          What the retrofit covers
        </h2>
        <ul className="mt-4 space-y-3">
          {RETROFIT_SCOPE.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-gray-300">
              <span aria-hidden="true" className="mt-1 text-emerald-400">
                →
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">
          Ongoing: Design Partner Pilot
        </h2>
        <p className="mt-3 leading-relaxed text-gray-300">
          Design Partner Pilot: €5,000/month, 90-day scope. Availability, scope,
          and acceptance are subject to a written pilot agreement.
        </p>
      </section>

      <section className="mt-10 border-t border-zinc-800 pt-6">
        <p className="text-sm leading-relaxed text-gray-400">
          MNNR provides technical controls designed to support transparency,
          governance, and auditability. MNNR is not a payment rail, is not a
          bank, does not provide legal advice, and does not guarantee regulatory
          compliance.
        </p>
      </section>
    </main>
  );
}
