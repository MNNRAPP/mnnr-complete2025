'use client';

import { useEffect, useRef, useState } from 'react';

// Feature card with hover effects
function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient,
  delay 
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref}
      className={`group relative transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Glow effect on hover */}
      <div className={`absolute -inset-0.5 ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
      
      {/* Card */}
      <div className="relative h-full rounded-2xl bg-white/[0.03] border border-white/10 p-8 backdrop-blur-sm transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/[0.05]">
        {/* Icon */}
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${gradient} mb-6`}>
          {icon}
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-emerald-400 transition-colors">
          {title}
        </h3>
        <p className="text-white/50 leading-relaxed">
          {description}
        </p>
        
        {/* Arrow indicator */}
        <div className="mt-6 flex items-center text-white/30 group-hover:text-emerald-400 transition-colors">
          <span className="text-sm font-medium">Learn more</span>
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Animated counter
function AnimatedStat({ value, label, suffix = '' }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="text-center px-8">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        {value}{suffix}
      </div>
      <div className="text-white/40 text-sm mt-2 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Real-Time Usage Tracking',
      description: 'Track API calls, tokens, compute cycles, or any custom metric. Sub-millisecond latency with global edge deployment.',
      gradient: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Programmable Billing',
      description: 'Usage-based, subscription, prepaid credits, or hybrid models. Stripe-powered with automatic invoicing and tax handling.',
      gradient: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/20'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      title: 'API Key Management',
      description: 'Generate, rotate, and revoke keys instantly. Scoped permissions, usage limits, and expiration policies per key.',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Distributed Rate Limiting',
      description: 'Redis-backed rate limiting across global edge nodes. Protect infrastructure and enforce fair usage at scale.',
      gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Enterprise Security',
      description: 'SOC 2 Type II ready. End-to-end encryption, audit logs, SSO, and compliance controls built-in.',
      gradient: 'bg-gradient-to-br from-red-500/20 to-pink-500/20'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'Web3 Native',
      description: 'First-class support for crypto payments, smart contract integration, and decentralized identity verification.',
      gradient: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20'
    }
  ];

  return (
    <section className="relative bg-[#0a0a0f] py-32 px-6 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-emerald-400 text-sm">✨ Core Capabilities</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Everything to monetize{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              autonomous systems
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-3xl mx-auto">
            A complete billing infrastructure designed for the machine economy. 
            From AI agents to IoT networks, we handle the complexity.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              delay={index * 100}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 pt-16 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-16">
            <AnimatedStat value="<5" suffix="ms" label="API Latency" />
            <AnimatedStat value="99.99" suffix="%" label="Uptime SLA" />
            <AnimatedStat value="50" suffix="+" label="Edge Locations" />
            <AnimatedStat value="∞" label="Scale" />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-white/40 mb-8 text-lg">
            Trusted by teams building the future of autonomous systems
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
            {/* Placeholder logos - replace with actual partner/customer logos */}
            {['AI Labs', 'CryptoDAO', 'RoboTech', 'EdgeNet', 'AutoDrive'].map((name) => (
              <span key={name} className="text-white/60 font-semibold text-lg tracking-wider">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
