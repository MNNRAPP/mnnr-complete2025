'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-800/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '0.5s' }} />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  );
}

function TypewriterRails() {
  const rails = ['Wero', 'SEPA Instant', 'Qivalis', 'Card Networks', 'Digital Euro'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rails.length);
        setIsVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`inline-block transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {rails[currentIndex]}
    </span>
  );
}

function StatsBar() {
  const stats = [
    { value: '7+', label: 'Payment Rails' },
    { value: '27', label: 'EU Countries' },
    { value: '100%', label: 'PSD3 Ready' },
    { value: '<200ms', label: 'Latency' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-16 pt-8 border-t border-white/10">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">{s.value}</div>
          <div className="text-white/40 text-sm mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#060918] flex items-center justify-center px-6 overflow-hidden">
      <ParticleField />
      <div className="relative z-10 max-w-5xl mx-auto text-center py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/20 mb-10 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-amber-400 text-sm font-medium">The Authority Layer for the Machine Economy</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
          <span className="block">Payments Infrastructure</span>
          <span className="block text-white/60 text-4xl md:text-5xl lg:text-6xl mt-2">for the</span>
          <span className="relative inline-block mt-2">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-blue-400">
              Machine Economy
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/60 mb-4 max-w-3xl mx-auto leading-relaxed font-light">
          The rail-neutral control plane that authorizes AI agent spend across{' '}
          <span className="text-amber-400 font-medium"><TypewriterRails /></span>
        </p>
        <p className="text-lg text-white/40 mb-12 max-w-2xl mx-auto">
          Built for European digital sovereignty. Compliant with PSD3, MiCA, EUDIW, and GDPR from day one.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]"
          >
            <span>Become a Design Partner</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/docs/quick-start"
            className="group inline-flex items-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium text-lg px-8 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/5"
          >
            <span>View Documentation</span>
            <span className="font-mono text-blue-400">&lt;/&gt;</span>
          </Link>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {[
            { icon: '🇪🇺', text: 'EU Sovereign' },
            { icon: '🔐', text: 'PSD3 Compliant' },
            { icon: '⚡', text: 'Sub-200ms' },
            { icon: '🔗', text: 'Rail-Neutral' },
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300">
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
