'use client';

import ContactButton from '@/components/ui/ContactButton/ContactButton';
import LogoCloud from '@/components/ui/LogoCloud';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const metrics = [
  { label: 'Per-call settlement across rails', value: 'USDC + Stripe' },
  { label: 'Ledgered receipts per request', value: 'Cryptographically signed' },
  { label: 'Guardrails built in', value: 'Wallet limits & runtime policies' }
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(14,83,115,0.55),rgba(0,0,0,0))]" />
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-emerald-500/20 blur-[160px]" />
        <div className="absolute -bottom-48 -right-20 h-[480px] w-[480px] rounded-full bg-sky-500/10 blur-[160px]" />
      </div>

      <div className="mx-auto flex min-h-[90vh] w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-28 md:pt-32">
        <div className="flex flex-col items-center text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium uppercase tracking-[0.32em] text-emerald-200">
            Built for production AI
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl md:leading-[1.1]">
            Enterprise-grade payments infrastructure for autonomous agents
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-300 md:text-xl">
            Meter every call, enforce spend caps, and settle instantly—without asking your engineers to stitch
            together billing, ledgers, or receipts. MNNR keeps machine-to-machine commerce trustworthy.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/partners/register"
              className="group inline-flex items-center justify-center rounded-full bg-emerald-400 px-8 py-3 text-lg font-semibold text-black shadow-[0_20px_60px_rgba(16,185,129,0.35)] transition-transform duration-200 hover:translate-y-[-2px] hover:bg-emerald-300"
            >
              Join the pilot
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <ContactButton
              source="hero-landing-page"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-lg font-semibold text-white transition hover:border-emerald-300/50 hover:bg-emerald-300/10"
            >
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              Speak with solutions
            </ContactButton>
          </div>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-12 -top-20 h-40 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-4 py-1 text-sm font-medium uppercase tracking-[0.18em] text-emerald-200">
                Trust your ledger
              </div>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">
                Spend guardrails, settlement, and receipts in a single control plane
              </h2>
              <p className="text-base leading-relaxed text-zinc-300">
                Agent wallets, deterministic metering, and policy enforcement live side by side. Every request is
                signed, priced, and posted to an auditable ledger automatically.
              </p>
              <dl className="grid gap-6 sm:grid-cols-2">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left">
                    <dt className="text-xs font-semibold uppercase tracking-widest text-emerald-200/80">
                      {metric.label}
                    </dt>
                    <dd className="mt-2 text-base font-medium text-white">{metric.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-[40px] border border-emerald-400/20 bg-emerald-400/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/60">
              <Image
                src="/architecture_diagram.png"
                alt="MNNR architecture overview"
                width={1200}
                height={840}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mt-4 w-full">
          <LogoCloud />
        </div>
      </div>
    </section>
  );
}