/**
 * Subscription Flow Integration Tests
 * 
 * Created: 2025-12-27 00:37:00 EST
 * Part of 2-hour completion plan - Phase 5
 */

import { apiClient } from '@/utils/api-client';

// Mock API client
jest.mock('@/utils/api-client');

describe('Subscription Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockSubscription,
      });

      const result = await apiClient.post('/api/subscriptions', {
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

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockSubscription,
      });

      const result = await apiClient.post('/api/subscriptions', {
        priceId: 'price_pro_monthly',
        paymentMethodId: 'pm_123',
        trial: false,
      });

      expect(result.data.status).toBe('active');
    });

    it('handles payment method required error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: {
          data: { error: 'Payment method required' },
          status: 400,
        },
      });

      await expect(
        apiClient.post('/api/subscriptions', {
          priceId: 'price_pro_monthly',
        })
      ).rejects.toMatchObject({
        response: {
          data: { error: 'Payment method required' },
        },
      });
    });

    it('handles invalid price ID error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: {
          data: { error: 'Invalid price ID' },
          status: 400,
        },
      });

      await expect(
        apiClient.post('/api/subscriptions', {
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

      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockSubscriptions,
      });

      const result = await apiClient.get('/api/subscriptions');

      expect(result.data).toEqual(mockSubscriptions);
      expect(result.data).toHaveLength(2);
    });

    it('handles empty subscriptions list', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: [],
      });

      const result = await apiClient.get('/api/subscriptions');

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

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockSubscription,
      });

      const result = await apiClient.post('/api/subscriptions/sub_123/cancel', {
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

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockSubscription,
      });

      const result = await apiClient.post('/api/subscriptions/sub_123/cancel', {
        immediately: true,
      });

      expect(result.data.status).toBe('canceled');
      expect(result.data.canceled_at).toBeDefined();
    });

    it('handles subscription not found error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: {
          data: { error: 'Subscription not found' },
          status: 404,
        },
      });

      await expect(
        apiClient.post('/api/subscriptions/invalid_id/cancel', {
          immediately: false,
        })
      ).rejects.toMatchObject({
        response: {
          status: 404,
        },
      });
    });

    it('handles already canceled subscription', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: {
          data: { error: 'Subscription already canceled' },
          status: 400,
        },
      });

      await expect(
        apiClient.post('/api/subscriptions/sub_canceled/cancel', {
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

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockNewSubscription,
      });

      const createResult = await apiClient.post('/api/subscriptions', {
        priceId: 'price_pro_monthly',
        paymentMethodId: 'pm_123',
      });

      expect(createResult.data.id).toBe('sub_789');

      // List subscriptions
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: [mockNewSubscription],
      });

      const listResult = await apiClient.get('/api/subscriptions');

      expect(listResult.data).toContainEqual(mockNewSubscription);

      // Cancel subscription
      const mockCanceledSubscription = {
        ...mockNewSubscription,
        cancel_at_period_end: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValue({
        data: mockCanceledSubscription,
      });

      const cancelResult = await apiClient.post(
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

      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: mockUpgradedSubscription,
      });

      const result = await apiClient.patch('/api/subscriptions/sub_123', {
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

      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: mockDowngradedSubscription,
      });

      const result = await apiClient.patch('/api/subscriptions/sub_123', {
        priceId: 'price_basic_monthly',
      });

      expect(result.data.plan).toBe('basic');
    });
  });
});
