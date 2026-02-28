import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeClient } from '@/utils/stripe/config';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await db.getCustomerByUserId(user.id);
    if (!customer?.stripe_customer_id) {
      return NextResponse.json({ invoices: [], has_more: false });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const starting_after = searchParams.get('starting_after') || undefined;
    const status = searchParams.get('status') as Stripe.InvoiceListParams.Status | undefined;

    const stripe = getStripeClient();
    const invoices = await stripe.invoices.list({
      customer: customer.stripe_customer_id,
      limit,
      starting_after,
      status,
    });

    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      amount_remaining: invoice.amount_remaining,
      currency: invoice.currency,
      created: invoice.created,
      due_date: invoice.due_date,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      lines: invoice.lines.data.map((line) => ({
        id: line.id,
        description: line.description,
        amount: line.amount,
        quantity: line.quantity,
        price: line.price,
      })),
    }));

    return NextResponse.json({ invoices: formattedInvoices, has_more: invoices.has_more });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
