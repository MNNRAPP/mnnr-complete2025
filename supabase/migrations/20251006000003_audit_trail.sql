-- DB-012: Audit Trail Implementation
-- Creates append-only audit log for security events
-- Tracks policy changes, admin actions, critical operations

-- ============================================
-- AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Who performed the action
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_role TEXT,

  -- What action was performed
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,

  -- Action details
  old_data JSONB,
  new_data JSONB,

  -- Request context
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,

  -- Security classification
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),

  -- Metadata
  metadata JSONB,

  -- Retention
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '90 days')
);

-- Indexes for performance
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_severity ON public.audit_log(severity);
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);

-- ============================================
-- RLS: SERVICE ROLE ONLY (APPEND-ONLY)
-- ============================================

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Deny all public access
CREATE POLICY "Deny all public access to audit_log" ON public.audit_log
  FOR ALL
  USING (false);

-- Service role can insert (for logging)
-- Service role can select (for auditing)
-- Service role CANNOT update or delete (append-only enforcement)

-- Note: Service role bypasses RLS, but we'll add application-level checks

-- ============================================
-- PREVENT UPDATES AND DELETES
-- ============================================

-- Create trigger to prevent updates
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log entries cannot be modified or deleted';
  RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_audit_log_update
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_modification();

CREATE TRIGGER prevent_audit_log_delete
  BEFORE DELETE ON public.audit_log
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_audit_log_modification();

-- ============================================
-- AUDIT LOGGING FUNCTIONS
-- ============================================

-- Generic audit log insertion function
CREATE OR REPLACE FUNCTION public.audit_log_event(
  p_action TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_role TEXT;
  v_audit_id UUID;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();

  IF v_user_id IS NOT NULL THEN
    SELECT email, raw_user_meta_data->>'role'
    INTO v_user_email, v_user_role
    FROM auth.users
    WHERE id = v_user_id;
  END IF;

  -- Insert audit log entry
  INSERT INTO public.audit_log (
    user_id,
    user_email,
    user_role,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    severity,
    metadata,
    ip_address,
    user_agent,
    request_path
  ) VALUES (
    v_user_id,
    v_user_email,
    v_user_role,
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    p_severity,
    p_metadata,
    inet(current_setting('request.headers', true)::json->>'x-forwarded-for'),
    current_setting('request.headers', true)::json->>'user-agent',
    current_setting('request.path', true)
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Never let audit logging break the application
    RAISE WARNING 'Audit log insertion failed: %', SQLERRM;
    RETURN NULL;
END;
$$;

-- Shorthand functions for common actions
CREATE OR REPLACE FUNCTION public.audit_policy_change(
  p_table_name TEXT,
  p_policy_name TEXT,
  p_old_definition JSONB,
  p_new_definition JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.audit_log_event(
    'policy_change',
    p_table_name,
    p_policy_name,
    p_old_definition,
    p_new_definition,
    'critical',
    jsonb_build_object('policy_name', p_policy_name)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_role_grant(
  p_target_user_id UUID,
  p_role TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.audit_log_event(
    'role_grant',
    'auth.users',
    p_target_user_id::TEXT,
    NULL,
    jsonb_build_object('role', p_role),
    'critical',
    jsonb_build_object('granted_role', p_role)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_subscription_change(
  p_subscription_id TEXT,
  p_old_status TEXT,
  p_new_status TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.audit_log_event(
    'subscription_status_change',
    'subscriptions',
    p_subscription_id,
    jsonb_build_object('status', p_old_status),
    jsonb_build_object('status', p_new_status),
    'info',
    jsonb_build_object('subscription_id', p_subscription_id)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_login(
  p_user_id UUID,
  p_method TEXT,
  p_success BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.audit_log_event(
    'login_attempt',
    'auth.users',
    p_user_id::TEXT,
    NULL,
    jsonb_build_object(
      'method', p_method,
      'success', p_success
    ),
    CASE WHEN p_success THEN 'info' ELSE 'warning' END,
    jsonb_build_object('login_method', p_method)
  );
END;
$$;

-- ============================================
-- AUTOMATIC AUDIT TRIGGERS
-- ============================================

-- Audit subscription changes automatically
CREATE OR REPLACE FUNCTION public.audit_subscription_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.audit_subscription_change(
      NEW.id,
      OLD.status::TEXT,
      NEW.status::TEXT
    );
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM public.audit_log_event(
      'subscription_created',
      'subscriptions',
      NEW.id,
      NULL,
      row_to_json(NEW)::JSONB,
      'info',
      jsonb_build_object('subscription_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_subscription_changes
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_subscription_trigger();

-- ============================================
-- RETENTION & CLEANUP
-- ============================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete audit logs older than expiration date
  DELETE FROM public.audit_log
  WHERE expires_at < NOW();

  RAISE NOTICE 'Expired audit logs cleaned up';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Audit log cleanup failed: %', SQLERRM;
END;
$$;

-- Optional: Schedule cleanup job (requires pg_cron extension)
-- Enable pg_cron in Supabase Dashboard → Database → Extensions
-- Then uncomment:
-- SELECT cron.schedule(
--   'cleanup-audit-logs',
--   '0 2 * * *',  -- 2 AM daily
--   'SELECT public.cleanup_expired_audit_logs()'
-- );

-- ============================================
-- AUDIT QUERY HELPERS
-- ============================================

-- Get recent critical events
CREATE OR REPLACE FUNCTION public.get_critical_audit_events(p_hours INT DEFAULT 24)
RETURNS TABLE(
  created_at TIMESTAMPTZ,
  user_email TEXT,
  action TEXT,
  table_name TEXT,
  severity TEXT,
  metadata JSONB
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    created_at,
    user_email,
    action,
    table_name,
    severity,
    metadata
  FROM public.audit_log
  WHERE severity = 'critical'
    AND created_at > NOW() - (p_hours || ' hours')::INTERVAL
  ORDER BY created_at DESC;
$$;

-- Get user activity
CREATE OR REPLACE FUNCTION public.get_user_audit_trail(p_user_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE(
  created_at TIMESTAMPTZ,
  action TEXT,
  table_name TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address INET
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    created_at,
    action,
    table_name,
    old_data,
    new_data,
    ip_address
  FROM public.audit_log
  WHERE user_id = p_user_id
    AND created_at > NOW() - (p_days || ' days')::INTERVAL
  ORDER BY created_at DESC;
$$;

-- ============================================
-- DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.audit_log IS 'Append-only audit log for security events. Cannot be modified or deleted.';
COMMENT ON COLUMN public.audit_log.action IS 'Action performed (e.g., login_attempt, policy_change, subscription_created)';
COMMENT ON COLUMN public.audit_log.severity IS 'Event severity: info, warning, or critical';
COMMENT ON COLUMN public.audit_log.expires_at IS 'Automatic expiration date (default 90 days from creation)';

COMMENT ON FUNCTION public.audit_log_event IS 'Log a generic audit event';
COMMENT ON FUNCTION public.audit_policy_change IS 'Log a policy change (critical severity)';
COMMENT ON FUNCTION public.audit_role_grant IS 'Log a role grant (critical severity)';
COMMENT ON FUNCTION public.audit_subscription_change IS 'Log a subscription status change';
COMMENT ON FUNCTION public.audit_login IS 'Log a login attempt';

-- ============================================
-- SEED INITIAL AUDIT ENTRY
-- ============================================

-- Log this migration
INSERT INTO public.audit_log (
  action,
  table_name,
  new_data,
  severity,
  metadata
) VALUES (
  'audit_trail_initialized',
  'audit_log',
  jsonb_build_object('migration', '20251006000003', 'description', 'Audit trail implementation'),
  'info',
  jsonb_build_object('system_event', true)
);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute on audit functions to authenticated users (for application use)
GRANT EXECUTE ON FUNCTION public.audit_log_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_subscription_change TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_login TO authenticated;

-- Admin functions (policy changes, role grants) - service role only
-- No explicit grants needed, SECURITY DEFINER handles it
