/**
 * Invoices API Endpoint
 * 
 * Created: 2025-12-26 22:50:00 EST
 * Action #6 in 19-hour optimization
 * 
 * Purpose: Allow users to view and manage their Stripe invoices
 * 
 * Endpoints:
 * - GET /api/invoices - List user's invoices
 * - GET /api/invoices/[id] - Get specific invoice details
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/invoices
 * List all invoices for the current user
 * 
 * Query Parameters:
 * - limit: Number of invoices to return (default: 10, max: 100)
 * - starting_after: Pagination cursor
 * - status: Filter by status (draft, open, paid, uncollectible, void)
 */
export async function GET(request: Request) {
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
      return NextResponse.json({ invoices: [], has_more: false });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10'),
      100
    );
    const starting_after = searchParams.get('starting_after') || undefined;
    const status = searchParams.get('status') as Stripe.InvoiceListParams.Status | undefined;

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: customer.stripe_customer_id,
      limit,
      starting_after,
      status,
    });

    // Format invoice data
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

    return NextResponse.json({
      invoices: formattedInvoices,
      has_more: invoices.has_more,
    });
  } catch (error) {
    console.error('Invoices fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
