import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll, type MockInstance } from 'vitest';
/**
 * @jest-environment node
 */

import { validateEnv } from '@/utils/env-validation';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Required Variables', () => {
    it('should pass with all required variables set', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789';

      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should fail with missing required variable', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      // Missing other required vars

      const result = validateEnv();

      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThan(0);
      expect(result.missing).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    });
  });

  describe('Security Checks', () => {
    it('should warn about exposed service role key', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789';

      // This should trigger a warning
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'exposed-key';

      const result = validateEnv();

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY'))).toBe(true);
    });

    it('should warn about exposed Stripe secret', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789';

      // This should trigger a CRITICAL warning
      process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY = 'exposed-stripe-key';

      const result = validateEnv();

      expect(result.valid).toBe(false); // Should fail with CRITICAL warning
      expect(result.warnings.some(w => w.includes('CRITICAL'))).toBe(true);
      expect(result.warnings.some(w => w.includes('NEXT_PUBLIC_STRIPE_SECRET_KEY'))).toBe(true);
    });
  });

  describe('URL Validation', () => {
    it('should validate Supabase URL format', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-valid-url';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789';

      const result = validateEnv();

      expect(result.warnings.some(w => w.includes('not a valid URL'))).toBe(true);
    });
  });

  describe('Webhook Secret Validation', () => {
    it('should warn about short webhook secret', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'short'; // Too short

      const result = validateEnv();

      expect(result.warnings.some(w => w.includes('too short'))).toBe(true);
    });
  });
});
