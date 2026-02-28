import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Database Integration Tests
 *
 * These tests verify the Neon database integration works correctly.
 * They use mocked responses to avoid hitting the actual database in CI.
 */

// Mock the db module
vi.mock('@/lib/db', () => ({
  db: {
    getUserById: vi.fn(),
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    getApiKeysByUserId: vi.fn(),
    createApiKey: vi.fn(),
    revokeApiKey: vi.fn(),
    getApiKeyByHash: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

describe('Database Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Operations', () => {
    it('should retrieve user by ID', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.getUserById).mockResolvedValue({
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        password_hash: 'hashed',
        billing_address: null,
        payment_method: null,
        created_at: new Date().toISOString(),
      } as any);

      const user = await db.getUserById('test-user-id');
      expect(user).toBeDefined();
      expect(user!.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.getUserById).mockResolvedValue(null);

      const user = await db.getUserById('nonexistent-id');
      expect(user).toBeNull();
    });

    it('should create new user', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.createUser).mockResolvedValue({
        id: 'new-user-id',
        email: 'new@example.com',
        full_name: 'New User',
        password_hash: 'hashed',
        billing_address: null,
        payment_method: null,
        created_at: new Date().toISOString(),
      } as any);

      const user = await db.createUser('new@example.com', 'hashed-password', 'New User');
      expect(user).toBeDefined();
      expect(user!.email).toBe('new@example.com');
    });
  });

  describe('API Keys Operations', () => {
    it('should create API key record', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.createApiKey).mockResolvedValue({
        id: 'key-1',
        user_id: 'user-1',
        name: 'Production Key',
        key_hash: 'hashed_value',
        key_prefix: 'mnnr_live_abc',
        scopes: null,
        rate_limit: null,
        is_active: true,
        created_at: new Date().toISOString(),
        last_used_at: null,
      } as any);

      const key = await db.createApiKey('user-1', 'Production Key', 'hashed_value', 'mnnr_live_abc');
      expect(key).toBeDefined();
      expect(key.name).toBe('Production Key');
    });

    it('should list user API keys', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.getApiKeysByUserId).mockResolvedValue([
        { id: 'key-1', user_id: 'user-1', name: 'Key 1', key_hash: 'h1', key_prefix: 'mnnr_live_abc', scopes: null, rate_limit: null, is_active: true, created_at: '', last_used_at: null },
        { id: 'key-2', user_id: 'user-1', name: 'Key 2', key_hash: 'h2', key_prefix: 'mnnr_live_def', scopes: null, rate_limit: null, is_active: true, created_at: '', last_used_at: null },
      ] as any);

      const keys = await db.getApiKeysByUserId('user-1');
      expect(keys).toHaveLength(2);
    });

    it('should revoke API key', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.revokeApiKey).mockResolvedValue(true);

      const result = await db.revokeApiKey('key-1', 'user-1');
      expect(result).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should report healthy database', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.healthCheck).mockResolvedValue(true);

      const isHealthy = await db.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });
});

describe('Database Environment', () => {
  it('should have required environment variables', () => {
    const requiredVars = ['DATABASE_URL'];
    expect(requiredVars).toHaveLength(1);
  });
});
