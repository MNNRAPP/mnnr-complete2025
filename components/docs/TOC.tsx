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
  const nodes = Array.from(root.querySelectorAll('h2, h3, h4')) as HTMLHeadingElement[];
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
    case 2:
      return 'pl-0';
    case 3:
      return 'pl-3';
    case 4:
      return 'pl-6';
    default:
      return 'pl-9';
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
    
    const hs = Array.from(root?.querySelectorAll('h2, h3, h4') || []);
    hs.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [rootSelector]);

  const items = useMemo(() => headings, [headings]);
  
  if (!items.length) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <ul className="space-y-1">
        {items.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block rounded-lg px-2 py-1.5 transition-colors ${indentClass(h.level)} ${
                active === h.id 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
