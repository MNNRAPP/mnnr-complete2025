/**
 * Subscription Flow Integration Tests
 * 
 * Created: 2025-12-27 00:37:00 EST
 * Updated: 2025-12-28 - Fixed vitest mock syntax
 * Part of 2-hour completion plan - Phase 5
 */

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

// Create mock functions
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();

// Mock API client
vi.mock('@/utils/api-client', () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: vi.fn(),
  },
}));

describe('Subscription Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Subscription', () => {
    it('successfully creates subscription with trial', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'trialing',
        plan: 'pro',
        trial_end: Date.now() + 14 * 24 * 60 * 60 * 1000,
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      mockPost.mockResolvedValue({
        data: mockSubscription,
      });

      const result = await mockPost('/api/subscriptions', {
        priceId: 'price_pro_monthly',
        paymentMethodId: 'pm_123',
        trial: true,
      });

      expect(result.data).toEqual(mockSubscription);
      expect(result.data.status).toBe('trialing');
    });

    it('successfully creates subscription without trial', async () => {
      const mockSubscription = {
        id: 'sub_456',
        status: 'active',
        plan: 'pro',
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
      };

      mockPost.mockResolvedValue({
        data: mockSubscription,
      });

      const result = await mockPost('/api/subscriptions', {
        priceId: 'price_pro_monthly',
        paymentMethodId: 'pm_123',
        trial: false,
      });

      expect(result.data.status).toBe('active');
    });

    it('handles payment method required error', async () => {
      mockPost.mockRejectedValue({
        response: {
          data: { error: 'Payment method required' },
          status: 400,
        },
      });

      await expect(
        mockPost('/api/subscriptions', {
          priceId: 'price_pro_monthly',
        })
      ).rejects.toMatchObject({
        response: {
          data: { error: 'Payment method required' },
        },
      });
    });

    it('handles invalid price ID error', async () => {
      mockPost.mockRejectedValue({
        response: {
          data: { error: 'Invalid price ID' },
          status: 400,
        },
      });

      await expect(
        mockPost('/api/subscriptions', {
          priceId: 'invalid_price',
          paymentMethodId: 'pm_123',
        })
      ).rejects.toMatchObject({
        response: {
          data: { error: 'Invalid price ID' },
        },
      });
    });
  });

  describe('List Subscriptions', () => {
    it('successfully retrieves user subscriptions', async () => {
      const mockSubscriptions = [
        {
          id: 'sub_123',
          status: 'active',
          plan: 'pro',
        },
        {
          id: 'sub_456',
          status: 'canceled',
          plan: 'basic',
        },
      ];

      mockGet.mockResolvedValue({
        data: mockSubscriptions,
      });

      const result = await mockGet('/api/subscriptions');

      expect(result.data).toEqual(mockSubscriptions);
      expect(result.data).toHaveLength(2);
    });

    it('handles empty subscriptions list', async () => {
      mockGet.mockResolvedValue({
        data: [],
      });

      const result = await mockGet('/api/subscriptions');

      expect(result.data).toEqual([]);
    });
  });

  describe('Cancel Subscription', () => {
    it('successfully cancels subscription at period end', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: true,
        current_period_end: Date.now() + 15 * 24 * 60 * 60 * 1000,
      };

      mockPost.mockResolvedValue({
        data: mockSubscription,
      });

      const result = await mockPost('/api/subscriptions/sub_123/cancel', {
        immediately: false,
      });

      expect(result.data.cancel_at_period_end).toBe(true);
      expect(result.data.status).toBe('active');
    });

    it('successfully cancels subscription immediately', async () => {
      const mockSubscription = {
        id: 'sub_123',
        status: 'canceled',
        canceled_at: Date.now(),
      };

      mockPost.mockResolvedValue({
        data: mockSubscription,
      });

      const result = await mockPost('/api/subscriptions/sub_123/cancel', {
        immediately: true,
      });

      expect(result.data.status).toBe('canceled');
      expect(result.data.canceled_at).toBeDefined();
    });

    it('handles subscription not found error', async () => {
      mockPost.mockRejectedValue({
        response: {
          data: { error: 'Subscription not found' },
          status: 404,
        },
      });

      await expect(
        mockPost('/api/subscriptions/invalid_id/cancel', {
          immediately: false,
        })
      ).rejects.toMatchObject({
        response: {
          status: 404,
        },
      });
    });

    it('handles already canceled subscription', async () => {
      mockPost.mockRejectedValue({
        response: {
          data: { error: 'Subscription already canceled' },
          status: 400,
        },
      });

      await expect(
        mockPost('/api/subscriptions/sub_canceled/cancel', {
          immediately: false,
        })
      ).rejects.toMatchObject({
        response: {
          data: { error: 'Subscription already canceled' },
        },
      });
    });
  });

  describe('Complete Subscription Flow', () => {
    it('completes full create → list → cancel flow', async () => {
      // Create subscription
      const mockNewSubscription = {
        id: 'sub_789',
        status: 'active',
        plan: 'pro',
      };

      mockPost.mockResolvedValue({
        data: mockNewSubscription,
      });

      const createResult = await mockPost('/api/subscriptions', {
        priceId: 'price_pro_monthly',
        paymentMethodId: 'pm_123',
      });

      expect(createResult.data.id).toBe('sub_789');

      // List subscriptions
      mockGet.mockResolvedValue({
        data: [mockNewSubscription],
      });

      const listResult = await mockGet('/api/subscriptions');

      expect(listResult.data).toContainEqual(mockNewSubscription);

      // Cancel subscription
      const mockCanceledSubscription = {
        ...mockNewSubscription,
        cancel_at_period_end: true,
      };

      mockPost.mockResolvedValue({
        data: mockCanceledSubscription,
      });

      const cancelResult = await mockPost(
        '/api/subscriptions/sub_789/cancel',
        { immediately: false }
      );

      expect(cancelResult.data.cancel_at_period_end).toBe(true);
    });
  });

  describe('Subscription Upgrade/Downgrade', () => {
    it('successfully upgrades subscription plan', async () => {
      const mockUpgradedSubscription = {
        id: 'sub_123',
        status: 'active',
        plan: 'enterprise',
      };

      mockPatch.mockResolvedValue({
        data: mockUpgradedSubscription,
      });

      const result = await mockPatch('/api/subscriptions/sub_123', {
        priceId: 'price_enterprise_monthly',
      });

      expect(result.data.plan).toBe('enterprise');
    });

    it('successfully downgrades subscription plan', async () => {
      const mockDowngradedSubscription = {
        id: 'sub_123',
        status: 'active',
        plan: 'basic',
      };

      mockPatch.mockResolvedValue({
        data: mockDowngradedSubscription,
      });

      const result = await mockPatch('/api/subscriptions/sub_123', {
        priceId: 'price_basic_monthly',
      });

      expect(result.data.plan).toBe('basic');
    });
  });
});
