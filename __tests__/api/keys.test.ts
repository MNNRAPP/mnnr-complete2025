/**
 * API Keys Route Tests
 * 
 * Comprehensive unit and integration tests for /api/keys endpoint
 * Updated: 2025-12-28 - Simplified mocking approach
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock all dependencies before importing route handlers
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => Promise.resolve(null)),
  rateLimiters: { apiKeys: {} },
  getClientIdentifier: vi.fn(() => 'test-user'),
}));

vi.mock('@/lib/csrf', () => ({
  csrfProtection: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@/utils/api-keys', () => ({
  generateApiKey: vi.fn(() => ({
    key: 'sk_live_test123',
    prefix: 'sk_live_',
    hash: 'hash123',
  })),
}));

describe('/api/keys', () => {
  let mockSupabase: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create fresh mock for each test
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };
    
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockReturnValue(mockSupabase);
  });

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      });

      const { GET } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return API keys for authenticated user', async () => {
      const mockKeys = [
        { id: '1', name: 'Test Key 1', key_prefix: 'sk_live_' },
        { id: '2', name: 'Test Key 2', key_prefix: 'sk_test_' },
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockKeys,
              error: null,
            }),
          }),
        }),
      });

      const { GET } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.keys).toEqual(mockKeys);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      });

      const { GET } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch API keys');
    });
  });

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      });

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
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
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

    it('should create API key successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock count check
      const mockCountChain = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              count: 0,
              error: null,
            }),
          }),
        }),
      };

      // Mock insert
      const mockInsertChain = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'key-123',
                name: 'Test Key',
                key_prefix: 'sk_live_',
                is_active: true,
              },
              error: null,
            }),
          }),
        }),
      };

      let callCount = 0;
      mockSupabase.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockCountChain;
        return mockInsertChain;
      });

      const { POST } = await import('@/app/api/keys/route');
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
  });

  describe('DELETE', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Unauthorized'),
      });

      const { DELETE } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys?id=key-123', {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if key ID is invalid', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const { DELETE } = await import('@/app/api/keys/route');
      const request = new NextRequest('http://localhost/api/keys?id=invalid-id', {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
    });

    it('should delete API key successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      });

      const { DELETE } = await import('@/app/api/keys/route');
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const request = new NextRequest(`http://localhost/api/keys?id=${validUuid}`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle database errors on delete', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: new Error('Database error'),
            }),
          }),
        }),
      });

      const { DELETE } = await import('@/app/api/keys/route');
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const request = new NextRequest(`http://localhost/api/keys?id=${validUuid}`, {
        method: 'DELETE',
      });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete API key');
    });
  });
});


describe('POST /api/keys - Additional Coverage', () => {
  let mockSupabase: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };
    
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockReturnValue(mockSupabase);
  });

  it('should handle userError in POST', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Auth error'),
    });

    const request = new NextRequest('http://localhost/api/keys', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Key' }),
    });

    const { POST } = await import('@/app/api/keys/route');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle unexpected error with ZodError in POST', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const request = new NextRequest('http://localhost/api/keys', {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // Invalid - will trigger ZodError
    });

    const { POST } = await import('@/app/api/keys/route');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
  });
});

describe('DELETE /api/keys - Additional Coverage', () => {
  let mockSupabase: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };
    
    const { createClient } = await import('@/utils/supabase/server');
    vi.mocked(createClient).mockReturnValue(mockSupabase);
  });

  it('should handle userError in DELETE', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Auth error'),
    });

    const request = new NextRequest('http://localhost/api/keys?id=123e4567-e89b-12d3-a456-426614174000', {
      method: 'DELETE',
    });

    const { DELETE } = await import('@/app/api/keys/route');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle unexpected error in DELETE', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(() => {
            throw new Error('Unexpected database error');
          }),
        }),
      }),
    });

    const request = new NextRequest('http://localhost/api/keys?id=123e4567-e89b-12d3-a456-426614174000', {
      method: 'DELETE',
    });

    const { DELETE } = await import('@/app/api/keys/route');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
});
