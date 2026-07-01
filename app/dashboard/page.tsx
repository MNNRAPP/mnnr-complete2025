/**
 * Dashboard overview page — server component.
 *
 * Renders inside app/dashboard/layout.tsx (which owns the dark wrapper +
 * auth gate + DashboardNav). This page is the "overview" tab — a
 * welcome banner, headline counters, and a CTA grid that routes into
 * /dashboard/keys|usage|audit|settings.
 *
 * Re-fetches the active Stripe subscription on the server because it's
 * the cheapest place to do it (single HTTP round-trip with Stripe;
 * client doesn't need the Stripe SDK in its bundle).
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import Stripe from 'stripe';
import { auth, currentUser } from '@clerk/nextjs/server';

import { db } from '@/lib/db';
import { getOrCreateUser } from '@/lib/user';

export const metadata = {
  title: 'Dashboard | MNNR',
  description: 'Overview of API keys, usage, audit, and subscription.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId: clerkId } = auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getOrCreateUser();
  if (!user) redirect('/sign-in');

  const cu = await currentUser();
  const displayName =
    [cu?.firstName, cu?.lastName].filter(Boolean).join(' ') ||
    cu?.username ||
    user.email;

  // --- Live counters from Neon. Three cheap COUNT queries; could be a
  // single CTE later if this gets hot. ---
  const [keyCount, usageCount, auditCount] = await Promise.all([
    db.apiKey.count({ where: { userId: user.id, revoked: false } }),
    db.usageEvent.count({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    db.auditEvent.count({ where: { userId: user.id } }),
  ]);

  // --- Stripe subscription lookup. Best-effort — never breaks the page. ---
  let activeSubscription: Stripe.Subscription | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      const customer = customers.data[0];
      if (customer) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 10,
          expand: ['data.items.data.price.product'],
        });
        activeSubscription =
          subs.data.find(
            (s) => s.status === 'active' || s.status === 'trialing',
          ) ?? null;
      }
    } catch (err) {
      console.error('Dashboard Stripe lookup failed', err);
    }
  }

  const planName = activeSubscription
    ? (activeSubscription.items.data[0]?.price?.nickname ??
      (
        activeSubscription.items.data[0]?.price?.product as Stripe.Product
      )?.name ??
      activeSubscription.status)
    : 'Free';

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">
          Welcome back, <span className="text-gray-200">{displayName}</span>
        </p>
      </header>

      {!user.onboardedAt && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-emerald-200">
              You haven&apos;t finished onboarding
            </p>
            <p className="text-xs text-emerald-300/80">
              Three quick steps to your first working API call.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Start tour
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active API keys"
          value={keyCount.toLocaleString()}
          href="/dashboard/keys"
          cta="Manage"
        />
        <StatCard
          label="Usage events (30d)"
          value={usageCount.toLocaleString()}
          href="/dashboard/usage"
          cta="View"
        />
        <StatCard
          label="Audit events"
          value={auditCount.toLocaleString()}
          href="/dashboard/audit"
          cta="Inspect"
        />
        <StatCard label="Plan" value={planName} href="/pricing" cta="Upgrade" />
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Get the most out of MNNR"
          body="Drop the curl from onboarding into a cron, a Cloudflare Worker, a Netlify function, or your agent runtime — every authenticated call lights up your usage feed."
          cta={{ href: '/dashboard/keys', label: 'Create another API key →' }}
        />
        <Panel
          title="Need x402 micropayments?"
          body="The /api/x402 endpoint serves machine-to-machine HTTP 402 challenges with on-chain settlement on Base. Verification stays gated until you flip the env switch."
          cta={{ href: '/docs/x402', label: 'Read the x402 spec →' }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  cta,
}: {
  label: string;
  value: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-emerald-500/40 hover:bg-zinc-900/80"
    >
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="mt-1 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-3 text-xs text-emerald-400">{cta} →</div>
    </Link>
  );
}

function Panel({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-gray-400">{body}</p>
      <Link
        href={cta.href}
        className="mt-4 inline-block text-sm font-medium text-emerald-400 hover:text-emerald-300"
      >
        {cta.label}
      </Link>
    </div>
  );
}
