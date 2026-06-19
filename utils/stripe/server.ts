'use server';

/**
 * utils/stripe/server.ts — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Server actions for Stripe checkout + customer portal. The legacy version
 * resolved the user via supabase.auth.getUser() and looked up the Stripe
 * customer via createOrRetrieveCustomer (a Supabase admin RPC that no
 * longer exists). We now resolve the user via Clerk + Prisma and look up
 * the Stripe customer by email (creating one on the fly if needed).
 *
 * Price type mirrors the shape that callers pass in; we keep it minimal so
 * we don't reintroduce a dependency on the deleted types_db Tables<'prices'>
 * type.
 */

import Stripe from 'stripe';
import {
  getStripeClient,
  StripeNotConfiguredError,
} from '@/utils/stripe/config';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user';
import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp,
} from '@/utils/helpers';

export type Price = {
  id: string;
  type: 'recurring' | 'one_time' | null;
  trial_period_days?: number | null;
};

type CheckoutResponse = {
  errorRedirect?: string;
  sessionId?: string;
};

async function getOrCreateStripeCustomer(stripe: Stripe, email: string): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data[0]) return existing.data[0].id;
  const created = await stripe.customers.create({ email });
  return created.id;
}

export async function checkoutWithStripe(
  price: Price,
  redirectPath: string = '/account',
): Promise<CheckoutResponse> {
  try {
    const stripe = getStripeClient();

    const { userId: clerkId } = auth();
    if (!clerkId) throw new Error('Could not get user session.');
    const user = await getOrCreateUser();
    if (!user) throw new Error('Could not get user session.');

    const customer = await getOrCreateStripeCustomer(stripe, user.email);

    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer,
      customer_update: { address: 'auto' },
      line_items: [{ price: price.id, quantity: 1 }],
      cancel_url: getURL(),
      success_url: getURL(redirectPath),
    };

    if (price.type === 'recurring') {
      params = {
        ...params,
        mode: 'subscription',
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days),
        },
      };
    } else {
      params = { ...params, mode: 'payment' };
    }

    const session = await stripe.checkout.sessions.create(params);
    if (!session) throw new Error('Unable to create checkout session.');
    return { sessionId: session.id };
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      return {
        errorRedirect: getErrorRedirect(
          redirectPath,
          'Stripe is not configured.',
          'Add STRIPE_SECRET_KEY to enable billing features.',
        ),
      };
    }
    return {
      errorRedirect: getErrorRedirect(
        redirectPath,
        error instanceof Error ? error.message : 'An unknown error occurred.',
        'Please try again later or contact a system administrator.',
      ),
    };
  }
}

export async function createStripePortal(currentPath: string) {
  try {
    const stripe = getStripeClient();

    const { userId: clerkId } = auth();
    if (!clerkId) throw new Error('Could not get user session.');
    const user = await getOrCreateUser();
    if (!user) throw new Error('Could not get user session.');

    const customer = await getOrCreateStripeCustomer(stripe, user.email);

    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: getURL('/account'),
    });
    if (!url) throw new Error('Could not create billing portal');
    return url;
  } catch (error) {
    if (error instanceof StripeNotConfiguredError) {
      return getErrorRedirect(
        currentPath,
        'Stripe is not configured.',
        'Add STRIPE_SECRET_KEY to enable billing features.',
      );
    }
    return getErrorRedirect(
      currentPath,
      error instanceof Error ? error.message : 'An unknown error occurred.',
      'Please try again later or contact a system administrator.',
    );
  }
}
