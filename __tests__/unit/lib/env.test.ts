/**
 * Unit tests for lib/env.ts
 *
 * The schema is evaluated AT MODULE LOAD against process.env. We test each
 * branch by mutating env vars + `vi.resetModules()` before dynamic-importing
 * the module fresh.
 */
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';

// Snapshot env so each test starts from a clean place — vitest.setup.ts has
// already set some sensible defaults (SUPABASE_*, UPSTASH_*, CSRF_SECRET).
const ORIGINAL_ENV = { ...process.env };

function restoreBaselineEnv() {
  // Reset to the harness baseline (mirrors vitest.setup.ts) then layer on
  // a CSRF_SECRET strong enough to pass the secret(32) check.
  for (const k of Object.keys(process.env)) {
    if (!(k in ORIGINAL_ENV)) delete process.env[k];
  }
  for (const [k, v] of Object.entries(ORIGINAL_ENV)) {
    if (v !== undefined) process.env[k] = v;
  }
  process.env.NODE_ENV = 'test';
  process.env.CSRF_SECRET = 'unit-test-csrf-secret-with-enough-entropy-1234';
  process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis.upstash.io';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token-16chars';
  process.env.TURNSTILE_SECRET_KEY = 'test-turnstile';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
  process.env.NEON_DATABASE_URL = 'postgres://user:pass@host/db';
}

describe('lib/env validation', () => {
  beforeEach(() => {
    vi.resetModules();
    restoreBaselineEnv();
  });

  afterAll(() => {
    restoreBaselineEnv();
  });

  it('loads cleanly with a valid baseline env', async () => {
    const mod = await import('@/lib/env');
    expect(mod.env).toBeDefined();
    expect(mod.env.CSRF_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(Array.isArray(mod.KNOWN_ENV_KEYS)).toBe(true);
    expect(mod.KNOWN_ENV_KEYS.length).toBeGreaterThan(10);
  });

  it('throws in production when CSRF_SECRET is shorter than 32 chars', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.CSRF_SECRET = 'too-short';
    await expect(import('@/lib/env')).rejects.toThrow(/CSRF_SECRET/);
    restoreBaselineEnv();
  });

  it('warns (does not throw) in development when CSRF_SECRET is too short', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'development';
    process.env.CSRF_SECRET = 'too-short';
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(import('@/lib/env')).resolves.toBeDefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    restoreBaselineEnv();
  });

  it('throws in production when PAYMENT_VERIFICATION_ENABLED=true but no receiver set', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.PAYMENT_VERIFICATION_ENABLED = 'true';
    process.env.RPC_URL_BASE = 'https://rpc.base/x';
    delete process.env.X402_RECEIVER_ADDRESS;
    delete process.env.X402_RECEIVER_ADDRESS_BASE;
    delete process.env.X402_RECEIVER_ADDRESS_ETHEREUM;
    delete process.env.X402_RECEIVER_ADDRESS_POLYGON;
    await expect(import('@/lib/env')).rejects.toThrow(/X402_RECEIVER_ADDRESS/);
    delete process.env.PAYMENT_VERIFICATION_ENABLED;
    restoreBaselineEnv();
  });

  it('throws in production when PAYMENT_VERIFICATION_ENABLED=true but no RPC URL', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    process.env.PAYMENT_VERIFICATION_ENABLED = 'true';
    process.env.X402_RECEIVER_ADDRESS = '0x' + '1'.repeat(40);
    delete process.env.RPC_URL_MAINNET;
    delete process.env.RPC_URL_BASE;
    delete process.env.RPC_URL_POLYGON;
    await expect(import('@/lib/env')).rejects.toThrow(/RPC_URL/);
    delete process.env.PAYMENT_VERIFICATION_ENABLED;
    restoreBaselineEnv();
  });

  it('throws in production when service-role secret is exposed via NEXT_PUBLIC_*', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    // eslint-disable-next-line camelcase
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY = 'leak-key';
    await expect(import('@/lib/env')).rejects.toThrow(/SECURITY: server secrets exposed/);
    delete process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    restoreBaselineEnv();
  });

  it('throws in production when neither Clerk nor Supabase auth env is set', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.CLERK_SECRET_KEY;
    delete process.env.CLERK_PUBLISHABLE_KEY;
    await expect(import('@/lib/env')).rejects.toThrow(/Auth provider env vars/);
    restoreBaselineEnv();
  });

  it('throws in production when no database URL configured', async () => {
    vi.resetModules();
    process.env.NODE_ENV = 'production';
    delete process.env.NEON_DATABASE_URL;
    delete process.env.DATABASE_URL;
    await expect(import('@/lib/env')).rejects.toThrow(/NEON_DATABASE_URL/);
    restoreBaselineEnv();
  });

  it('accepts valid EVM 0x receiver address', async () => {
    vi.resetModules();
    process.env.X402_RECEIVER_ADDRESS = '0x' + 'a'.repeat(40);
    const mod = await import('@/lib/env');
    expect(mod.env.X402_RECEIVER_ADDRESS).toBe('0x' + 'a'.repeat(40));
    restoreBaselineEnv();
  });
});
