-- prisma/migrations/20260620000000_add_user_onboarded_at/migration.sql
--
-- Adds User.onboardedAt — set when a user finishes the /onboarding 3-step tour.
-- Idempotent so re-runs in dev (and against a freshly forked DB on a Neon
-- branch) don't blow up.
--
-- Backfill: NULL on every existing row. That's the correct "never onboarded"
-- state — existing users will see the onboarding flow once on next sign-in,
-- which is what we want (they get the tour for the new dashboard surfaces
-- shipped in this PR).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;
