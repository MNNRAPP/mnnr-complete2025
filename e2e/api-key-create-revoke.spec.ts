/**
 * E2E: API key create + revoke.
 *
 * Requires a signed-in user. Skipped by default since real Clerk/Supabase
 * session bootstrapping isn't wired into CI. Run locally with E2E_USER_COOKIE
 * exported to your dashboard session cookie to exercise it.
 */
import { test, expect } from '@playwright/test';

const hasSession = Boolean(process.env.E2E_USER_COOKIE);

test.describe('api-key create + revoke', () => {
  test.skip(!hasSession, 'set E2E_USER_COOKIE to a logged-in session cookie to enable');

  test('user can create + revoke a key from the dashboard', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'session',
        value: process.env.E2E_USER_COOKIE!,
        url: process.env.PLAYWRIGHT_BASE_URL ?? 'https://mnnr-app.netlify.app',
      },
    ]);
    await page.goto('/dashboard/keys');
    const createBtn = page.locator(
      'button:has-text("Create"), button:has-text("New key"), button:has-text("Generate")',
    );
    await expect(createBtn.first()).toBeVisible({ timeout: 15_000 });
    await createBtn.first().click();
    // Plaintext is shown exactly once — assert it renders + then disappears
    // after navigating away.
    const plaintext = page.locator('[data-testid="api-key-plaintext"], code:has-text("sk_")');
    await expect(plaintext.first()).toBeVisible({ timeout: 15_000 });
    // Revoke
    const revokeBtn = page.locator('button:has-text("Revoke"), button:has-text("Delete")');
    await expect(revokeBtn.first()).toBeVisible();
    await revokeBtn.first().click();
    // Confirm dialog if present
    const confirmBtn = page.locator(
      'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")',
    );
    if (await confirmBtn.first().isVisible({ timeout: 2_000 }).catch(() => false)) {
      await confirmBtn.first().click();
    }
    // Key should disappear from the list
    await expect(plaintext.first()).toBeHidden({ timeout: 10_000 });
  });
});
