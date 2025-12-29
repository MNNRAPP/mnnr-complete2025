'use client';

import Button from '@/components/ui/Button';
import type { Tables } from '@/types_db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

export default function Pricing({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    // Redirect to Stripe Checkout
    window.location.href = `/api/checkout?session_id=${sessionId}`;

    setPriceIdLoading(undefined);
  };

  // If no products from Stripe, show manual pricing
  if (!products.length) {
    return (
      <section className="bg-black py-24 px-6" id="pricing">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
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
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">10,000 API calls/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Basic usage analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">API key management</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Community support</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Start Free
              </Link>
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
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">1M API calls/month</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Advanced analytics & insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Custom rate limits</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Stripe billing integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Email support</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-3 rounded-lg transition-colors"
              >
                Start Pro Trial
              </Link>
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
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Unlimited API calls</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Dedicated infrastructure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">SSO & advanced security</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span className="text-gray-300">Custom SLA</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
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

          {/* FAQ/Note */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 text-sm">
              All plans include uptime monitoring • Cancel anytime • No credit card required for free tier
            </p>
            <p className="text-gray-500 text-xs mt-4">
              Need to set up Stripe products?{' '}
              <a
                href="https://dashboard.stripe.com/products"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Configure in Stripe Dashboard →
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  // If products exist in Stripe, show dynamic pricing
  return (
    <section className="bg-black py-24 px-6" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees.
          </p>

          {intervals.length > 1 && (
            <div className="relative self-center mt-8 bg-gray-900 rounded-lg p-1 flex justify-center border border-gray-800 inline-flex">
              {intervals.includes('month') && (
                <button
                  onClick={() => setBillingInterval('month')}
                  type="button"
                  className={cn(
                    'rounded-md px-6 py-2 text-sm font-medium transition-all',
                    billingInterval === 'month'
                      ? 'bg-emerald-500 text-black'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  Monthly
                </button>
              )}
              {intervals.includes('year') && (
                <button
                  onClick={() => setBillingInterval('year')}
                  type="button"
                  className={cn(
                    'rounded-md px-6 py-2 text-sm font-medium transition-all',
                    billingInterval === 'year'
                      ? 'bg-emerald-500 text-black'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  Yearly <span className="text-xs">(Save 20%)</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product) => {
            const price = product?.prices?.find(
              (price) => price.interval === billingInterval
            );
            if (!price) return null;
            
            const currency = price.currency ?? 'USD';
            const amount = price.unit_amount ?? 0;
            const priceString = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency,
              minimumFractionDigits: 0
            }).format(amount / 100);

            const isPopular = product.name?.toLowerCase().includes('pro');
            const isCurrentPlan = subscription?.prices?.products?.name === product.name;

            return (
              <div
                key={product.id}
                className={cn(
                  'rounded-2xl border p-8 relative',
                  isCurrentPlan
                    ? 'border-emerald-500 bg-gradient-to-b from-emerald-500/10 to-black'
                    : isPopular
                    ? 'border-2 border-emerald-500 bg-gradient-to-b from-emerald-500/10 to-black'
                    : 'border-gray-800 bg-gradient-to-b from-gray-900/50 to-black'
                )}
              >
                {isPopular && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-sm font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                    CURRENT PLAN
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-white">
                      {priceString}
                    </span>
                    <span className="text-gray-400">/{billingInterval}</span>
                  </div>
                </div>

                <Button
                  variant="slim"
                  type="button"
                  loading={priceIdLoading === price.id}
                  onClick={() => handleStripeCheckout(price)}
                  className={cn(
                    'w-full py-3 rounded-lg font-semibold transition-colors',
                    isPopular || isCurrentPlan
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  )}
                >
                  {isCurrentPlan ? 'Manage Subscription' : 'Get Started'}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            All plans include uptime monitoring • Cancel anytime • No credit card required for free tier
          </p>
        </div>
      </div>
    </section>
  );
}
