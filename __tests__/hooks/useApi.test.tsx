/**
 * React Hooks Tests
 * 
 * Created: 2025-12-26 23:21:00 EST
 * Action #24 in 19-hour optimization
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useApi, useMutation, useProfile } from '@/hooks/useApi';
import * as apiClient from '@/utils/api-client';

// Mock API client
jest.mock('@/utils/api-client');

describe('useApi hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data on mount when immediate is true', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetcher = jest.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useApi(mockFetcher, { immediate: true }));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should not fetch data on mount when immediate is false', () => {
    const mockFetcher = jest.fn();

    const { result } = renderHook(() => useApi(mockFetcher, { immediate: false }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  it('should handle fetch errors', async () => {
    const mockError = 'Failed to fetch';
    const mockFetcher = jest.fn().mockResolvedValue({
      success: false,
      error: mockError,
    });

    const { result } = renderHook(() => useApi(mockFetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe(mockError);
  });

  it('should call onSuccess callback', async () => {
    const mockData = { id: 1 };
    const mockFetcher = jest.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });
    const onSuccess = jest.fn();

    renderHook(() => useApi(mockFetcher, { onSuccess }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });
  });

  it('should call onError callback', async () => {
    const mockError = 'Error message';
    const mockFetcher = jest.fn().mockResolvedValue({
      success: false,
      error: mockError,
    });
    const onError = jest.fn();

    renderHook(() => useApi(mockFetcher, { onError }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should refetch data when refetch is called', async () => {
    const mockData = { id: 1 };
    const mockFetcher = jest.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useApi(mockFetcher));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetcher).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useMutation hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not execute mutation on mount', () => {
    const mockMutator = jest.fn();

    const { result } = renderHook(() => useMutation(mockMutator));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockMutator).not.toHaveBeenCalled();
  });

  it('should execute mutation when mutate is called', async () => {
    const mockData = { id: 1, created: true };
    const mockMutator = jest.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useMutation(mockMutator));

    const variables = { name: 'Test' };
    result.current.mutate(variables);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(mockMutator).toHaveBeenCalledWith(variables);
  });

  it('should handle mutation errors', async () => {
    const mockError = 'Mutation failed';
    const mockMutator = jest.fn().mockResolvedValue({
      success: false,
      error: mockError,
    });

    const { result } = renderHook(() => useMutation(mockMutator));

    result.current.mutate({});

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
  });

  it('should reset state when reset is called', async () => {
    const mockData = { id: 1 };
    const mockMutator = jest.fn().mockResolvedValue({
      success: true,
      data: mockData,
    });

    const { result } = renderHook(() => useMutation(mockMutator));

    result.current.mutate({});

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
    });

    result.current.reset();

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

describe('useProfile hook', () => {
  it('should fetch user profile', async () => {
    const mockProfile = { id: 1, name: 'User', email: 'user@example.com' };
    
    jest.spyOn(apiClient.apiClient, 'get').mockResolvedValue({
      success: true,
      data: mockProfile,
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockProfile);
    expect(apiClient.apiClient.get).toHaveBeenCalledWith('/user/profile');
  });
});
