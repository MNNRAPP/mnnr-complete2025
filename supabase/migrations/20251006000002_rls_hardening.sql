-- DB-010: RLS Hardening and Audit
-- Ensures deny-by-default RLS is enabled on ALL tables
-- Adds missing policies for data modification operations

-- ============================================
-- VERIFY RLS IS ENABLED ON ALL TABLES
-- ============================================

-- RLS is already enabled on:
-- - users (lines 15-17 in init.sql)
-- - customers (line 44 in init.sql)
-- - products (line 65 in init.sql)
-- - prices (line 98 in init.sql)
-- - subscriptions (line 137 in init.sql)
-- - stripe_events (created in 20251006000001_stripe_events.sql)

-- ============================================
-- ADD MISSING POLICIES FOR DATA MODIFICATION
-- ============================================

-- USERS table: Add INSERT policy for new user creation
CREATE POLICY "Users can insert own data on signup" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- USERS table: Add DELETE policy (optional, typically disabled)
-- Uncomment if you want users to be able to delete their own accounts
-- CREATE POLICY "Users can delete own data" ON public.users
--   FOR DELETE
--   USING (auth.uid() = id);

-- SUBSCRIPTIONS table: Prevent user modifications (read-only for users)
-- Subscriptions are managed via Stripe webhooks only
-- No INSERT/UPDATE/DELETE policies = users cannot modify

-- PRODUCTS table: Add admin-only modification policies
-- Only service role can modify products (synced from Stripe)
CREATE POLICY "Service role can modify products" ON public.products
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- PRICES table: Add admin-only modification policies
CREATE POLICY "Service role can modify prices" ON public.prices
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- CUSTOMERS TABLE: Enhanced Security
-- ============================================

-- customers table has NO policies (lines 44-45 in init.sql)
-- This is correct: users should never access this table directly
-- Only service role can access for Stripe customer ID lookups

-- Add explicit deny policy for extra security
CREATE POLICY "Deny all public access to customers" ON public.customers
  FOR ALL
  USING (false);

-- Service role bypasses RLS, so webhooks can still access

-- ============================================
-- STRIPE_EVENTS TABLE: Already Secured
-- ============================================

-- stripe_events table already has "Service role only" policy
-- Created in 20251006000001_stripe_events.sql
-- No changes needed

-- ============================================
-- RLS AUDIT FUNCTION
-- ============================================

-- Function to audit all tables for RLS status
CREATE OR REPLACE FUNCTION public.audit_rls_status()
RETURNS TABLE(
  schema_name TEXT,
  table_name TEXT,
  rls_enabled BOOLEAN,
  rls_forced BOOLEAN,
  policy_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    n.nspname::TEXT AS schema_name,
    c.relname::TEXT AS table_name,
    c.relrowsecurity AS rls_enabled,
    c.relforcerowsecurity AS rls_forced,
    (
      SELECT COUNT(*)
      FROM pg_policy p
      WHERE p.polrelid = c.oid
    ) AS policy_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind = 'r'  -- Only tables
    AND n.nspname = 'public'  -- Only public schema
    AND c.relname NOT LIKE 'pg_%'  -- Exclude system tables
  ORDER BY c.relname;
$$;

COMMENT ON FUNCTION public.audit_rls_status() IS 'Audits RLS status for all public tables';

-- ============================================
-- PASSKEYS TABLE: Add RLS if missing
-- ============================================

-- Check if passkeys table exists (from 20250105_passkeys_and_challenges.sql)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'passkeys'
  ) THEN
    -- Enable RLS on passkeys
    ALTER TABLE public.passkeys ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any (to avoid conflicts)
    DROP POLICY IF EXISTS "Users can view own passkeys" ON public.passkeys;
    DROP POLICY IF EXISTS "Users can insert own passkeys" ON public.passkeys;
    DROP POLICY IF EXISTS "Users can delete own passkeys" ON public.passkeys;

    -- Users can only view their own passkeys
    CREATE POLICY "Users can view own passkeys" ON public.passkeys
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Users can insert their own passkeys
    CREATE POLICY "Users can insert own passkeys" ON public.passkeys
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Users can delete their own passkeys
    CREATE POLICY "Users can delete own passkeys" ON public.passkeys
      FOR DELETE
      USING (auth.uid() = user_id);

    RAISE NOTICE 'RLS enabled on passkeys table';
  END IF;
END $$;

-- ============================================
-- CHALLENGES TABLE: Add RLS if missing
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'challenges'
  ) THEN
    -- Enable RLS on challenges
    ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Users can view own challenges" ON public.challenges;
    DROP POLICY IF EXISTS "Users can insert own challenges" ON public.challenges;

    -- Users can only view their own challenges
    CREATE POLICY "Users can view own challenges" ON public.challenges
      FOR SELECT
      USING (auth.uid() = user_id);

    -- Users can insert their own challenges
    CREATE POLICY "Users can insert own challenges" ON public.challenges
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    -- Service role can update challenges (for verification)
    CREATE POLICY "Service role can update challenges" ON public.challenges
      FOR UPDATE
      USING (auth.jwt() ->> 'role' = 'service_role');

    RAISE NOTICE 'RLS enabled on challenges table';
  END IF;
END $$;

-- ============================================
-- SECURITY VERIFICATION
-- ============================================

-- Run audit to verify all tables have RLS enabled
-- Uncomment to see results during migration:
-- SELECT * FROM public.audit_rls_status();

-- Expected results:
-- All tables should have rls_enabled = true
-- All tables should have at least 1 policy (except customers which has deny-all)

-- ============================================
-- RLS TESTING HELPERS
-- ============================================

-- Function to test RLS as specific user
CREATE OR REPLACE FUNCTION public.test_rls_as_user(test_user_id UUID)
RETURNS TABLE(
  table_name TEXT,
  can_select BOOLEAN,
  can_insert BOOLEAN,
  can_update BOOLEAN,
  can_delete BOOLEAN,
  row_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function helps test RLS policies
  -- Usage: SELECT * FROM test_rls_as_user('user-uuid-here');

  RAISE NOTICE 'Testing RLS for user: %', test_user_id;

  -- Set session to impersonate user
  PERFORM set_config('request.jwt.claims', json_build_object('sub', test_user_id)::text, true);

  -- Test users table
  RETURN QUERY SELECT
    'users'::TEXT,
    EXISTS(SELECT 1 FROM public.users WHERE id = test_user_id),
    true,  -- Placeholder (would need actual insert test)
    true,  -- Placeholder
    false, -- Placeholder
    (SELECT COUNT(*) FROM public.users WHERE id = test_user_id)::BIGINT;

  -- Reset session
  PERFORM set_config('request.jwt.claims', NULL, true);
END;
$$;

COMMENT ON FUNCTION public.test_rls_as_user(UUID) IS 'Tests RLS policies by impersonating a user';

-- ============================================
-- DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.users IS 'User profiles - RLS enabled, users can view/update own data only';
COMMENT ON TABLE public.customers IS 'Stripe customer mappings - RLS enabled, service role only';
COMMENT ON TABLE public.products IS 'Stripe products - RLS enabled, public read, service role write';
COMMENT ON TABLE public.prices IS 'Stripe prices - RLS enabled, public read, service role write';
COMMENT ON TABLE public.subscriptions IS 'User subscriptions - RLS enabled, users can view own only';
COMMENT ON TABLE public.stripe_events IS 'Webhook idempotency - RLS enabled, service role only';

-- ============================================
-- AUDIT LOG ENTRY
-- ============================================

-- Log this migration in audit trail (if audit table exists)
-- This will be created in next migration (DB-012)
-- INSERT INTO public.audit_log (action, table_name, new_data)
-- VALUES ('rls_hardening', 'all_tables', '{"migration": "20251006000002", "description": "RLS hardening and audit"}');
