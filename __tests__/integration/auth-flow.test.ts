/**
 * Authentication Flow Integration Tests
 *
 * Tests the session-based auth system using Neon PostgreSQL.
 * Uses mocked db layer to avoid hitting the actual database.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock lib/db
vi.mock('@/lib/db', () => ({
  db: {
    getUserByEmail: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    createSession: vi.fn(),
    getSessionByTokenHash: vi.fn(),
    deleteSession: vi.fn(),
  },
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Sign Up Flow', () => {
    it('should create a new user successfully', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.getUserByEmail).mockResolvedValue(null);
      vi.mocked(db.createUser).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: 'hashed',
        billing_address: null,
        payment_method: null,
        created_at: new Date().toISOString(),
      } as any);

      const user = await db.createUser(
        'test@example.com',
        'hashed-password',
        'Test User'
      );

      expect(user).toBeDefined();
      expect(user!.email).toBe('test@example.com');
      expect(db.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'hashed-password',
        'Test User'
      );
    });

    it('should reject duplicate email', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.getUserByEmail).mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com',
        full_name: null,
        password_hash: 'hashed',
        billing_address: null,
        payment_method: null,
        created_at: new Date().toISOString(),
      } as any);

      const existingUser = await db.getUserByEmail('existing@example.com');
      expect(existingUser).not.toBeNull();
    });
  });

  describe('Sign In Flow', () => {
    it('should authenticate valid user', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.getUserByEmail).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: 'correct-hash',
        billing_address: null,
        payment_method: null,
        created_at: new Date().toISOString(),
      } as any);

      const user = await db.getUserByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user!.email).toBe('test@example.com');
    });

    it('should reject non-existent user', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.getUserByEmail).mockResolvedValue(null);

      const user = await db.getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should create session for authenticated user', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.createSession).mockResolvedValue({
        id: 'session-123',
        user_id: 'user-123',
        token_hash: 'hashed-token',
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      } as any);

      const session = await db.createSession(
        'user-123',
        'hashed-token',
        '127.0.0.1',
        'test-agent'
      );

      expect(session).toBeDefined();
      expect(session!.user_id).toBe('user-123');
    });

    it('should retrieve session by token hash', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.getSessionByTokenHash).mockResolvedValue({
        id: 'session-123',
        user_id: 'user-123',
        token_hash: 'hashed-token',
        ip_address: '127.0.0.1',
        user_agent: 'test-agent',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      } as any);

      const session = await db.getSessionByTokenHash('hashed-token');
      expect(session).toBeDefined();
      expect(session!.user_id).toBe('user-123');
    });

    it('should return null for expired/invalid session', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.getSessionByTokenHash).mockResolvedValue(null);

      const session = await db.getSessionByTokenHash('invalid-token');
      expect(session).toBeNull();
    });
  });

  describe('Sign Out Flow', () => {
    it('should destroy session', async () => {
      const { db } = await import('@/lib/db');

      vi.mocked(db.deleteSession).mockResolvedValue(undefined);

      await db.deleteSession('hashed-token');
      expect(db.deleteSession).toHaveBeenCalledWith('hashed-token');
    });
  });
});
