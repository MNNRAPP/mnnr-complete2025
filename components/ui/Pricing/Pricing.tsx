'use client';

import Button from '@/components/ui/Button';
import LogoCloud from '@/components/ui/LogoCloud';
import type { Tables } from '@/types_db';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import { getErrorRedirect } from '@/utils/helpers';
import { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

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

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  if (!products.length) {
    return (
      <section className="relative py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="rounded-3xl border border-white/10 bg-black/60 p-10 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              No pricing plans detected
            </h2>
            <p className="mt-4 text-base text-zinc-300">
              Create subscription products and prices in your{' '}
              <a
                className="text-emerald-300 underline decoration-dotted underline-offset-4"
                href="https://dashboard.stripe.com/products"
                rel="noopener noreferrer"
                target="_blank"
              >
                Stripe Dashboard
              </a>{' '}
              to surface packages here.
            </p>
          </div>
        </div>
        <div className="mt-16">
          <LogoCloud />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-28">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(140%_140%_at_50%_0%,rgba(15,118,110,0.15),rgba(0,0,0,0))]" />
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
            Pricing
          </span>
          <h2 className="mt-6 text-3xl font-semibold text-white md:text-5xl md:leading-[1.1]">
            Predictable plans for pilots and production scale
          </h2>
          <p className="mt-4 text-base text-zinc-300 md:text-lg">
            Start in minutes with developer-friendly tooling. Graduate to enterprise controls when you are ready—without
            a surprise migration.
          </p>
          <div className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-sm font-medium text-zinc-300">
            {intervals.includes('month') && (
              <button
                onClick={() => setBillingInterval('month')}
                type="button"
                className={cn(
                  'rounded-full px-6 py-2 transition',
                  billingInterval === 'month'
                    ? 'bg-white text-black shadow-[0_12px_40px_rgba(255,255,255,0.25)]'
                    : 'text-zinc-400 hover:text-white'
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
                  'rounded-full px-6 py-2 transition',
                  billingInterval === 'year'
                    ? 'bg-white text-black shadow-[0_12px_40px_rgba(255,255,255,0.25)]'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                Annual
              </button>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
            const isActivePlan = subscription
              ? product.name === subscription?.prices?.products?.name
              : product.name === 'Freelancer';

            return (
              <div
                key={product.id}
                className={cn(
                  'relative flex h-full flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)] transition',
                  isActivePlan && 'border-emerald-300/60 shadow-[0_30px_120px_rgba(16,185,129,0.25)]'
                )}
              >
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-white">{product.name}</h3>
                    {isActivePlan && (
                      <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300">{product.description}</p>
                  <div>
                    <span className="text-5xl font-semibold text-white">{priceString}</span>
                    <span className="ml-2 text-sm text-zinc-400">/{billingInterval}</span>
                  </div>
                </div>

                <Button
                  variant="slim"
                  type="button"
                  loading={priceIdLoading === price.id}
                  onClick={() => handleStripeCheckout(price)}
                  className="w-full rounded-full bg-white/10 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  {subscription ? 'Manage subscription' : 'Get started'}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-20">
          <LogoCloud />
        </div>
      </div>
    </section>
  );
}
