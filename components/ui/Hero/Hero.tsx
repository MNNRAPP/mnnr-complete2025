'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
          <span className="text-emerald-400 text-sm font-medium">
            ⚡ Usage-Based Billing for AI Applications
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Stripe for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            AI Agents
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
          Track usage, enforce limits, collect payments.
        </p>
        
        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          One API to add usage-based billing to your AI applications. 
          Start free, scale with revenue.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link 
            href="/signup"
            className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/50"
          >
            Start Free →
          </Link>
          
          <Link 
            href="/docs"
            className="border-2 border-gray-700 text-gray-300 hover:border-emerald-500 hover:text-emerald-400 font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200"
          >
            View Docs
          </Link>
        </div>

        {/* Code Example */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-400 text-sm ml-2">Track usage in one line</span>
            </div>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{`curl https://api.mnnr.app/v1/usage \\
  -H "Authorization: Bearer sk_live_..." \\
  -d '{"tokens": 1500, "model": "gpt-4"}'`}</code>
            </pre>
          </div>
        </div>
        
        {/* Trust Signals */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>5 minutes to integrate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Free tier included</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span>
            <span>No credit card required</span>
          </div>
        </div>
      </div>
    </div>
  );
}
