"use client";
import { PropsWithChildren, useState } from 'react';
import Link from 'next/link';
import SidebarNav from '@/components/docs/SidebarNav';
import TOC from '@/components/docs/TOC';
import AutoAnchors from '@/components/docs/AutoAnchors';

export default function DocsLayout({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Mobile sticky header */}
      <div className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-emerald-400 font-bold text-xl hover:text-emerald-300 transition-colors">
              MNNR
            </Link>
            <span className="text-zinc-500">/</span>
            <span className="font-semibold text-zinc-100">Documentation</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="hidden sm:inline-flex text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/signin" 
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-zinc-900 bg-emerald-400 rounded-lg hover:bg-emerald-300 transition-colors"
            >
              Get Started
            </Link>
            <button
              className="md:hidden inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 ring-1 ring-zinc-700 hover:bg-zinc-800 transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Open docs navigation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 014.5 6h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 5.25a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm.75 4.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5h-15z" clipRule="evenodd" />
              </svg>
              Menu
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-zinc-900 shadow-2xl border-r border-zinc-800">
            <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
              <div className="font-semibold text-zinc-100">Documentation</div>
              <button className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors" onClick={() => setOpen(false)} aria-label="Close navigation">Close</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-60px)]">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-12 grid grid-cols-12 gap-8">
        <aside className="hidden md:block md:col-span-3 xl:col-span-2">
          <div className="sticky top-24">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <SidebarNav />
            </div>
          </div>
        </aside>

        <main id="docs-content" className="col-span-12 md:col-span-9 xl:col-span-8 prose prose-invert prose-zinc max-w-none prose-headings:text-zinc-100 prose-headings:font-semibold prose-h1:text-3xl prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b prose-h1:border-zinc-800 prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-zinc-300 prose-p:leading-relaxed prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:text-emerald-300 prose-strong:text-zinc-100 prose-code:text-emerald-400 prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-ul:text-zinc-300 prose-ol:text-zinc-300 prose-li:marker:text-emerald-500 prose-blockquote:border-l-emerald-500 prose-blockquote:bg-zinc-900/50 prose-blockquote:text-zinc-300 prose-th:bg-zinc-800 prose-th:text-zinc-100 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-zinc-800 prose-td:text-zinc-300 prose-hr:border-zinc-800">
          <AutoAnchors />
          {children}
        </main>

        <aside className="hidden xl:block xl:col-span-2">
          <div className="sticky top-24">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">On this page</h4>
              <TOC rootSelector="#docs-content" />
            </div>
          </div>
        </aside>
      </div>

      <footer className="border-t border-zinc-800 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-zinc-500">© 2025 MNNR. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <Link href="/docs/quick-start" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">Quick Start</Link>
              <Link href="/docs/api" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">API Reference</Link>
              <Link href="https://github.com/MNNRAPP" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
