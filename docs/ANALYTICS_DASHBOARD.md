# Advanced Analytics Dashboard

The `/account/analytics` route delivers subscription telemetry, revenue KPIs, and SDK event insights for operators.

## Requirements

- `SUPABASE_SERVICE_ROLE_KEY` — enables server-side aggregation across subscriptions.
- `SDK_INGEST_SECRET` — authenticates SDK clients and signals readiness in the dashboard.
- Optional: `POSTHOG_API_KEY` + `POSTHOG_HOST` for forwarding events to PostHog.

## Data sources

| Card | Source |
| ---- | ------ |
| Active/Trial counts | `subscriptions` table in Supabase |
| MRR/ARR | Stripe prices joined via Supabase webhook sync |
| Trial conversion | `trial_start` / `trial_end` columns |
| Usage signals & Event spotlight | `usage_events` table fed by the SDK ingestion route |
| Integration health | Environment validation + ingestion status |

## Refresh behaviour

- Users can trigger a refresh manually.
- The dashboard fetches `/api/analytics/overview` which responds with 503 when service credentials are missing.

## Extending the view

- Add new metrics inside `utils/analytics/overview.ts`.
- Extend the `usage_events` schema for additional metadata and update the SDKs to populate it.
- Hook Coinbase Commerce webhooks to write on-chain settlement events and surface them alongside Stripe metrics.
