// app/dashboard/usage/UsageTable.tsx — narrow client component for the row list.
//
// Client because we render relative-time strings ("3m ago") and want them
// to be human-friendly without a hydration mismatch on SSR.

'use client';

import { useState } from 'react';

interface UsageRow {
  id: string;
  event: string;
  createdAt: string;
  meta: Record<string, unknown> | null;
}

export default function UsageTable({ events }: { events: UsageRow[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
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
              Meta
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {events.map((e) => (
            <tr key={e.id} className="hover:bg-zinc-800/40">
              <td className="whitespace-nowrap px-4 py-3 text-gray-300">
                {new Date(e.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <code className="rounded bg-zinc-950 px-2 py-1 text-xs text-emerald-300">
                  {e.event}
                </code>
              </td>
              <td className="px-4 py-3 text-gray-400">
                {e.meta && Object.keys(e.meta).length > 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(expanded === e.id ? null : e.id)
                    }
                    className="text-xs text-emerald-400 underline hover:text-emerald-300"
                  >
                    {expanded === e.id ? 'Hide' : 'Show'} JSON
                  </button>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
                {expanded === e.id && (
                  <pre className="mt-2 overflow-x-auto rounded bg-zinc-950 p-2 text-xs text-gray-300">
                    {JSON.stringify(e.meta, null, 2)}
                  </pre>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
