-- Migration: Add Passkeys and Challenges tables
-- Description: WebAuthn/Passkey passwordless authentication support
-- Date: 2025-01-05

-- Create passkeys table
CREATE TABLE IF NOT EXISTS passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type TEXT,
  friendly_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  CONSTRAINT passkeys_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_passkeys_user_id ON passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_credential_id ON passkeys(credential_id);
CREATE INDEX IF NOT EXISTS idx_passkeys_created_at ON passkeys(created_at DESC);

-- Create passkey_challenges table for temporary challenge storage
CREATE TABLE IF NOT EXISTS passkey_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for passkey_challenges
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_user_id ON passkey_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_type ON passkey_challenges(type);
CREATE INDEX IF NOT EXISTS idx_passkey_challenges_expires_at ON passkey_challenges(expires_at);

-- Auto-delete expired challenges (cleanup function)
CREATE OR REPLACE FUNCTION delete_expired_passkey_challenges()
RETURNS void AS $$
BEGIN
  DELETE FROM passkey_challenges WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired challenges (if pg_cron is available)
-- Note: This requires pg_cron extension. If not available, run cleanup manually or via cron
-- SELECT cron.schedule('cleanup-passkey-challenges', '*/5 * * * *', 'SELECT delete_expired_passkey_challenges()');

-- Row Level Security (RLS) policies
ALTER TABLE passkeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE passkey_challenges ENABLE ROW LEVEL SECURITY;

-- Users can only see their own passkeys
CREATE POLICY passkeys_select_own ON passkeys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own passkeys
CREATE POLICY passkeys_insert_own ON passkeys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own passkeys
CREATE POLICY passkeys_update_own ON passkeys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own passkeys
CREATE POLICY passkeys_delete_own ON passkeys
  FOR DELETE
  USING (auth.uid() = user_id);

-- Passkey challenges are accessible by the user or system
CREATE POLICY passkey_challenges_select ON passkey_challenges
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY passkey_challenges_insert ON passkey_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY passkey_challenges_delete ON passkey_challenges
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON passkeys TO authenticated;
GRANT SELECT, INSERT, DELETE ON passkey_challenges TO authenticated;

-- Comments for documentation
COMMENT ON TABLE passkeys IS 'Stores WebAuthn/Passkey credentials for passwordless authentication';
COMMENT ON COLUMN passkeys.credential_id IS 'Base64-encoded credential ID from WebAuthn';
COMMENT ON COLUMN passkeys.public_key IS 'Base64-encoded public key for signature verification';
COMMENT ON COLUMN passkeys.counter IS 'Signature counter for replay attack prevention';
COMMENT ON COLUMN passkeys.device_type IS 'Type of device (iOS, Android, macOS, Windows)';
COMMENT ON COLUMN passkeys.friendly_name IS 'User-friendly name for the passkey';

COMMENT ON TABLE passkey_challenges IS 'Temporary storage for WebAuthn challenges';
COMMENT ON COLUMN passkey_challenges.challenge IS 'Base64-encoded challenge string';
COMMENT ON COLUMN passkey_challenges.type IS 'registration or authentication';
COMMENT ON COLUMN passkey_challenges.expires_at IS 'Challenge expiration time (typically 5 minutes)';
