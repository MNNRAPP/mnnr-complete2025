/**
 * Subscriptions Cancel API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Cancels a Stripe subscription owned by the authenticated user. Ownership
 * is enforced by re-looking up the subscription's customer and asserting
 * that customer's email matches the Clerk session email.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { getOrCreateUser, unauthorized } from '@/lib/user';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return unauthorized();
    const user = await getOrCreateUser();
    if (!user) return unauthorized();

    const subId = params.id;
    const sub = await stripe.subscriptions.retrieve(subId);

    // Ownership check via Stripe customer email
    const customerId =
      typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return NextResponse.json({ error: 'Customer deleted' }, { status: 404 });
    }
    if ((customer as Stripe.Customer).email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await stripe.subscriptions.update(subId, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updated.id,
        status: updated.status,
        cancel_at_period_end: updated.cancel_at_period_end,
        cancel_at: updated.cancel_at,
      },
    });
  } catch (error) {
    console.error('Subscription cancel error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
