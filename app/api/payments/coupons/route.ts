import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/coupons
 * Validate and retrieve a promotion code / coupon
 *
 * Query parameters:
 * - code (string): The promotion code to validate
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
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Promotion code is required' },
        { status: 400 }
      );
    }

    // Search for the promotion code
    const promotionCodes = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    if (promotionCodes.data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired promotion code' },
        { status: 404 }
      );
    }

    const promoCode = promotionCodes.data[0];
    const coupon = promoCode.coupon;

    return NextResponse.json({
      promotionCode: {
        id: promoCode.id,
        code: promoCode.code,
        active: promoCode.active,
        coupon: {
          id: coupon.id,
          name: coupon.name,
          percent_off: coupon.percent_off,
          amount_off: coupon.amount_off,
          currency: coupon.currency,
          duration: coupon.duration,
          duration_in_months: coupon.duration_in_months,
          valid: coupon.valid,
        },
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/coupons
 * Apply a promotion code to an existing subscription
 *
 * Body:
 * - code (string): The promotion code to apply
 * - subscriptionId (string): The subscription to apply it to
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
    const { code, subscriptionId } = body;

    if (!code || !subscriptionId) {
      return NextResponse.json(
        { error: 'Promotion code and subscription ID are required' },
        { status: 400 }
      );
    }

    // Verify subscription belongs to user
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Look up the promotion code
    const promotionCodes = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    if (promotionCodes.data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired promotion code' },
        { status: 404 }
      );
    }

    const promoCode = promotionCodes.data[0];

    // Apply the promotion code's coupon to the subscription
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      { promotion_code: promoCode.id }
    );

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        discount: updatedSubscription.discount
          ? {
              id: updatedSubscription.discount.id,
              coupon: {
                id: updatedSubscription.discount.coupon.id,
                name: updatedSubscription.discount.coupon.name,
                percent_off: updatedSubscription.discount.coupon.percent_off,
                amount_off: updatedSubscription.discount.coupon.amount_off,
              },
              start: updatedSubscription.discount.start,
              end: updatedSubscription.discount.end,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Coupon apply error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}
