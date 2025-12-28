"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = { onNavigate?: () => void };

const sections = [
  { title: 'Overview', items: [
    { href: '/docs', label: 'Getting Started' },
    { href: '/docs/quick-start', label: 'Quick Start' },
  ]},
  { title: 'Guides', items: [
    { href: '/docs/deployment', label: 'Deployment' },
    { href: '/docs/security', label: 'Security' },
    { href: '/docs/enterprise', label: 'Enterprise' },
  ]},
  { title: 'Reference', items: [
    { href: '/docs/api', label: 'API Reference' },
    { href: '/docs/changelog', label: 'Changelog' },
  ]},
];

export default function SidebarNav({ onNavigate }: Props) {
  const pathname = usePathname();
  
  return (
    <nav className="text-sm">
      {sections.map((group) => (
        <div key={group.title} className="mb-6">
          <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {group.title}
          </div>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 transition-colors ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
