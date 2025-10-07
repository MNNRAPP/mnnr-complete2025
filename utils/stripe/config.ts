import Stripe from 'stripe';

const STRIPE_APP_INFO = {
  name: 'Next.js Subscription Starter',
  version: '0.0.0',
  url: 'https://github.com/vercel/nextjs-subscription-payments'
} as const;

let stripeClient: Stripe | null = null;

export class StripeNotConfiguredError extends Error {
  constructor() {
    super(
      'Stripe secret key is not configured. Set STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_LIVE in your environment to enable Stripe features.'
    );
    this.name = 'StripeNotConfiguredError';
  }
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY
  );
}

export function getStripeClient(): Stripe {
  const secretKey =
    process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new StripeNotConfiguredError();
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      // https://github.com/stripe/stripe-node#configuration
      // https://stripe.com/docs/api/versioning
      // @ts-ignore
      apiVersion: null,
      // Register this as an official Stripe plugin.
      // https://stripe.com/docs/building-plugins#setappinfo
      appInfo: STRIPE_APP_INFO
    });
  }

  return stripeClient;
}
