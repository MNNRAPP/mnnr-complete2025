import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscriptions
 * Get current user's subscriptions
 */
export async function GET() {
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
      return NextResponse.json({ subscriptions: [] });
    }

    // Get subscriptions from database
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        prices (
          *,
          products (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created', { ascending: false });

    if (error) {
      console.error('Subscription fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ subscriptions: subscriptions || [] });
  } catch (error) {
    console.error('Subscriptions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions
 * Create a new subscription
 */
export async function POST(request: Request) {
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

    // Parse request body
    const body = await request.json();
    const { priceId, paymentMethodId, trialDays } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let { data: customerData } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = customerData?.stripe_customer_id;

    if (!customerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID
      await supabase.from('customers').insert({
        id: user.id,
        stripe_customer_id: customerId,
      });
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    };

    if (trialDays) {
      subscriptionParams.trial_period_days = trialDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as Stripe.Invoice)
        ?.payment_intent
        ? ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent)
            .client_secret
        : null,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
