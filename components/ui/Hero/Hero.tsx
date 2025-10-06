'use client';

import ContactButton from '@/components/ui/ContactButton/ContactButton';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
          <span className="text-emerald-400">Payments</span>{' '}
          <span className="text-white">for</span>{' '}
          <span className="text-emerald-400">Machines</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Pay-per-call for agents/APIs with verifiable receipts. Agent wallets, spend caps, and real-time 
          settlement. Multi-rail: USDC + Stripe in one API.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {/* Apply Now Button */}
          <Link 
            href="/partners/register"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
          >
            Apply now (0% pilot fees)
          </Link>
          
          {/* Contact Button */}
          <ContactButton 
            source="hero-landing-page"
            className="border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-black font-bold text-lg px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            pilot@mnnr.app
          </ContactButton>
        </div>
        
        {/* Additional Info */}
        <div className="mt-16 text-gray-400 text-sm">
          <p>🤖 Designed for AI agents and autonomous systems</p>
          <p className="mt-2">💰 Per-transaction pricing • 🔐 Cryptographic receipts • ⚡ Real-time settlement</p>
        </div>
      </div>
    </div>
  );
}