/**
 * Stripe <-> Neon Database Sync
 * Replaces utils/supabase/admin.ts with direct Neon operations
 */

import { toDateTime } from '@/utils/helpers';
import { getStripeClient } from '@/utils/stripe/config';
import { db } from '@/lib/db';
import type { Product, Price, Subscription } from '@/lib/db';
import Stripe from 'stripe';
import { logger } from '@/utils/logger';

export const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata,
  };

  await db.upsertProduct(productData);
  logger.info('Product inserted/updated', { productId: product.id });
};

export const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3
) => {
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? 0,
  };

  try {
    await db.upsertPrice(priceData);
    logger.info('Price inserted/updated', { priceId: price.id });
  } catch (error: any) {
    if (error?.message?.includes('foreign key') && retryCount < maxRetries) {
      logger.warn('Retrying price upsert due to FK constraint', {
        attempt: retryCount + 1,
        priceId: price.id,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
    } else {
      throw error;
    }
  }
};

export const deleteProductRecord = async (product: Stripe.Product) => {
  await db.deleteProduct(product.id);
  logger.info('Product deleted', { productId: product.id });
};

export const deletePriceRecord = async (price: Stripe.Price) => {
  await db.deletePrice(price.id);
  logger.info('Price deleted', { priceId: price.id });
};

export const createOrRetrieveCustomer = async ({
  email,
  uuid,
}: {
  email: string;
  uuid: string;
}) => {
  const existingCustomer = await db.getCustomerByUserId(uuid);

  const stripe = getStripeClient();
  let stripeCustomerId: string | undefined;

  if (existingCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingCustomer.stripe_customer_id
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    const stripeCustomers = await stripe.customers.list({ email });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : (await stripe.customers.create({ metadata: { supabaseUUID: uuid }, email })).id;

  if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');

  await db.upsertCustomer(uuid, stripeIdToInsert);

  if (existingCustomer && stripeCustomerId && existingCustomer.stripe_customer_id !== stripeCustomerId) {
    logger.warn('Customer record mismatched Stripe ID. Updated.', { uuid, stripeCustomerId });
  }

  return stripeIdToInsert;
};

const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  const customer =
    typeof payment_method.customer === 'string'
      ? payment_method.customer
      : payment_method.customer?.id;

  const { name, phone, address } = payment_method.billing_details;
  if (!customer || !name || !phone || !address) return;

  const stripe = getStripeClient();

  const addressParam: Stripe.AddressParam = {
    city: address.city ?? undefined,
    country: address.country ?? undefined,
    line1: address.line1 ?? undefined,
    line2: address.line2 ?? undefined,
    postal_code: address.postal_code ?? undefined,
    state: address.state ?? undefined,
  };

  await stripe.customers.update(customer, { name, phone, address: addressParam });
  await db.updateUser(uuid, {
    billing_address: { ...address } as Record<string, unknown>,
    payment_method: { ...payment_method[payment_method.type] } as Record<string, unknown>,
  });
};

export const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  const customerData = await db.getCustomerByStripeId(customerId);
  if (!customerData) {
    throw new Error(`Customer lookup failed for stripe_customer_id: ${customerId}`);
  }
  const uuid = customerData.id;

  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });

  const subscriptionData: Subscription = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata as Record<string, unknown>,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: (subscription as any).quantity ?? null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(subscription.current_period_start).toISOString(),
    current_period_end: toDateTime(subscription.current_period_end).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null,
  };

  await db.upsertSubscription(subscriptionData);
  logger.info('Subscription upserted', { subscriptionId: subscription.id, userId: uuid });

  if (createAction && uuid) {
    const dpm = subscription.default_payment_method;
    if (dpm && typeof dpm !== 'string') {
      await copyBillingDetailsToCustomer(uuid, dpm);
    }
  }
};
