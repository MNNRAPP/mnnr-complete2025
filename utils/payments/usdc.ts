import { getURL } from '@/utils/helpers';

export class UsdcNotConfiguredError extends Error {
  constructor() {
    super('USDC payments are not configured');
    this.name = 'UsdcNotConfiguredError';
  }
}

export interface UsdcChargeRequest {
  priceId: string;
  amount: number;
  currency: string;
  planName: string;
  description?: string | null;
  userId: string;
  email?: string | null;
  successPath?: string;
  cancelPath?: string;
}

export interface UsdcChargeResponse {
  hostedUrl: string;
  code: string;
  expiresAt?: string;
}

const COINBASE_API_URL = 'https://api.commerce.coinbase.com/charges';

export const isUsdcConfigured = (): boolean =>
  Boolean(process.env.COINBASE_COMMERCE_API_KEY);

export async function createUsdcCharge(
  request: UsdcChargeRequest
): Promise<UsdcChargeResponse> {
  if (!isUsdcConfigured()) {
    throw new UsdcNotConfiguredError();
  }

  const response = await fetch(COINBASE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CC-Version': '2018-03-22',
      'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY as string
    },
    body: JSON.stringify({
      name: `${request.planName} – USDC`,
      description: request.description ?? undefined,
      pricing_type: 'fixed_price',
      local_price: {
        amount: request.amount.toFixed(2),
        currency: 'USD'
      },
      payment_currencies: ['USDC'],
      metadata: {
        price_id: request.priceId,
        supabase_user_id: request.userId,
        email: request.email ?? undefined
      },
      redirect_url: getURL(request.successPath ?? '/account'),
      cancel_url: getURL(request.cancelPath ?? '/pricing')
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      (error?.error?.message as string | undefined) ||
      response.statusText ||
      'Unable to create USDC charge';
    throw new Error(message);
  }

  const payload = await response.json();
  const data = payload?.data;

  if (!data?.hosted_url || !data?.code) {
    throw new Error('Coinbase Commerce response missing hosted_url or code');
  }

  return {
    hostedUrl: data.hosted_url,
    code: data.code,
    expiresAt: data.expires_at
  };
}
