/**
 * Integration tests for app/api/csp-report
 *
 * The route is fire-and-forget: it must always 204, never 4xx, never 5xx —
 * browsers retry aggressively on non-2xx CSP reports.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

describe('/api/csp-report POST', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('returns 204 for an empty body', async () => {
    const { POST } = await import('@/app/api/csp-report/route');
    const req = new NextRequest('http://localhost/api/csp-report', {
      method: 'POST',
      body: '',
    });
    const res = await POST(req);
    expect(res.status).toBe(204);
  });

  it('returns 204 for a legacy csp-report payload', async () => {
    const { POST } = await import('@/app/api/csp-report/route');
    const payload = {
      'csp-report': {
        'document-uri': 'https://mnnr.app/',
        'violated-directive': "script-src 'self'",
        'blocked-uri': 'https://evil.example/x.js',
      },
    };
    const req = new NextRequest('http://localhost/api/csp-report', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await POST(req);
    expect(res.status).toBe(204);
  });

  it('returns 204 for a Reporting-API envelope', async () => {
    const { POST } = await import('@/app/api/csp-report/route');
    const payload = [
      {
        type: 'csp-violation',
        body: {
          documentURL: 'https://mnnr.app/',
          effectiveDirective: 'script-src',
          blockedURL: 'https://evil.example/x.js',
        },
      },
    ];
    const req = new NextRequest('http://localhost/api/csp-report', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const res = await POST(req);
    expect(res.status).toBe(204);
  });

  it('returns 204 for malformed JSON (does not 4xx)', async () => {
    const { POST } = await import('@/app/api/csp-report/route');
    const req = new NextRequest('http://localhost/api/csp-report', {
      method: 'POST',
      body: 'this is not json {{{',
    });
    const res = await POST(req);
    expect(res.status).toBe(204);
  });

  it('returns 204 for an oversized payload (no error)', async () => {
    const { POST } = await import('@/app/api/csp-report/route');
    const big = JSON.stringify({
      'csp-report': { sample: 'x'.repeat(20_000) },
    });
    const req = new NextRequest('http://localhost/api/csp-report', {
      method: 'POST',
      body: big,
    });
    const res = await POST(req);
    expect(res.status).toBe(204);
  });
});

describe('/api/csp-report OPTIONS', () => {
  it('preflight returns 204 with Allow header', async () => {
    const { OPTIONS } = await import('@/app/api/csp-report/route');
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get('Allow')).toContain('POST');
  });
});
