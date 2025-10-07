import { ClipboardSignature, Shield, Zap } from 'lucide-react';

const SIGNALS = [
  {
    title: 'Externally validated controls',
    copy: 'SOC 2 Type II coverage, penetration testing, and documented response plans keep risk teams confident.',
    icon: Shield
  },
  {
    title: 'Procurement ready',
    copy: 'Pre-built diligence packages, diagram libraries, and custom terms templates accelerate enterprise onboarding.',
    icon: ClipboardSignature
  },
  {
    title: 'Seconds to integrate',
    copy: 'SDKs, Terraform modules, and environment recipes mean pilots stand up in days—not quarters.',
    icon: Zap
  }
];

export default function Trust() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(110%_110%_at_100%_100%,rgba(22,163,74,0.12),rgba(15,23,42,0))]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="space-y-6 text-white">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
              Trust signals
            </span>
            <h2 className="text-3xl font-semibold md:text-5xl md:leading-[1.1]">
              Enterprise rigor without giving up product velocity
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
              We designed MNNR to feel like a flagship SaaS experience while satisfying the checklists Fortune 100
              companies require. Security reviewers see the maturity. Operators feel the polish.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SIGNALS.map((signal) => {
              const Icon = signal.icon;
              return (
                <div
                  key={signal.title}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-black/60 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.45)]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                    <Icon className="h-5 w-5 text-emerald-200" />
                  </span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">{signal.title}</h3>
                    <p className="text-sm text-zinc-300">{signal.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
