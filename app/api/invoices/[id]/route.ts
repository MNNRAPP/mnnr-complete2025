/**
 * Invoice Details API Endpoint
 * 
 * Created: 2025-12-26 22:51:00 EST
 * Action #7 in 19-hour optimization
 * 
 * Purpose: Get detailed information about a specific invoice
 * 
 * Endpoints:
 * - GET /api/invoices/[id] - Get invoice details
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/invoices/[id]
 * Get detailed information about a specific invoice
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const invoiceId = params.id;

    // Fetch invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Verify invoice belongs to user
    if (invoice.customer !== customer.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Format invoice data
    const formattedInvoice = {
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
        period: {
          start: line.period?.start,
          end: line.period?.end,
        },
      })),
      payment_intent: invoice.payment_intent,
      subscription: invoice.subscription,
    };

    return NextResponse.json(formattedInvoice);
  } catch (error) {
    console.error('Invoice fetch error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      if (error.type === 'StripeInvalidRequestError') {
        return NextResponse.json(
          { error: 'Invoice not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}
