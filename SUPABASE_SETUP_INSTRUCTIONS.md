# Supabase Database Setup Instructions

> **⚠️ CRITICAL SECRET HANDLING WARNING**
>
> Never commit any real Supabase keys to a public repository. The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row-Level Security and must NEVER be exposed to client-side code or version control. If this key was ever committed (even briefly), rotate it immediately via the Supabase dashboard.
>
> The `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable / anon key) is designed for browser exposure and is enforced by RLS — it is **not** the same as the service-role key. Do not paste a service-role JWT into any `NEXT_PUBLIC_*` variable.

## Project Information

Replace the placeholders below with your own Supabase project values. The values shown are templates, not real credentials.

- **Project Ref**: `<your-project-ref>`
- **Project URL**: `https://<your-project-ref>.supabase.co`
- **Dashboard**: `https://app.supabase.com/project/<your-project-ref>`

## Apply Database Schema

### Option 1: Supabase Dashboard (Recommended)

1. Go to the SQL Editor for your project: `https://app.supabase.com/project/<your-project-ref>/sql/new`
2. Copy the entire contents of `deploy-database.sql`
3. Paste into the SQL Editor
4. Click the "Run" button
5. Wait for completion (should take ~5 seconds)

### Option 2: Supabase CLI

```bash
cd /path/to/mnnr-complete2025
supabase db push
```

## Verify Setup

After applying the schema, verify:

1. **Tables Created** (8 tables):
   - `users`
   - `subscriptions`
   - `invoices`
   - `usage_events`
   - `audit_logs` (legacy)
   - `audit_events` (new — used by `lib/audit.ts`)
   - `payment_challenges` (new — x402 nonces)
   - `used_tx_hashes` (new — replay-prevention ledger)

2. **RLS Enabled**: All tables should have Row Level Security enabled.

3. **Indexes Created**: 17 performance indexes.

4. **Functions Created**:
   - `get_user_subscription_status()`
   - `log_usage_event()`

## RLS Posture (post-audit, 6/19/26)

- `usage_events` — INSERT restricted to `auth.uid() = user_id`. The previous `WITH CHECK (true)` policy was removed (Finding #4). Server-generated metering events must use the service-role client (`lib/supabase-admin.ts`), which bypasses RLS by design.
- `audit_events` — SELECT restricted to row owner. No client-facing INSERT/UPDATE/DELETE policy → only the service-role client can write events.
- `payment_challenges` — same posture: SELECT for owner; writes via service-role only.
- `used_tx_hashes` — same posture: SELECT for owner; writes via service-role only.
- Admin role can SELECT all of the above via the `Admins can view all *` policies.

## Database Schema Details

The schema includes:

- **8 tables** for core application data
- **17 indexes** for query performance
- **Row Level Security** policies for data protection (deny-by-default for service-role-only writes)
- **Admin policies** for administrative access
- **Database functions** for common operations
- **Automatic timestamps** via triggers

## Connection Info

Use these env variables in your application. **All real values stay in `.env.local` (gitignored) or your hosting provider's encrypted secret store — never in the repo.**

```env
# Public — safe to expose to the browser; protected by RLS.
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...REPLACE_WITH_YOUR_ANON_KEY...

# NEVER COMMIT THE REAL VALUE. SERVER-SIDE ONLY. BYPASSES RLS.
# Used by lib/supabase-admin.ts for service-role operations (audit-events insert,
# payment processing, billing/metering events generated server-side, etc.).
# If this value ever lands in git history or in a NEXT_PUBLIC_* var, ROTATE
# IMMEDIATELY via Supabase dashboard → Settings → API.
SUPABASE_SERVICE_ROLE_KEY=replace_me_server_only
```

### Key types at a glance

| Variable | Type | Exposure | Bypasses RLS? |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable / anon | browser-safe | No |
| `SUPABASE_SERVICE_ROLE_KEY` | service-role JWT | server-only secret | **Yes** |

Never set the service-role key as a `NEXT_PUBLIC_*` variable. Doing so leaks it into the bundled client JavaScript and grants every visitor full database access.

## Status

- Schema file ready: `deploy-database.sql`
- Server-only admin client: `lib/supabase-admin.ts`
- Apply schema via Dashboard or CLI; verify tables created.

## Next Steps

1. Apply schema (see options above).
2. Verify tables in Dashboard.
3. Confirm `.env.local` (or hosting secret store) carries real values for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. Deploy application.
5. Test database connection and RLS posture (see test checklist in the audit report).
