import Stripe from 'stripe';
import { stripe } from '@/utils/stripe/config';
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord
} from '@/utils/supabase/admin';
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
  // Apply rate limiting
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.webhook);

  if (!rateLimit.allowed) {
    logger.warn('Webhook rate limit exceeded', { clientIp });
    return createRateLimitResponse(rateLimit.resetTime);
  }
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    // Critical: Validate webhook secret exists
    if (!webhookSecret) {
      logger.error('CRITICAL: STRIPE_WEBHOOK_SECRET is not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    if (!sig) {
      logger.warn('Webhook received without signature', { hasBody: !!body });
      return new Response('Missing signature', { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    logger.webhook(event.type, { eventId: event.id });
  } catch (err: any) {
    logger.error('Webhook signature validation failed', err, {
      errorMessage: err?.message
    });
    return new Response('Webhook signature validation failed', { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
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
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Webhook processing failed', error, {
        eventType: event.type,
        eventId: event.id
      });

      return new Response('Webhook processing failed', { status: 500 });
    }
  } else {
    logger.warn('Unsupported event type received', {
      eventType: event.type,
      eventId: event.id
    });
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    });
  }
  return new Response(JSON.stringify({ received: true }));
}
