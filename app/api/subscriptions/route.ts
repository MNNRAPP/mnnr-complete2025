/**
 * Subscriptions API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Maps the Clerk identity to a Stripe customer via the user's email. The
 * legacy Supabase handler looked up customers by `customers.stripe_customer_id`
 * keyed on `users.id`; the Neon schema has no `customers` table yet, so we
 * fall back to `stripe.customers.list({ email })` which returns at most one
 * row in normal operation (Stripe enforces unique emails per account).
 *
 * TODO(clerk-migrate): Add a `stripeCustomerId` column to the User model in
 * a follow-up migration so we can stop round-tripping the Stripe customer
 * search on every request. Also persist subscription state locally so we
 * can show plan info without hitting Stripe.
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
    if (!customer) return NextResponse.json({ subscriptions: [] });

    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      expand: ['data.items.data.price.product'],
      limit: 100,
    });

    return NextResponse.json({
      subscriptions: subs.data.map((s) => ({
        id: s.id,
        status: s.status,
        current_period_end: s.current_period_end,
        cancel_at_period_end: s.cancel_at_period_end,
        items: s.items.data.map((it) => ({
          id: it.id,
          price_id: it.price.id,
          product:
            typeof it.price.product === 'object'
              ? { id: it.price.product.id, name: (it.price.product as Stripe.Product).name }
              : { id: String(it.price.product) },
          unit_amount: it.price.unit_amount,
          currency: it.price.currency,
          interval: it.price.recurring?.interval ?? null,
        })),
      })),
    });
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
