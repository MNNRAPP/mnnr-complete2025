-- MNNR.APP — Vanilla Postgres reference schema for Neon
--
-- Rewritten 2026-06-19 as part of the Supabase → Neon migration. This file is
-- NOT the source of truth — that is `prisma/schema.prisma` plus the migrations
-- under `prisma/migrations/`. This file exists as a reference for DBAs and
-- external tooling that cannot run Prisma.
--
-- Differences vs. the prior Supabase-flavored schema:
--   - No FK to `auth.users` (Supabase Auth is gone; auth is Clerk).
--   - No `auth.uid()` calls. RLS uses `current_setting('app.current_user_id', true)::uuid`,
--     which the application binds per-request via lib/rls.ts#withUserContext.
--   - No `SUPABASE_SERVICE_ROLE_KEY` bypass; service-role flows use a Postgres role
--     with BYPASSRLS (`app_service`) granted to the admin connection user.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  clerk_id    TEXT UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usage_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event       TEXT NOT NULL,
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.api_keys (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hashed_key    TEXT UNIQUE NOT NULL, -- sha256 of full key; never store plaintext
  prefix        TEXT NOT NULL,         -- first 8 chars for display
  name          TEXT,
  revoked       BOOLEAN NOT NULL DEFAULT FALSE,
  last_used_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_events (
  id          BIGSERIAL PRIMARY KEY,
  event       TEXT NOT NULL,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  target_id   TEXT,
  actor_ip    TEXT,
  user_agent  TEXT,
  meta        JSONB,
  outcome     TEXT NOT NULL CHECK (outcome IN ('success', 'failure', 'denied')),
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_challenges (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id         TEXT,
  nonce              TEXT UNIQUE NOT NULL,
  amount             TEXT NOT NULL,  -- string for big-num precision
  resource           TEXT NOT NULL,
  receiver           TEXT NOT NULL,
  chain              TEXT NOT NULL,
  expires_at         TIMESTAMPTZ NOT NULL,
  consumed           BOOLEAN NOT NULL DEFAULT FALSE,
  consumed_at        TIMESTAMPTZ,
  consumed_tx_hash   TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.used_tx_hashes (
  tx_hash        TEXT PRIMARY KEY,
  chain          TEXT NOT NULL,
  challenge_id   UUID REFERENCES public.payment_challenges(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id                                BIGSERIAL PRIMARY KEY,
  email                             TEXT UNIQUE NOT NULL,
  email_hash                        TEXT NOT NULL,
  status                            TEXT NOT NULL, -- 'pending' | 'confirmed' | 'unsubscribed'
  confirmation_token                TEXT UNIQUE,
  confirmation_token_expires_at     TIMESTAMPTZ,
  created_at                        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at                      TIMESTAMPTZ,
  unsubscribed_at                   TIMESTAMPTZ
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usage_events_user_created
  ON public.usage_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_keys_user
  ON public.api_keys (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_user_event_created
  ON public.audit_events (user_id, event, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_challenges_nonce
  ON public.payment_challenges (nonce);
CREATE INDEX IF NOT EXISTS idx_payment_challenges_user_created
  ON public.payment_challenges (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email_hash
  ON public.newsletter_subscribers (email_hash);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status
  ON public.newsletter_subscribers (status);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
-- All policies key off `current_setting('app.current_user_id', true)::uuid`.
-- The application must SET LOCAL app.current_user_id = '<uuid>' inside the
-- transaction for owner-scoped queries to return rows. lib/rls.ts wraps this.

ALTER TABLE public.users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_challenges     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.used_tx_hashes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- users: row owner can read / update own row
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (id = current_setting('app.current_user_id', true)::uuid);

-- usage_events: owner read + insert
CREATE POLICY usage_events_select_own ON public.usage_events
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY usage_events_insert_own ON public.usage_events
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

-- api_keys: owner read / insert / update
CREATE POLICY api_keys_select_own ON public.api_keys
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY api_keys_insert_own ON public.api_keys
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY api_keys_update_own ON public.api_keys
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- audit_events: owner SELECT; INSERT only via BYPASSRLS service-role
CREATE POLICY audit_events_select_own ON public.audit_events
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- payment_challenges + used_tx_hashes + newsletter_subscribers:
--   RLS enabled, no public policies = deny-by-default; only the BYPASSRLS
--   service role can read or write.

-- ---------------------------------------------------------------------------
-- Service-role bypass role
-- ---------------------------------------------------------------------------
-- NOLOGIN role that BYPASSes RLS. Grant to the Neon admin connection user that
-- handles service-role flows (audit writes, challenge creation, replay-ledger
-- inserts, newsletter pipeline). Never grant to a role bound to anon traffic.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_service') THEN
    CREATE ROLE app_service NOLOGIN;
  END IF;
END
$$;

ALTER ROLE app_service BYPASSRLS;
-- GRANT app_service TO <neon_admin_connection_user>;
