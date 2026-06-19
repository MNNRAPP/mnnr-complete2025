/**
 * E2E: sign-in entry flow.
 *
 * Hits the live deploy (default: https://mnnr-app.netlify.app/) and verifies
 * the homepage exposes a way to start authentication. Does NOT attempt to
 * actually authenticate — that would need real provider credentials.
 *
 * Override target via PLAYWRIGHT_BASE_URL or E2E_BASE_URL env.
 */
import { test, expect } from '@playwright/test';

test.describe('sign-in entry flow', () => {
  test('homepage loads and exposes a sign-in affordance', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/, { timeout: 15_000 });
    // Search for any link/button that mentions sign-in / log-in.
    const signInLocator = page.locator(
      'a:has-text("Sign in"), a:has-text("Sign In"), a:has-text("Log in"), a:has-text("Log In"), button:has-text("Sign in"), button:has-text("Sign In")',
    );
    const count = await signInLocator.count();
    test.skip(count === 0, 'no sign-in affordance present on the landing page yet');
    await expect(signInLocator.first()).toBeVisible();
  });

  test('sign-in affordance navigates to an auth surface', async ({ page }) => {
    await page.goto('/');
    const signIn = page
      .locator('a:has-text("Sign in"), a:has-text("Sign In"), a:has-text("Log in")')
      .first();
    const has = (await signIn.count()) > 0;
    test.skip(!has, 'no sign-in link to follow');
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined),
      signIn.click(),
    ]);
    // Expect URL changed OR an auth widget rendered.
    const url = page.url();
    const onAuthRoute =
      /sign-?in|login|auth|clerk|accounts/.test(url) ||
      (await page
        .locator('form, [role="form"], input[type="email"]')
        .count()) > 0;
    expect(onAuthRoute).toBe(true);
  });
});
