# MIGRATION — Supabase → Neon Postgres

Tracking: ChatGPT-prescribed pivot, 2026-06-19. Executed by the Neon migration keystone agent + follow-on per-file refactor agents.

## TL;DR

| | Before (Supabase) | After (Neon) |
|---|---|---|
| Postgres host | Supabase managed | Neon managed |
| Client library | `@supabase/supabase-js`, `@supabase/ssr` | `@prisma/client` + (optional) `@neondatabase/serverless` |
| Auth | Supabase Auth (`auth.uid()`) | Clerk (binds `app.current_user_id` per request) |
| RLS keying | `auth.uid() = user_id` | `current_setting('app.current_user_id', true)::uuid = user_id` |
| Schema authoring | Hand-written `deploy-database.sql` | `prisma/schema.prisma` + `prisma migrate` |
| Service-role writes | `SUPABASE_SERVICE_ROLE_KEY` (JWT, bypasses RLS) | Postgres role with `BYPASSRLS` (`app_service`) granted to the admin connection user |
| Connection envs | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `NEON_DATABASE_URL` (pooled), `NEON_DIRECT_URL` (unpooled, migrations) |

## What changed in this repo (keystone agent scope)

Created:
- `prisma/schema.prisma` — Prisma data model (User, UsageEvent, ApiKey, AuditEvent, PaymentChallenge, UsedTxHash, NewsletterSubscriber)
- `prisma/migrations/20260619000000_init_rls/migration.sql` — RLS policies + `app_service` BYPASSRLS role
- `prisma/migrations/migration_lock.toml` — Prisma migration provider lock
- `lib/db.ts` — server-only Prisma client (HMR-safe; throws if env missing in production; throws if imported from browser)
- `lib/rls.ts` — `withUserContext(userId, fn)` helper that binds `app.current_user_id` for the transaction
- `NEON_SETUP_INSTRUCTIONS.md` — Neon-flavored replacement for `SUPABASE_SETUP_INSTRUCTIONS.md`
- `MIGRATION_SUPABASE_TO_NEON.md` — this file

Modified:
- `package.json` — added `@prisma/client`, `@neondatabase/serverless`, devDep `prisma`; removed `@supabase/supabase-js`, `@supabase/ssr`, devDep `supabase`; replaced `supabase:*` scripts with `db:*` scripts (`generate`, `migrate`, `migrate:deploy`, `studio`)
- `deploy-database.sql` — rewritten as vanilla Postgres reference (no Supabase `auth.uid()`, no Supabase `auth.users` FK); documents the `current_setting('app.current_user_id', true)::uuid` pattern; preserved for non-Prisma DBA tooling

Renamed:
- `SUPABASE_SETUP_INSTRUCTIONS.md` → `NEON_SETUP_INSTRUCTIONS.md`

## What did NOT change (out of keystone scope)

37 application files still import `@supabase/supabase-js` / `@supabase/ssr` or reference Supabase admin helpers. Other agents in this swarm own the refactor of those files. The complete inventory:

```
app/api/usage/route.ts
app/api/keys/route.ts
app/api/user/profile/route.ts
app/api/subscriptions/route.ts
app/api/subscriptions/[id]/cancel/route.ts
app/api/streams/route.ts
app/api/payments/methods/route.ts
app/api/newsletter/route.ts
app/api/marketplace/route.ts
app/api/invoices/route.ts
app/api/invoices/[id]/route.ts
app/api/escrow/route.ts
app/api/agents/route.ts
app/auth/callback/route.ts
app/auth/reset_password/route.ts
app/signin/[id]/page.tsx
app/pricing/page.tsx
app/dashboard/page.tsx
components/ui/Pricing/PricingSection.tsx
components/ui/Pricing/Pricing.tsx
components/ui/Navbar/Navlinks.tsx
components/ui/Navbar/Navbar.tsx
components/ui/AuthForms/OauthSignIn.tsx
utils/supabase/queries.ts
utils/supabase/server.ts
utils/supabase/middleware.ts
utils/supabase/client.ts
utils/supabase/admin.ts
utils/stripe/server.ts
utils/auth-helpers/server.ts
utils/auth-helpers/client.ts
scripts/sync-stripe-to-supabase.js
lib/payment-challenge-store.ts
lib/audit-trail.ts
__tests__/integration/supabase.test.ts
__tests__/integration/auth-flow.test.ts
__tests__/api/keys.test.ts
```

## Refactor playbook (for follow-on agents)

For each file in the inventory above:

1. **Remove** any `import { createClient } from '@supabase/supabase-js'` / `@supabase/ssr` / `utils/supabase/*` imports.
2. **Replace** server-side queries with `import { db } from '@/lib/db'` (or `import { withUserContext } from '@/lib/rls'` when the call is in an authenticated user context).
3. **Auth replacement** — wherever the old code did `const { data: { user } } = await supabase.auth.getUser()`, swap in the Clerk equivalent (`auth()` from `@clerk/nextjs/server` in Route Handlers / Server Components; `useUser()` on the client). The agent owning the Clerk wiring is responsible for the exact import path.
4. **RLS context** — when running queries inside a user request, wrap them in `withUserContext(clerkUserId, (tx) => tx.usageEvent.findMany(...))`. Pass the transactional `tx` client into the call — using the outer `db` client inside the callback escapes the transaction and defeats RLS.
5. **Service-role flows** (audit writes, challenge creation, replay-ledger inserts, newsletter pipeline) — use the plain `db` import. The connection user provisioned for admin code paths must have the `app_service` role (see `NEON_SETUP_INSTRUCTIONS.md`); that role's `BYPASSRLS` replaces the old `SUPABASE_SERVICE_ROLE_KEY` bypass.
6. **Delete** `utils/supabase/*` once all consumers are migrated. Same for `scripts/sync-stripe-to-supabase.js` (replace with a Prisma-flavored equivalent or delete if Stripe sync now writes via webhook handlers directly).
7. **Tests** — `__tests__/integration/supabase.test.ts` should be deleted and replaced with a Prisma/Neon equivalent; `auth-flow.test.ts` and `api/keys.test.ts` need their auth stubs rewritten against Clerk.

## Auth-layer note

`auth.uid()` no longer exists. The `app.current_user_id` setting is empty unless `withUserContext()` binds it. Anything that previously relied on Supabase auto-populating `auth.uid()` for an RLS check must now route through `withUserContext()` with the authenticated Clerk user ID.

## Initial database bring-up

```bash
# 1. Install new deps
pnpm install

# 2. Generate Prisma client
pnpm db:generate

# 3. Apply migrations to the Neon dev branch
#    (Tohid runs this; the keystone agent does NOT run it)
pnpm db:migrate

# 4. Confirm in Prisma Studio
pnpm db:studio
```

## Rollback note

Old Supabase artifacts retained until rollback window closes:
- `deploy-database.sql` — rewritten to vanilla Postgres, but still on disk if a hand-applied schema reference is needed.
- `utils/supabase/*` — left on disk for the per-file refactor agents to delete.

## Outstanding Tohid decisions

1. Neon project URL / hostname pattern (`ep-xxxx-xxxx.us-east-2.aws.neon.tech`?) — needed before `NEON_DATABASE_URL` can be set in Vercel.
2. Branch strategy (one Neon branch per environment vs. one branch per PR preview).
3. Whether to keep `audit_logs` and `subscriptions` / `invoices` tables (legacy Supabase schema) or fold them into the Prisma schema; current Prisma model intentionally omits them per the ChatGPT prescription. If retained, a follow-on Prisma migration must add them as models with the appropriate RLS.
