'use client';

import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative bg-[#060918] py-32 px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Main CTA Card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-blue-500/30 to-amber-500/30 rounded-3xl blur-xl" />
          <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-amber-400 text-sm font-medium">Design Partner Program</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Build for the European{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-blue-400">
                Machine Economy
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Join our design partner program. Shape the authority layer that will govern
              trillions in autonomous agent transactions across Europe.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold text-lg px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]"
              >
                <span>Apply as Design Partner</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/docs"
                className="group inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium text-lg px-10 py-5 rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/5"
              >
                <span>Read the Whitepaper</span>
                <span className="text-white/40 group-hover:text-white/60">→</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>PSD3 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>EU Data Residency</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Rail-Neutral</span>
              </div>
            </div>

            <p className="text-white/30 text-sm mt-8">
              Currently accepting European AI infrastructure companies and forward-thinking merchants.
            </p>
          </div>
        </div>

        {/* Use cases grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🤖', label: 'AI Agents' },
            { icon: '🏦', label: 'European Banks' },
            { icon: '🛒', label: 'E-Commerce' },
            { icon: '🏭', label: 'Industrial IoT' }
          ].map((useCase) => (
            <div
              key={useCase.label}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{useCase.icon}</span>
              <span className="text-white/60 text-sm font-medium group-hover:text-white/80">{useCase.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
