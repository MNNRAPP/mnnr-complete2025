'use client';

export default function Compliance() {
  const regulations = [
    {
      name: 'PSD3 / PSR',
      desc: 'Full compliance with the Payment Services Directive 3 and Payment Services Regulation. Strong Customer Authentication for agent-initiated flows.',
      badge: 'Ready',
      color: 'text-blue-400',
      borderColor: 'border-blue-500/30',
    },
    {
      name: 'MiCA',
      desc: 'Markets in Crypto-Assets regulation compliance for euro stablecoin rail integration via Qivalis and future digital asset settlement.',
      badge: 'Compliant',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
    },
    {
      name: 'EUDIW',
      desc: 'EU Digital Identity Wallet integration readiness. Agent credentials as verifiable presentations under eIDAS 2.0.',
      badge: 'Integrated',
      color: 'text-purple-400',
      borderColor: 'border-purple-500/30',
    },
    {
      name: 'GDPR',
      desc: 'Privacy-by-design architecture. Data minimization for agent transaction metadata. No cross-border data leakage to non-EU jurisdictions.',
      badge: 'Native',
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
    },
  ];

  return (
    <section id="compliance" className="relative py-24 px-6 bg-[#070a1a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            European <span className="text-amber-400">Compliance</span> Ready
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
