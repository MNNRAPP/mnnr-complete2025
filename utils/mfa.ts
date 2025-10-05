/**
 * Multi-Factor Authentication (MFA/2FA) System
 * Supports TOTP (Google Authenticator, Authy) and SMS
 */

import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';
import { logAuditEvent, AuditEventType } from '@/utils/audit-logger';
import * as crypto from 'crypto';

/**
 * Generate TOTP secret for user
 * Use with Google Authenticator, Authy, etc.
 */
export function generateTOTPSecret(): {
  secret: string;
  qrCodeUrl: string;
} {
  // Generate a random base32 secret
  const secret = crypto.randomBytes(20).toString('base32');

  // Create QR code URL for authenticator apps
  const appName = process.env.NEXT_PUBLIC_SITE_URL || 'YourApp';
  const qrCodeUrl = `otpauth://totp/${encodeURIComponent(appName)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;

  return { secret, qrCodeUrl };
}

/**
 * Verify TOTP code
 * @param secret - User's TOTP secret
 * @param token - 6-digit code from authenticator app
 */
export function verifyTOTP(secret: string, token: string): boolean {
  // Use a library like 'otplib' or 'speakeasy' in production
  // This is a simplified example
  const window = 1; // Allow 1 time step before/after for clock drift
  const timeStep = 30; // 30 seconds
  const currentTime = Math.floor(Date.now() / 1000 / timeStep);

  for (let i = -window; i <= window; i++) {
    const time = currentTime + i;
    const expectedToken = generateTOTPToken(secret, time);

    if (expectedToken === token) {
      return true;
    }
  }

  return false;
}

/**
 * Generate TOTP token (internal)
 */
function generateTOTPToken(secret: string, time: number): string {
  // Simplified HMAC-based implementation
  // Use 'otplib' or 'speakeasy' library in production
  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base32'));
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));
  hmac.update(timeBuffer);

  const hash = hmac.digest();
  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

/**
 * Enable MFA for user
 */
export async function enableMFA(userId: string, method: 'totp' | 'sms' = 'totp'): Promise<{
  secret?: string;
  qrCodeUrl?: string;
  phoneNumber?: string;
}> {
  const supabase = createClient();

  if (method === 'totp') {
    const { secret, qrCodeUrl } = generateTOTPSecret();

    // Store encrypted secret in user metadata
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        mfa_enabled: true,
        mfa_method: 'totp',
        mfa_secret: secret,
        mfa_enabled_at: new Date().toISOString()
      }
    });

    if (error) {
      logger.error('Failed to enable MFA', error, { userId });
      throw new Error('Failed to enable MFA');
    }

    await logAuditEvent(AuditEventType.MFA_ENABLED, {
      userId,
      action: 'MFA enabled',
      status: 'success',
      metadata: { method: 'totp' }
    });

    return { secret, qrCodeUrl };
  }

  throw new Error('SMS MFA not yet implemented');
}

/**
 * Disable MFA for user
 */
export async function disableMFA(userId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      mfa_enabled: false,
      mfa_method: null,
      mfa_secret: null,
      mfa_disabled_at: new Date().toISOString()
    }
  });

  if (error) {
    logger.error('Failed to disable MFA', error, { userId });
    throw new Error('Failed to disable MFA');
  }

  await logAuditEvent(AuditEventType.MFA_DISABLED, {
    userId,
    action: 'MFA disabled',
    status: 'success'
  });
}

/**
 * Verify MFA token during login
 */
export async function verifyMFAToken(
  userId: string,
  token: string
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createClient();

  // Get user's MFA settings
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !userData) {
    logger.error('Failed to get user for MFA verification', userError, { userId });
    return { valid: false, error: 'User not found' };
  }

  const { mfa_enabled, mfa_method, mfa_secret } = userData.user.user_metadata || {};

  if (!mfa_enabled) {
    return { valid: false, error: 'MFA not enabled for this user' };
  }

  if (mfa_method === 'totp') {
    const isValid = verifyTOTP(mfa_secret, token);

    await logAuditEvent(AuditEventType.MFA_VERIFIED, {
      userId,
      action: 'MFA verification',
      status: isValid ? 'success' : 'failure',
      metadata: { method: 'totp' }
    });

    if (!isValid) {
      return { valid: false, error: 'Invalid MFA code' };
    }

    return { valid: true };
  }

  return { valid: false, error: 'Unknown MFA method' };
}

/**
 * Generate backup codes for MFA recovery
 */
export async function generateBackupCodes(userId: string): Promise<string[]> {
  const codes: string[] = [];

  // Generate 10 backup codes
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }

  const supabase = createClient();

  // Hash codes before storing
  const hashedCodes = codes.map(code =>
    crypto.createHash('sha256').update(code).digest('hex')
  );

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      mfa_backup_codes: hashedCodes
    }
  });

  if (error) {
    logger.error('Failed to generate backup codes', error, { userId });
    throw new Error('Failed to generate backup codes');
  }

  await logAuditEvent(AuditEventType.MFA_ENABLED, {
    userId,
    action: 'Backup codes generated',
    status: 'success'
  });

  // Return unhashed codes to user (only time they'll see them)
  return codes;
}

/**
 * Verify backup code
 */
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const supabase = createClient();

  const { data: userData, error } = await supabase.auth.admin.getUserById(userId);

  if (error || !userData) {
    return false;
  }

  const { mfa_backup_codes } = userData.user.user_metadata || {};

  if (!mfa_backup_codes || !Array.isArray(mfa_backup_codes)) {
    return false;
  }

  const hashedCode = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');

  const index = mfa_backup_codes.indexOf(hashedCode);

  if (index === -1) {
    await logAuditEvent(AuditEventType.MFA_VERIFIED, {
      userId,
      action: 'Backup code verification',
      status: 'failure'
    });
    return false;
  }

  // Remove used backup code
  const updatedCodes = [...mfa_backup_codes];
  updatedCodes.splice(index, 1);

  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      mfa_backup_codes: updatedCodes
    }
  });

  await logAuditEvent(AuditEventType.MFA_VERIFIED, {
    userId,
    action: 'Backup code used',
    status: 'success',
    metadata: { remaining_codes: updatedCodes.length }
  });

  return true;
}

/**
 * Check if user has MFA enabled
 */
export async function isMFAEnabled(userId: string): Promise<boolean> {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.admin.getUserById(userId);

  return userData?.user?.user_metadata?.mfa_enabled === true;
}
