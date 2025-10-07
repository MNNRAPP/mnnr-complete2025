# SDK Integration Guide

This project now ships first-party helper clients for JavaScript/TypeScript and Python. They authenticate against the `/api/sdk/events` endpoint using a shared secret.

## 1. Configure the server

Set the following environment variables and redeploy:

```bash
SDK_INGEST_SECRET=generate_a_long_random_string
POSTHOG_API_KEY=phc_example_key  # optional but recommended
POSTHOG_HOST=https://app.posthog.com
```

The analytics dashboard reflects readiness once the secret is present.

## 2. Use the JavaScript client

See [`sdks/javascript`](../sdks/javascript/README.md) for installation instructions and example usage.

Key methods:

- `track({ event, userId, properties })` — persists the event and forwards it to PostHog.

## 3. Use the Python client

See [`sdks/python`](../sdks/python/README.md) for installation instructions and example usage.

The interface mirrors the JavaScript version with synchronous execution.

## 4. Custom metadata

The ingestion API stores the `properties` payload as JSON in the `usage_events` table. Extend your analytics by adding typed metadata (e.g. feature flags, plan tiers, or request latency).

## 5. Security checklist

- Keep `SDK_INGEST_SECRET` private. Rotate it if you suspect it leaked.
- Consider issuing per-customer secrets by proxying the ingestion route and applying your own auth layer.
- Monitor Vercel logs for ingestion failures surfaced by the SDKs.
