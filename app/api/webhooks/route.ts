/**
 * Stripe webhook receiver — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * The legacy version persisted product/price/subscription rows into Supabase
 * tables (`products`, `prices`, `subscriptions`, `stripe_events`). Those
 * tables are not modelled in Prisma yet, so this route is reduced to:
 *
 *   1. Validate the Stripe webhook signature (still mandatory).
 *   2. Apply the existing rate-limit gate.
 *   3. Log + ack the event.
 *
 * Subscription/product/price reconciliation is now best handled by reading
 * Stripe at request time (see app/api/subscriptions/route.ts) until a proper
 * Prisma Subscription / Product / Price model lands. Idempotency was based
 * on the `stripe_events` table; until we add an equivalent Prisma model,
 * Stripe's at-least-once delivery means handlers must remain side-effect-free.
 *
 * TODO(clerk-migrate): Add Prisma models for stripe_events / products /
 * prices / subscriptions and restore the upsert / idempotency logic.
 */

import Stripe from 'stripe';
import {
  getStripeClient,
  isStripeConfigured,
  StripeNotConfiguredError,
} from '@/utils/stripe/config';
import { logger } from '@/utils/logger';
import {
  checkRateLimit,
  getClientIp,
  rateLimitConfigs,
  createRateLimitResponse,
} from '@/utils/rate-limit';

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'price.deleted',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook not configured', { status: 500 });
  }
  if (!isStripeConfigured()) {
    logger.error('Stripe webhook invoked without secret key configured');
    return new Response('Stripe is not configured', { status: 500 });
  }

  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(clientIp, rateLimitConfigs.webhook);
  if (!rateLimit.allowed) {
    logger.warn('Webhook rate limit exceeded', { clientIp });
    return createRateLimitResponse(rateLimit.resetTime);
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      logger.error('Webhook validation failed: Missing signature or secret');
      return new Response('Webhook secret not found.', { status: 400 });
    }
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logger.webhook(event.type, { eventId: event.id, clientIp });
  } catch (err: unknown) {
    if (err instanceof StripeNotConfiguredError) {
      logger.error('Stripe client unavailable during webhook validation');
      return new Response('Stripe is not configured on this deployment.', {
        status: 500,
      });
    }
    logger.error('Webhook signature validation failed', err, {
      clientIp,
      bodyLength: body.length,
    });
    return new Response('Webhook validation failed', { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    // TODO(clerk-migrate): persist + reconcile once Prisma models exist.
    logger.info('Stripe webhook accepted (no-op pending Prisma reconciliation)', {
      eventType: event.type,
      eventId: event.id,
    });
  } else {
    logger.warn('Unsupported webhook event type', {
      eventType: event.type,
      eventId: event.id,
    });
  }

  return new Response(JSON.stringify({ received: true }));
}
