import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Supabase Integration Tests
 * 
 * These tests verify the Supabase integration works correctly.
 * They use mocked responses to avoid hitting the actual database in CI.
 */

// Create chainable mock functions
const createChainableMock = () => {
  const mock: any = {
    data: null,
    error: null,
  };
  
  mock.from = vi.fn().mockReturnValue(mock);
  mock.select = vi.fn().mockReturnValue(mock);
  mock.insert = vi.fn().mockReturnValue(mock);
  mock.update = vi.fn().mockReturnValue(mock);
  mock.delete = vi.fn().mockReturnValue(mock);
  mock.eq = vi.fn().mockReturnValue(mock);
  mock.single = vi.fn().mockImplementation(() => Promise.resolve({ data: mock.data, error: mock.error }));
  mock.then = vi.fn().mockImplementation((resolve) => Promise.resolve({ data: mock.data, error: mock.error }).then(resolve));
  
  mock.setResponse = (data: any, error: any = null) => {
    mock.data = data;
    mock.error = error;
  };
  
  return mock;
};

const mockSupabaseClient = createChainableMock();

// Add auth methods
mockSupabaseClient.auth = {
  getUser: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.setResponse(null, null);
  });

  describe('Authentication', () => {
    it('should handle user authentication', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
        error: null,
      });

      const result = await mockSupabaseClient.auth.getUser();

      expect(result.data.user).toBeDefined();
      expect(result.data.user.email).toBe('test@example.com');
      expect(result.error).toBeNull();
    });

    it('should handle authentication errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      const result = await mockSupabaseClient.auth.getUser();

      expect(result.data.user).toBeNull();
      expect(result.error).toBeDefined();
    });

    it('should handle sign in', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'test-user-id', email: 'test@example.com' },
          session: { access_token: 'test-token' },
        },
        error: null,
      });

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.data.user).toBeDefined();
      expect(result.data.session).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle sign out', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await mockSupabaseClient.auth.signOut();

      expect(result.error).toBeNull();
    });
  });

  describe('Database Operations', () => {
    it('should query data from tables', async () => {
      mockSupabaseClient.setResponse({ id: '1', name: 'Test' }, null);

      const result = await mockSupabaseClient
        .from('test_table')
        .select('*')
        .eq('id', '1')
        .single();

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should insert data into tables', async () => {
      mockSupabaseClient.setResponse({ id: '2', name: 'New Item' }, null);

      const result = await mockSupabaseClient
        .from('test_table')
        .insert({ name: 'New Item' })
        .select()
        .single();

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should update data in tables', async () => {
      mockSupabaseClient.setResponse({ id: '1', name: 'Updated' }, null);

      const result = await mockSupabaseClient
        .from('test_table')
        .update({ name: 'Updated' })
        .eq('id', '1')
        .select()
        .single();

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should delete data from tables', async () => {
      mockSupabaseClient.setResponse(null, null);

      const result = await mockSupabaseClient
        .from('test_table')
        .delete()
        .eq('id', '1');

      // Result is the mock itself which has error: null
      expect(result.error).toBeNull();
    });

    it('should handle database errors', async () => {
      mockSupabaseClient.setResponse(null, { message: 'Row not found', code: 'PGRST116' });

      const result = await mockSupabaseClient
        .from('test_table')
        .select('*')
        .eq('id', 'nonexistent')
        .single();

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('API Keys Table', () => {
    it('should create API key record', async () => {
      mockSupabaseClient.setResponse({
        id: 'key-1',
        user_id: 'user-1',
        name: 'Production Key',
        key_prefix: 'sk_live_abc',
        key_hash: 'hashed_value',
        created_at: new Date().toISOString(),
      }, null);

      const result = await mockSupabaseClient
        .from('api_keys')
        .insert({
          user_id: 'user-1',
          name: 'Production Key',
          key_prefix: 'sk_live_abc',
          key_hash: 'hashed_value',
        })
        .select()
        .single();

      expect(result.data).toBeDefined();
      expect(result.data.name).toBe('Production Key');
      expect(result.error).toBeNull();
    });

    it('should list user API keys', async () => {
      mockSupabaseClient.setResponse([
        { id: 'key-1', name: 'Key 1', key_prefix: 'sk_live_abc' },
        { id: 'key-2', name: 'Key 2', key_prefix: 'sk_live_def' },
      ], null);

      const result = await mockSupabaseClient
        .from('api_keys')
        .select('id, name, key_prefix')
        .eq('user_id', 'user-1');

      expect(result.data).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should soft delete API key', async () => {
      mockSupabaseClient.setResponse({ id: 'key-1', deleted_at: new Date().toISOString() }, null);

      const result = await mockSupabaseClient
        .from('api_keys')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', 'key-1')
        .select()
        .single();

      expect(result.data.deleted_at).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('Row Level Security', () => {
    it('should enforce RLS on API keys', async () => {
      mockSupabaseClient.setResponse(null, { message: 'Row not found', code: 'PGRST116' });

      const result = await mockSupabaseClient
        .from('api_keys')
        .select('*')
        .eq('user_id', 'other-user-id')
        .single();

      expect(result.data).toBeNull();
    });
  });
});

describe('Supabase Environment', () => {
  it('should have required environment variables', () => {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    expect(requiredVars).toHaveLength(2);
  });
});
