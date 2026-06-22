'use client';

export default function Compliance() {
  const regulations = [
    {
      // CLM-003: never "compliant" — PSD3/PSR-aligned controls only.
      name: 'PSD3 / PSR',
      desc: 'PSD3/PSR-aligned payment-governance controls, including Strong Customer Authentication for agent-initiated flows. Final PSD3/PSR implementation details remain subject to legislative completion.',
      badge: 'Aligned',
      color: 'text-blue-400',
      borderColor: 'border-blue-500/30',
    },
    {
      name: 'MiCA',
      desc: 'Designed to support Markets in Crypto-Assets (MiCA) requirements for euro-stablecoin rail integration via Qivalis and future digital-asset settlement.',
      badge: 'By design',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
    },
    {
      // CLM-017: design trajectory only, no eIDAS conformity claim.
      name: 'EUDIW',
      desc: 'Designed to support identity-assurance routing compatible with the EUDI Wallet trajectory — agent credentials as verifiable presentations under eIDAS 2.0.',
      badge: 'In design',
      color: 'text-purple-400',
      borderColor: 'border-purple-500/30',
    },
    {
      // CLM-015: never "GDPR compliant"; data-residency controls only.
      name: 'GDPR',
      desc: 'Privacy-by-design architecture with data minimization for agent transaction metadata. Data-residency controls available for EU customer deployments.',
      badge: 'By design',
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
    },
  ];

  return (
    <section id="compliance" className="relative py-24 px-6 bg-[#070a1a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Built for <span className="text-amber-400">European</span> regulation
          </h2>
          <p className="text-lg text-white/50 max-w-3xl mx-auto leading-relaxed">
            Built from the ground up for the European regulatory framework. Not retrofitted — native.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {regulations.map((reg) => (
            <div key={reg.name} className={`p-8 rounded-xl bg-white/[0.02] border ${reg.borderColor} transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${reg.color}`}>{reg.name}</h3>
                <span className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium ${reg.color}`}>
                  {reg.badge}
                </span>
              </div>
              <p className="text-white/40 leading-relaxed text-sm">{reg.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
