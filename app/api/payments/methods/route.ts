/**
 * Payment Methods API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Lists the authenticated user's Stripe card payment methods. We look up the
 * Stripe customer by email (legacy code used a `customers` join table that
 * no longer exists in the Neon schema).
 *
 * TODO(clerk-migrate): Persist stripeCustomerId on the User row in a
 * follow-up migration so we can drop the per-request `customers.list` round
 * trip.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { getOrCreateUser, unauthorized } from '@/lib/user';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return unauthorized();
    const user = await getOrCreateUser();
    if (!user) return unauthorized();

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) return NextResponse.json({ paymentMethods: [] });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: 'card',
    });

    return NextResponse.json({
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand,
        last4: pm.card?.last4,
        exp_month: pm.card?.exp_month,
        exp_year: pm.card?.exp_year,
        is_default: pm.id === customer.invoice_settings?.default_payment_method,
      })),
    });
  } catch (error) {
    console.error('Payment methods fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
