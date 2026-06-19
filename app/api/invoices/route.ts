/**
 * Invoices List API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Lists the authenticated user's Stripe invoices. Customer is resolved by
 * Clerk-session email; legacy `customers` join table is gone.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { getOrCreateUser, unauthorized } from '@/lib/user';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return unauthorized();
    const user = await getOrCreateUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 10, 1), 100);
    const status = searchParams.get('status') as Stripe.Invoice.Status | null;
    const startingAfter = searchParams.get('starting_after') || undefined;

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) return NextResponse.json({ invoices: [], has_more: false });

    const params: Stripe.InvoiceListParams = {
      customer: customer.id,
      limit,
    };
    if (status) params.status = status;
    if (startingAfter) params.starting_after = startingAfter;

    const invoices = await stripe.invoices.list(params);

    return NextResponse.json({
      invoices: invoices.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amount_due: inv.amount_due,
        amount_paid: inv.amount_paid,
        currency: inv.currency,
        created: inv.created,
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf: inv.invoice_pdf,
      })),
      has_more: invoices.has_more,
    });
  } catch (error) {
    console.error('Invoices fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
