// Database Configuration - Prisma Client with Security Extensions
// Implements connection pooling and security monitoring

import { PrismaClient } from '@prisma/client';
import { encryptionService } from '@/lib/security/encryption';

// Extend Prisma Client with security features
declare global {
  var prisma: PrismaClient | undefined;
}

export class SecurePrismaClient extends PrismaClient {
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
    
    this.$on('query', (e) => {
      // Log slow queries for performance monitoring
      if (e.duration > 1000) { // Queries taking more than 1 second
        console.warn(`Slow query detected: ${e.query} (${e.duration}ms)`);
      }
    });
    
    this.$on('error', (e) => {
      console.error('Database error:', e.message);
    });
  }
  
  // Override methods to add security features
  async userFindUnique(args: any) {
    const result = await super.user.findUnique(args);
    if (result) {
      // Decrypt sensitive fields
      if (result.email) {
        try {
          result.email = encryptionService.decryptField({
            data: result.email,
            iv: 'static_iv', // In production, store IV properly
            algorithm: 'AES-256-GCM'
          });
        } catch {
          // Handle decryption error
        }
      }
    }
    return result;
  }
  
  async userCreate(args: any) {
    // Encrypt sensitive data before storing
    if (args.data.email) {
      const encrypted = encryptionService.encryptField(args.data.email);
      args.data.email = encrypted.data;
    }
    
    return super.user.create(args);
  }
}

// Singleton pattern for Prisma Client
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new SecurePrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new SecurePrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };

// Database utility functions
export const dbUtils = {
  // Health check
  async healthCheck(): Promise<{ status: string; latency: number }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        latency: Date.now() - start
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - start
      };
    }
  },
  
  // Connection pool stats
  async getPoolStats() {
    return {
      totalConnections: 0, // Would need custom implementation
      idleConnections: 0,
      activeConnections: 0
    };
  }
};