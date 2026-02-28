import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripeClient } from '@/utils/stripe/config';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;

    // Verify subscription belongs to user
    const subscription = await db.getSubscriptionById(subscriptionId, user.id);
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { immediately = false } = body;

    const stripe = getStripeClient();
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId, {
      invoice_now: immediately,
      prorate: immediately,
    });

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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
