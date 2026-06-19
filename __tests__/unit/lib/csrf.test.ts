/**
 * Unit tests for lib/csrf.ts
 *
 * Coverage targets:
 *  - generateCsrfToken returns 3-part `{random}.{issuedAt}.{hmac}` token
 *  - verifyCsrfToken: valid / tampered HMAC / expired / malformed cases
 *  - csrfProtection middleware: safe methods bypass, webhook bypass, 403 on missing/invalid
 *  - addCsrfTokenToResponse attaches header
 *  - safeCompareHex coverage via tampered token + same-length non-hex inputs
 *
 * Notes on the production fail-closed branch:
 *  The "throws when CSRF_SECRET missing in production" branch is a module-load
 *  invariant. We cover it by `vi.resetModules()` + setting env vars before the
 *  dynamic `await import('@/lib/csrf')`.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// vitest.setup.ts already sets CSRF_SECRET=test-csrf-secret + NODE_ENV defaults.
// These tests run against that baseline unless they explicitly reset modules.

describe('lib/csrf', () => {
  let csrf: typeof import('@/lib/csrf');

  beforeEach(async () => {
    vi.resetModules();
    // Ensure clean baseline secret for happy-path tests
    process.env.CSRF_SECRET = 'unit-test-csrf-secret-with-enough-entropy-1234';
    process.env.NODE_ENV = 'test';
    delete process.env.CSRF_TOKEN_TTL_MS;
    csrf = await import('@/lib/csrf');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateCsrfToken', () => {
    it('returns a 3-part `{random}.{issuedAt}.{hmac}` token', () => {
      const t = csrf.generateCsrfToken();
      expect(typeof t).toBe('string');
      const parts = t.split('.');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^[a-f0-9]{64}$/); // 32 random bytes -> 64 hex
      expect(Number(parts[1])).toBeGreaterThan(0);
      expect(parts[2]).toMatch(/^[a-f0-9]{64}$/); // sha256 hex
    });

    it('returns distinct tokens across calls (entropy)', () => {
      const a = csrf.generateCsrfToken();
      const b = csrf.generateCsrfToken();
      expect(a).not.toEqual(b);
      expect(a.split('.')[0]).not.toEqual(b.split('.')[0]);
    });
  });

  describe('verifyCsrfToken', () => {
    it('returns true for a freshly generated token', () => {
      const t = csrf.generateCsrfToken();
      expect(csrf.verifyCsrfToken(t)).toBe(true);
    });

    it('returns false for an empty string', () => {
      expect(csrf.verifyCsrfToken('')).toBe(false);
    });

    it('returns false for a non-string input', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(csrf.verifyCsrfToken(null as any)).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(csrf.verifyCsrfToken(undefined as any)).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(csrf.verifyCsrfToken(12345 as any)).toBe(false);
    });

    it('returns false when token has wrong number of parts', () => {
      expect(csrf.verifyCsrfToken('only.two')).toBe(false);
      expect(csrf.verifyCsrfToken('a.b.c.d')).toBe(false);
      expect(csrf.verifyCsrfToken('nope')).toBe(false);
    });

    it('returns false when any part is empty', () => {
      const t = csrf.generateCsrfToken();
      const [r, , s] = t.split('.');
      expect(csrf.verifyCsrfToken(`${r}..${s}`)).toBe(false);
      expect(csrf.verifyCsrfToken(`.${Date.now()}.${s}`)).toBe(false);
      expect(csrf.verifyCsrfToken(`${r}.${Date.now()}.`)).toBe(false);
    });

    it('returns false when issuedAt is non-numeric / negative', () => {
      const t = csrf.generateCsrfToken();
      const [r, , s] = t.split('.');
      expect(csrf.verifyCsrfToken(`${r}.notanumber.${s}`)).toBe(false);
      expect(csrf.verifyCsrfToken(`${r}.-1.${s}`)).toBe(false);
      expect(csrf.verifyCsrfToken(`${r}.0.${s}`)).toBe(false);
    });

    it('returns false for a tampered HMAC (correct length, wrong bytes)', () => {
      const t = csrf.generateCsrfToken();
      const [r, ts, s] = t.split('.');
      // Flip the first hex char; preserves length so we exercise timingSafeEqual.
      const flipped = (s[0] === '0' ? '1' : '0') + s.slice(1);
      expect(csrf.verifyCsrfToken(`${r}.${ts}.${flipped}`)).toBe(false);
    });

    it('returns false when HMAC length differs', () => {
      const t = csrf.generateCsrfToken();
      const [r, ts] = t.split('.');
      expect(csrf.verifyCsrfToken(`${r}.${ts}.deadbeef`)).toBe(false);
    });

    it('returns false for an expired token (older than TTL)', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-19T00:00:00Z'));
      const t = csrf.generateCsrfToken();
      // Default TTL is 1 hour — advance 2 hours.
      vi.setSystemTime(new Date('2026-06-19T02:00:01Z'));
      expect(csrf.verifyCsrfToken(t)).toBe(false);
    });

    it('respects a custom TTL via CSRF_TOKEN_TTL_MS env (module reload)', async () => {
      vi.resetModules();
      process.env.CSRF_TOKEN_TTL_MS = '500'; // half a second
      const fresh = await import('@/lib/csrf');

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-06-19T00:00:00Z'));
      const t = fresh.generateCsrfToken();
      // Still valid within TTL.
      expect(fresh.verifyCsrfToken(t)).toBe(true);
      vi.setSystemTime(new Date('2026-06-19T00:00:00.700Z'));
      expect(fresh.verifyCsrfToken(t)).toBe(false);
    });

    it('exposes __csrfConfig with the resolved TTL + dev-fallback flag', () => {
      expect(csrf.__csrfConfig.tokenTtlMs).toBeGreaterThan(0);
      expect(typeof csrf.__csrfConfig.usingDevFallback).toBe('boolean');
    });
  });

  describe('csrfProtection middleware', () => {
    it('bypasses GET / HEAD / OPTIONS', async () => {
      for (const method of ['GET', 'HEAD', 'OPTIONS']) {
        const req = new NextRequest('http://localhost/api/keys', { method });
        const res = await csrf.csrfProtection(req);
        expect(res).toBeNull();
      }
    });

    it('bypasses webhook endpoints under /api/webhooks/**', async () => {
      const req = new NextRequest('http://localhost/api/webhooks/stripe', {
        method: 'POST',
      });
      const res = await csrf.csrfProtection(req);
      expect(res).toBeNull();
    });

    it('returns 403 when CSRF token header missing on POST', async () => {
      const req = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
      });
      const res = await csrf.csrfProtection(req);
      expect(res).not.toBeNull();
      expect(res!.status).toBe(403);
      const body = await res!.json();
      expect(body.error).toBe('CSRF token missing');
    });

    it('returns 403 when CSRF token invalid', async () => {
      const req = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
        headers: { 'x-csrf-token': 'not-a-real-token' },
      });
      const res = await csrf.csrfProtection(req);
      expect(res!.status).toBe(403);
      const body = await res!.json();
      expect(body.error).toBe('Invalid CSRF token');
    });

    it('returns null (pass) when a valid token is supplied', async () => {
      const token = csrf.generateCsrfToken();
      const req = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
        headers: { 'x-csrf-token': token },
      });
      const res = await csrf.csrfProtection(req);
      expect(res).toBeNull();
    });

    it('also accepts the X-CSRF-Token header casing', async () => {
      const token = csrf.generateCsrfToken();
      const req = new NextRequest('http://localhost/api/keys', {
        method: 'POST',
        headers: { 'X-CSRF-Token': token },
      });
      const res = await csrf.csrfProtection(req);
      expect(res).toBeNull();
    });

    it('verifyCSRF alias points to csrfProtection', () => {
      expect(csrf.verifyCSRF).toBe(csrf.csrfProtection);
    });
  });

  describe('addCsrfTokenToResponse', () => {
    it('sets X-CSRF-Token header on the response', async () => {
      const { NextResponse } = await import('next/server');
      const resp = NextResponse.json({ ok: true });
      csrf.addCsrfTokenToResponse(resp);
      const tok = resp.headers.get('X-CSRF-Token');
      expect(tok).toBeTruthy();
      expect(tok!.split('.')).toHaveLength(3);
    });
  });

  describe('production fail-closed', () => {
    it('throws when CSRF_SECRET is missing in production', async () => {
      vi.resetModules();
      delete process.env.CSRF_SECRET;
      process.env.NODE_ENV = 'production';
      await expect(import('@/lib/csrf')).rejects.toThrow(/CSRF_SECRET is required in production/);
      // Restore so other tests don't blow up at setup time.
      process.env.NODE_ENV = 'test';
      process.env.CSRF_SECRET = 'unit-test-csrf-secret-with-enough-entropy-1234';
    });
  });

  describe('dev fallback warning', () => {
    it('warns + uses fallback when CSRF_SECRET missing in dev', async () => {
      vi.resetModules();
      delete process.env.CSRF_SECRET;
      process.env.NODE_ENV = 'development';
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const devCsrf = await import('@/lib/csrf');
      const t = devCsrf.generateCsrfToken();
      expect(warn).toHaveBeenCalled();
      expect(devCsrf.verifyCsrfToken(t)).toBe(true);
      expect(devCsrf.__csrfConfig.usingDevFallback).toBe(true);
      warn.mockRestore();
      // Restore env for other tests.
      process.env.NODE_ENV = 'test';
      process.env.CSRF_SECRET = 'unit-test-csrf-secret-with-enough-entropy-1234';
    });
  });
});
