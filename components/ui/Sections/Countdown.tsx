'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Countdown to EU AI Act Article 50 applicability (2 August 2026, 00:00 UTC).
 *
 * Rendered on `/` between EuropeanTimeline and CTA. Purpose:
 * pin the wedge in seconds-precision terms for cold-outreach recipients
 * verifying MNNR on the landing page after receiving the pitch email.
 *
 * Server-safe: renders a placeholder on SSR, hydrates on client, then ticks.
 */
const ARTICLE_50_DEADLINE_UTC = new Date('2026-08-02T00:00:00Z').getTime();

type Remaining = { days: number; hours: number; minutes: number; seconds: number; expired: boolean };

function computeRemaining(now: number): Remaining {
  const diff = ARTICLE_50_DEADLINE_UTC - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

export default function Countdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    // First tick immediately on mount, then every 1s.
    setRemaining(computeRemaining(Date.now()));
    const id = setInterval(() => setRemaining(computeRemaining(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative bg-[#050813] py-24 px-6 overflow-hidden">
      {/* Background glow — matches CTA amber accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] bg-amber-500/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-amber-400 text-sm font-medium tracking-wide uppercase">
            EU AI Act — Article 50 Applicability
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          Time to compliance for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-blue-400">
            AI-actor payment self-ID
          </span>
        </h2>
        <p className="text-lg text-white/50 max-w-3xl mx-auto mb-12">
          Article 50 of the EU AI Act becomes applicable on{' '}
          <span className="text-white/80">2 August 2026, 00:00 UTC</span>.
          Every agent-initiated payment interacting with EU merchants must ship AI-actor disclosure,
          mandate-scope binding, and audit-grade traceability by that date.
        </p>

        {/* Countdown grid */}
        <div
          className="grid grid-cols-4 gap-3 md:gap-6 max-w-3xl mx-auto mb-12 font-mono"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Countdown to EU AI Act Article 50 applicability on 2 August 2026"
        >
          {[
            { label: 'Days', value: remaining?.days },
            { label: 'Hours', value: remaining?.hours },
            { label: 'Minutes', value: remaining?.minutes },
            { label: 'Seconds', value: remaining?.seconds },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6"
            >
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent blur-sm pointer-events-none" />
              <div className="relative">
                <div className="text-3xl md:text-5xl font-bold text-white tabular-nums">
                  {value === undefined ? '--' : String(value).padStart(2, '0')}
                </div>
                <div className="text-white/40 text-xs md:text-sm uppercase tracking-wider mt-1">
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sub-context */}
        {remaining?.expired ? (
          <p className="text-amber-400 text-lg font-medium mb-8">
            Article 50 is now in force. If your agentic-payment governance layer isn't live, contact us immediately.
          </p>
        ) : (
          <p className="text-white/60 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            MNNR ships the governance layer above whichever rail your surface adopts —
            x402, AP2, UCP, ACP, or MCP payment server — via adapters.
            Rail-neutral by design, live before the deadline.
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/compliance-brief.pdf"
            className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold text-lg px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]"
          >
            <span>Read the Compliance Brief</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/eu-brief.pdf"
            className="group relative inline-flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white font-semibold text-lg px-10 py-4 rounded-xl backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/40"
          >
            <span>EU Brief</span>
          </Link>
        </div>

        {/* Positioning-honesty footnote — matches Claims Register discipline */}
        <p className="mt-10 text-white/30 text-xs max-w-2xl mx-auto leading-relaxed">
          Pre-launch positioning — target architecture and roadmap; external validation and
          certifications in progress. Positioning language above is not a technical or compliance
          claim.
        </p>
      </div>
    </section>
  );
}
