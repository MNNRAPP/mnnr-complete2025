/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { logger } from '@/utils/logger';

describe('Logger Security', () => {
  let consoleInfoSpy: MockInstance;
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Sensitive Data Sanitization', () => {
    it('should redact password field', () => {
      logger.info('User action', {
        userId: '123',
        password: 'secret123'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.password).toBe('[REDACTED]');
      expect(loggedData.metadata.userId).toBe('123');
    });

    it('should redact token field', () => {
      logger.info('Auth attempt', {
        token: 'abc123xyz',
        username: 'john'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.token).toBe('[REDACTED]');
      expect(loggedData.metadata.username).toBe('john');
    });

    it('should redact stripe_customer_id', () => {
      logger.info('Customer update', {
        stripe_customer_id: 'cus_123',
        email: 'test@example.com'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.stripe_customer_id).toBe('[REDACTED]');
    });

    it('should redact nested sensitive data', () => {
      logger.info('Complex object', {
        user: {
          id: '123',
          password: 'secret',
          profile: {
            apiKey: 'key123'
          }
        }
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.user.password).toBe('[REDACTED]');
      expect(loggedData.metadata.user.profile.apiKey).toBe('[REDACTED]');
      expect(loggedData.metadata.user.id).toBe('123');
    });

    it('should redact case-insensitive sensitive keys', () => {
      logger.info('Mixed case', {
        PASSWORD: 'secret',
        ApiKey: 'key123',
        TOKEN: 'token123'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.PASSWORD).toBe('[REDACTED]');
      expect(loggedData.metadata.ApiKey).toBe('[REDACTED]');
      expect(loggedData.metadata.TOKEN).toBe('[REDACTED]');
    });
  });

  describe('Log Levels', () => {
    it('should log info messages', () => {
      logger.info('Test message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include error stack in logs', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.metadata.error.stack).toBeDefined();
    });
  });

  describe('Production Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should format logs as JSON in production', () => {
      logger.info('Production log', { data: 'test' });

      const logged = consoleInfoSpy.mock.calls[0][0];
      expect(() => JSON.parse(logged)).not.toThrow();
    });

    it('should include timestamp in production logs', () => {
      logger.info('Production log');

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.timestamp).toBeDefined();
      expect(new Date(loggedData.timestamp)).toBeInstanceOf(Date);
    });

    it('should include environment in logs', () => {
      logger.info('Production log');

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.environment).toBe('production');
    });
  });

  describe('Webhook Logging', () => {
    it('should log webhook events', () => {
      logger.webhook('customer.subscription.created', {
        eventId: 'evt_123'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.message).toContain('Webhook received');
      expect(loggedData.metadata.eventType).toBe('customer.subscription.created');
    });
  });

  describe('Subscription Logging', () => {
    it('should log subscription events with partial IDs', () => {
      logger.subscription('created', 'sub_1234567890', 'user_abcdefgh');

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.subscriptionId).toBe('sub_1234...');
      expect(loggedData.metadata.userId).toBe('user_abc...');
    });
  });
});
