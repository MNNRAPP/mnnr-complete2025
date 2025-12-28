import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | MNNR',
  description: 'Building the billing layer for autonomous systems - Learn about MNNR and our mission to power the machine economy'
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="text-emerald-400 text-sm">🚀 Our Mission</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            Building the Billing Layer for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Autonomous Systems
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            We believe the next major economic shift will be powered by machines transacting with machines. 
            MNNR provides the infrastructure to make that possible.
          </p>
        </div>
      </section>

      {/* Why We Built MNNR */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Why We Built MNNR</h2>
          
          <div className="space-y-6 text-lg text-white/70 leading-relaxed">
            <p>
              When we started building AI agents that needed to charge for API usage, we hit a wall. 
              Existing billing tools—Stripe, Chargebee, Recurly—were built for monthly subscriptions 
              and human-initiated transactions, not real-time usage tracking across distributed systems.
            </p>
            
            <p>
              We needed <strong className="text-white">fast billing decisions</strong> at global edge locations. 
              We needed <strong className="text-white">API key management</strong> with granular permissions. 
              We needed <strong className="text-white">crypto payment support</strong> for Web3 applications. 
              None of the existing tools could handle it.
            </p>
            
            <p>
              So we built MNNR. What started as internal infrastructure became the foundation for how 
              autonomous systems should handle billing. We&apos;re not building another payment processor—we&apos;re 
              building the <strong className="text-white">payments infrastructure for the machine economy</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* The Machine Economy */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">The Machine Economy is Emerging</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-4xl font-bold text-emerald-400 mb-2">AI Agents</div>
              <div className="text-white/50">Autonomous systems that need to transact</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-4xl font-bold text-cyan-400 mb-2">IoT Networks</div>
              <div className="text-white/50">Billions of connected devices</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-4xl font-bold text-purple-400 mb-2">Web3 Protocols</div>
              <div className="text-white/50">Decentralized applications</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-4xl font-bold text-yellow-400 mb-2">M2M Commerce</div>
              <div className="text-white/50">Machine-to-machine transactions</div>
            </div>
          </div>
          
          <div className="text-lg text-white/70 leading-relaxed">
            <p>
              AI agents are already hiring other AI agents. IoT devices are negotiating with each other. 
              Smart contracts are executing autonomous transactions. The infrastructure for this new economy 
              is still being built—<strong className="text-white">we&apos;re building it</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Our Approach</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 text-xl font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">API-First, Always</h3>
                <p className="text-white/60">
                  Everything is programmable. No dashboards required. Your code controls your billing.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <span className="text-cyan-400 text-xl font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-Time by Default</h3>
                <p className="text-white/60">
                  Low latency design. Global infrastructure. Billing decisions at the speed your applications need.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-purple-400 text-xl font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Web3 Compatible</h3>
                <p className="text-white/60">
                  Crypto payments, smart contracts, and decentralized identity are first-class citizens.
                </p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="text-yellow-400 text-xl font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Security Focused</h3>
                <p className="text-white/60">
                  Bank-level encryption, security best practices, and compliance controls in progress. Built for scale from day one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Team</h2>
          <p className="text-lg text-white/60 mb-12">
            We&apos;re a small team of engineers who&apos;ve built billing systems at scale. 
            We&apos;ve seen what works and what doesn&apos;t—and we&apos;re building what should exist.
          </p>
          
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 mx-auto mb-6 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">M</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">MNNR Team</h3>
            <p className="text-white/50 mb-6">
              Engineers building infrastructure for the machine economy
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://github.com/MNNRAPP" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a 
                href="mailto:hello@mnnr.app"
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
            Whether you&apos;re building AI agents, IoT networks, or Web3 applications, 
            we&apos;d love to help you monetize your autonomous systems.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/signup"
              className="px-8 py-4 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-all"
            >
              Start Building Free
            </Link>
            <a 
              href="mailto:pilot@mnnr.app"
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              Contact Us
            </a>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/40">
            <a href="mailto:support@mnnr.app" className="hover:text-white transition-colors">support@mnnr.app</a>
            <a href="mailto:pilot@mnnr.app" className="hover:text-white transition-colors">pilot@mnnr.app</a>
            <a href="mailto:enterprise@mnnr.app" className="hover:text-white transition-colors">enterprise@mnnr.app</a>
          </div>
        </div>
      </section>
    </div>
  );
}
