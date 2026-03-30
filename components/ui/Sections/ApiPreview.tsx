'use client';

import { useState } from 'react';

export default function ApiPreview() {
  const [copied, setCopied] = useState(false);

  const code = `import { MNNR } from '@mnnr/sdk';

const mnnr = new MNNR({ apiKey: 'sk_live_...' });

// Create an authorized agent payment session
const payment = await mnnr.payments.create({
  agent_id: 'agent_eu_7x9k2m',
  authority: 'auth_del_3f8n1p',
  amount: 49_99,
  currency: 'EUR',
  rail_preference: 'auto', // Wero > SEPA > Card
  merchant: 'mcht_de_berlin_9x2',
  metadata: {
    purpose: 'cloud_compute',
    model: 'gpt-4-turbo',
  },
});

// MNNR routes to optimal rail automatically
// Returns: rail selected, tx hash, compliance proof
console.log(payment);
// {
//   id: 'pay_eu_8k3m2n',
//   rail: 'wero',
//   status: 'settled',
//   settlement_time: '1.2s',
//   compliance_proof: 'psd3_sca_verified',
//   tx_hash: '0x7f3a...',
// }`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="api" className="relative py-24 px-6 bg-[#060918]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Developer-First <span className="text-amber-400">API</span>
          </h2>
          <p className="text-lg text-white/50 max-w-3xl mx-auto leading-relaxed">
            Rail-agnostic payment routing in a single API call.
            Let MNNR handle the complexity of European payment fragmentation.
          </p>
        </div>

        {/* Code Block */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-white/30 text-xs ml-3 font-mono">create-payment.ts</span>
              </div>
              <button
                onClick={handleCopy}
                className="text-white/30 hover:text-amber-400 transition-colors text-xs font-mono"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            {/* Code */}
            <pre className="p-6 text-sm font-mono overflow-x-auto leading-relaxed">
              <code className="text-white/70">{code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
