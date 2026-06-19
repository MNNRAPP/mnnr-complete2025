/**
 * E2E: newsletter double-opt-in surface.
 *
 * Verifies the public /api/newsletter endpoint returns the enumeration-resistant
 * generic shape regardless of input. This is a SAFETY test, not a happy-path
 * onboarding test — exercising real Resend email send from CI would generate
 * deliverability noise.
 */
import { test, expect } from '@playwright/test';

test.describe('newsletter enumeration-resistance', () => {
  test('POST /api/newsletter returns the same generic shape for missing token + invalid email', async ({
    request,
  }) => {
    // Note: the endpoint requires Turnstile in production. In a deployed env
    // we expect 200 generic for any malformed input (enumeration-resistant);
    // if the API is gated by Turnstile and returns 429/403, that is also
    // acceptable — what we MUST NOT see is a distinguishable success for one
    // input vs another.
    const r1 = await request.post('/api/newsletter', {
      data: { email: 'not-a-real-email' },
    });
    const r2 = await request.post('/api/newsletter', {
      data: { email: 'another-bad-email@@nowhere' },
    });
    expect([200, 429, 403, 503]).toContain(r1.status());
    expect([200, 429, 403, 503]).toContain(r2.status());
    if (r1.status() === 200 && r2.status() === 200) {
      const b1 = await r1.json();
      const b2 = await r2.json();
      // Generic message must NOT include the input email (would defeat
      // enumeration-resistance).
      expect(b1.message).toBeDefined();
      expect(b1.message).toEqual(b2.message);
    }
  });
});
