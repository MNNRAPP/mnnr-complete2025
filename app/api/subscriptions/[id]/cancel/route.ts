import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscriptions/[id]/cancel
 * Cancel a subscription
 *
 * Body:
 * - immediately (boolean): If true, cancel immediately with proration.
 *   If false (default), set cancel_at_period_end so the user retains access
 *   until the current billing period ends.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const subscriptionId = params.id;

    // Verify subscription belongs to user
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Subscription already canceled' },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { immediately = false } = body;

    let canceledSubscription: Stripe.Subscription;

    if (immediately) {
      // Cancel immediately — generates a prorated invoice
      canceledSubscription = await stripe.subscriptions.cancel(
        subscriptionId,
        {
          invoice_now: true,
          prorate: true,
        }
      );
    } else {
      // Cancel at the end of the current billing period
      canceledSubscription = await stripe.subscriptions.update(
        subscriptionId,
        { cancel_at_period_end: true }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        canceled_at: canceledSubscription.canceled_at,
        current_period_end: canceledSubscription.current_period_end,
      },
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
