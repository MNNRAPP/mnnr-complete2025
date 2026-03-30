'use client';

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg className="w-5 h-5 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function PartialIcon() {
  return <span className="text-amber-400/60 text-sm font-medium">Partial</span>;
}

export default function Comparison() {
  const features = [
    { name: 'Rail-Neutral Routing', mnnr: 'check', stripe: 'x', x402: 'x' },
    { name: 'EU Sovereignty', mnnr: 'check', stripe: 'x', x402: 'x' },
    { name: 'Wero Native', mnnr: 'check', stripe: 'x', x402: 'x' },
    { name: 'PSD3 Native', mnnr: 'check', stripe: 'partial', x402: 'x' },
    { name: 'Agent Authority Layer', mnnr: 'check', stripe: 'x', x402: 'partial' },
    { name: 'Euro Stablecoin Ready', mnnr: 'check', stripe: 'x', x402: 'check' },
    { name: 'EUDIW Integration', mnnr: 'check', stripe: 'x', x402: 'x' },
    { name: 'EU Data Residency', mnnr: 'check', stripe: 'partial', x402: 'x' },
  ];

  const renderIcon = (status: string) => {
    if (status === 'check') return <CheckIcon />;
    if (status === 'x') return <XIcon />;
    return <PartialIcon />;
  };

  return (
    <section id="compare" className="relative py-24 px-6 bg-[#060918]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why <span className="text-amber-400">Rail-Neutral</span> Wins
          </h2>
          <p className="text-lg text-white/50 max-w-3xl mx-auto leading-relaxed">
            US-centric payment solutions were not designed for European digital sovereignty. MNNR was.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-white/50 font-medium text-sm">Feature</th>
                <th className="text-center py-4 px-4">
                  <span className="text-amber-400 font-bold">MNNR</span>
                </th>
                <th className="text-center py-4 px-4">
                  <span className="text-white/50 font-medium">Stripe</span>
                </th>
                <th className="text-center py-4 px-4">
                  <span className="text-white/50 font-medium">Coinbase x402</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={f.name} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                  <td className="py-4 px-4 text-white/70 text-sm">{f.name}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">{renderIcon(f.mnnr)}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">{renderIcon(f.stripe)}</div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center">{renderIcon(f.x402)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
