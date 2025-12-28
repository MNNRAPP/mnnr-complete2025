-- Create audit_logs table for immutable audit trail
-- Supports cryptographic integrity verification and compliance reporting

CREATE TABLE IF NOT EXISTS audit_logs (
  -- Primary identification
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Event classification
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  
  -- Actor information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Resource and action
  resource TEXT,
  action TEXT,
  
  -- Additional context
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Cryptographic integrity
  previous_hash TEXT,
  signature TEXT NOT NULL,
  
  -- Indexes for performance
  CONSTRAINT audit_logs_timestamp_idx CHECK (timestamp IS NOT NULL)
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource) WHERE resource IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address) WHERE ip_address IS NOT NULL;

-- Create GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata ON audit_logs USING GIN (metadata);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Policy: System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Audit logs are immutable (no updates or deletes)
CREATE POLICY "Audit logs are immutable"
  ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted"
  ON audit_logs
  FOR DELETE
  USING (false);

-- Create function to automatically set timestamp
CREATE OR REPLACE FUNCTION set_audit_log_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.timestamp = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce timestamp
CREATE TRIGGER set_audit_log_timestamp_trigger
  BEFORE INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION set_audit_log_timestamp();

-- Create view for audit log analytics
CREATE OR REPLACE VIEW audit_log_summary AS
SELECT
  DATE_TRUNC('day', timestamp) as date,
  event_type,
  severity,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM audit_logs
GROUP BY DATE_TRUNC('day', timestamp), event_type, severity
ORDER BY date DESC, event_count DESC;

-- Grant access to authenticated users for the view
GRANT SELECT ON audit_log_summary TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE audit_logs IS 'Immutable audit trail with cryptographic integrity verification. Used for security monitoring, compliance reporting, and forensic analysis.';
COMMENT ON COLUMN audit_logs.signature IS 'HMAC-SHA256 signature of event data for tamper detection';
COMMENT ON COLUMN audit_logs.previous_hash IS 'Hash of previous event signature to create blockchain-like chain';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional event-specific data in JSON format';
