import { createHash, randomBytes } from 'crypto';

/**
 * Generate a new API key with format: sk_live_xxxxxxxxxxxxx or sk_test_xxxxxxxxxxxxx
 */
export function generateApiKey(mode: 'live' | 'test' = 'live'): {
  key: string;
  prefix: string;
  hash: string;
} {
  // Generate 32 random bytes
  const randomPart = randomBytes(32).toString('hex');
  
  // Create the full key
  const key = `sk_${mode}_${randomPart}`;
  
  // Create prefix (first 12 chars for display)
  const prefix = key.substring(0, 15);
  
  // Hash the key for storage
  const hash = createHash('sha256').update(key).digest('hex');
  
  return { key, prefix, hash };
}

/**
 * Hash an API key for comparison
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Mask an API key for display (show only prefix)
 */
export function maskApiKey(prefix: string): string {
  return `${prefix}••••••••••••••••`;
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(key: string): boolean {
  return /^sk_(live|test)_[a-f0-9]{64}$/.test(key);
}
