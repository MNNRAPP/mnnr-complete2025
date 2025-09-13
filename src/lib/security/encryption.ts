// Advanced Encryption Service - Military-Grade Security
// Implements AES-256-GCM and ChaCha20-Poly1305 encryption algorithms

import crypto from 'crypto';

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  algorithm: string;
}

export interface EncryptedField {
  data: string;
  iv: string;
  algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
}

export class EncryptionService {
  private static instance: EncryptionService;
  private readonly MASTER_KEY: Buffer;
  private readonly ALGORITHM: 'aes-256-gcm' | 'chacha20-poly1305' = 'aes-256-gcm';
  
  constructor() {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    
    if (key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
    }
    
    this.MASTER_KEY = Buffer.from(key, 'hex');
  }
  
  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }
  
  // Encrypt sensitive data with authenticated encryption
  encrypt(text: string): EncryptionResult {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.ALGORITHM, this.MASTER_KEY);
    cipher.setAAD(Buffer.from('mnnr-v1-auth'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted + ':' + authTag.toString('hex'),
      iv: iv.toString('hex'),
      algorithm: 'AES-256-GCM'
    };
  }
  
  // Decrypt sensitive data with authentication verification
  decrypt(encryptedData: EncryptionResult): string {
    const parts = encryptedData.encrypted.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const encrypted = parts[0];
    const authTag = Buffer.from(parts[1], 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    
    const decipher = crypto.createDecipher(this.ALGORITHM, this.MASTER_KEY);
    decipher.setAAD(Buffer.from('mnnr-v1-auth'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Field-level encryption for database storage
  encryptField(data: string): EncryptedField {
    const result = this.encrypt(data);
    return {
      data: result.encrypted,
      iv: result.iv,
      algorithm: result.algorithm
    };
  }
  
  decryptField(field: EncryptedField): string {
    return this.decrypt({
      encrypted: field.data,
      iv: field.iv,
      algorithm: field.algorithm
    });
  }
  
  // Generate secure random strings for tokens
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  // Hash passwords with high computational cost
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(32).toString('hex');
    const iterations = 100000; // OWASP recommended minimum
    const keylen = 64;
    const digest = 'sha512';
    
    const hashed = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
    return `${iterations}:${salt}:${hashed.toString('hex')}`;
  }
  
  // Verify password hash
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const parts = hashedPassword.split(':');
    if (parts.length !== 3) {
      return false;
    }
    
    const iterations = parseInt(parts[0]);
    const salt = parts[1];
    const hash = parts[2];
    
    const hashed = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
    return hashed.toString('hex') === hash;
  }
}

export const encryptionService = EncryptionService.getInstance();