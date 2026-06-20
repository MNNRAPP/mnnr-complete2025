/**
 * Pricing Page — Defensive 4-tier vs AWS AgentCore GA bundling (2026-06-20).
 *
 * Replaces the Stripe-catalog-driven page with a hardcoded 4-tier structure
 * locked in BEFORE the ~90-day AWS AgentCore bundling window compresses
 * comparable price points. Each tier carries a written 25%-under-AWS price-
 * protection commitment that flows through to the MSA.
 *
 * Reviewer notes:
 *   1. Replaces dynamic Stripe-products rendering. If you want Stripe-driven
 *      tiers back later, restore from git history of this file (pre-2026-06-20).
 *   2. The four tier names, prices, and bullets MUST match the latest copy
 *      sales has been using verbally this week and the MSA template's
 *      price-protection clause.
 *   3. Source content snapshot lives at docs/pricing/PRICING_CONTENT_v1.md.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — MNNR.app',
  description:
    'Four defensive tiers covering EU AI Act Article 50 retrofit, PSD3 overlay, annual compliance, and multi-rail enterprise. Every plan carries a written 25%-under-AWS price-protection clause.',
};

type Tier = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  audience: string;
  highlight: boolean;
  bullets: string[];
  cta: { label: string; href: string };
};

const TIERS: Tier[] = [
  {
    id: 'a50-emergency',
    name: 'A50 Emergency Retrofit',
    tagline: '5-day deployment for the Aug 2, 2026 deadline',
    price: '€15,000',
    cadence: 'flat',
    audience:
      'Organisations facing the Aug 2, 2026 EU AI Act Article 50 deadline.',
    highlight: false,
    bullets: [
      'Article 50 disclosure layer deployed in 5 business days',
      'Pre-configured attestation templates',
      'Single-jurisdiction scope (EU 27)',
      'Handover documentation pack',
    ],
    cta: { label: 'Book a 30-min scope call', href: '/contact?tier=a50' },
  },
  {
    id: 'psd3-pilot',
    name: 'PSD3 Overlay Pilot',
    tagline: 'Month-to-month PSD3-aligned overlay',
    price: '€5,000',
    cadence: '/ month',
    audience:
      'Ongoing PSD3-aligned overlay for payments and financial-services AI workloads.',
    highlight: false,
    bullets: [
      'PSD3 control mapping maintained quarterly',
      'Continuous policy delta monitoring',
      'Up to 3 production workloads covered',
      'Email + chat support',
    ],
    cta: { label: 'Start the pilot', href: '/contact?tier=psd3' },
  },
  {
    id: 'annual',
    name: 'Annual Compliance Subscription',
    tagline: 'Best value — 17% savings vs monthly',
    price: '€50,000',
    cadence: '/ year',
    audience:
      'All overlay capabilities, locked in for 12 months at a fixed rate.',
    highlight: true,
    bullets: [
      'Everything in PSD3 Overlay Pilot',
      'Unlimited covered workloads (single tenant)',
      'Quarterly compliance posture report',
      'Named customer success contact',
      'Price locked for full 12 months',
    ],
    cta: { label: 'Talk to sales', href: '/contact?tier=annual' },
  },
  {
    id: 'enterprise',
    name: 'Multi-rail Enterprise',
    tagline: 'Unlimited attestations, dedicated SE, 24/7',
    price: '€120,000',
    cadence: '/ year',
    audience: 'Enterprise multi-rail deployment with custom MSA.',
    highlight: false,
    bullets: [
      'Everything in Annual Compliance Subscription',
      'Unlimited attestations across all jurisdictions',
      '24/7 support with named on-call engineer',
      'Dedicated solutions engineer',
      'Custom MSA available',
    ],
    cta: { label: 'Request enterprise terms', href: '/contact?tier=enterprise' },
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Pricing — built to stay 25% under AWS
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Four defensive tiers covering emergency Article 50 retrofit, ongoing
          PSD3 overlay, annual compliance, and full multi-rail enterprise. Every
          plan carries a written price-protection clause against published AWS
          rates.
        </p>
      </header>

      <section
        aria-label="Pricing tiers"
        className="mt-12 grid gap-6 lg:grid-cols-4"
      >
        {TIERS.map((tier) => (
          <article
            key={tier.id}
            className={[
              'flex flex-col rounded-2xl border p-6 shadow-sm',
              tier.highlight
                ? 'border-blue-600 ring-2 ring-blue-600'
                : 'border-gray-200 dark:border-gray-800',
            ].join(' ')}
          >
            {tier.highlight ? (
              <span className="mb-3 inline-flex w-fit rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                Best value
              </span>
            ) : null}
            <h2 className="text-xl font-semibold">{tier.name}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {tier.tagline}
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold">{tier.price}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tier.cadence}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {tier.audience}
            </p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {tier.bullets.map((b) => (
                <li key={b} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              href={tier.cta.href}
              className={[
                'mt-6 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium',
                tier.highlight
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900',
              ].join(' ')}
            >
              {tier.cta.label}
            </Link>
          </article>
        ))}
      </section>

      <section
        aria-label="Price-protection commitment"
        className="mx-auto mt-16 max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950"
      >
        <h2 className="text-2xl font-semibold">
          The 25% price-protection commitment
        </h2>
        <p className="mt-3 text-gray-700 dark:text-gray-300">
          Every Master Service Agreement includes a written clause that MNNR.app
          will keep A50 SKU pricing at least 25% below the published comparable
          AWS or major cloud-bundled rate. We validate against published rates
          monthly and adjust to maintain the commitment.
        </p>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Rate-card source of truth: <code>docs/pricing/PRICING_CONTENT_v1.md</code>.
          MSA template clause: <code>§4.3 Price Protection</code>.
        </p>
      </section>

      <footer className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Pricing last revised 2026-06-20. Subject to change with 30 days notice
        for new orders; existing orders honor the rate at the time of signature.
      </footer>
    </main>
  );
}
