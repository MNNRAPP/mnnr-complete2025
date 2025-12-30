'use client';

export default function PricingComparison() {
  const features = [
    {
      category: 'Core Billing',
      items: [
        { name: 'Usage-based billing', mnnr: true, stripe: 'Limited', aws: true, custom: 'Months' },
        { name: 'Per-token/per-call pricing', mnnr: true, stripe: false, aws: 'Complex', custom: 'Weeks' },
        { name: 'Real-time metering', mnnr: true, stripe: false, aws: true, custom: 'Weeks' },
        { name: 'Streaming payments', mnnr: true, stripe: false, aws: false, custom: 'Months' },
      ]
    },
    {
      category: 'Machine Economy',
      items: [
        { name: 'Agent-to-agent payments', mnnr: true, stripe: false, aws: false, custom: 'Months' },
        { name: 'Autonomous spending limits', mnnr: true, stripe: false, aws: false, custom: 'Complex' },
        { name: 'Programmable escrow', mnnr: true, stripe: false, aws: false, custom: 'Months' },
        { name: 'Web3/crypto support', mnnr: true, stripe: 'Beta', aws: false, custom: 'Months' },
      ]
    },
    {
      category: 'Infrastructure',
      items: [
        { name: 'API key management', mnnr: true, stripe: false, aws: true, custom: 'Days' },
        { name: 'Distributed rate limiting', mnnr: true, stripe: false, aws: true, custom: 'Weeks' },
        { name: 'Global edge deployment', mnnr: true, stripe: true, aws: true, custom: 'Months' },
        { name: 'Sub-50ms latency', mnnr: true, stripe: true, aws: 'Varies', custom: 'Complex' },
      ]
    },
    {
      category: 'Developer Experience',
      items: [
        { name: 'Integration time', mnnr: '5 min', stripe: '1 hour', aws: 'Days', custom: 'Months' },
        { name: 'SDK support', mnnr: '4 languages', stripe: '10+', aws: '10+', custom: 'Varies' },
        { name: 'Sandbox testing', mnnr: true, stripe: true, aws: true, custom: 'Build it' },
        { name: 'Webhook reliability', mnnr: '99.99%', stripe: '99.9%', aws: '99.9%', custom: 'Varies' },
      ]
    },
  ];

  const renderValue = (value: boolean | string) => {
    if (value === true) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      );
    }
    if (value === false) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20">
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      );
    }
    return <span className="text-white/60 text-sm">{value}</span>;
  };

  return (
    <section className="relative bg-[#0a0a0f] py-24 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">⚖️ Compare Solutions</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Choose{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              MNNR
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Purpose-built for the machine economy. See how we compare to alternatives.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 bg-white/[0.03] border-b border-white/10">
            <div className="p-4 text-white/40 text-sm font-medium">Feature</div>
            <div className="p-4 text-center">
              <div className="text-emerald-400 font-bold">MNNR</div>
              <div className="text-white/30 text-xs">Machine Economy</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-white/70 font-medium">Stripe Billing</div>
              <div className="text-white/30 text-xs">Traditional</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-white/70 font-medium">AWS Marketplace</div>
              <div className="text-white/30 text-xs">Enterprise</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-white/70 font-medium">Build Custom</div>
              <div className="text-white/30 text-xs">DIY</div>
            </div>
          </div>

          {/* Table Body */}
          {features.map((section, sectionIndex) => (
            <div key={section.category}>
              {/* Category Header */}
              <div className="grid grid-cols-5 bg-white/[0.02] border-b border-white/5">
                <div className="col-span-5 p-3 text-white/50 text-xs font-semibold uppercase tracking-wider">
                  {section.category}
                </div>
              </div>
              
              {/* Category Items */}
              {section.items.map((item, itemIndex) => (
                <div 
                  key={item.name}
                  className={`grid grid-cols-5 ${
                    itemIndex < section.items.length - 1 || sectionIndex < features.length - 1 
                      ? 'border-b border-white/5' 
                      : ''
                  } hover:bg-white/[0.02] transition-colors`}
                >
                  <div className="p-4 text-white/70 text-sm">{item.name}</div>
                  <div className="p-4 flex items-center justify-center">{renderValue(item.mnnr)}</div>
                  <div className="p-4 flex items-center justify-center">{renderValue(item.stripe)}</div>
                  <div className="p-4 flex items-center justify-center">{renderValue(item.aws)}</div>
                  <div className="p-4 flex items-center justify-center">{renderValue(item.custom)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-white/40 text-sm mb-6">
            Stop building billing infrastructure. Start monetizing your autonomous systems.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/signin/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors"
            >
              Start Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 text-white font-medium transition-colors"
            >
              Read the Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
