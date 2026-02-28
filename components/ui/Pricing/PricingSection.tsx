'use client';

import { useEffect, useState } from 'react';
import Pricing from './Pricing';
import type { Product, Price, Subscription } from '@/lib/db';

interface ProductWithPrices extends Product {
  prices: Price[];
}

interface PriceWithProduct extends Price {
  products: Product | null;
}

interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

// Static pricing fallback - shown immediately for fast LCP
function StaticPricing() {
  return (
    <section className="bg-black py-24 px-6" id="pricing">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/50 to-black p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">10,000 API calls/month</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Basic usage analytics</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">API key management</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Community support</span>
              </li>
            </ul>

            <a
              href="/sign-up"
              className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Start Free
            </a>
          </div>

          {/* Pro Tier */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-500/10 to-black p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-sm font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$49</span>
                <span className="text-gray-400">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">1M API calls/month</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Advanced analytics &amp; insights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Custom rate limits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Stripe billing integration</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Email support</span>
              </li>
            </ul>

            <a
              href="/sign-up"
              className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Start Pro Trial
            </a>
          </div>

          {/* Enterprise Tier */}
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/50 to-black p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">Custom</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Unlimited API calls</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Dedicated infrastructure</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">SSO &amp; advanced security</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Custom SLA</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">&#10003;</span>
                <span className="text-gray-300">Dedicated support</span>
              </li>
            </ul>

            <a
              href="mailto:pilot@mnnr.app"
              className="block w-full text-center border-2 border-gray-700 hover:border-emerald-500 text-gray-300 hover:text-emerald-400 font-semibold py-3 rounded-lg transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            All plans include uptime monitoring - Cancel anytime - No credit card required for free tier
          </p>
        </div>
      </div>
    </section>
  );
}

export default function PricingSection() {
  // Always show static pricing - dynamic pricing fetched on pricing page
  return <StaticPricing />;
}
