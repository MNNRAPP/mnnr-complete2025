// app/dashboard/usage/page.tsx — usage events view.
//
// Server component: read the user's recent usage events from Neon directly
// via Prisma (we already have a Clerk session here via the layout's auth gate).
// Skipping the round-trip through /api/usage shaves a hop and keeps the
// markup HTML-streamable.

import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { getOrCreateUser } from '@/lib/user';
import UsageTable from './UsageTable';

export const metadata: Metadata = {
  title: 'Usage | MNNR Dashboard',
  description: 'Recent usage events, request counts, and event breakdown.',
};

export const dynamic = 'force-dynamic';

export default async function UsagePage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  // Last 30d, capped at 200 rows for the table. Aggregation runs in JS
  // because the dataset is tiny (free-tier traffic is bounded). When this
  // grows we can swap to a SQL group-by.
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const events = await db.usageEvent.findMany({
    where: { userId: user.id, createdAt: { gte: since } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const totalEvents = events.length;
  const byEvent = new Map<string, number>();
  for (const e of events) {
    byEvent.set(e.event, (byEvent.get(e.event) ?? 0) + 1);
  }
  const topEvents = Array.from(byEvent.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Usage</h1>
        <p className="mt-1 text-sm text-gray-400">
          The last 30 days of usage events recorded for your account.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Events (30d)" value={totalEvents.toLocaleString()} />
        <Stat
          label="Unique event types"
          value={byEvent.size.toLocaleString()}
        />
        <Stat
          label="First event in window"
          value={
            events.length
              ? new Date(
                  events[events.length - 1].createdAt,
                ).toLocaleDateString()
              : '—'
          }
        />
      </div>

      {topEvents.length > 0 && (
        <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-white">Top events</h2>
          <ul className="mt-3 space-y-2">
            {topEvents.map(([name, count]) => (
              <li
                key={name}
                className="flex items-center justify-between text-sm"
              >
                <code className="rounded bg-zinc-950 px-2 py-1 text-emerald-300">
                  {name}
                </code>
                <span className="text-gray-400">{count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-12 text-center">
          <p className="text-gray-300">No usage events yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Make your first API call with an API key from{' '}
            <a
              href="/dashboard/keys"
              className="text-emerald-400 underline hover:text-emerald-300"
            >
              the keys page
            </a>{' '}
            and it will appear here.
          </p>
        </div>
      ) : (
        <UsageTable
          events={events.map((e) => ({
            id: String(e.id),
            event: e.event,
            createdAt: e.createdAt.toISOString(),
            meta: e.meta as Record<string, unknown> | null,
          }))}
        />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
