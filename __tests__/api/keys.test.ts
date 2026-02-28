/**
 * API Keys Route Tests
 *
 * Comprehensive unit tests for /api/keys endpoint
 * Updated: Migrated from Supabase to Neon (lib/db + lib/auth)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies before importing route handlers
vi.mock('@/lib/auth', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    getApiKeysByUserId: vi.fn(),
    createApiKey: vi.fn(),
    revokeApiKey: vi.fn(),
  },
}));

vi.mock('@/lib/api-key-utils', () => ({
  generateApiKey: vi.fn(() => ({
    key: 'mnnr_live_test123',
    prefix: 'mnnr_live_',
    hash: 'hash123',
  })),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => Promise.resolve(null)),
  rateLimiters: { apiKeys: {} },
  getClientIdentifier: vi.fn(() => 'test-user'),
}));

vi.mock('@/lib/csrf', () => ({
  csrfProtection: vi.fn(() => Promise.resolve(null)),
}));

describe('/api/keys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { getAuthenticatedUser } = await import('@/lib/auth');
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const { GET } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return API keys for authenticated user', async () => {
      const { getAuthenticatedUser } = await import('@/lib/auth');
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const { db } = await import('@/lib/db');
      vi.mocked(db.getApiKeysByUserId).mockResolvedValue([
        { id: '1', user_id: 'user-123', name: 'Test Key 1', key_hash: 'h1', key_prefix: 'mnnr_live_', scopes: null, rate_limit: null, created_at: '2025-01-01', last_used_at: null, is_active: true },
        { id: '2', user_id: 'user-123', name: 'Test Key 2', key_hash: 'h2', key_prefix: 'mnnr_test_', scopes: null, rate_limit: null, created_at: '2025-01-01', last_used_at: null, is_active: true },
      ] as any);

      const { GET } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.keys).toHaveLength(2);
    });
  });

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { getAuthenticatedUser } = await import('@/lib/auth');
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const { POST } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Key' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if name is missing', async () => {
      const { getAuthenticatedUser } = await import('@/lib/auth');
      vi.mocked(getAuthenticatedUser).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const { POST } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });
  });

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { getAuthenticatedUser } = await import('@/lib/auth');
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const { DELETE } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys?id=key-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});
