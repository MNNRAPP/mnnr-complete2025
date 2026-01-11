/**
 * API Key Generation Utilities
 * Secure key generation with prefix and hashing
 */

import { createHash, randomBytes } from 'crypto';

export interface GeneratedKey {
  key: string;      // Full key (shown once to user)
  prefix: string;   // Visible prefix for identification
  hash: string;     // Hash stored in database
}

/**
 * Generate a new API key
 * Format: mnnr_live_xxxxxxxxxxxxxxxxxxxx or mnnr_test_xxxxxxxxxxxxxxxxxxxx
 */
export function generateApiKey(mode: 'live' | 'test' = 'live'): GeneratedKey {
  const randomPart = randomBytes(24).toString('base64url');
  const key = `mnnr_${mode}_${randomPart}`;
  const prefix = key.substring(0, 12); // mnnr_live_xx or mnnr_test_xx
  const hash = hashApiKey(key);
  
  return { key, prefix, hash };
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Verify an API key against a stored hash
 */
export function verifyApiKey(key: string, storedHash: string): boolean {
  const keyHash = hashApiKey(key);
  return keyHash === storedHash;
}

/**
 * Extract mode from API key
 */
export function getKeyMode(key: string): 'live' | 'test' | null {
  if (key.startsWith('mnnr_live_')) return 'live';
  if (key.startsWith('mnnr_test_')) return 'test';
  return null;
}

/**
 * Validate API key format
 */
export function isValidKeyFormat(key: string): boolean {
  return /^mnnr_(live|test)_[A-Za-z0-9_-]{32}$/.test(key);
}
