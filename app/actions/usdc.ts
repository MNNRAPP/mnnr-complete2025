'use server';

import { createClient } from '@/utils/supabase/server';
import { createUsdcCharge, isUsdcConfigured, UsdcNotConfiguredError } from '@/utils/payments/usdc';
import { getErrorRedirect } from '@/utils/helpers';

export interface BeginUsdcCheckoutResult {
  hostedUrl?: string;
  errorRedirect?: string;
  error?: string;
}

export async function beginUsdcCheckout(
  priceId: string,
  currentPath: string
): Promise<BeginUsdcCheckoutResult> {
  if (!isUsdcConfigured()) {
    return {
      error: 'USDC payments are not configured yet.'
    };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      errorRedirect: getErrorRedirect(
        currentPath,
        'Sign in required',
        'Create an account or log in to pay with USDC.'
      )
    };
  }

  const { data: price, error: priceError } = await supabase
    .from('prices')
    .select('id, unit_amount, currency, products(name, description)')
    .eq('id', priceId)
    .eq('active', true)
    .maybeSingle();

  if (priceError || !price) {
    return {
      errorRedirect: getErrorRedirect(
        currentPath,
        'Plan unavailable',
        'This plan is not available for USDC checkout right now.'
      )
    };
  }

  try {
    const charge = await createUsdcCharge({
      priceId: price.id,
      amount: (price.unit_amount ?? 0) / 100,
      currency: price.currency ?? 'usd',
      planName: price.products?.name ?? 'Subscription',
      description: price.products?.description,
      userId: user.id,
      email: user.email,
      successPath: '/account',
      cancelPath: currentPath
    });

    return {
      hostedUrl: charge.hostedUrl
    };
  } catch (error) {
    if (error instanceof UsdcNotConfiguredError) {
      return {
        errorRedirect: getErrorRedirect(
          currentPath,
          'USDC offline',
          'Add Coinbase Commerce credentials to enable on-chain payments.'
        )
      };
    }

    return {
      errorRedirect: getErrorRedirect(
        currentPath,
        'Unable to start USDC checkout',
        error instanceof Error ? error.message : 'Please try again later.'
      )
    };
  }
}
