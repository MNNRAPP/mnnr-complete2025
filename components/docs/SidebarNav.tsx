import Link from 'next/link';

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
  return (
    <nav className="text-sm">
      {sections.map((group) => (
        <div key={group.title} className="mb-6">
          <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {group.title}
          </div>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={onNavigate}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
