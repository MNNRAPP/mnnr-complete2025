import Stripe from 'stripe';
import { env } from '@/utils/env-validation';

export const stripe = new Stripe(
  env.stripe.secretKey(),
  {
    // https://github.com/stripe/stripe-node#configuration
    // https://stripe.com/docs/api/versioning
    apiVersion: '2024-11-20.acacia',
    timeout: 10000, // 10 seconds
    maxNetworkRetries: 2,
    // Register this as an official Stripe plugin.
    // https://stripe.com/docs/building-plugins#setappinfo
    appInfo: {
      name: 'Next.js Subscription Starter',
      version: '0.0.0',
      url: 'https://github.com/vercel/nextjs-subscription-payments'
    }
  }
);
