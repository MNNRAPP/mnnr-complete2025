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
global.fetch = jest.fn();

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
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

      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await apiClient.get('/test', { showErrorToast: false });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Network error');
    });

    it('should handle timeout errors', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
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
      (global.fetch as jest.Mock)
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
      (global.fetch as jest.Mock).mockResolvedValueOnce({
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
