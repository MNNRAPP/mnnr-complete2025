'use client';

export default function AuthorityGap() {
  const layers = [
    {
      label: 'Identity Layer',
      desc: 'EUDIW — Solved',
      color: 'from-blue-500/20 to-blue-600/20',
      border: 'border-blue-500/30',
      textColor: 'text-blue-400',
      status: 'solved',
    },
    {
      label: 'Authority Layer',
      desc: 'MNNR — Solving Now',
      color: 'from-amber-500/20 to-amber-600/20',
      border: 'border-amber-500/50',
      textColor: 'text-amber-400',
      status: 'active',
    },
    {
      label: 'Settlement Layer',
      desc: 'Wero / SEPA / Qivalis — Solved',
      color: 'from-emerald-500/20 to-emerald-600/20',
      border: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      status: 'solved',
    },
  ];

  return (
    <section id="authority" className="relative py-24 px-6 bg-[#060918]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          The <span className="text-amber-400">Authority Gap</span>
        </h2>
        <p className="text-lg text-white/50 mb-16 max-w-3xl mx-auto leading-relaxed">
          Europe has built the identity layer (EUDIW) and the settlement rails (Wero, SEPA Instant).
          But the critical middle layer — who authorizes an AI agent to spend, under what constraints,
          and on which rail — remains unsolved.
        </p>

        {/* Stack Diagram */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {layers.map((layer, i) => (
            <div key={layer.label} className="relative">
              {i > 0 && (
                <div className="flex justify-center -my-2 relative z-10">
                  <div className="w-px h-6 bg-white/20" />
                </div>
              )}
              <div
                className={`relative p-6 rounded-xl bg-gradient-to-r ${layer.color} border ${layer.border} backdrop-blur-sm ${
                  layer.status === 'active' ? 'ring-2 ring-amber-500/30 shadow-[0_0_30px_rgba(212,175,55,0.15)]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className={`text-xl font-bold ${layer.textColor}`}>{layer.label}</h3>
                    <p className="text-white/50 text-sm mt-1">{layer.desc}</p>
                  </div>
                  {layer.status === 'active' ? (
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                      </span>
                      <span className="text-amber-400 text-xs font-medium">Building</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-xs">
                      Established
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
