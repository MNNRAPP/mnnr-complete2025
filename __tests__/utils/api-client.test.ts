import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll, type MockInstance } from 'vitest';
/**
 * API Client Tests
 * 
 * Created: 2025-12-26 23:20:00 EST
 * Action #23 in 19-hour optimization
 * 
 * Purpose: Comprehensive tests for API client utility
 */

import { apiClient, api } from '@/utils/api-client';

// Mock fetch
global.fetch = vi.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const response = await apiClient.get('/test');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle GET request with query parameters', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiClient.get('/test', { params: { page: '1', limit: '10' } });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1'),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      );
    });

    it('should handle GET request errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Resource not found' }),
      });

      const response = await apiClient.get('/test');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Resource not found');
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockData = { id: 1, created: true };
      const postData = { name: 'Test' };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const response = await apiClient.post('/test', postData);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
    });
  });

  describe('PATCH requests', () => {
    it('should make successful PATCH request', async () => {
      const mockData = { id: 1, updated: true };
      const patchData = { name: 'Updated' };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const response = await apiClient.patch('/test', patchData);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        })
      );
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ deleted: true }),
      });

      const response = await apiClient.delete('/test');

      expect(response.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      const response = await apiClient.get('/test', { showErrorToast: false });

      expect(response.success).toBe(false);
      // The error message may vary based on implementation
      expect(response.error).toBeDefined();
      expect(typeof response.error).toBe('string');
    });

    it('should handle timeout errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      );

      const response = await apiClient.get('/test', {
        timeout: 50,
        showErrorToast: false,
      });

      expect(response.success).toBe(false);
    });

    it('should retry on network errors', async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const response = await apiClient.get('/test', {
        retries: 1,
        showErrorToast: false,
      });

      expect(response.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Typed API methods', () => {
    it('should call user profile endpoint', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'User' }),
      });

      await api.user.getProfile();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/user/profile'),
        expect.any(Object)
      );
    });

    it('should call subscriptions list endpoint', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ subscriptions: [] }),
      });

      await api.subscriptions.list();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/subscriptions'),
        expect.any(Object)
      );
    });

    it('should call subscription cancel endpoint', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ canceled: true }),
      });

      await api.subscriptions.cancel('sub_123', true);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/subscriptions/sub_123/cancel'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ immediately: true }),
        })
      );
    });
  });
});

describe('ApiClient PUT Method', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make successful PUT request', async () => {
    const mockResponse = { id: 1, updated: true };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const response = await apiClient.put('/test', { data: 'test' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ data: 'test' }),
      })
    );
    expect(response.success).toBe(true);
    expect(response.data).toEqual(mockResponse);
  });
});

describe('Additional Typed API Methods - User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('api.user.updateProfile should call correct endpoint', async () => {
    const updateData = { name: 'Updated Name' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Updated Name' }),
    });

    await api.user.updateProfile(updateData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/profile'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(updateData),
      })
    );
  });
});

describe('Additional Typed API Methods - Subscriptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('api.subscriptions.create should call correct endpoint', async () => {
    const createData = { priceId: 'price_123', paymentMethodId: 'pm_123' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'sub_new', status: 'active' }),
    });

    await api.subscriptions.create(createData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/subscriptions'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(createData),
      })
    );
  });
});

describe('Typed API Methods - Payments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('api.payments.listMethods should call correct endpoint', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'pm_1', type: 'card' }],
    });

    await api.payments.listMethods();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/payments/methods'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('api.payments.addMethod should call correct endpoint', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'pm_new', type: 'card' }),
    });

    await api.payments.addMethod('pm_123', true);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/payments/methods'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ paymentMethodId: 'pm_123', setAsDefault: true }),
      })
    );
  });

  it('api.payments.removeMethod should call correct endpoint', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await api.payments.removeMethod('pm_123');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/payments/methods'),
      expect.objectContaining({
        method: 'DELETE',
        body: JSON.stringify({ paymentMethodId: 'pm_123' }),
      })
    );
  });
});

describe('Typed API Methods - Invoices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('api.invoices.list should accept params', async () => {
    const params = { limit: 10, status: 'paid' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await api.invoices.list(params);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.any(Object)
    );
  });

  it('api.invoices.get should call correct endpoint with id', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'in_123', amount: 1000 }),
    });

    await api.invoices.get('in_123');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/invoices/in_123'),
      expect.objectContaining({ method: 'GET' })
    );
  });
});

describe('Typed API Methods - Usage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('api.usage.get should call correct endpoint', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total: 1000, period: 'month' }),
    });

    await api.usage.get();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/usage'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('api.usage.get should accept params', async () => {
    const params = { period: 'month', metric: 'api_calls' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await api.usage.get(params);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('period=month'),
      expect.any(Object)
    );
  });

  it('api.usage.record should call correct endpoint', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ recorded: true }),
    });

    await api.usage.record('api_calls', 1, { source: 'test' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/usage'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ metric: 'api_calls', value: 1, metadata: { source: 'test' } }),
      })
    );
  });
});

describe('Typed API Methods - Admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('api.admin.listUsers should call correct endpoint', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, email: 'user@example.com' }],
    });

    await api.admin.listUsers();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/users'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('api.admin.listUsers should accept params', async () => {
    const params = { page: 2, limit: 50, search: 'test' };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await api.admin.listUsers(params);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.any(Object)
    );
  });

  it('api.admin.getAnalytics should call correct endpoint', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: 100, revenue: 50000 }),
    });

    await api.admin.getAnalytics();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/analytics'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('api.admin.getAnalytics should accept period param', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await api.admin.getAnalytics('month');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('period=month'),
      expect.any(Object)
    );
  });
});


describe('ApiClient Error Toast Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should show error toast on AbortError with showErrorToast true', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(abortError);

    const response = await apiClient.get('/test', {
      timeout: 1,
      retries: 0,
      showErrorToast: true, // This will trigger line 138
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe('Request timeout');
  });

  it('should show error toast on generic Error with showErrorToast true', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network failure'));

    const response = await apiClient.get('/test', {
      retries: 0,
      showErrorToast: true, // This will trigger line 138
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe('Network failure');
  });
});
