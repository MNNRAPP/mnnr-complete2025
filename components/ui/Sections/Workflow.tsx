import { ArrowUpRight, CircuitBoard, Cog, Sparkles } from 'lucide-react';

const STEPS = [
  {
    title: 'Instrument',
    description:
      'Drop-in SDKs capture usage, attach metadata, and normalize events. Configure wallets and policies in minutes.',
    icon: CircuitBoard
  },
  {
    title: 'Enforce',
    description:
      'Attach spend caps, throttles, and runtime signatures to each agent. Webhooks and alerts fire before incidents.',
    icon: Cog
  },
  {
    title: 'Settle',
    description:
      'Stripe and USDC settle to a unified ledger with customer-level receipts, tax data, and reconciliation exports.',
    icon: ArrowUpRight
  },
  {
    title: 'Evolve',
    description:
      'Use insights, anomaly detection, and replay tooling to iterate on pricing and guardrails without downtime.',
    icon: Sparkles
  }
];

export default function Workflow() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(37,99,235,0.12),rgba(15,23,42,0))]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Operating model
          </span>
          <h2 className="text-3xl font-semibold text-white md:text-5xl md:leading-[1.1]">
            A guided runway from first idea to global rollout
          </h2>
          <p className="text-base leading-relaxed text-zinc-300 md:text-lg">
            Every customer journey can stretch or sprint. Our scrollable blueprint lets stakeholders explore the MNNR
            lifecycle at their own pace—especially on mobile where endless scroll feels native.
          </p>
        </div>

        <div className="relative -mx-4 overflow-hidden md:mx-0">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-950 to-transparent md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-950 to-transparent md:hidden" />
          <ol className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 md:grid md:snap-none md:grid-cols-4 md:gap-8 md:border-l md:border-white/10 md:px-0 md:pb-0">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="group relative min-w-[260px] snap-center rounded-3xl border border-white/10 bg-black/60 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.45)] transition-colors duration-200 hover:border-emerald-300/50 md:min-w-0 md:snap-align-none md:border-transparent md:bg-transparent md:p-0 md:shadow-none"
                >
                  <div className="hidden h-full flex-col gap-4 rounded-3xl border border-white/10 bg-black/60 p-6 md:flex">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-sm font-semibold text-emerald-200">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                        <Icon className="h-5 w-5 text-emerald-200" />
                      </span>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-300">{step.description}</p>
                  </div>

                  <div className="flex h-full flex-col gap-4 md:hidden">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-xs font-semibold text-emerald-200">
                        {index + 1}
                      </span>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                        <Icon className="h-5 w-5 text-emerald-200" />
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold text-white">{step.title}</h3>
                      <p className="text-sm text-zinc-300">{step.description}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
