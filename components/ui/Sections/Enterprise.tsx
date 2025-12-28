import { Building2, FileCheck, LockKeyhole } from 'lucide-react';

const PILLARS = [
  {
    title: 'Operational excellence',
    description:
      'Automated reconciliation, signed events, and deep observability keep finance, engineering, and risk aligned from day one.',
    icon: Building2,
    bullets: ['Streaming exports into your warehouse', 'Role-based access with approval flows', 'Incident-grade audit trails']
  },
  {
    title: 'Security from the start',
    description:
      'Hardened infrastructure, encrypted secrets, and isolation boundaries designed for regulated workloads.',
    icon: LockKeyhole,
    bullets: ['Dedicated data plane per tenant', 'Field-level encryption with customer keys', 'Zero trust posture across services']
  },
  {
    title: 'Compliance ready',
    description:
      'Frameworks and documentation to satisfy enterprise procurement and trust requirements without slowing pilots.',
    icon: FileCheck,
    bullets: ['SOC 2 aligned controls and evidence', 'Diligence package with policies and diagrams', 'Ongoing penetration testing cadence']
  }
];

export default function Enterprise() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(16,185,129,0.12),rgba(15,23,42,0))]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Enterprise posture
          </span>
          <h2 className="text-3xl font-semibold text-white md:text-5xl md:leading-[1.1]">
            Designed for teams that cannot compromise on trust
          </h2>
          <p className="text-base leading-relaxed text-zinc-300 md:text-lg">
            Fortune 100 teams expect more than a slick dashboard. MNNR pairs a beautiful operator experience with
            the documentation, controls, and guardrails your security reviewers expect.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="relative flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                  <Icon className="h-5 w-5 text-emerald-200" />
                </span>
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
                  <p className="text-sm text-zinc-300">{pillar.description}</p>
                </div>
                <ul className="mt-2 space-y-2 text-sm text-zinc-400">
                  {pillar.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
