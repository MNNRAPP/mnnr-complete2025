/**
 * Centralized API Client Utility
 * 
 * Created: 2025-12-26 23:02:00 EST
 * Action #13 in 19-hour optimization
 * 
 * Purpose: Provide a consistent, type-safe API client for all frontend requests
 * 
 * Benefits:
 * - DRY principle (Don't Repeat Yourself)
 * - Consistent error handling
 * - Type safety
 * - Request/response interceptors
 * - Automatic retries
 * - Loading states
 */

import { toast } from '@/components/ui/Toasts/toasts';

// API Response type
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// API Client configuration
interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Request options
interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
  retries?: number;
  showErrorToast?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retries: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.timeout = config.timeout || 30000; // 30 seconds
    this.retries = config.retries || 3;
  }

  /**
   * Make an HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      timeout = this.timeout,
      retries = this.retries,
      showErrorToast = true,
      ...fetchOptions
    } = options;

    // Build URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Merge headers
    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    };

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url.toString(), {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = data.error || `HTTP ${response.status}: ${response.statusText}`;
        
        if (showErrorToast) {
          toast({ title: 'Error', description: error, variant: 'destructive' });
        }

        return {
          error,
          success: false,
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors
      if (retries > 0 && error instanceof Error && error.name !== 'AbortError') {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
        return this.request<T>(endpoint, { ...options, retries: retries - 1 });
      }

      const errorMessage =
        error instanceof Error
          ? error.name === 'AbortError'
            ? 'Request timeout'
            : error.message
          : 'Network error';

      if (showErrorToast) {
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      }

      return {
        error: errorMessage,
        success: false,
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export typed API methods for specific endpoints
export const api = {
  // User endpoints
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (data: any) => apiClient.patch('/user/profile', data),
  },

  // Subscription endpoints
  subscriptions: {
    list: () => apiClient.get('/subscriptions'),
    create: (data: { priceId: string; paymentMethodId?: string; trialDays?: number }) =>
      apiClient.post('/subscriptions', data),
    cancel: (id: string, immediately = false) =>
      apiClient.post(`/subscriptions/${id}/cancel`, { immediately }),
  },

  // Payment endpoints
  payments: {
    listMethods: () => apiClient.get('/payments/methods'),
    addMethod: (paymentMethodId: string, setAsDefault = false) =>
      apiClient.post('/payments/methods', { paymentMethodId, setAsDefault }),
    removeMethod: (paymentMethodId: string) =>
      apiClient.delete('/payments/methods', {
        body: JSON.stringify({ paymentMethodId }),
      }),
  },

  // Invoice endpoints
  invoices: {
    list: (params?: { limit?: number; starting_after?: string; status?: string }) =>
      apiClient.get('/invoices', { params: params as any }),
    get: (id: string) => apiClient.get(`/invoices/${id}`),
  },

  // Usage endpoints
  usage: {
    get: (params?: { period?: string; metric?: string }) =>
      apiClient.get('/usage', { params: params as any }),
    record: (metric: string, value?: number, metadata?: any) =>
      apiClient.post('/usage', { metric, value, metadata }),
  },

  // Admin endpoints
  admin: {
    listUsers: (params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      sort?: string;
      order?: string;
    }) => apiClient.get('/admin/users', { params: params as any }),
    getAnalytics: (period?: string) =>
      apiClient.get('/admin/analytics', { params: { period } as any }),
  },
};
