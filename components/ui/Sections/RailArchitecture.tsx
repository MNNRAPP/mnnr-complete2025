'use client';

export default function RailArchitecture() {
  const rails = [
    {
      name: 'Wero',
      desc: '52.5M users across 13 EU countries by 2027. Account-to-account instant payments.',
      icon: '🟢',
      color: 'border-emerald-500/30 hover:border-emerald-500/60',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    {
      name: 'SEPA Instant',
      desc: 'Mandatory EU-wide instant credit transfers. Sub-10-second settlement.',
      icon: '🔵',
      color: 'border-blue-500/30 hover:border-blue-500/60',
      glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
    {
      name: 'Qivalis',
      desc: 'Euro stablecoin backed by 12 major European banks. Launching H2 2026.',
      icon: '🟡',
      color: 'border-amber-500/30 hover:border-amber-500/60',
      glow: 'hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]',
    },
    {
      name: 'Card Networks',
      desc: 'Visa, Mastercard, and domestic schemes. Legacy compatibility layer.',
      icon: '⚪',
      color: 'border-white/20 hover:border-white/40',
      glow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]',
    },
  ];

  return (
    <section id="architecture" className="relative py-24 px-6 bg-[#070a1a]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="text-amber-400">Rail-Neutral</span> Architecture
          </h2>
          <p className="text-lg text-white/50 max-w-3xl mx-auto leading-relaxed">
            One control plane. Every European payment rail. MNNR dynamically routes agent-initiated
            transactions to the optimal rail based on cost, speed, compliance, and merchant preference.
          </p>
        </div>

        {/* Control Plane Visual */}
        <div className="relative max-w-4xl mx-auto mb-12">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full bg-amber-500/5 border border-amber-500/20 animate-pulse" />
          </div>
          <div className="relative text-center py-12">
            <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 backdrop-blur-sm">
              <div className="text-amber-400 text-sm font-mono uppercase tracking-wider mb-1">MNNR</div>
              <div className="text-white text-xl font-bold">Control Plane</div>
              <div className="text-white/40 text-sm mt-1">Rail-Agnostic Payment Routing</div>
            </div>
          </div>
        </div>

        {/* Rail Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rails.map((rail) => (
            <div
              key={rail.name}
              className={`p-6 rounded-xl bg-white/[0.02] border ${rail.color} ${rail.glow} transition-all duration-300 backdrop-blur-sm`}
            >
              <div className="text-3xl mb-4">{rail.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{rail.name}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{rail.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
