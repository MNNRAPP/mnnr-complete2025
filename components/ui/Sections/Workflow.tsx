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
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(100%_100%_at_100%_0%,rgba(16,185,129,0.15),rgba(0,0,0,0))]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Operating model
          </span>
          <h2 className="text-3xl font-semibold text-white md:text-5xl md:leading-[1.1]">
            Endless runway for your product roadmap
          </h2>
          <p className="text-base leading-relaxed text-zinc-300 md:text-lg">
            From proof-of-concept to global rollout, MNNR scales with your agents. Each phase introduces new controls and
            visibility without rewriting how you ship features.
          </p>
        </div>

        <ol className="relative grid gap-10 border-l border-white/10 pl-8 md:pl-10">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="group relative">
                <span className="absolute -left-[42px] flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-sm font-semibold text-emerald-200 shadow-[0_12px_40px_rgba(16,185,129,0.25)] md:-left-[52px] md:h-12 md:w-12">
                  {index + 1}
                </span>
                <div className="relative flex flex-col gap-4 rounded-3xl border border-white/10 bg-black/60 p-6 transition duration-200 group-hover:border-emerald-300/50">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                      <Icon className="h-5 w-5 text-emerald-200" />
                    </span>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-300">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
