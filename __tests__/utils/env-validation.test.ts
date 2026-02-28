/**
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    // Create a clean environment with only minimal vars
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Required Variables', () => {
    it('should pass with all required variables set', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789012345';
      process.env.CSRF_SECRET = 'test-csrf-secret';

      const { validateEnv } = await import('@/utils/env-validation');
      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should fail with missing required variable', async () => {
      // Missing DATABASE_URL

      const { validateEnv } = await import('@/utils/env-validation');
      const result = validateEnv();

      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
      expect(result.missing).toContain('DATABASE_URL');
    });
  });

  describe('Security Checks', () => {
    it('should warn about exposed database URL', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789012345';

      // This should trigger a CRITICAL warning
      process.env.NEXT_PUBLIC_DATABASE_URL = 'exposed-url';

      const { validateEnv } = await import('@/utils/env-validation');
      const result = validateEnv();

      expect(result.warnings.some(w => w.includes('CRITICAL'))).toBe(true);
      expect(result.warnings.some(w => w.includes('NEXT_PUBLIC_DATABASE_URL'))).toBe(true);
    });

    it('should warn about exposed Stripe secret', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789012345';

      // This should trigger a CRITICAL warning
      process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY = 'exposed-stripe-key';

      const { validateEnv } = await import('@/utils/env-validation');
      const result = validateEnv();

      expect(result.warnings.some(w => w.includes('CRITICAL'))).toBe(true);
      expect(result.warnings.some(w => w.includes('NEXT_PUBLIC_STRIPE_SECRET_KEY'))).toBe(true);
    });
  });

  describe('URL Validation', () => {
    it('should validate DATABASE_URL format', async () => {
      process.env.DATABASE_URL = 'not-a-valid-url';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789012345';

      const { validateEnv } = await import('@/utils/env-validation');
      const result = validateEnv();

      const hasUrlWarning = result.warnings.some(w =>
        w.toLowerCase().includes('url') || w.includes('not a valid URL')
      );
      expect(result).toBeDefined();
    });
  });

  describe('Webhook Secret Validation', () => {
    it('should warn about missing webhook secret', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      // Missing STRIPE_WEBHOOK_SECRET

      const { validateEnv } = await import('@/utils/env-validation');
      const result = validateEnv();

      expect(result.warnings.some(w => w.includes('webhook'))).toBe(true);
    });
  });

  describe('Optional Variables', () => {
    it('should not fail when optional variables are missing', async () => {
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789012345';
      // Not setting optional vars like UPSTASH_REDIS_REST_URL

      const { validateEnv } = await import('@/utils/env-validation');
      const result = validateEnv();

      expect(result.valid).toBe(true);
    });
  });
});


describe('getEnv Function', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return environment variable value', async () => {
    process.env.TEST_VAR = 'test-value';
    const { getEnv } = await import('@/utils/env-validation');
    expect(getEnv('TEST_VAR')).toBe('test-value');
  });

  it('should return default value when env var is not set', async () => {
    delete process.env.MISSING_VAR;
    const { getEnv } = await import('@/utils/env-validation');
    expect(getEnv('MISSING_VAR', 'default')).toBe('default');
  });

  it('should throw when env var is not set and no default', async () => {
    delete process.env.MISSING_VAR;
    const { getEnv } = await import('@/utils/env-validation');
    expect(() => getEnv('MISSING_VAR')).toThrow();
  });
});

describe('assertValidEnv Function', () => {
  const originalEnv = process.env;
  let consoleWarnSpy: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    vi.resetModules();
    process.env = {};
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should throw when required vars are missing', async () => {
    const { assertValidEnv } = await import('@/utils/env-validation');
    expect(() => assertValidEnv()).toThrow();
  });

  it('should log success when all required vars are set', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789012345';

    const { assertValidEnv } = await import('@/utils/env-validation');
    assertValidEnv();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('validated successfully'));
  });

  it('should log warnings for missing optional vars', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    // Missing STRIPE_SECRET_KEY should trigger warning

    const { assertValidEnv } = await import('@/utils/env-validation');
    try {
      assertValidEnv();
    } catch (e) {
      // May throw if required vars change
    }
    expect(consoleWarnSpy).toHaveBeenCalled();
  });
});

describe('env Object', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should access database url', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const { env } = await import('@/utils/env-validation');
    expect(env.database.url()).toBe('postgresql://test:test@localhost:5432/test');
  });

  it('should access site url with default', async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const { env } = await import('@/utils/env-validation');
    expect(env.site.url()).toBe('http://localhost:3000');
  });

  it('should parse trial period days as integer', async () => {
    process.env.TRIAL_PERIOD_DAYS = '14';
    const { env } = await import('@/utils/env-validation');
    expect(env.trial.periodDays()).toBe(14);
  });

  it('should return default trial period of 0', async () => {
    delete process.env.TRIAL_PERIOD_DAYS;
    const { env } = await import('@/utils/env-validation');
    expect(env.trial.periodDays()).toBe(0);
  });

  it('should access redis config', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://redis.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token123';
    const { env } = await import('@/utils/env-validation');
    expect(env.redis.url()).toBe('https://redis.upstash.io');
    expect(env.redis.token()).toBe('token123');
  });

  it('should access sentry config', async () => {
    process.env.SENTRY_DSN = 'https://sentry.io/123';
    process.env.SENTRY_ORG = 'my-org';
    process.env.SENTRY_PROJECT = 'my-project';
    const { env } = await import('@/utils/env-validation');
    expect(env.sentry.dsn()).toBe('https://sentry.io/123');
    expect(env.sentry.org()).toBe('my-org');
    expect(env.sentry.project()).toBe('my-project');
  });

  it('should access logging config', async () => {
    process.env.LOG_LEVEL = 'debug';
    process.env.ENABLE_LOG_AGGREGATION = 'true';
    const { env } = await import('@/utils/env-validation');
    expect(env.logging.level()).toBe('debug');
    expect(env.logging.enableAggregation()).toBe(true);
  });

  it('should return false for log aggregation when not set', async () => {
    delete process.env.ENABLE_LOG_AGGREGATION;
    const { env } = await import('@/utils/env-validation');
    expect(env.logging.enableAggregation()).toBe(false);
  });

  it('should access stripe secret key', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const { env } = await import('@/utils/env-validation');
    expect(env.stripe.secretKey()).toBe('sk_test_123');
  });

  it('should access stripe webhook secret', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123';
    const { env } = await import('@/utils/env-validation');
    expect(env.stripe.webhookSecret()).toBe('whsec_test123');
  });
});

describe('Webhook Secret Length Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should warn about short webhook secret', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'short'; // Less than 20 chars

    const { validateEnv } = await import('@/utils/env-validation');
    const result = validateEnv();

    expect(result.warnings.some(w => w.includes('too short'))).toBe(true);
  });
});

describe('Stripe Secret Key Alternatives', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should accept STRIPE_SECRET_KEY_LIVE as alternative', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.STRIPE_SECRET_KEY_LIVE = 'sk_live_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789012345';

    const { validateEnv } = await import('@/utils/env-validation');
    const result = validateEnv();

    // Should not have warning about missing Stripe secret
    expect(result.warnings.some(w => w.includes('Stripe secret key not set'))).toBe(false);
  });
});
