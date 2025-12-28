/**
 * API Keys Route Tests
 * 
 * Comprehensive unit and integration tests for /api/keys endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '@/app/api/keys/route';

// Mock Supabase
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  })),
}));

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => Promise.resolve(null)),
  rateLimiters: {
    apiKeys: {},
  },
  getClientIdentifier: vi.fn(() => 'test-user'),
}));

// Mock CSRF
vi.mock('@/lib/csrf', () => ({
  csrfProtection: vi.fn(() => Promise.resolve(null)),
}));

// Mock API key generation
vi.mock('@/utils/api-keys', () => ({
  generateApiKey: vi.fn(() => ({
    key: 'sk_live_test123',
    prefix: 'sk_live_',
    hash: 'hash123',
  })),
}));

describe('/api/keys', () => {
  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      } as any);

      const request = new NextRequest('http://localhost/api/keys');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return API keys for authenticated user', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      const mockKeys = [
        { id: '1', name: 'Test Key 1', key_prefix: 'sk_live_' },
        { id: '2', name: 'Test Key 2', key_prefix: 'sk_test_' },
      ];

      const mockFrom = mockClient.from('api_keys');
      vi.mocked(mockFrom.single).mockResolvedValue({
        data: mockKeys,
        error: null,
      } as any);

      const request = new NextRequest('http://localhost/api/keys');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.keys).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      } as any);

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
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      const request = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should create API key successfully', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      const mockFrom = mockClient.from('api_keys');
      vi.mocked(mockFrom.single).mockResolvedValue({
        data: {
          id: 'key-123',
          name: 'Test Key',
          key_prefix: 'sk_live_',
          is_active: true,
        },
        error: null,
      } as any);

      const request = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Key', mode: 'live' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.apiKey).toBeDefined();
      expect(data.apiKey.key).toBe('sk_live_test123');
    });

    it('should validate name format', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      const request = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
        body: JSON.stringify({ name: 'Invalid@Name!', mode: 'live' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });
  });

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      } as any);

      const request = new NextRequest('http://localhost/api/keys?id=key-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if key ID is invalid', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      const request = new NextRequest('http://localhost/api/keys?id=invalid-id', {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should delete API key successfully', async () => {
      const { createClient } = await import('@/utils/supabase/server');
      const mockClient = createClient();
      
      vi.mocked(mockClient.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      } as any);

      const mockFrom = mockClient.from('api_keys');
      vi.mocked(mockFrom.single).mockResolvedValue({
        data: null,
        error: null,
      } as any);

      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const request = new NextRequest(`http://localhost/api/keys?id=${validUuid}`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});
