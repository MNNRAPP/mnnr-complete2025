import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/refunds
 * Create a refund for a payment intent or charge
 *
 * Body:
 * - paymentIntentId (string): The payment intent to refund
 * - amount (number, optional): Amount in cents to refund. If omitted, refunds the full amount.
 * - reason (string, optional): One of 'duplicate', 'fraudulent', 'requested_by_customer'
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

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

    const body = await request.json();
    const { paymentIntentId, amount, reason } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Validate reason if provided
    const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer'];
    if (reason && !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: `Invalid reason. Must be one of: ${validReasons.join(', ')}` },
        { status: 400 }
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

    // Verify the payment intent belongs to the user
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.customer !== customer.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Create refund
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      if (typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'Amount must be a positive number' },
          { status: 400 }
        );
      }
      refundParams.amount = amount;
    }

    if (reason) {
      refundParams.reason = reason as Stripe.RefundCreateParams.Reason;
    }

    const refund = await stripe.refunds.create(refundParams);

    return NextResponse.json({
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        payment_intent: refund.payment_intent,
        created: refund.created,
      },
    });
  } catch (error) {
    console.error('Refund creation error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      if (error.code === 'charge_already_refunded') {
        return NextResponse.json(
          { error: 'This payment has already been refunded' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create refund' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/refunds
 * List refunds for the current user
 *
 * Query parameters:
 * - limit (number, optional): Max results (default: 10, max: 100)
 * - starting_after (string, optional): Pagination cursor
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

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

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!customer?.stripe_customer_id) {
      return NextResponse.json({ refunds: [], has_more: false });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10'),
      100
    );
    const starting_after = searchParams.get('starting_after') || undefined;

    // List charges for the customer, then get refunds
    const charges = await stripe.charges.list({
      customer: customer.stripe_customer_id,
      limit: 100,
    });

    // Collect payment intents from charges to filter refunds
    const paymentIntentIds = new Set(
      charges.data
        .map((c) => typeof c.payment_intent === 'string' ? c.payment_intent : c.payment_intent?.id)
        .filter(Boolean) as string[]
    );

    const refundsParams: Stripe.RefundListParams = {
      limit,
      starting_after,
    };

    const refunds = await stripe.refunds.list(refundsParams);

    // Filter to only refunds belonging to this customer
    const customerRefunds = refunds.data.filter((r) => {
      const pi = typeof r.payment_intent === 'string' ? r.payment_intent : r.payment_intent?.id;
      return pi && paymentIntentIds.has(pi);
    });

    return NextResponse.json({
      refunds: customerRefunds.map((refund) => ({
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        payment_intent: refund.payment_intent,
        created: refund.created,
      })),
      has_more: refunds.has_more,
    });
  } catch (error) {
    console.error('Refunds fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch refunds' },
      { status: 500 }
    );
  }
}
