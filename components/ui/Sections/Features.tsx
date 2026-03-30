'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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
      className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className={`absolute -inset-0.5 ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
      <div className="relative h-full rounded-2xl bg-white/[0.03] border border-white/10 p-8 backdrop-blur-sm transition-all duration-300 group-hover:border-amber-500/30 group-hover:bg-white/[0.05]">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${gradient} mb-6`}>
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-amber-400 transition-colors">
          {title}
        </h3>
        <p className="text-white/50 leading-relaxed">{description}</p>
        <Link href={href} className="mt-6 flex items-center text-white/30 group-hover:text-amber-400 transition-colors">
          <span className="text-sm font-medium">Learn more</span>
          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function Features() {
  const features = [
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
      title: 'Rail-Neutral Routing',
      description: 'Dynamically route agent transactions to the optimal European rail — Wero, SEPA Instant, Qivalis, or card networks — based on cost, speed, and compliance.',
      gradient: 'bg-gradient-to-br from-amber-500/20 to-amber-600/20',
      href: '/docs/api#routing'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: 'Agent Authority Protocol',
      description: 'Cryptographic delegation framework defining what an AI agent can spend, where, and until when. Revocable in real-time with full audit trails.',
      gradient: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20',
      href: '/docs/api#authority'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
      title: 'Dynamic Budget Envelopes',
      description: 'Real-time spend controls with per-transaction, daily, and categorical limits. Auto-adjusting based on risk signals and merchant trust scores.',
      gradient: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20',
      href: '/docs/api#budgets'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
        </svg>
      ),
      title: 'EUDIW-Ready Identity',
      description: 'Agent credentials as verifiable presentations under eIDAS 2.0. Seamless integration with the EU Digital Identity Wallet ecosystem.',
      gradient: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20',
      href: '/docs/api#identity'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 9.75c0 .746-.092 1.472-.264 2.165m-15.472 0A8.96 8.96 0 005 9.75c0-.746.092-1.472.264-2.165" />
        </svg>
      ),
      title: 'Sovereign Data Residency',
      description: 'All transaction data stays within EU borders. Privacy-by-design architecture with GDPR-native data minimization for agent metadata.',
      gradient: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20',
      href: '/docs/api#residency'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
      title: 'Compliance Automation',
      description: 'Built-in PSD3 Strong Customer Authentication for agent flows. MiCA compliance for stablecoin rails. Automated regulatory reporting.',
      gradient: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
      href: '/docs/api#compliance'
    }
  ];

  return (
    <section id="features-detail" className="relative bg-[#060918] py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-amber-400 text-sm">Core Capabilities</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Everything to authorize{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-blue-400">
              autonomous agents
            </span>
          </h2>
          <p className="text-xl text-white/50 max-w-3xl mx-auto">
            A complete authority infrastructure designed for the European machine economy.
            From AI agents to industrial IoT, we handle the complexity of multi-rail compliance.
          </p>
        </div>

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
            {[
              { value: '7+', suffix: '', label: 'Payment Rails' },
              { value: '27', suffix: '', label: 'EU Countries' },
              { value: '100%', suffix: '', label: 'PSD3 Ready' },
              { value: '<200', suffix: 'ms', label: 'Latency' },
            ].map((stat) => (
              <div key={stat.label} className="text-center px-8">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-white/40 text-sm mt-2 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <span className="text-amber-400 font-medium">Design Partner Program Open</span>
          </div>
          <p className="text-white/50 mb-10 text-lg max-w-2xl mx-auto">
            Join the pioneers building sovereign payment infrastructure for the European machine economy
          </p>
        </div>
      </div>
    </section>
  );
}
