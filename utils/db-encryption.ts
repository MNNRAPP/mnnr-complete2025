/**
 * Database Column-Level Encryption
 * AES-256-GCM encryption for sensitive database fields
 *
 * Use for: SSN, phone numbers, addresses, credit cards (though use Stripe!)
 *
 * IMPORTANT: Store DB_ENCRYPTION_KEY in environment variables
 * Generate key: openssl rand -hex 32
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { logger } from './logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Get encryption key from environment
 * Falls back to hashed site URL for development (NOT for production!)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.DB_ENCRYPTION_KEY;

  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DB_ENCRYPTION_KEY must be set in production');
    }

    // Development fallback (NOT SECURE - for local testing only)
    logger.warn('Using fallback encryption key - DO NOT USE IN PRODUCTION');
    const fallback = process.env.NEXT_PUBLIC_SITE_URL || 'localhost';
    return createHash('sha256').update(fallback).digest();
  }

  // Key should be 32-byte hex string
  if (key.length !== 64) {
    throw new Error('DB_ENCRYPTION_KEY must be 32 bytes (64 hex characters). Generate with: openssl rand -hex 32');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string value for database storage
 * Returns object with encrypted value, IV, and auth tag
 */
export function encryptField(plaintext: string): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    };
  } catch (error) {
    logger.error('Failed to encrypt field', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt a string value from database
 */
export function decryptField(
  encrypted: string,
  iv: string,
  authTag: string
): string {
  try {
    const key = getEncryptionKey();

    const decipher = createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(iv, 'base64')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Failed to decrypt field', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Encrypt JSON object for database storage
 */
export function encryptJSON(data: any): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const json = JSON.stringify(data);
  return encryptField(json);
}

/**
 * Decrypt JSON object from database
 */
export function decryptJSON<T = any>(
  encrypted: string,
  iv: string,
  authTag: string
): T {
  const json = decryptField(encrypted, iv, authTag);
  return JSON.parse(json);
}

/**
 * Helper class for encrypting/decrypting database records
 */
export class FieldEncryptor {
  /**
   * Encrypt sensitive fields in a record before saving to database
   *
   * Example:
   * const user = { name: 'John', ssn: '123-45-6789', email: 'john@example.com' };
   * const encrypted = FieldEncryptor.encryptRecord(user, ['ssn']);
   * // encrypted = { name: 'John', ssn_encrypted: '...', ssn_iv: '...', ssn_authTag: '...', email: 'john@example.com' }
   */
  static encryptRecord<T extends Record<string, any>>(
    record: T,
    fieldsToEncrypt: (keyof T)[]
  ): any {
    const result: any = { ...record };

    for (const field of fieldsToEncrypt) {
      const value = record[field];

      if (value === null || value === undefined) {
        // Don't encrypt null/undefined
        delete result[field];
        continue;
      }

      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const { encrypted, iv, authTag } = encryptField(stringValue);

      // Remove original field, add encrypted fields
      delete result[field];
      result[`${String(field)}_encrypted`] = encrypted;
      result[`${String(field)}_iv`] = iv;
      result[`${String(field)}_authTag`] = authTag;
    }

    return result;
  }

  /**
   * Decrypt sensitive fields in a record after loading from database
   *
   * Example:
   * const encrypted = { name: 'John', ssn_encrypted: '...', ssn_iv: '...', ssn_authTag: '...', email: 'john@example.com' };
   * const decrypted = FieldEncryptor.decryptRecord(encrypted, ['ssn']);
   * // decrypted = { name: 'John', ssn: '123-45-6789', email: 'john@example.com' }
   */
  static decryptRecord<T extends Record<string, any>>(
    record: any,
    fieldsToDecrypt: string[]
  ): T {
    const result: any = { ...record };

    for (const field of fieldsToDecrypt) {
      const encrypted = record[`${field}_encrypted`];
      const iv = record[`${field}_iv`];
      const authTag = record[`${field}_authTag`];

      if (encrypted && iv && authTag) {
        try {
          result[field] = decryptField(encrypted, iv, authTag);

          // Remove encrypted fields from result
          delete result[`${field}_encrypted`];
          delete result[`${field}_iv`];
          delete result[`${field}_authTag`];
        } catch (error) {
          logger.error(`Failed to decrypt field: ${field}`, error);
          // Keep encrypted data, mark as error
          result[field] = '[DECRYPTION_ERROR]';
        }
      }
    }

    return result as T;
  }
}

/**
 * Database migration helper: Encrypt existing plaintext data
 *
 * Example usage:
 * const users = await supabase.from('users').select('*');
 * for (const user of users.data || []) {
 *   const encrypted = encryptExistingData(user.ssn);
 *   await supabase.from('users')
 *     .update({
 *       ssn_encrypted: encrypted.encrypted,
 *       ssn_iv: encrypted.iv,
 *       ssn_authTag: encrypted.authTag
 *     })
 *     .eq('id', user.id);
 * }
 */
export function encryptExistingData(plaintext: string | null): {
  encrypted: string;
  iv: string;
  authTag: string;
} | null {
  if (!plaintext) return null;
  return encryptField(plaintext);
}

/**
 * Search encrypted data (requires decrypting all records - use sparingly!)
 * Better approach: Use hash indexes for searching
 */
export function createSearchHash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/**
 * Example: Add hash column to enable searching without decryption
 *
 * Database schema:
 * CREATE TABLE users (
 *   id UUID PRIMARY KEY,
 *   ssn_encrypted TEXT,
 *   ssn_iv TEXT,
 *   ssn_authTag TEXT,
 *   ssn_hash TEXT,  -- SHA-256 hash for searching
 *   INDEX idx_ssn_hash (ssn_hash)
 * );
 *
 * Usage:
 * const hash = createSearchHash('123-45-6789');
 * const user = await supabase.from('users')
 *   .select('*')
 *   .eq('ssn_hash', hash)
 *   .single();
 *
 * if (user.data) {
 *   const decrypted = FieldEncryptor.decryptRecord(user.data, ['ssn']);
 *   console.log(decrypted.ssn); // '123-45-6789'
 * }
 */

/**
 * Key rotation: Re-encrypt data with new key
 *
 * Process:
 * 1. Generate new key: openssl rand -hex 32
 * 2. Set NEW_DB_ENCRYPTION_KEY in environment
 * 3. Run migration to re-encrypt all data
 * 4. Swap keys: DB_ENCRYPTION_KEY = NEW_DB_ENCRYPTION_KEY
 * 5. Remove NEW_DB_ENCRYPTION_KEY
 *
 * DO NOT LOSE OLD KEY until rotation is complete!
 */
export async function rotateEncryptionKey(
  oldKey: string,
  newKey: string,
  encryptedData: { encrypted: string; iv: string; authTag: string }
): Promise<{ encrypted: string; iv: string; authTag: string }> {
  // Temporarily use old key to decrypt
  const originalKey = process.env.DB_ENCRYPTION_KEY;
  process.env.DB_ENCRYPTION_KEY = oldKey;

  const plaintext = decryptField(
    encryptedData.encrypted,
    encryptedData.iv,
    encryptedData.authTag
  );

  // Use new key to encrypt
  process.env.DB_ENCRYPTION_KEY = newKey;
  const reencrypted = encryptField(plaintext);

  // Restore original key
  process.env.DB_ENCRYPTION_KEY = originalKey;

  return reencrypted;
}

/**
 * Compliance: Log all encryption/decryption operations
 */
export function auditEncryptionOperation(
  operation: 'encrypt' | 'decrypt',
  fieldName: string,
  userId?: string
) {
  logger.info('Encryption operation', {
    operation,
    fieldName,
    userId,
    timestamp: new Date().toISOString(),
  });
}
