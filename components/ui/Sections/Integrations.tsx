'use client';

import Image from 'next/image';

const INTEGRATIONS = [
  { name: 'Stripe', src: '/stripe.svg', category: 'Payments' },
  { name: 'Supabase', src: '/supabase.svg', category: 'Database' },
  { name: 'Vercel', src: '/vercel.svg', category: 'Deployment' },
  { name: 'GitHub', src: '/github.svg', category: 'DevOps' },
];

const ECOSYSTEMS = [
  { name: 'OpenAI', icon: '🧠', description: 'GPT, DALL-E, Whisper' },
  { name: 'Anthropic', icon: '🤖', description: 'Claude models' },
  { name: 'Ethereum', icon: '⟠', description: 'Smart contracts' },
  { name: 'Solana', icon: '◎', description: 'High-speed blockchain' },
  { name: 'AWS', icon: '☁️', description: 'Lambda, SageMaker' },
  { name: 'Google Cloud', icon: '🌐', description: 'Vertex AI' },
  { name: 'Hugging Face', icon: '🤗', description: 'Model hub' },
  { name: 'Replicate', icon: '🔄', description: 'ML inference' },
];

function IntegrationCard({ name, src, category }: { name: string; src: string; category: string }) {
  return (
    <div className="group relative">
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Card */}
      <div className="relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.04]">
        <div className="h-10 flex items-center justify-center">
          <Image 
            src={src} 
            alt={`${name} logo`} 
            width={120} 
            height={40} 
            className="h-8 w-auto opacity-60 group-hover:opacity-100 transition-opacity filter brightness-0 invert" 
          />
        </div>
        <span className="text-white/40 text-xs uppercase tracking-wider">{category}</span>
      </div>
    </div>
  );
}

function EcosystemBadge({ name, icon, description }: { name: string; icon: string; description: string }) {
  return (
    <div className="group flex items-center gap-3 px-5 py-3 rounded-full bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300 cursor-default">
      <span className="text-xl">{icon}</span>
      <div className="text-left">
        <div className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">{name}</div>
        <div className="text-white/30 text-xs">{description}</div>
      </div>
    </div>
  );
}

export default function Integrations() {
  return (
    <section className="relative bg-[#0a0a0f] py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-cyan-400 text-sm">🔌 Integrations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Works with your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              entire stack
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto">
            Plug into your existing infrastructure. No migration required.
          </p>
          <p className="text-xs text-white/30 mt-4 max-w-2xl mx-auto">
            Third-party logos are trademarks of their respective owners. MNNR is not affiliated with or endorsed by these companies. Logos shown indicate technical compatibility only.
          </p>
        </div>

        {/* Core Integrations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {INTEGRATIONS.map((integration) => (
            <IntegrationCard key={integration.name} {...integration} />
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-white/30 text-sm uppercase tracking-wider">Ecosystem</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Ecosystem Grid */}
        <div className="flex flex-wrap justify-center gap-3">
          {ECOSYSTEMS.map((ecosystem) => (
            <EcosystemBadge key={ecosystem.name} {...ecosystem} />
          ))}
        </div>

        {/* Code Example */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="relative">
            {/* Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 rounded-2xl blur-xl" />
            
            {/* Terminal */}
            <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-white/30 text-xs ml-3 font-mono">Universal SDK</span>
              </div>
              
              {/* Code */}
              <div className="p-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code>
                    <span className="text-purple-400">import</span>
                    <span className="text-white/80"> {'{ MNNR }'} </span>
                    <span className="text-purple-400">from</span>
                    <span className="text-emerald-400"> '@mnnr/sdk'</span>
                    <span className="text-white/80">;</span>
                    {'\n\n'}
                    <span className="text-white/40">// Works with any AI provider</span>
                    {'\n'}
                    <span className="text-purple-400">const</span>
                    <span className="text-white/80"> mnnr = </span>
                    <span className="text-purple-400">new</span>
                    <span className="text-cyan-400"> MNNR</span>
                    <span className="text-white/80">({'{'}</span>
                    {'\n'}
                    <span className="text-white/80">  apiKey: </span>
                    <span className="text-emerald-400">'sk_test_...'</span>
                    <span className="text-white/80">,</span>
                    {'\n'}
                    <span className="text-white/80">  provider: </span>
                    <span className="text-emerald-400">'openai'</span>
                    <span className="text-white/40"> // or 'anthropic', 'replicate', etc.</span>
                    {'\n'}
                    <span className="text-white/80">{'}'})</span>
                    <span className="text-white/80">;</span>
                    {'\n\n'}
                    <span className="text-white/40">// Track usage automatically</span>
                    {'\n'}
                    <span className="text-purple-400">const</span>
                    <span className="text-white/80"> response = </span>
                    <span className="text-purple-400">await</span>
                    <span className="text-white/80"> mnnr.</span>
                    <span className="text-cyan-400">track</span>
                    <span className="text-white/80">(</span>
                    <span className="text-emerald-400">'gpt-4-completion'</span>
                    <span className="text-white/80">, {'{'}</span>
                    {'\n'}
                    <span className="text-white/80">  tokens: </span>
                    <span className="text-yellow-400">1500</span>
                    <span className="text-white/80">,</span>
                    {'\n'}
                    <span className="text-white/80">  userId: </span>
                    <span className="text-emerald-400">'user_123'</span>
                    {'\n'}
                    <span className="text-white/80">{'}'})</span>
                    <span className="text-white/80">;</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
