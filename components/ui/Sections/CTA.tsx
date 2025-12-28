'use client';

import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative bg-[#0a0a0f] py-32 px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(16, 185, 129, 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Main CTA Card */}
        <div className="relative">
          {/* Glow border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-purple-500/30 rounded-3xl blur-xl" />
          
          {/* Card content */}
          <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-12 md:p-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 text-sm font-medium">Early Access Program</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to monetize the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">
                machine economy
              </span>
              ?
            </h2>
            
            {/* Subheadline */}
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Join the pioneers building autonomous systems that pay for themselves. 
              Zero platform fees during beta. White-glove onboarding included.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold text-lg px-10 py-5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(16,185,129,0.5)]"
              >
                <span>Start Building Free</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link 
                href="/docs/quick-start"
                className="group inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium text-lg px-10 py-5 rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/5"
              >
                <span>Read the Docs</span>
                <span className="text-white/40 group-hover:text-white/60">→</span>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>5-minute integration</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Use cases grid */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🤖', label: 'AI Agents' },
            { icon: '🔗', label: 'Smart Contracts' },
            { icon: '📡', label: 'IoT Networks' },
            { icon: '🚗', label: 'Autonomous Vehicles' }
          ].map((useCase) => (
            <div 
              key={useCase.label}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300"
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
