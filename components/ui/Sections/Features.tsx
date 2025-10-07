import {
  ActivitySquare,
  Check,
  GaugeCircle,
  Layers3,
  ShieldCheck,
  Wallet2
} from 'lucide-react';

const FEATURES = [
  {
    title: 'Deterministic metering',
    description: 'Every API call is signed, priced, and recorded in a tamper-evident ledger.',
    icon: GaugeCircle
  },
  {
    title: 'Programmable spend caps',
    description: 'Set limits per agent wallet with soft and hard stops, alerts, and policy hooks.',
    icon: Wallet2
  },
  {
    title: 'Real-time enforcement',
    description: 'Runtime guards throttle anomalies before they hit your models or downstream APIs.',
    icon: ActivitySquare
  },
  {
    title: 'Multi-rail settlement',
    description: 'Stripe and USDC settle to the same customer ledger with unified reporting.',
    icon: Layers3
  },
  {
    title: 'Enterprise controls',
    description: 'Granular roles, signed webhooks, and audit-ready exports for finance and security.',
    icon: ShieldCheck
  }
];

const OUTCOMES = [
  'Launch usage-based agents with confidence in weeks instead of quarters.',
  'Give finance real-time visibility into spend without rebuilding your stack.',
  'Retain developer velocity with APIs, SDKs, and observability out of the box.'
];

export default function Features() {
  return (
    <section className="relative py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(100%_90%_at_0%_0%,rgba(59,130,246,0.12),rgba(15,23,42,0))]" />
      <div className="mx-auto grid w-full max-w-6xl gap-16 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Why teams choose MNNR
          </div>
          <h2 className="text-3xl font-semibold text-white md:text-5xl md:leading-[1.1]">
            Your command center for machine-to-machine commerce
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
            Replace brittle billing scripts and spreadsheets with a single platform that understands agents. We
            instrument calls, enforce policy, and reconcile payments so your team can focus on intelligent
            experiences—not financial plumbing.
          </p>
          <ul className="space-y-3 text-left text-sm text-zinc-300 md:text-base">
            {OUTCOMES.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 rounded-full bg-emerald-400/20 p-1">
                  <Check className="h-4 w-4 text-emerald-300" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-black/55 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.45)]"
              >
                <div>
                  <span className="inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 p-2">
                    <Icon className="h-5 w-5 text-emerald-200" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-zinc-300">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
