// app/dashboard/DashboardNav.tsx — secondary nav for dashboard subpages.
//
// Client component because we read usePathname() to highlight the active tab.
// Otherwise pure presentation.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/keys', label: 'API Keys' },
  { href: '/dashboard/usage', label: 'Usage' },
  { href: '/dashboard/audit', label: 'Audit' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {tabs.map((tab) => {
          // /dashboard is active only on EXACT match (so it doesn't light up
          // when we're on /dashboard/keys). Subpages use startsWith.
          const isActive =
            tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-gray-400 hover:border-zinc-700 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
