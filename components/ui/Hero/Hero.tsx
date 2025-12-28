'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// Animated particles background
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] animate-pulse" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-500" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Floating particles */}
      <div className="absolute top-20 left-[10%] w-2 h-2 bg-emerald-400/60 rounded-full animate-float" />
      <div className="absolute top-40 right-[15%] w-1.5 h-1.5 bg-cyan-400/50 rounded-full animate-float-delayed" />
      <div className="absolute bottom-32 left-[20%] w-1 h-1 bg-purple-400/40 rounded-full animate-float" />
      <div className="absolute top-1/2 right-[25%] w-2 h-2 bg-emerald-300/30 rounded-full animate-float-delayed" />
    </div>
  );
}

// Animated typing effect for use cases
function TypewriterText() {
  const useCases = [
    'AI Agents',
    'LLM APIs', 
    'Crypto Protocols',
    'IoT Devices',
    'Autonomous Systems',
    'Smart Contracts',
    'Robotics',
    'Edge Computing'
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % useCases.length);
        setIsVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span 
      className={`inline-block transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {useCases[currentIndex]}
    </span>
  );
}

// Glassmorphic code terminal
function CodeTerminal() {
  const [copied, setCopied] = useState(false);
  
  const copyCode = () => {
    navigator.clipboard.writeText(`curl https://api.mnnr.app/v1/usage \\
  -H "Authorization: Bearer sk_test_..." \\
  -d '{"tokens": 1500, "model": "gpt-4"}'`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Terminal */}
      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-white/40 text-xs ml-3 font-mono">Track usage in one line</span>
          </div>
          <button 
            onClick={copyCode}
            className="text-white/40 hover:text-emerald-400 transition-colors text-xs font-mono"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        
        {/* Code */}
        <pre className="text-sm font-mono overflow-x-auto">
          <code>
            <span className="text-cyan-400">curl</span>
            <span className="text-white/80"> https://api.mnnr.app/v1/usage \</span>
            {'\n'}
            <span className="text-white/50">  -H </span>
            <span className="text-emerald-400">&quot;Authorization: Bearer sk_test_...&quot;</span>
            <span className="text-white/80"> \</span>
            {'\n'}
            <span className="text-white/50">  -d </span>
            <span className="text-purple-400">{'\'{\"tokens\": 1500, \"model\": \"gpt-4\"}\''}</span>
          </code>
        </pre>
        
        {/* Response preview */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="text-white/30 text-xs font-mono">Response:</span>
          <pre className="text-xs font-mono mt-2 text-emerald-400/80">
            {'{\"success\": true, \"usage_id\": \"usg_7x9k2...\", \"balance\": 8500}'}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Stats with animated counters - QUALIFIED CLAIMS ONLY
function AnimatedStats() {
  return (
    <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
      {[
        { value: '< 5min', label: 'Integration' },
        { value: 'High', label: 'Availability' },
        { value: '$0', label: 'To Start' }
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {stat.value}
          </div>
          <div className="text-white/40 text-sm mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Trust badges - QUALIFIED CLAIMS ONLY
function TrustBadges() {
  const badges = [
    { icon: '🔐', text: 'Bank-Level Encryption' },
    { icon: '⚡', text: 'Low Latency' },
    { icon: '🌐', text: 'Global Infrastructure' },
    { icon: '🔗', text: 'Web3 Compatible' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-12">
      {badges.map((badge) => (
        <div 
          key={badge.text}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300"
        >
          <span>{badge.icon}</span>
          <span>{badge.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6 overflow-hidden">
      <ParticleField />
      
      <div className="relative z-10 max-w-6xl mx-auto text-center py-20">
        {/* Announcement Badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 mb-10 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 text-sm font-medium">
            Payments Infrastructure for the Machine Economy
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
          <span className="block">Monetize</span>
          <span className="relative inline-block mt-2">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 animate-gradient">
              <TypewriterText />
            </span>
            {/* Underline glow */}
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-full blur-sm" />
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-white/70 mb-4 max-w-3xl mx-auto leading-relaxed font-light">
          The universal billing layer for autonomous systems.
        </p>
        
        <p className="text-lg text-white/50 mb-12 max-w-2xl mx-auto">
          One API to track usage, enforce limits, and collect payments from any machine, agent, or protocol.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link 
            href="/signup"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            <span>Start Building</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <Link 
            href="/docs/quick-start"
            className="group inline-flex items-center gap-2 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium text-lg px-8 py-4 rounded-xl transition-all duration-300 backdrop-blur-sm hover:bg-white/5"
          >
            <span>View Documentation</span>
            <span className="text-white/40 group-hover:text-white/60">→</span>
          </Link>
        </div>

        {/* Code Terminal */}
        <div className="max-w-2xl mx-auto mb-16">
          <CodeTerminal />
        </div>
        
        {/* Stats */}
        <AnimatedStats />
        
        {/* Trust Badges */}
        <TrustBadges />
        
        {/* Use Cases Ticker */}
        <div className="mt-16 pt-16 border-t border-white/5">
          <p className="text-white/30 text-sm mb-6 uppercase tracking-wider">Built for the future</p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-white/40">
            {['AI Agents', 'LLM APIs', 'Crypto Protocols', 'IoT Networks', 'Robotics', 'Edge Computing', 'Smart Contracts', 'Autonomous Vehicles'].map((useCase) => (
              <span key={useCase} className="hover:text-emerald-400 transition-colors cursor-default">
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
