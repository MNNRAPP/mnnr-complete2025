import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { logger } from '@/utils/logger';

export const getUser = cache(async (supabase: SupabaseClient) => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    logger.error('Failed to fetch user', error);
    throw new Error('Unable to fetch user data');
  }

  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    logger.error('Failed to fetch subscription', error);
    throw new Error('Unable to fetch subscription data');
  }

  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  if (error) {
    logger.error('Failed to fetch products', error);
    throw new Error('Unable to fetch products');
  }

  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  const { data: userDetails, error } = await supabase
    .from('users')
    .select('*')
    .single();

  if (error) {
    logger.error('Failed to fetch user details', error);
    throw new Error('Unable to fetch user details');
  }

  return userDetails;
});
