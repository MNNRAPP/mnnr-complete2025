# @mnnr/sdk

Official TypeScript SDK for the [mnnr.app](https://mnnr.app) API.

- Fetch-only — **zero runtime deps**
- Runs on Node 18+, browsers, Cloudflare Workers, Vercel Edge, Deno
- Companion to [`openapi.yaml`](../../openapi.yaml) and
  [Swagger UI](https://mnnr-app.netlify.app/docs/api-reference)

## Install

```bash
pnpm add @mnnr/sdk
# or
npm install @mnnr/sdk
```

Until this package is published to npm, install directly from the repo:

```bash
pnpm add github:MNNRAPP/mnnr-complete2025#feat/demos-and-apis-20260619&path=packages/sdk
```

## Quick start

```ts
import { MnnrClient } from '@mnnr/sdk';

const client = new MnnrClient({
  apiKey: process.env.MNNR_API_KEY!,
  // baseUrl: 'https://mnnr-app.netlify.app',  // default
});

// 1. Mint + revoke an API key (dashboard session required)
const dashboard = new MnnrClient({
  sessionCookie: process.env.SB_ACCESS_TOKEN!,
  csrfToken: process.env.CSRF_TOKEN!,
});

const created = await dashboard.keys.create({ name: 'my-laptop', mode: 'live' });
console.log('Save this key, it is shown once:', created.key);
await dashboard.keys.revoke(created.id);

// 2. Record + query usage
await client.usage.record({ metric: 'api.calls', value: 1, metadata: { route: '/analyze' } });
const usage = await client.usage.list({ period: 'week' });

// 3. x402 payment — challenge → verify
const challenge = await client.payments.createChallenge({
  resource: 'analyze',
  amountUSD: '0.01',
  token: 'USDC',
  chain: 'base-sepolia',
});

// (Pay on-chain referencing challenge.nonce here, get back a txHash)

const result = await client.payments.verify({
  nonce: challenge.nonce,
  txHash: '0x…',
  chain: 'base-sepolia',
  executeAction: { resource: 'analyze', params: {} },
});

// 4. Newsletter (no auth)
await client.newsletter.subscribe({
  email: 'you@example.com',
  turnstileToken: '<turnstile widget token>',
});
```

## Auth modes

| Mode | What you pass | Use for |
|------|---------------|---------|
| API key | `new MnnrClient({ apiKey: 'mnnr_live_…' })` | server-to-server, agent runtimes |
| Session cookie | `new MnnrClient({ sessionCookie, csrfToken })` | replaying dashboard flows from a script |

## Errors

Every non-2xx response throws `MnnrError`:

```ts
import { MnnrError } from '@mnnr/sdk';

try {
  await client.payments.verify({ ... });
} catch (e) {
  if (e instanceof MnnrError) {
    if (e.status === 503) {
      // PAYMENT_VERIFICATION_ENABLED is not set on the server
    } else if (e.status === 402) {
      console.log('verification failed:', e.body);
    } else {
      throw e;
    }
  }
}
```

## Status

Version `0.1.0`. Skeleton — covers the routes documented in
[`/openapi.json`](../../public/openapi.json). Not yet published to npm.

See also:

- [`examples/curl/README.md`](../../examples/curl/README.md) — raw HTTP equivalents
- [`examples/demos/`](../../examples/demos/) — runnable end-to-end demos
- [`examples/postman/`](../../examples/postman/) — Postman collection
