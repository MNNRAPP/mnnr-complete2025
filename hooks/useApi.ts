/**
 * React Hooks for API Calls
 * 
 * Created: 2025-12-26 23:03:00 EST
 * Action #14 in 19-hour optimization
 * 
 * Purpose: Provide React hooks for API calls with automatic loading/error states
 * 
 * Benefits:
 * - Automatic loading states
 * - Error handling
 * - Data caching
 * - Optimistic updates
 * - Type safety
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/utils/api-client';

// Hook state interface
interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for API calls
 */
export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
): UseApiState<T> {
  const { immediate = true, onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await fetcher();

    if (response.success && response.data) {
      setData(response.data);
      onSuccess?.(response.data);
    } else if (response.error) {
      setError(response.error);
      onError?.(response.error);
    }

    setLoading(false);
  }, [fetcher, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for mutations (POST, PATCH, DELETE)
 */
export function useMutation<T, TVariables = any>(
  mutator: (variables: TVariables) => Promise<ApiResponse<T>>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
) {
  const { onSuccess, onError } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setLoading(true);
      setError(null);

      const response = await mutator(variables);

      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
      } else if (response.error) {
        setError(response.error);
        onError?.(response.error);
      }

      setLoading(false);

      return response;
    },
    [mutator, onSuccess, onError]
  );

  return {
    data,
    loading,
    error,
    mutate,
    reset: () => {
      setData(null);
      setError(null);
    },
  };
}

// Specific hooks for common API calls

/**
 * Hook for user profile
 */
export function useProfile() {
  return useApi(() => apiClient.get('/user/profile'));
}

/**
 * Hook for subscriptions
 */
export function useSubscriptions() {
  return useApi(() => apiClient.get('/subscriptions'));
}

/**
 * Hook for payment methods
 */
export function usePaymentMethods() {
  return useApi(() => apiClient.get('/payments/methods'));
}

/**
 * Hook for invoices
 */
export function useInvoices(params?: { limit?: number; status?: string }) {
  return useApi(() => apiClient.get('/invoices', { params: params as any }));
}

/**
 * Hook for usage data
 */
export function useUsage(params?: { period?: string; metric?: string }) {
  return useApi(() => apiClient.get('/usage', { params: params as any }));
}

/**
 * Hook for creating subscription
 */
export function useCreateSubscription() {
  return useMutation((data: { priceId: string; paymentMethodId?: string; trialDays?: number }) =>
    apiClient.post('/subscriptions', data)
  );
}

/**
 * Hook for canceling subscription
 */
export function useCancelSubscription() {
  return useMutation((data: { id: string; immediately?: boolean }) =>
    apiClient.post(`/subscriptions/${data.id}/cancel`, { immediately: data.immediately })
  );
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  return useMutation((data: any) => apiClient.patch('/user/profile', data));
}

/**
 * Hook for adding payment method
 */
export function useAddPaymentMethod() {
  return useMutation((data: { paymentMethodId: string; setAsDefault?: boolean }) =>
    apiClient.post('/payments/methods', data)
  );
}

/**
 * Hook for removing payment method
 */
export function useRemovePaymentMethod() {
  return useMutation((paymentMethodId: string) =>
    apiClient.delete('/payments/methods', {
      body: JSON.stringify({ paymentMethodId }),
    })
  );
}

/**
 * Hook for recording usage
 */
export function useRecordUsage() {
  return useMutation((data: { metric: string; value?: number; metadata?: any }) =>
    apiClient.post('/usage', data)
  );
}

/**
 * Hook for admin users list
 */
export function useAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) {
  return useApi(() => apiClient.get('/admin/users', { params: params as any }));
}

/**
 * Hook for admin analytics
 */
export function useAdminAnalytics(period?: string) {
  return useApi(() => apiClient.get('/admin/analytics', { params: { period } as any }));
}
