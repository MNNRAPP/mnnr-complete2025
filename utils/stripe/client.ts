/**
 * @module stripe/client
 * @description Lazy-loaded Stripe.js client for the browser.
 *
 * Initializes the Stripe.js SDK once and caches the promise, using the live
 * publishable key with a fallback to the test key from environment variables.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Returns a cached promise that resolves to the Stripe.js instance.
 * Uses `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE` with fallback to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
 * @returns A promise resolving to the Stripe instance, or `null` if no key is set.
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        ''
    );
  }

  return stripePromise;
};
