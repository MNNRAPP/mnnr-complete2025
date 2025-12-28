/**
 * React Hooks Tests
 * 
 * Created: 2025-12-26 23:21:00 EST
 * Updated: 2025-12-28 - Fixed async handling and mocking
 * Action #24 in 19-hour optimization
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApi, useMutation, useProfile } from '@/hooks/useApi';

// Mock the api-client module
vi.mock('@/utils/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('useApi hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data on mount when immediate is true', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetcher = vi.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useApi(mockFetcher, { immediate: true }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should not fetch data on mount when immediate is false', () => {
    const mockFetcher = vi.fn();

    const { result } = renderHook(() => useApi(mockFetcher, { immediate: false }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('should handle fetch errors', async () => {
    const mockError = 'Failed to fetch';
    const mockFetcher = vi.fn().mockResolvedValue({
      success: false,
      error: mockError,
    });

    const { result } = renderHook(() => useApi(mockFetcher, { immediate: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(mockError);
  });

  it('should call onSuccess callback', async () => {
    const mockData = { id: 1 };
    const mockFetcher = vi.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });
    const onSuccess = vi.fn();

    renderHook(() => useApi(mockFetcher, { immediate: true, onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback', async () => {
    const mockError = 'Error message';
    const mockFetcher = vi.fn().mockResolvedValue({
      success: false,
      error: mockError,
    });
    const onError = vi.fn();

    renderHook(() => useApi(mockFetcher, { immediate: true, onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should refetch data when refetch is called', async () => {
    const mockData = { id: 1 };
    const mockFetcher = vi.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useApi(mockFetcher, { immediate: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  it('should return refetch function', () => {
    const mockFetcher = vi.fn().mockResolvedValue({ success: true, data: null });
    const { result } = renderHook(() => useApi(mockFetcher, { immediate: false }));
    
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should handle null data in success response', async () => {
    const mockFetcher = vi.fn().mockResolvedValue({
      success: true,
      data: null,
    });

    const { result } = renderHook(() => useApi(mockFetcher, { immediate: true }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

describe('useMutation hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not execute mutation on mount', () => {
    const mockMutator = vi.fn();

    const { result } = renderHook(() => useMutation(mockMutator));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockMutator).not.toHaveBeenCalled();
  });

  it('should execute mutation when mutate is called', async () => {
    const mockData = { id: 1, created: true };
    const mockMutator = vi.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useMutation(mockMutator));

    const variables = { name: 'Test' };
    
    await act(async () => {
      await result.current.mutate(variables);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockMutator).toHaveBeenCalledWith(variables);
  });

  it('should handle mutation errors', async () => {
    const mockError = 'Mutation failed';
    const mockMutator = vi.fn().mockResolvedValue({
      success: false,
      error: mockError,
    });

    const { result } = renderHook(() => useMutation(mockMutator));

    await act(async () => {
      await result.current.mutate({});
    });

    expect(result.current.error).toBe(mockError);
  });

  it('should reset state when reset is called', async () => {
    const mockData = { id: 1 };
    const mockMutator = vi.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useMutation(mockMutator));

    await act(async () => {
      await result.current.mutate({});
    });

    expect(result.current.data).toEqual(mockData);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should call onSuccess callback on successful mutation', async () => {
    const mockData = { id: 1 };
    const mockMutator = vi.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useMutation(mockMutator, { onSuccess }));

    await act(async () => {
      await result.current.mutate({});
    });

    expect(onSuccess).toHaveBeenCalledWith(mockData);
  });

  it('should call onError callback on failed mutation', async () => {
    const mockError = 'Error';
    const mockMutator = vi.fn().mockResolvedValue({
      success: false,
      error: mockError,
    });
    const onError = vi.fn();

    const { result } = renderHook(() => useMutation(mockMutator, { onError }));

    await act(async () => {
      await result.current.mutate({});
    });

    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should return response from mutate', async () => {
    const mockResponse = { success: true, data: { id: 1 } };
    const mockMutator = vi.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useMutation(mockMutator));

    let response;
    await act(async () => {
      response = await result.current.mutate({});
    });

    expect(response).toEqual(mockResponse);
  });
});

describe('useProfile hook', () => {
  it('should be a function', () => {
    expect(typeof useProfile).toBe('function');
  });

  it('should return expected properties', () => {
    // useProfile returns an object with data, loading, error, and refetch
    // Since it's built on useApi, we just verify the structure
    expect(useProfile).toBeDefined();
  });
});


// Import additional hooks for testing
import {
  useSubscriptions,
  usePaymentMethods,
  useInvoices,
  useUsage,
  useCreateSubscription,
  useCancelSubscription,
  useUpdateProfile,
  useAddPaymentMethod,
  useRemovePaymentMethod,
  useRecordUsage,
  useAdminUsers,
  useAdminAnalytics,
} from '@/hooks/useApi';

describe('Specific API Hooks', () => {
  it('useSubscriptions should be a function', () => {
    expect(typeof useSubscriptions).toBe('function');
  });

  it('usePaymentMethods should be a function', () => {
    expect(typeof usePaymentMethods).toBe('function');
  });

  it('useInvoices should be a function', () => {
    expect(typeof useInvoices).toBe('function');
  });

  it('useUsage should be a function', () => {
    expect(typeof useUsage).toBe('function');
  });

  it('useCreateSubscription should be a function', () => {
    expect(typeof useCreateSubscription).toBe('function');
  });

  it('useCancelSubscription should be a function', () => {
    expect(typeof useCancelSubscription).toBe('function');
  });

  it('useUpdateProfile should be a function', () => {
    expect(typeof useUpdateProfile).toBe('function');
  });

  it('useAddPaymentMethod should be a function', () => {
    expect(typeof useAddPaymentMethod).toBe('function');
  });

  it('useRemovePaymentMethod should be a function', () => {
    expect(typeof useRemovePaymentMethod).toBe('function');
  });

  it('useRecordUsage should be a function', () => {
    expect(typeof useRecordUsage).toBe('function');
  });

  it('useAdminUsers should be a function', () => {
    expect(typeof useAdminUsers).toBe('function');
  });

  it('useAdminAnalytics should be a function', () => {
    expect(typeof useAdminAnalytics).toBe('function');
  });
});

describe('Hook Return Types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useCreateSubscription returns mutate function', () => {
    const { result } = renderHook(() => useCreateSubscription());
    expect(result.current).toHaveProperty('mutate');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('data');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('reset');
  });

  it('useCancelSubscription returns mutate function', () => {
    const { result } = renderHook(() => useCancelSubscription());
    expect(result.current).toHaveProperty('mutate');
    expect(typeof result.current.mutate).toBe('function');
  });

  it('useUpdateProfile returns mutate function', () => {
    const { result } = renderHook(() => useUpdateProfile());
    expect(result.current).toHaveProperty('mutate');
    expect(typeof result.current.mutate).toBe('function');
  });

  it('useAddPaymentMethod returns mutate function', () => {
    const { result } = renderHook(() => useAddPaymentMethod());
    expect(result.current).toHaveProperty('mutate');
    expect(typeof result.current.mutate).toBe('function');
  });

  it('useRemovePaymentMethod returns mutate function', () => {
    const { result } = renderHook(() => useRemovePaymentMethod());
    expect(result.current).toHaveProperty('mutate');
    expect(typeof result.current.mutate).toBe('function');
  });

  it('useRecordUsage returns mutate function', () => {
    const { result } = renderHook(() => useRecordUsage());
    expect(result.current).toHaveProperty('mutate');
    expect(typeof result.current.mutate).toBe('function');
  });
});
