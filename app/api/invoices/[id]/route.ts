import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeClient } from '@/utils/stripe/config';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await db.getCustomerByUserId(user.id);
    if (!customer?.stripe_customer_id) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const stripe = getStripeClient();
    const invoice = await stripe.invoices.retrieve(params.id);

    // Verify invoice belongs to user
    if (invoice.customer !== customer.stripe_customer_id) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
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
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      discount: invoice.discount,
      lines: invoice.lines.data.map((line) => ({
        id: line.id,
        description: line.description,
        amount: line.amount,
        quantity: line.quantity,
        price: line.price,
        period: { start: line.period?.start, end: line.period?.end },
      })),
      payment_intent: invoice.payment_intent,
      subscription: invoice.subscription,
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError && error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
