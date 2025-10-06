import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import { logger } from '@/utils/logger';
import {
  checkRateLimit,
  getClientIp,
  rateLimitConfigs,
  createRateLimitResponse
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
  'customer.subscription.deleted'
]);

export async function POST(req: Request) {
  // Skip during build time when env vars aren't available
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Webhook not configured', { status: 500 });
  }

  // Apply enterprise rate limiting
  const clientIp = getClientIp(req);
  const rateLimit = await checkRateLimit(clientIp, rateLimitConfigs.webhook);

  if (!rateLimit.allowed) {
    logger.warn('Webhook rate limit exceeded', { clientIp, remaining: rateLimit.remaining });
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
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logger.webhook(event.type, { eventId: event.id, clientIp });
  } catch (err: unknown) {
    logger.error('Webhook signature validation failed', err, { clientIp, bodyLength: body.length });
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      // PAY-020: Idempotency check - prevent duplicate processing
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const supabase = createAdminClient();

      const { data: existingEvent } = await (supabase as any)
        .from('stripe_events')
        .select('id')
        .eq('id', event.id)
        .single();

      if (existingEvent) {
        logger.info('Webhook already processed (idempotency)', { eventId: event.id, eventType: event.type });
        return new Response(JSON.stringify({ received: true, processed: 'already' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Dynamically import admin functions to avoid build-time issues
      const {
        upsertProductRecord,
        upsertPriceRecord,
        manageSubscriptionStatusChange,
        deleteProductRecord,
        deletePriceRecord
      } = await import('@/utils/supabase/admin');

      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'price.deleted':
          await deletePriceRecord(event.data.object as Stripe.Price);
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );
          }
          break;
        default:
          logger.error('Unhandled relevant event type', undefined, { eventType: event.type, eventId: event.id });
          throw new Error('Unhandled relevant event!');
      }

      // PAY-020: Record successful processing for idempotency
      await (supabase as any)
        .from('stripe_events')
        .insert({
          id: event.id,
          event_type: event.type
        });

      logger.info('Webhook processed successfully', { eventType: event.type, eventId: event.id });
    } catch (error) {
      logger.error('Webhook processing failed', error, { eventType: event.type, eventId: event.id });
      return new Response(
        'Webhook handler failed. View your Next.js function logs.',
        {
          status: 400
        }
      );
    }
  } else {
    logger.warn('Unsupported webhook event type', { eventType: event.type, eventId: event.id });
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
