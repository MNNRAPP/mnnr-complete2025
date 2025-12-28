# USDC On-Chain Checkout

This project now supports stablecoin payments alongside the traditional Stripe flow using Coinbase Commerce. Follow the steps below to go live.

## 1. Create a Coinbase Commerce account

1. Visit [commerce.coinbase.com](https://commerce.coinbase.com/)
2. Create a business account and verify your domain
3. Generate an API key and webhook shared secret from **Settings → API keys**

## 2. Configure environment variables

Update your environment using the new variables documented in `.env.example`:

```bash
COINBASE_COMMERCE_API_KEY=cc_live_api_key
COINBASE_COMMERCE_WEBHOOK_SECRET=whsec_example
```

Redeploy the Next.js application after saving the variables in Vercel.

## 3. Enable webhooks (optional but recommended)

Coinbase Commerce can notify your application when a charge is confirmed. Point the webhook to a secure endpoint (e.g. `/api/webhooks/coinbase`) and validate signatures using the shared secret. The env validator warns when the webhook secret is missing.

## 4. Test the flow

1. Sign in to the hosted app
2. Visit the pricing section and click **“Pay with USDC”**
3. You will be redirected to a Coinbase-hosted checkout
4. After payment, Coinbase redirects the user back to the app via the configured success URL

> Tip: The server action `beginUsdcCheckout` can also be invoked from other surfaces if you want to expose USDC payments outside of pricing cards.

## Troubleshooting

- **Button hidden** — Ensure `COINBASE_COMMERCE_API_KEY` is set; the UI hides the USDC button otherwise.
- **Charge not created** — Check the Vercel logs. The helper reports the raw Coinbase error message for quick diagnosis.
- **Webhook verification** — Add the shared secret to surface signature warnings in the environment validator.
