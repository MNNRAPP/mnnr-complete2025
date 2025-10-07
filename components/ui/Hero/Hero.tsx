'use client';

import ContactButton from '@/components/ui/ContactButton/ContactButton';
import LogoCloud from '@/components/ui/LogoCloud';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const metrics = [
  {
    label: 'Realtime settlement uptime',
    value: '99.995%',
    helper: 'Continuously audited across all rails'
  },
  {
    label: 'Enterprise pilots live',
    value: '22',
    helper: 'Global programs with finance + security sign-off'
  },
  {
    label: 'Policy decisions per minute',
    value: '2.7M',
    helper: 'Guardrails that adapt to every agent invocation'
  }
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(110%_110%_at_50%_-10%,rgba(22,163,74,0.18),rgba(15,23,42,0.65)_50%,rgba(10,10,10,0.95))]" />
        <div className="absolute -top-40 left-1/2 h-[540px] w-[540px] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-[150px]" />
        <div className="absolute -bottom-48 right-1/2 h-[420px] w-[420px] translate-x-1/3 rounded-full bg-sky-500/15 blur-[140px]" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-28 pt-24 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col gap-8 text-left">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
              Finance + security in lockstep
            </div>
            <div className="space-y-6 text-white">
              <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-6xl md:leading-[1.05]">
                The control plane Fortune 100 teams trust for autonomous payments
              </h1>
              <p className="max-w-xl text-base text-zinc-300 md:text-lg">
                MNNR orchestrates metering, policy enforcement, and settlement so your agents can transact without
                compromise. Launch globally confident that every request is priced, approved, and reconciled in real time.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/partners/register"
                className="group inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-base font-semibold text-slate-950 shadow-[0_18px_60px_rgba(148,163,184,0.3)] transition-all duration-200 hover:-translate-y-1 hover:bg-emerald-200"
              >
                Book a build review
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <ContactButton
                source="hero-landing-page"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3 text-base font-semibold text-white transition hover:border-emerald-300/50 hover:bg-emerald-300/10"
              >
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                Talk to a human
              </ContactButton>
            </div>
            <div className="grid gap-4 rounded-3xl border border-white/10 bg-black/50 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.45)] sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">{metric.label}</p>
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="text-xs text-zinc-400">{metric.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[32px] border border-white/10 bg-white/5 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/60 backdrop-blur">
              <div className="absolute inset-x-10 -top-10 h-40 rounded-full bg-emerald-400/25 blur-3xl" aria-hidden />
              <div className="relative flex flex-col gap-6 px-8 pb-10 pt-12">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                  Live guardrails
                </div>
                <div className="space-y-5 text-white">
                  <h2 className="text-2xl font-semibold md:text-3xl">Always-on policy enforcement for every agent call</h2>
                  <p className="text-sm text-zinc-300">
                    Wallet-level controls, delegated approvals, and signed receipts keep operators ahead of anomalies while
                    finance teams export settlements they can audit.
                  </p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/70">
                  <Image
                    src="/architecture_diagram.png"
                    alt="MNNR architecture overview"
                    width={1200}
                    height={840}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300">
                  <LockKeyhole className="h-5 w-5 text-emerald-200" />
                  <span className="text-left">
                    SOC 2 controls, customer-managed keys, and dedicated data planes are available from day one of the pilot.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LogoCloud />
      </div>
    </section>
  );
}