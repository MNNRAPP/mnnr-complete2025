/**
 * @module supabase/queries
 * @description React-cached Supabase query helpers for fetching user, subscription,
 * product, and user-detail data. Uses React `cache()` to deduplicate identical
 * queries within a single server render pass.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

/** Fetches the currently authenticated user. Cached per render pass. */
export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

/** Fetches the user's active or trialing subscription with nested price and product data. */
export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

/** Fetches all active products with their active prices, ordered by metadata index. */
export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

/** Fetches the current user's profile details from the `users` table. */
export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
});
