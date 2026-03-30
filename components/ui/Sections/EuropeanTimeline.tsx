'use client';

export default function EuropeanTimeline() {
  const events = [
    { date: 'Q1 2026', name: 'Wero Expansion', desc: '52.5M users, online payments launch', color: 'bg-emerald-500' },
    { date: 'H2 2026', name: 'Qivalis Launch', desc: 'Euro stablecoin by 12 major banks', color: 'bg-amber-500' },
    { date: 'Q4 2026', name: 'EUDIW Mandate', desc: 'Legally mandated digital identity wallet', color: 'bg-purple-500' },
    { date: 'Q4 2026', name: 'PSD3/PSR Enforcement', desc: 'New payment services regulation', color: 'bg-blue-500' },
    { date: '2027', name: 'SEPA Instant Mandatory', desc: 'All EU banks must support instant', color: 'bg-cyan-500' },
    { date: '2028-29', name: 'Digital Euro', desc: 'ECB central bank digital currency', color: 'bg-indigo-500' },
  ];

  return (
    <section className="relative py-24 px-6 bg-[#070a1a]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            The European <span className="text-amber-400">Moment</span>
          </h2>
          <p className="text-lg text-white/50 max-w-3xl mx-auto leading-relaxed">
            Seven parallel infrastructure initiatives are converging right now.
            The window to become the universal authority standard is 12-18 months.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/50 via-blue-500/50 to-purple-500/50" />

          <div className="space-y-8">
            {events.map((event, i) => (
              <div key={event.name} className={`relative flex items-start gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/80 border-2 border-[#070a1a] z-10 mt-2" />

                {/* Content */}
                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-mono text-white/80 mb-2 ${event.color}/20 border border-white/10`}>
                    {event.date}
                  </div>
                  <h3 className="text-white font-bold text-lg">{event.name}</h3>
                  <p className="text-white/40 text-sm mt-1">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
