# MNNR JavaScript SDK

A lightweight helper for streaming product analytics and operational events into your hosted MNNR instance.

## Installation

```bash
npm install mnnr-client
# or
pnpm add mnnr-client
```

> This repository ships the reference implementation in `sdks/javascript/index.ts`. Publish it under your organisation's npm scope when ready.

## Usage

```ts
import { MnnrClient } from '@mnnr/client';

const client = new MnnrClient({
  apiUrl: process.env.MNNR_API_URL!,
  sdkSecret: process.env.MNNR_SDK_SECRET!,
  defaultUserId: 'workspace_123'
});

await client.track({
  event: 'workflow_started',
  properties: {
    template: 'kyc_onboarding',
    region: 'us-east-1'
  }
});
```

### Configuration

| Option | Required | Description |
| ------ | -------- | ----------- |
| `apiUrl` | ✅ | Base URL of your deployed Next.js application (e.g. `https://app.mnnr.com`). |
| `sdkSecret` | ✅ | The `SDK_INGEST_SECRET` value added to your environment. |
| `defaultUserId` | ⛔️ | Optional default identifier applied when you do not pass `userId` per event. |

### Tracking events

Each call to `track` is forwarded to the `/api/sdk/events` route. Events are persisted to Supabase and forwarded to PostHog automatically when server credentials are configured.

```ts
await client.track({
  event: 'usdc_checkout_initiated',
  userId: 'org_456',
  properties: {
    priceId: 'price_123',
    plan: 'Scale',
    wallet: 'base-mainnet'
  }
});
```

The SDK throws when ingestion fails so you can retry or surface errors upstream.
