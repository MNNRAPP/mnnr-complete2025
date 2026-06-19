# Neon Postgres Setup Instructions

> **CRITICAL SECRET HANDLING**
>
> `NEON_DATABASE_URL` and `NEON_DIRECT_URL` are server-only secrets. They include the database password and grant full row access subject to RLS. **Never expose them to browser code, never set them as `NEXT_PUBLIC_*` variables, and never commit them to git.** If a real value lands in git history or in a bundle, rotate the database password immediately via the Neon console.
>
> The connection user provisioned for service-role flows (the one that gets `GRANT app_service` so it can `BYPASSRLS`) is even more sensitive — restrict it to server-side admin code paths. Never use it for queries originating from a user request.

## Project Information

Replace the placeholders below with your own Neon project values. The values shown are templates, not real credentials.

- **Project Ref**: `<your-neon-project-ref>`
- **Region**: `<your-region, e.g. us-east-2>`
- **Console**: `https://console.neon.tech/app/projects/<your-neon-project-ref>`

## Connection string format

Neon connection strings look like:

```
postgresql://<user>:<password>@<endpoint>.<region>.aws.neon.tech/<dbname>?sslmode=require
```

You need two variants:

| Env var | Connection type | Used by |
|---|---|---|
| `NEON_DATABASE_URL` | **Pooled** (PgBouncer endpoint, often `…-pooler.<region>.aws.neon.tech`) | App at runtime — every API route, Server Component, Server Action |
| `NEON_DIRECT_URL` | **Unpooled** (direct endpoint) | `prisma migrate dev` / `prisma migrate deploy` / `prisma db push` |

Prisma migrations require an unpooled connection because they issue statements (DDL, advisory locks) that PgBouncer's transaction-pooling mode cannot proxy correctly.

## Required environment variables

Add to `.env.local` (dev) and your Vercel / hosting provider's encrypted secret store (production):

```env
# Pooled connection — runtime queries. SERVER-ONLY. Never expose to the browser.
NEON_DATABASE_URL=replace_me_server_only

# Unpooled connection — Prisma migrations only. SERVER-ONLY.
NEON_DIRECT_URL=replace_me_server_only
```

## Apply the schema

### Recommended path: Prisma

```bash
# Generate the typed client (run after every schema change)
pnpm db:generate

# Apply migrations to the dev database
pnpm db:migrate

# Apply migrations to production (CI / deploy step)
pnpm db:migrate:deploy

# Open Prisma Studio against the current connection
pnpm db:studio
```

The initial migration (`prisma/migrations/20260619000000_init_rls/migration.sql`) installs the RLS policies and the `app_service` BYPASSRLS role.

### Alternative path: hand-applied SQL (DBA tooling)

If you need to apply the schema without Prisma — e.g. an external DBA tool, a one-off `psql` session — `deploy-database.sql` is the vanilla-Postgres reference. It mirrors the Prisma schema but is **not** the source of truth; Prisma migrations are.

## RLS posture

RLS is enabled on every public table. Policies key off the session-local setting `app.current_user_id`, which the application binds via `lib/rls.ts#withUserContext`:

| Table | Owner-scoped policies | Service-role-only |
|---|---|---|
| `users` | SELECT, UPDATE own row | INSERT (account creation) |
| `usage_events` | SELECT, INSERT own rows | (none — owner can write) |
| `api_keys` | SELECT, INSERT, UPDATE own rows | (none — owner can write) |
| `audit_events` | SELECT own rows | INSERT (server emits events) |
| `payment_challenges` | (none) | all writes + reads |
| `used_tx_hashes` | (none) | all writes + reads |
| `newsletter_subscribers` | (none) | all writes + reads |

`current_setting('app.current_user_id', true)::uuid` returns NULL when the variable is not set, so any query that forgets to wrap in `withUserContext` returns zero rows — fail-closed.

## Provisioning the service-role connection user

The migration creates a `NOLOGIN` role called `app_service` with `BYPASSRLS`. To use it:

```sql
-- As a Neon admin / superuser:
CREATE USER mnnr_app_admin WITH PASSWORD 'replace_me_server_only';
GRANT CONNECT ON DATABASE <dbname> TO mnnr_app_admin;
GRANT USAGE ON SCHEMA public TO mnnr_app_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mnnr_app_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mnnr_app_admin;
GRANT app_service TO mnnr_app_admin;
```

Then build a second `NEON_DATABASE_URL` for the admin connection and bind it to your service-role flows (audit writes, challenge creation, replay-ledger inserts, newsletter pipeline). **Do not** reuse this connection for queries that originate from a user request — those queries must go through `lib/rls.ts#withUserContext`.

## Neon branching

Use Neon branches for staging / preview environments:

- `main` branch = production
- `staging` branch = staging
- per-PR ephemeral branch = preview (Vercel preview deployments)

Each branch gets its own pooled + unpooled URL; wire them into the corresponding Vercel environment.

## Verify setup

After applying migrations:

1. **Tables created** (7 tables matching the Prisma schema):
   - `users`, `usage_events`, `api_keys`, `audit_events`,
     `payment_challenges`, `used_tx_hashes`, `newsletter_subscribers`
2. **RLS enabled** on every table above (`SELECT relname, relrowsecurity FROM pg_class WHERE relnamespace = 'public'::regnamespace;`)
3. **`app_service` role exists with `BYPASSRLS`**
   (`SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'app_service';`)
4. **Indexes created** (per Prisma schema `@@index` directives)
5. **Sanity query** — connect as a non-admin user, run
   `SET LOCAL app.current_user_id = '<some-uuid>'; SELECT * FROM usage_events;`
   inside a transaction and confirm you only see that user's rows.

## Status

- Prisma schema: `prisma/schema.prisma`
- Initial RLS migration: `prisma/migrations/20260619000000_init_rls/migration.sql`
- Server-only Prisma client: `lib/db.ts`
- RLS binding helper: `lib/rls.ts`
- Vanilla-Postgres reference (DBA tooling): `deploy-database.sql`

## Next steps

1. Provision the Neon project + branches; capture pooled + unpooled URLs.
2. Set `NEON_DATABASE_URL` + `NEON_DIRECT_URL` in `.env.local` and Vercel.
3. `pnpm install` → `pnpm db:generate` → `pnpm db:migrate`.
4. Provision the admin connection user, grant `app_service`, point service-role code at the admin URL.
5. Hand off to the per-file refactor agents to delete `utils/supabase/*` and swap call sites to `lib/db.ts` + `lib/rls.ts` (see `MIGRATION_SUPABASE_TO_NEON.md`).
