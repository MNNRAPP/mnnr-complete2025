/**
 * Unit tests for lib/security.ts
 *
 * Covers the hardened CSP helpers + static security headers + utility funcs.
 */
import { describe, it, expect } from 'vitest';
import {
  generateCspNonce,
  generateCsp,
  CSP_ALLOWED_ORIGINS,
  SECURITY_HEADERS_STATIC,
  getCspNonceFromHeaders,
  sanitizeString,
  sanitizeObject,
  stripHtml,
  sanitizeUrl,
  hasSqlInjection,
  escapeSql,
  getClientIP,
  validateRequestSize,
  isBlockedIP,
  secureHash,
  generateHMAC,
  verifyHMAC,
  generateSecureToken,
} from '@/lib/security';
import { NextRequest } from 'next/server';

describe('lib/security CSP', () => {
  it('generateCspNonce returns a non-empty base64-ish string', () => {
    const n = generateCspNonce();
    expect(typeof n).toBe('string');
    expect(n.length).toBeGreaterThan(0);
    // Base64 alphabet plus padding
    expect(n).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('two consecutive nonces are distinct', () => {
    const a = generateCspNonce();
    const b = generateCspNonce();
    expect(a).not.toEqual(b);
  });

  it('generateCsp injects nonce into script-src and style-src', () => {
    const nonce = 'TEST_NONCE_123';
    const csp = generateCsp(nonce);
    expect(csp).toContain(`'nonce-${nonce}'`);
    // Both directives must include the nonce
    const scriptDir = csp.split(';').find((d) => d.trim().startsWith('script-src'));
    const styleDir = csp.split(';').find((d) => d.trim().startsWith('style-src'));
    expect(scriptDir).toContain(`'nonce-${nonce}'`);
    expect(styleDir).toContain(`'nonce-${nonce}'`);
  });

  it('generateCsp does NOT include unsafe-inline or unsafe-eval', () => {
    const csp = generateCsp('any-nonce');
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it('generateCsp emits report-uri and frame-ancestors none', () => {
    const csp = generateCsp('n');
    expect(csp).toContain('report-uri /api/csp-report');
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('generateCsp includes whitelisted third-party origins', () => {
    const csp = generateCsp('n');
    for (const origin of CSP_ALLOWED_ORIGINS.script) {
      expect(csp).toContain(origin);
    }
    for (const origin of CSP_ALLOWED_ORIGINS.connect) {
      expect(csp).toContain(origin);
    }
  });

  it('SECURITY_HEADERS_STATIC contains HSTS with preload and X-Frame DENY', () => {
    const hsts = SECURITY_HEADERS_STATIC.find(
      (h) => h.key === 'Strict-Transport-Security',
    );
    expect(hsts).toBeDefined();
    expect(hsts!.value).toContain('preload');
    expect(hsts!.value).toContain('includeSubDomains');

    const frame = SECURITY_HEADERS_STATIC.find((h) => h.key === 'X-Frame-Options');
    expect(frame?.value).toBe('DENY');
  });

  it('getCspNonceFromHeaders reads `x-nonce`', () => {
    const headers = new Headers({ 'x-nonce': 'abc123' });
    expect(getCspNonceFromHeaders(headers)).toBe('abc123');
  });

  it('getCspNonceFromHeaders returns null when absent', () => {
    const headers = new Headers();
    expect(getCspNonceFromHeaders(headers)).toBeNull();
  });
});

describe('lib/security input sanitization', () => {
  it('sanitizeString escapes HTML special chars', () => {
    expect(sanitizeString('<script>alert(1)</script>')).not.toContain('<script>');
    expect(sanitizeString('a&b')).toContain('&amp;');
    expect(sanitizeString("'quote'")).toContain('&#x27;');
  });

  it('sanitizeString returns empty for non-string', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeString(123 as any)).toBe('');
  });

  it('sanitizeObject recurses into nested objects and arrays', () => {
    const out = sanitizeObject({
      a: '<b>x</b>',
      nested: { b: '<c>y</c>' },
      arr: ['<d>z</d>', { c: '<e>w</e>' }, 42],
    });
    expect(out.a).not.toContain('<b>');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((out.nested as any).b).not.toContain('<c>');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((out.arr as any)[0]).not.toContain('<d>');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((out.arr as any)[1].c).not.toContain('<e>');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((out.arr as any)[2]).toBe(42);
  });

  it('stripHtml removes tags', () => {
    expect(stripHtml('<b>hi</b>')).toBe('hi');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(stripHtml(undefined as any)).toBe('');
  });

  it('sanitizeUrl accepts http/https, rejects javascript:', () => {
    expect(sanitizeUrl('https://example.com/x')).toContain('https://example.com');
    expect(sanitizeUrl('http://example.com/x')).toContain('http://example.com');
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('not a url')).toBeNull();
  });
});

describe('lib/security SQL / IP / size helpers', () => {
  it('hasSqlInjection detects common patterns', () => {
    expect(hasSqlInjection("SELECT * FROM users")).toBe(true);
    expect(hasSqlInjection("1 OR 1=1")).toBe(true);
    expect(hasSqlInjection("'; DROP TABLE x;--")).toBe(true);
    expect(hasSqlInjection('hello world')).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(hasSqlInjection(123 as any)).toBe(false);
  });

  it('escapeSql escapes quotes and control chars', () => {
    expect(escapeSql("o'reilly")).toBe("o''reilly");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(escapeSql(null as any)).toBe('');
  });

  it('getClientIP reads x-forwarded-for first', () => {
    const req = new NextRequest('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIP(req)).toBe('1.2.3.4');
  });

  it('getClientIP falls back to x-real-ip', () => {
    const req = new NextRequest('http://localhost', {
      headers: { 'x-real-ip': '9.9.9.9' },
    });
    expect(getClientIP(req)).toBe('9.9.9.9');
  });

  it('getClientIP defaults to 127.0.0.1', () => {
    const req = new NextRequest('http://localhost');
    expect(getClientIP(req)).toBe('127.0.0.1');
  });

  it('validateRequestSize honors max and treats null as allowed', () => {
    expect(validateRequestSize(null, 100)).toBe(true);
    expect(validateRequestSize(50, 100)).toBe(true);
    expect(validateRequestSize(101, 100)).toBe(false);
  });

  it('isBlockedIP checks membership', () => {
    expect(isBlockedIP('1.2.3.4', ['1.2.3.4', '5.5.5.5'])).toBe(true);
    expect(isBlockedIP('9.9.9.9', ['1.2.3.4'])).toBe(false);
  });
});

describe('lib/security hash + HMAC helpers', () => {
  it('secureHash produces stable sha256 hex', () => {
    const h1 = secureHash('hello');
    const h2 = secureHash('hello');
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });

  it('secureHash with salt diverges from no-salt', () => {
    const h1 = secureHash('hello');
    const h2 = secureHash('hello', 'pepper');
    expect(h1).not.toBe(h2);
  });

  it('generateHMAC + verifyHMAC roundtrips', () => {
    const sig = generateHMAC('payload', 'secret');
    expect(verifyHMAC('payload', 'secret', sig)).toBe(true);
  });

  it('verifyHMAC fails for tampered signature (same length)', () => {
    const sig = generateHMAC('payload', 'secret');
    const tampered =
      (sig[0] === '0' ? '1' : '0') + sig.slice(1); // preserve length for timingSafeEqual
    expect(verifyHMAC('payload', 'secret', tampered)).toBe(false);
  });

  it('generateSecureToken returns hex of expected length', () => {
    const t = generateSecureToken(16);
    expect(t).toMatch(/^[a-f0-9]{32}$/); // 16 bytes -> 32 hex chars
    const t2 = generateSecureToken();
    expect(t2).toMatch(/^[a-f0-9]{64}$/); // default 32 bytes -> 64 hex
  });
});
