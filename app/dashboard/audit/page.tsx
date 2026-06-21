// app/dashboard/audit/page.tsx — per-user audit trail view.
//
// Audit events are durable forensic records: every key creation, deletion,
// payment attempt, and security-relevant action lands here. SOC 2-style
// review starts with this page.
//
// Note: lib/audit-trail.ts currently logs to console (per its own comment).
// The route below queries the AuditEvent Prisma model directly, which is
// the canonical store the migration set up. Once the audit-trail helper
// is wired to write through to AuditEvent (separate PR), this page will
// fill in.

import type { Metadata } from 'next';

import { db } from '@/lib/db';
import { getOrCreateUser } from '@/lib/user';

export const metadata: Metadata = {
  title: 'Audit | MNNR Dashboard',
  description: 'Forensic audit trail of every security-relevant action.',
};

export const dynamic = 'force-dynamic';

const OUTCOME_STYLES: Record<string, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  failure: 'bg-red-500/15 text-red-300 ring-red-500/30',
  denied: 'bg-yellow-500/15 text-yellow-300 ring-yellow-500/30',
};

export default async function AuditPage() {
  const user = await getOrCreateUser();
  if (!user) return null;

  const events = await db.auditEvent.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
        <p className="mt-1 text-sm text-gray-400">
          Every security-relevant action on your account — authentication,
          key changes, payment attempts. Most recent 100 events.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950 p-12 text-center">
          <p className="text-gray-300">No audit events yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Once you start using your account (creating keys, making API
            calls), events will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-800 text-sm">
            <thead className="bg-zinc-950">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Time
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Event
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Outcome
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  IP
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-400">
                  Reason
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {events.map((e) => (
                <tr key={String(e.id)} className="hover:bg-zinc-800/40">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-300">
                    {e.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-zinc-950 px-2 py-1 text-xs text-emerald-300">
                      {e.event}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ${
                        OUTCOME_STYLES[e.outcome] ??
                        'bg-zinc-800 text-zinc-300 ring-zinc-700'
                      }`}
                    >
                      {e.outcome}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-400">
                    {e.actorIp ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {e.reason ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
