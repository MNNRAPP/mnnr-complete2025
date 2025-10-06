"use client";

import { useEffect, useMemo, useState } from 'react';

type Heading = { id: string; text: string; level: number };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getHeadings(root: Element | null): Heading[] {
  if (!root) return [];
  const nodes = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5')) as HTMLHeadingElement[];
  nodes.forEach((n) => {
    if (!n.id) {
      const id = slugify(n.textContent || '');
      if (id) n.id = id;
    }
  });
  return nodes.map((n) => ({
    id: n.id,
    text: n.textContent || '',
    level: Number(n.tagName.substring(1)),
  }));
}

function indentClass(level: number) {
  switch (level) {
    case 1:
      return 'pl-0';
    case 2:
      return 'pl-3';
    case 3:
      return 'pl-6';
    case 4:
      return 'pl-9';
    default:
      return 'pl-12';
  }
}

export default function TOC({ rootSelector = '#docs-content' }: { rootSelector?: string }) {
  const [active, setActive] = useState<string>('');
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const root = document.querySelector(rootSelector);
    setHeadings(getHeadings(root));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop
          );
        if (visible[0]) setActive((visible[0].target as HTMLElement).id);
      },
      { rootMargin: '0px 0px -70% 0px', threshold: [0, 1] }
    );

  const hs = Array.from(root?.querySelectorAll('h1, h2, h3, h4, h5') || []);
    hs.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [rootSelector]);

  const items = useMemo(() => headings, [headings]);
  if (!items.length) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        On this page
      </div>
      <ul className="space-y-1">
        {items.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={
                `block rounded-md px-2 py-1 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 ${indentClass(h.level)} ` +
                (active === h.id ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200' : '')
              }
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
