/**
 * API Key Management Utilities
 *
 * This module provides secure API key generation, hashing, validation, and masking
 * utilities for the MNNR platform. It implements industry-standard security practices
 * for API key management including:
 *
 * - Cryptographically secure key generation using crypto.randomBytes
 * - SHA-256 hashing for secure storage (keys are never stored in plaintext)
 * - Format validation to ensure keys meet security requirements
 * - Safe key masking for UI display
 *
 * @module utils/api-keys
 * @security Critical security component - handle with care
 *
 * @example
 * ```typescript
 * import { generateApiKey, hashApiKey, maskApiKey, isValidApiKeyFormat } from '@/utils/api-keys';
 *
 * // Generate a new API key
 * const { key, prefix, hash } = generateApiKey('live');
 *
 * // Store only the hash in the database (NEVER store the raw key!)
 * await db.insert({ prefix, hash });
 *
 * // Show the key to the user ONCE (they must save it)
 * console.log('Your API key:', key);
 *
 * // Later, display the masked version
 * console.log('Your key:', maskApiKey(prefix));
 * ```
 */

import { createHash, randomBytes } from 'crypto';

/**
 * API Key Generation Result
 * Contains the raw key, display prefix, and secure hash for storage
 */
export interface ApiKeyResult {
  /** The complete API key - show to user ONCE, never store in plaintext */
  key: string;
  /** The key prefix (first 15 characters) - safe to store and display */
  prefix: string;
  /** SHA-256 hash of the key - store this in the database for validation */
  hash: string;
}

/**
 * Generate a new cryptographically secure API key
 *
 * Creates a new API key with the format: `sk_{mode}_{64_hex_chars}`
 * - Uses crypto.randomBytes for cryptographically secure random generation
 * - Generates 32 random bytes (256 bits) of entropy
 * - Encodes as 64 hexadecimal characters
 * - Prefixes with 'sk_live_' or 'sk_test_' for mode identification
 *
 * @param mode - The key mode: 'live' for production or 'test' for development
 * @returns Object containing the key, prefix, and hash
 *
 * @security CRITICAL SECURITY CONSIDERATIONS:
 * - The returned `key` must be shown to the user ONLY ONCE
 * - Never log the raw key to console, files, or analytics
 * - Never store the raw key in the database
 * - Always store only the `hash` in the database
 * - The `prefix` is safe to store and display for key identification
 * - Users cannot recover lost keys - they must generate new ones
 *
 * @example
 * ```typescript
 * // Generate a live API key
 * const { key, prefix, hash } = generateApiKey('live');
 *
 * // Display to user ONCE (e.g., in a modal after creation)
 * console.log('Save this key - it will not be shown again!');
 * console.log(key); // sk_live_a1b2c3d4e5f6...
 *
 * // Store in database
 * await supabase.from('api_keys').insert({
 *   user_id: userId,
 *   name: 'Production Key',
 *   prefix: prefix,      // sk_live_a1b2c3d
 *   key_hash: hash,      // SHA-256 hash for verification
 *   mode: 'live',
 *   created_at: new Date()
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Generate a test API key for development
 * const testKey = generateApiKey('test');
 * console.log(testKey.key); // sk_test_x7y8z9...
 * ```
 */
export function generateApiKey(mode: 'live' | 'test' = 'live'): ApiKeyResult {
  // Generate 32 random bytes (256 bits of entropy)
  // This provides cryptographically secure randomness
  const randomPart = randomBytes(32).toString('hex');

  // Create the full key with mode prefix
  // Format: sk_{mode}_{64_hex_chars}
  const key = `sk_${mode}_${randomPart}`;

  // Create prefix (first 15 chars for display)
  // Example: "sk_live_a1b2c3d" - safe to show in UI
  const prefix = key.substring(0, 15);

  // Hash the key for storage using SHA-256
  // This is what gets stored in the database for later verification
  const hash = createHash('sha256').update(key).digest('hex');

  return { key, prefix, hash };
}

/**
 * Hash an API key using SHA-256 for secure comparison
 *
 * Converts an API key into a SHA-256 hash for secure storage and verification.
 * This is a one-way hash - the original key cannot be recovered from the hash.
 *
 * Use this function to:
 * - Hash incoming API keys from requests for comparison with stored hashes
 * - Verify API key authenticity without storing plaintext keys
 * - Implement secure API key authentication
 *
 * @param key - The API key to hash (format: sk_live_xxx or sk_test_xxx)
 * @returns The SHA-256 hash of the key as a hexadecimal string (64 characters)
 *
 * @security Security Properties:
 * - Uses SHA-256 cryptographic hash function
 * - One-way function - hash cannot be reversed to get original key
 * - Same input always produces same output (deterministic)
 * - Different inputs produce vastly different outputs (avalanche effect)
 * - Collision-resistant - extremely unlikely for two keys to have same hash
 *
 * @example
 * ```typescript
 * // Hash an API key for storage
 * const key = 'sk_live_a1b2c3d4e5f6...';
 * const hash = hashApiKey(key);
 *
 * // Store the hash (not the key!)
 * await db.insert({ key_hash: hash });
 * ```
 *
 * @example
 * ```typescript
 * // Verify an incoming API key from a request
 * async function verifyApiKey(incomingKey: string): Promise<boolean> {
 *   // Hash the incoming key
 *   const incomingHash = hashApiKey(incomingKey);
 *
 *   // Compare with stored hash
 *   const { data } = await supabase
 *     .from('api_keys')
 *     .select('key_hash')
 *     .eq('key_hash', incomingHash)
 *     .single();
 *
 *   return data !== null; // Key is valid if hash exists
 * }
 * ```
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Mask an API key for safe display in user interfaces
 *
 * Converts a key prefix into a masked string that's safe to display in UIs,
 * logs, and user-facing interfaces. Shows the prefix followed by bullets (••••)
 * to indicate the hidden portion.
 *
 * This allows users to:
 * - Identify which key they're using without exposing the secret
 * - Distinguish between multiple keys in the UI
 * - Safely display keys in settings, dashboards, and logs
 *
 * @param prefix - The API key prefix (first 15 characters, e.g., "sk_live_a1b2c3d")
 * @returns The masked key string with bullets for the hidden portion
 *
 * @example
 * ```typescript
 * const prefix = 'sk_live_a1b2c3d';
 * const masked = maskApiKey(prefix);
 * console.log(masked); // "sk_live_a1b2c3d••••••••••••••••"
 * ```
 *
 * @example
 * ```typescript
 * // Display masked keys in a dashboard
 * interface ApiKeyListItem {
 *   name: string;
 *   prefix: string;
 * }
 *
 * function ApiKeyList({ keys }: { keys: ApiKeyListItem[] }) {
 *   return (
 *     <ul>
 *       {keys.map(key => (
 *         <li key={key.prefix}>
 *           <strong>{key.name}:</strong> {maskApiKey(key.prefix)}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Safe logging of API key usage
 * console.log(`API request using key: ${maskApiKey(keyPrefix)}`);
 * ```
 */
export function maskApiKey(prefix: string): string {
  return `${prefix}••••••••••••••••`;
}

/**
 * Validate that a string matches the expected API key format
 *
 * Checks if a given string conforms to the MNNR API key format requirements:
 * - Must start with 'sk_' prefix
 * - Must specify mode: 'live' or 'test'
 * - Must contain exactly 64 hexadecimal characters (0-9, a-f) after the prefix
 * - Total format: `sk_{mode}_{64_hex_chars}`
 *
 * Use this for:
 * - Input validation before attempting to use a key
 * - Early rejection of malformed keys (before hitting database)
 * - Security hardening (reject invalid formats immediately)
 * - User feedback when keys are incorrectly formatted
 *
 * @param key - The string to validate as an API key
 * @returns `true` if the key matches the valid format, `false` otherwise
 *
 * @security Format Validation:
 * - Validates structure only, not authenticity
 * - Does NOT verify if the key exists in the database
 * - Does NOT check if the key is active or expired
 * - Use in combination with hash verification for authentication
 *
 * @example
 * ```typescript
 * // Validate before processing
 * const key = 'sk_live_a1b2c3d4e5f6...';
 *
 * if (!isValidApiKeyFormat(key)) {
 *   throw new Error('Invalid API key format');
 * }
 *
 * // Proceed with authentication
 * const hash = hashApiKey(key);
 * ```
 *
 * @example
 * ```typescript
 * // Validate user input in API endpoint
 * export async function POST(request: Request) {
 *   const { apiKey } = await request.json();
 *
 *   // Quick format check before database lookup
 *   if (!isValidApiKeyFormat(apiKey)) {
 *     return new Response(
 *       JSON.stringify({ error: 'Invalid API key format' }),
 *       { status: 400 }
 *     );
 *   }
 *
 *   // Now verify against database
 *   const hash = hashApiKey(apiKey);
 *   const validKey = await verifyKeyHash(hash);
 *   // ...
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Test various formats
 * isValidApiKeyFormat('sk_live_a1b2c3d4...64chars');  // true
 * isValidApiKeyFormat('sk_test_x7y8z9...64chars');    // true
 * isValidApiKeyFormat('sk_prod_xxx');                 // false (wrong mode)
 * isValidApiKeyFormat('pk_live_xxx');                 // false (wrong prefix)
 * isValidApiKeyFormat('sk_live_GGGG');                // false (not hex)
 * isValidApiKeyFormat('sk_live_short');               // false (too short)
 * ```
 */
export function isValidApiKeyFormat(key: string): boolean {
  // Regex breakdown:
  // ^sk_           - Must start with 'sk_'
  // (live|test)    - Mode must be 'live' or 'test'
  // _              - Underscore separator
  // [a-f0-9]{64}   - Exactly 64 hexadecimal characters (lowercase)
  // $              - End of string
  return /^sk_(live|test)_[a-f0-9]{64}$/.test(key);
}
