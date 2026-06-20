// app/not-found.tsx — branded 404 surface.
//
// Next 14 renders this for unmatched routes. We want it on-brand (dark
// MNNR theme, emerald accent) and to surface the most useful destinations
// instead of dead-ending the user.

import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '404 — Not found | MNNR',
  description: 'The page you were looking for could not be found.',
};

const links: Array<{ href: string; label: string; body: string }> = [
  {
    href: '/',
    label: 'Home',
    body: 'Back to the MNNR overview.',
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    body: 'Manage your keys, usage, and audit log.',
  },
  {
    href: '/docs',
    label: 'Documentation',
    body: 'Read the API reference and integration guides.',
  },
  {
    href: '/sign-in',
    label: 'Sign in',
    body: 'Access your MNNR account.',
  },
];

export default function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-8rem)] bg-black px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
          We can&apos;t find that page
        </h1>
        <p className="mt-4 text-base text-gray-400">
          The URL might be stale, or the page may have moved. Try one of
          these instead.
        </p>

        <ul className="mt-10 grid gap-3 text-left sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-emerald-500/40 hover:bg-zinc-900/80"
              >
                <span className="text-sm font-semibold text-white">
                  {l.label}
                </span>
                <span className="mt-1 block text-xs text-gray-400">
                  {l.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-xs text-gray-500">
          Still stuck?{' '}
          <a
            href="mailto:support@mnnr.app"
            className="text-emerald-400 underline hover:text-emerald-300"
          >
            support@mnnr.app
          </a>
        </p>
      </div>
    </div>
  );
}
