/**
 * Invoice Detail API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Returns one Stripe invoice if it belongs to the Clerk-session user. We
 * verify ownership by comparing the invoice's customer email to the user's.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { getOrCreateUser, unauthorized } from '@/lib/user';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return unauthorized();
    const user = await getOrCreateUser();
    if (!user) return unauthorized();

    const invoice = await stripe.invoices.retrieve(params.id, {
      expand: ['customer', 'lines.data.price.product'],
    });

    // Ownership check
    const customer = invoice.customer;
    const ownerEmail =
      typeof customer === 'object' && customer && !('deleted' in customer)
        ? (customer as Stripe.Customer).email
        : null;
    if (ownerEmail !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      currency: invoice.currency,
      created: invoice.created,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      lines: invoice.lines.data.map((l) => ({
        id: l.id,
        amount: l.amount,
        currency: l.currency,
        description: l.description,
        quantity: l.quantity,
      })),
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError && error.statusCode === 404) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    console.error('Invoice fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
