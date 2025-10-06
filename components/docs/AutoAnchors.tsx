"use client";

import { useEffect } from 'react';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function AutoAnchors({ rootSelector = '#docs-content' }: { rootSelector?: string }) {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5')) as HTMLHeadingElement[];
    headings.forEach((h) => {
      if (!h.id) {
        const id = slugify(h.textContent || '');
        if (id) h.id = id;
      }

      // Avoid duplicating anchors on re-renders
      if (h.querySelector('a.heading-anchor')) return;

      if (h.id) {
        const link = document.createElement('a');
        link.href = `#${h.id}`;
        link.className = 'heading-anchor';
        link.setAttribute('aria-label', 'Link to this section');
        link.innerText = '#';
        link.addEventListener('click', async (e) => {
          // Copy the full URL to clipboard for convenience
          e.preventDefault();
          const url = new URL(window.location.href);
          url.hash = h.id;
          try {
            await navigator.clipboard.writeText(url.toString());
            link.classList.add('copied');
            setTimeout(() => link.classList.remove('copied'), 800);
          } catch (_) {
            // Fallback to just navigating if clipboard fails
            window.location.hash = h.id;
          }
        });
        // Append a small space then the anchor marker
        const spacer = document.createTextNode(' ');
        h.appendChild(spacer);
        h.appendChild(link);
      }
    });
  }, [rootSelector]);

  return null;
}
