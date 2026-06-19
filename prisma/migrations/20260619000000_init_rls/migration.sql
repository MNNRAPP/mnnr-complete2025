-- MNNR.APP — Initial RLS policies for Neon Postgres
--
-- Created 2026-06-19. Companion to prisma/schema.prisma.
--
-- Prisma does not manage RLS; this raw-SQL migration installs the policies
-- the application relies on. All policies key off the session-local setting
-- `app.current_user_id`, which lib/rls.ts#withUserContext binds at the start
-- of every transaction that runs in a user's authenticated context.
--
-- For server-side / service-role flows (audit-event writes, payment challenge
-- creation, replay-ledger inserts, newsletter pipeline), connect using a
-- Postgres role that has BYPASSRLS. See the `app_service` role at the bottom
-- of this file. Grant that role to the Neon connection user used by
-- service-role code paths only — never to the user role bound to anon traffic.

-- ---------------------------------------------------------------------------
-- usage_events: users can only insert/select their own
-- ---------------------------------------------------------------------------
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_events_select_own ON public.usage_events
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY usage_events_insert_own ON public.usage_events
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- api_keys: users only see / manage their own
-- ---------------------------------------------------------------------------
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_keys_select_own ON public.api_keys
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY api_keys_insert_own ON public.api_keys
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY api_keys_update_own ON public.api_keys
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- audit_events: users see their own; INSERTs are service-role only
--   (no INSERT policy => non-bypass-RLS roles cannot write)
-- ---------------------------------------------------------------------------
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_events_select_own ON public.audit_events
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- payment_challenges, used_tx_hashes, newsletter_subscribers:
--   service-role only — RLS enabled, NO public policies = deny-by-default
-- ---------------------------------------------------------------------------
ALTER TABLE public.payment_challenges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_tx_hashes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- users: row owner can read / update their own row; service-role writes new rows
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (id = current_setting('app.current_user_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- Service-role bypass: a NOLOGIN role that BYPASSes RLS. Grant it to the
-- Neon role used by server-side admin code paths (audit writes, challenge
-- creation, replay-ledger inserts, newsletter pipeline, billing/metering).
--
-- WARNING: never grant app_service to the role that handles anon / authenticated
-- client traffic. Doing so disables RLS for the entire application.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_service') THEN
    CREATE ROLE app_service NOLOGIN;
  END IF;
END
$$;

ALTER ROLE app_service BYPASSRLS;

-- After provisioning your Neon admin user, run (manually, with appropriate role):
--   GRANT app_service TO <neon_admin_connection_user>;
