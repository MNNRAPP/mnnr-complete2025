import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscriptions/usage
 * Report usage for a metered subscription item
 *
 * Body:
 * - subscriptionItemId (string): The subscription item to report usage for
 * - quantity (number): The usage quantity to report
 * - action (string, optional): 'increment' (default) or 'set'
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
    const { subscriptionItemId, quantity, action = 'increment' } = body;

    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: 'Subscription item ID is required' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative number' },
        { status: 400 }
      );
    }

    // Verify the subscription belongs to the user by checking Stripe
    const subscriptionItem = await stripe.subscriptionItems.retrieve(subscriptionItemId);
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionItem.subscription as string
    );

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!customer?.stripe_customer_id || subscription.customer !== customer.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Report usage to Stripe
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        action: action === 'set' ? 'set' : 'increment',
        timestamp: Math.floor(Date.now() / 1000),
      }
    );

    // Also record in our usage_events table for local analytics
    await supabase.from('usage_events').insert({
      user_id: user.id,
      metric: `stripe_usage:${subscriptionItemId}`,
      value: quantity,
    });

    return NextResponse.json({
      usageRecord: {
        id: usageRecord.id,
        quantity: usageRecord.quantity,
        timestamp: usageRecord.timestamp,
        subscription_item: usageRecord.subscription_item,
      },
    });
  } catch (error) {
    console.error('Usage report error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to report usage' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscriptions/usage
 * Get usage summary for the current billing period
 *
 * Query parameters:
 * - subscriptionItemId (string): The subscription item to get usage for
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

    const { searchParams } = new URL(request.url);
    const subscriptionItemId = searchParams.get('subscriptionItemId');

    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: 'Subscription item ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const subscriptionItem = await stripe.subscriptionItems.retrieve(subscriptionItemId);
    const subscription = await stripe.subscriptions.retrieve(
      subscriptionItem.subscription as string
    );

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!customer?.stripe_customer_id || subscription.customer !== customer.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get usage record summaries from Stripe
    const usageSummary = await stripe.subscriptionItems.listUsageRecordSummaries(
      subscriptionItemId,
      { limit: 10 }
    );

    return NextResponse.json({
      usage: usageSummary.data.map((summary) => ({
        id: summary.id,
        total_usage: summary.total_usage,
        period: {
          start: summary.period.start,
          end: summary.period.end,
        },
        subscription_item: summary.subscription_item,
      })),
      has_more: usageSummary.has_more,
    });
  } catch (error) {
    console.error('Usage fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
