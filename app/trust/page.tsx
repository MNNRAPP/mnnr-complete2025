/**
 * /trust — Trust Center (deliberately sparse).
 *
 * Per the claims register (claims_register.md), every sentence on this page must
 * map to an Approved row. Until security/hosting/uptime/insurance/certification
 * rows are evidenced and counsel-approved, this page enumerates ONLY:
 *   - the generic governance-controls statement,
 *   - a preparing-diligence-materials status,
 *   - an available-on-request list,
 *   - the compliance caveat, and
 *   - the security contact.
 *
 * Do NOT add CSP/HSTS/MFA/Argon2id/HSM/region/uptime/insurance claims here until
 * they have an Approved row. Sparse is safer than false precision.
 *
 * Public route (added to middleware.ts publicRoutes). Server component.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Trust Center — MNNR',
  description:
    'MNNR provides technical controls designed to support transparency, governance, and auditability in agentic payment flows. Pilot diligence materials available on request.',
  robots: { index: true, follow: true },
};

export const dynamic = 'force-static';

const ON_REQUEST = [
  'Pilot MSA',
  'Pilot Statement of Work',
  'Data Processing Addendum',
  'Security questionnaire responses',
  'Subprocessor list',
  'Architecture overview',
  'Sample audit export',
  'Incident response summary',
];

export default function TrustPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-gray-200">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Trust Center</h1>
        <p className="mt-2 text-sm text-gray-400">Last updated: 2026-06-22</p>
      </header>

      <p className="mt-8 text-base leading-relaxed">
        MNNR provides technical controls designed to support transparency,
        governance, and auditability in agentic payment flows.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">
          Security and compliance status
        </h2>
        <p className="mt-3 leading-relaxed text-gray-300">
          MNNR is currently preparing enterprise pilot diligence materials for
          Article 50 transparency support and PSD3/PSR-aligned payment-governance
          use cases.
        </p>
        <p className="mt-3 leading-relaxed text-gray-300">
          Current controls and documentation are maintained in a claim-controlled
          register. Public claims on this page are limited to controls that are
          implemented, evidenced, and approved for external use.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Available on request</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ON_REQUEST.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-gray-200"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">Compliance caveat</h2>
        <p className="mt-3 leading-relaxed text-gray-300">
          MNNR provides technical controls. MNNR does not provide legal advice,
          does not guarantee regulatory compliance, and does not replace customer
          legal, compliance, or risk review. Customers remain responsible for
          determining whether their implementation satisfies applicable legal and
          regulatory obligations.
        </p>
      </section>

      <section className="mt-10 border-t border-zinc-800 pt-6">
        <h2 className="text-xl font-semibold text-white">Security contact</h2>
        <p className="mt-3 text-gray-300">
          <Link
            href="mailto:security@mnnr.app"
            className="text-emerald-300 underline hover:text-emerald-200"
          >
            security@mnnr.app
          </Link>
        </p>
      </section>
    </main>
  );
}
