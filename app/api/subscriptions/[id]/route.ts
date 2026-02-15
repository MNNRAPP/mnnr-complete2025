import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/subscriptions/[id]
 * Upgrade or downgrade a subscription by changing the price
 */
export async function PATCH(
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

    if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      return NextResponse.json(
        { error: 'Cannot modify a canceled subscription' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { priceId, prorationBehavior = 'create_prorations' } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the current subscription from Stripe to get the item ID
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentItemId = stripeSubscription.items.data[0]?.id;

    if (!currentItemId) {
      return NextResponse.json(
        { error: 'No subscription item found' },
        { status: 400 }
      );
    }

    // Update subscription with new price (upgrade/downgrade)
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: currentItemId,
          price: priceId,
        },
      ],
      proration_behavior: prorationBehavior,
      expand: ['latest_invoice.payment_intent'],
    });

    return NextResponse.json({
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_start: updatedSubscription.current_period_start,
        current_period_end: updatedSubscription.current_period_end,
        items: updatedSubscription.items.data.map((item) => ({
          id: item.id,
          price: {
            id: item.price.id,
            unit_amount: item.price.unit_amount,
            currency: item.price.currency,
            interval: item.price.recurring?.interval,
          },
        })),
      },
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
