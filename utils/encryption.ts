/**
 * End-to-End Encryption (E2EE) Utilities
 * Client-side encryption for maximum privacy
 * Zero-knowledge architecture - server never sees unencrypted data
 */

import * as crypto from 'crypto';

// Encryption constants
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Generate a cryptographically secure encryption key from password
 */
export async function deriveKeyFromPassword(
  password: string,
  salt?: Buffer
): Promise<{ key: Buffer; salt: Buffer }> {
  const actualSalt = salt || crypto.randomBytes(SALT_LENGTH);

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      actualSalt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512',
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve({ key: derivedKey, salt: actualSalt });
      }
    );
  });
}

/**
 * Generate a random encryption key
 */
export function generateEncryptionKey(): Buffer {
  return crypto.randomBytes(KEY_LENGTH);
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt (string or object)
 * @param key - 256-bit encryption key
 * @returns Encrypted data with IV and auth tag
 */
export function encrypt(
  data: string | object,
  key: Buffer
): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(dataString, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - Encrypted data with IV and auth tag
 * @param key - 256-bit encryption key
 * @returns Decrypted data
 */
export function decrypt(
  encryptedData: {
    encrypted: string;
    iv: string;
    authTag: string;
  },
  key: Buffer
): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encryptedData.iv, 'base64')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));

  let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Encrypt data with password (combines key derivation and encryption)
 */
export async function encryptWithPassword(
  data: string | object,
  password: string
): Promise<{
  encrypted: string;
  iv: string;
  authTag: string;
  salt: string;
}> {
  const { key, salt } = await deriveKeyFromPassword(password);
  const encrypted = encrypt(data, key);

  return {
    ...encrypted,
    salt: salt.toString('base64')
  };
}

/**
 * Decrypt data with password
 */
export async function decryptWithPassword(
  encryptedData: {
    encrypted: string;
    iv: string;
    authTag: string;
    salt: string;
  },
  password: string
): Promise<string> {
  const salt = Buffer.from(encryptedData.salt, 'base64');
  const { key } = await deriveKeyFromPassword(password, salt);

  return decrypt(encryptedData, key);
}

/**
 * Hash data (one-way, for verification)
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash with salt (for password storage)
 */
export async function hashWithSalt(
  data: string,
  salt?: Buffer
): Promise<{ hash: string; salt: string }> {
  const actualSalt = salt || crypto.randomBytes(SALT_LENGTH);

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      data,
      actualSalt,
      ITERATIONS,
      64,
      'sha512',
      (err, derivedKey) => {
        if (err) reject(err);
        else
          resolve({
            hash: derivedKey.toString('hex'),
            salt: actualSalt.toString('base64')
          });
      }
    );
  });
}

/**
 * Verify hashed data
 */
export async function verifyHash(
  data: string,
  hashedData: { hash: string; salt: string }
): Promise<boolean> {
  const salt = Buffer.from(hashedData.salt, 'base64');
  const { hash } = await hashWithSalt(data, salt);

  return hash === hashedData.hash;
}

/**
 * Encrypt file (for document uploads)
 */
export function encryptFile(fileBuffer: Buffer, key: Buffer): {
  encrypted: Buffer;
  iv: string;
  authTag: string;
} {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

/**
 * Decrypt file
 */
export function decryptFile(
  encryptedData: {
    encrypted: Buffer;
    iv: string;
    authTag: string;
  },
  key: Buffer
): Buffer {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encryptedData.iv, 'base64')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));

  return Buffer.concat([
    decipher.update(encryptedData.encrypted),
    decipher.final()
  ]);
}

/**
 * Generate RSA key pair for asymmetric encryption
 * (for sharing encrypted data between users)
 */
export function generateRSAKeyPair(): {
  publicKey: string;
  privateKey: string;
} {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

/**
 * Encrypt with RSA public key (for sharing encryption keys)
 */
export function encryptWithPublicKey(data: string, publicKey: string): string {
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(data)
  );

  return encrypted.toString('base64');
}

/**
 * Decrypt with RSA private key
 */
export function decryptWithPrivateKey(
  encryptedData: string,
  privateKey: string
): string {
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(encryptedData, 'base64')
  );

  return decrypted.toString();
}

/**
 * Client-side encryption utilities for browser
 * (Use Web Crypto API in actual client code)
 */
export const clientSideEncryption = {
  /**
   * Example: Encrypt before sending to server
   */
  async encryptBeforeSend(data: any, userPassword: string) {
    return await encryptWithPassword(data, userPassword);
  },

  /**
   * Example: Decrypt after receiving from server
   */
  async decryptAfterReceive(encryptedData: any, userPassword: string) {
    return await decryptWithPassword(encryptedData, userPassword);
  }
};

/**
 * Database column-level encryption helpers
 * Use these to encrypt sensitive columns before storing in Supabase
 */
export const databaseEncryption = {
  /**
   * Encrypt sensitive field before database insert
   */
  async encryptField(
    value: string,
    masterKey: Buffer
  ): Promise<{ encrypted: string; iv: string; authTag: string }> {
    return encrypt(value, masterKey);
  },

  /**
   * Decrypt sensitive field after database query
   */
  async decryptField(
    encryptedData: { encrypted: string; iv: string; authTag: string },
    masterKey: Buffer
  ): Promise<string> {
    return decrypt(encryptedData, masterKey);
  }
};
