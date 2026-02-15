import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/checkout?session_id=cs_xxx
 * Redirects the user to Stripe Checkout for the given session.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.url) {
      return NextResponse.json(
        { error: 'Checkout session has no URL' },
        { status: 400 }
      );
    }

    return NextResponse.redirect(session.url);
  } catch (error) {
    console.error('Checkout redirect error:', error);
    return NextResponse.json(
      { error: 'Invalid checkout session' },
      { status: 400 }
    );
  }
}
