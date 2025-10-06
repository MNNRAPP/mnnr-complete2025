"use client";

import { PropsWithChildren, useState } from 'react';
import SidebarNav from '@/components/docs/SidebarNav';
import TOC from '@/components/docs/TOC';
import AutoAnchors from '@/components/docs/AutoAnchors';

export default function DocsLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Mobile sticky header */}
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Documentation</div>
          <button
            className="md:hidden inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
            onClick={() => setOpen(true)}
            aria-label="Open docs navigation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M3.75 6.75A.75.75 0 014.5 6h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z"
                clipRule="evenodd"
              />
            </svg>
            Menu
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">Docs</div>
              <button
                className="inline-flex items-center rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 lg:py-12 grid grid-cols-12 gap-6">
        <aside className="hidden md:block md:col-span-3 xl:col-span-2">
          <div className="sticky top-20">
            <SidebarNav />
          </div>
        </aside>
        <main id="docs-content" className="col-span-12 md:col-span-9 xl:col-span-8 prose prose-slate max-w-none">
          <AutoAnchors />
          {children}
        </main>
        <aside className="hidden xl:block xl:col-span-2">
          <div className="sticky top-24">
            <TOC rootSelector="#docs-content" />
          </div>
        </aside>
      </div>
    </div>
  );
}
