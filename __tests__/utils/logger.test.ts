/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';

// We need to dynamically import the logger after setting NODE_ENV
describe('Logger Security', () => {
  let consoleInfoSpy: MockInstance;
  let consoleErrorSpy: MockInstance;
  let consoleWarnSpy: MockInstance;
  let consoleDebugSpy: MockInstance;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Set production mode so logger outputs JSON
    process.env.NODE_ENV = 'production';
    
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleDebugSpy.mockRestore();
    vi.resetModules();
  });

  describe('Sensitive Data Sanitization', () => {
    it('should redact password field', async () => {
      const { logger } = await import('@/utils/logger');
      logger.info('User action', {
        userId: '123',
        password: 'secret123'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.password).toBe('[REDACTED]');
      expect(loggedData.metadata.userId).toBe('123');
    });

    it('should redact token field', async () => {
      const { logger } = await import('@/utils/logger');
      logger.info('Auth attempt', {
        token: 'abc123xyz',
        username: 'john'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.token).toBe('[REDACTED]');
      expect(loggedData.metadata.username).toBe('john');
    });

    it('should redact stripe_customer_id', async () => {
      const { logger } = await import('@/utils/logger');
      logger.info('Customer update', {
        stripe_customer_id: 'cus_123',
        email: 'test@example.com'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.stripe_customer_id).toBe('[REDACTED]');
    });

    it('should redact nested sensitive data', async () => {
      const { logger } = await import('@/utils/logger');
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

    it('should redact case-insensitive sensitive keys', async () => {
      const { logger } = await import('@/utils/logger');
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
    it('should log info messages', async () => {
      const { logger } = await import('@/utils/logger');
      logger.info('Test message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should log error messages', async () => {
      const { logger } = await import('@/utils/logger');
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include error stack in logs', async () => {
      const { logger } = await import('@/utils/logger');
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData.metadata.error.stack).toBeDefined();
    });
  });

  describe('Production Mode', () => {
    it('should format logs as JSON in production', async () => {
      const { logger } = await import('@/utils/logger');
      logger.info('Production log', { data: 'test' });

      const logged = consoleInfoSpy.mock.calls[0][0];
      expect(() => JSON.parse(logged)).not.toThrow();
    });

    it('should include timestamp in production logs', async () => {
      const { logger } = await import('@/utils/logger');
      logger.info('Production log');

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.timestamp).toBeDefined();
      expect(new Date(loggedData.timestamp)).toBeInstanceOf(Date);
    });

    it('should include environment in logs', async () => {
      const { logger } = await import('@/utils/logger');
      logger.info('Production log');

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.environment).toBe('production');
    });
  });

  describe('Webhook Logging', () => {
    it('should log webhook events', async () => {
      const { logger } = await import('@/utils/logger');
      logger.webhook('customer.subscription.created', {
        eventId: 'evt_123'
      });

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.message).toContain('Webhook received');
      expect(loggedData.metadata.eventType).toBe('customer.subscription.created');
    });
  });

  describe('Subscription Logging', () => {
    it('should log subscription events with partial IDs', async () => {
      const { logger } = await import('@/utils/logger');
      logger.subscription('created', 'sub_1234567890', 'user_abcdefgh');

      const loggedData = JSON.parse(consoleInfoSpy.mock.calls[0][0]);
      expect(loggedData.metadata.subscriptionId).toBe('sub_1234...');
      expect(loggedData.metadata.userId).toBe('user_abc...');
    });
  });
});

describe('Logger Development Mode', () => {
  let consoleInfoSpy: MockInstance;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleInfoSpy.mockRestore();
    vi.resetModules();
  });

  it('should output human-readable format in development', async () => {
    const { logger } = await import('@/utils/logger');
    logger.info('Dev message', { key: 'value' });

    const logged = consoleInfoSpy.mock.calls[0][0];
    expect(logged).toContain('[INFO]');
    expect(logged).toContain('Dev message');
  });
});
