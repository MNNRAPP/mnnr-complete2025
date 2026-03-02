import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
      console.error(
        '[Stripe] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe checkout will not work.'
      );
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(key);
    }
  }

  return stripePromise;
};
