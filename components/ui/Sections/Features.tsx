'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

// Feature card with hover effects
function FeatureCard({ 
  icon, 
  title, 
  description, 
  gradient,
  delay,
  href
}: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
  href: string;
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
        <Link href={href} className="mt-6 flex items-center text-white/30 group-hover:text-emerald-400 transition-colors">
          <span className="text-sm font-medium">Learn more</span>
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
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
      gradient: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20',
      href: '/docs/api#usage-tracking'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: 'Programmable Billing',
      description: 'Usage-based, subscription, prepaid credits, or hybrid models. Stripe-powered with automatic invoicing and tax handling.',
      gradient: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/20',
      href: '/docs/api#billing'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      title: 'API Key Management',
      description: 'Generate, rotate, and revoke keys instantly. Scoped permissions, usage limits, and expiration policies per key.',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20',
      href: '/docs/api#api-keys'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Distributed Rate Limiting',
      description: 'Redis-backed rate limiting across global edge nodes. Protect infrastructure and enforce fair usage at scale.',
      gradient: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
      href: '/docs/api#rate-limiting'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Security Focused',
      description: 'Bank-level encryption, audit logs, SSO support, and compliance controls in progress.',
      gradient: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
      href: '/legal/security'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'Web3 Native',
      description: 'First-class support for crypto payments, smart contract integration, and decentralized identity verification.',
      gradient: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20',
      href: '/docs/x402'
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
              href={feature.href}
            />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 pt-16 border-t border-white/5">
          <div className="flex flex-wrap justify-center gap-16">
            <AnimatedStat value="<5" suffix="min" label="Integration" />
            <AnimatedStat value="High" suffix="" label="Availability" />
            <AnimatedStat value="Global" suffix="" label="Infrastructure" />
            <AnimatedStat value="$0" suffix="" label="To Start" />
          </div>
        </div>

        {/* Bottom CTA - Trust Signals */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-medium">Public Beta Now Open</span>
          </div>
          <p className="text-white/50 mb-10 text-lg max-w-2xl mx-auto">
            Join the developers building the future of autonomous commerce
          </p>
          
          {/* Real Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {/* Integration Partners */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-6 h-6 text-[#635BFF]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
              </svg>
              <span className="text-white/70 font-medium">Stripe</span>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-6 h-6 text-[#3ECF8E]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z"/>
              </svg>
              <span className="text-white/70 font-medium">Supabase</span>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className="text-white/70 font-medium">GitHub</span>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 22.525H0l12-21.05 12 21.05z"/>
              </svg>
              <span className="text-white/70 font-medium">Vercel</span>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-6 h-6 text-[#FF6B35]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/>
              </svg>
              <span className="text-white/70 font-medium">Tailwind</span>
            </div>
          </div>
          
          {/* Beta Metrics */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
            <div className="px-6">
              <div className="text-2xl font-bold text-white">Beta</div>
              <div className="text-white/40 text-sm">Now Open</div>
            </div>
            <div className="px-6 border-l border-white/10">
              <div className="text-2xl font-bold text-white">Free</div>
              <div className="text-white/40 text-sm">Tier Available</div>
            </div>
            <div className="px-6 border-l border-white/10">
              <div className="text-2xl font-bold text-white">Email</div>
              <div className="text-white/40 text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
