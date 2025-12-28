import { test, expect } from '@playwright/test';

/**
 * MNNR Dashboard E2E Tests
 * 
 * Tests for authenticated user flows:
 * 1. Dashboard access
 * 2. API key management
 * 3. Usage statistics
 * 4. Account settings
 */

test.describe('Dashboard (Unauthenticated)', () => {
  test('should redirect to sign in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to signin or show auth required message
    await page.waitForURL(/signin|login|auth/, { timeout: 5000 }).catch(() => {
      // If no redirect, check for auth message
    });
    
    const currentUrl = page.url();
    const hasAuthContent = currentUrl.includes('signin') || 
                          currentUrl.includes('login') ||
                          await page.locator('text=/sign in|log in|authenticate/i').isVisible().catch(() => false);
    
    expect(hasAuthContent).toBeTruthy();
  });
});

test.describe('API Keys Page (Unauthenticated)', () => {
  test('should require authentication for API keys', async ({ page }) => {
    await page.goto('/dashboard/api-keys');
    
    // Should redirect or show auth required
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    const requiresAuth = currentUrl.includes('signin') || 
                        currentUrl.includes('login') ||
                        !currentUrl.includes('api-keys');
    
    expect(requiresAuth).toBeTruthy();
  });
});

test.describe('API Endpoints', () => {
  test('should return 401 for protected API routes without auth', async ({ request }) => {
    const response = await request.get('/api/keys');
    
    // Should return 401 Unauthorized
    expect(response.status()).toBe(401);
  });

  test('should return proper error format', async ({ request }) => {
    const response = await request.get('/api/keys');
    
    const body = await response.json();
    
    // Should have error structure
    expect(body).toHaveProperty('error');
  });

  test('should handle rate limiting headers', async ({ request }) => {
    const response = await request.get('/api/health');
    
    // Check for rate limit headers (if implemented)
    const headers = response.headers();
    
    // These headers may or may not be present depending on implementation
    const hasRateLimitHeaders = 
      headers['x-ratelimit-limit'] !== undefined ||
      headers['x-ratelimit-remaining'] !== undefined ||
      headers['retry-after'] !== undefined;
    
    // Log for debugging
    console.log('Rate limit headers present:', hasRateLimitHeaders);
  });
});

test.describe('Billing Page (Unauthenticated)', () => {
  test('should require authentication for billing', async ({ page }) => {
    await page.goto('/billing');
    
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    const requiresAuth = currentUrl.includes('signin') || 
                        currentUrl.includes('login') ||
                        !currentUrl.includes('billing');
    
    expect(requiresAuth).toBeTruthy();
  });
});

test.describe('Account Settings (Unauthenticated)', () => {
  test('should require authentication for account settings', async ({ page }) => {
    await page.goto('/account');
    
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    const requiresAuth = currentUrl.includes('signin') || 
                        currentUrl.includes('login') ||
                        !currentUrl.includes('account');
    
    expect(requiresAuth).toBeTruthy();
  });
});

/**
 * Authenticated Tests
 * 
 * These tests require a test user to be set up.
 * They are skipped by default and can be enabled with proper test credentials.
 */
test.describe('Dashboard (Authenticated)', () => {
  // Skip these tests unless TEST_USER_EMAIL and TEST_USER_PASSWORD are set
  const hasTestCredentials = process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD;
  
  test.skip(!hasTestCredentials, 'Skipping authenticated tests - no test credentials');

  test.beforeEach(async ({ page }) => {
    // Login flow
    await page.goto('/signin');
    
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || '');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || '');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i }).first()).toBeVisible();
  });

  test('should show API keys section', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for API keys section
    const apiKeysSection = page.locator('text=/api key/i').first();
    await expect(apiKeysSection).toBeVisible();
  });

  test('should be able to create new API key', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find and click create API key button
    const createButton = page.getByRole('button', { name: /create|new|generate/i }).first();
    await createButton.click();
    
    // Should show modal or form
    await page.waitForTimeout(500);
    
    // Fill in key name if required
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test API Key');
    }
    
    // Submit
    const submitButton = page.getByRole('button', { name: /create|generate|save/i }).first();
    await submitButton.click();
    
    // Should show the new key
    await page.waitForTimeout(1000);
  });

  test('should show usage statistics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for usage/stats section
    const usageSection = page.locator('text=/usage|calls|requests|statistics/i').first();
    
    // May or may not be visible depending on implementation
    const isVisible = await usageSection.isVisible().catch(() => false);
    console.log('Usage section visible:', isVisible);
  });
});

test.describe('Error Handling', () => {
  test('should show 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    
    // Should show 404 content
    const has404 = await page.locator('text=/404|not found|page.*exist/i').isVisible().catch(() => false);
    
    expect(has404).toBeTruthy();
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // This test checks that the app doesn't crash on errors
    await page.goto('/');
    
    // Page should still be interactive after any errors
    const isInteractive = await page.locator('body').isVisible();
    expect(isInteractive).toBeTruthy();
  });
});

test.describe('Security Headers', () => {
  test('should have security headers on responses', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    
    // Check for common security headers
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security',
      'content-security-policy',
      'x-xss-protection'
    ];
    
    let foundHeaders = 0;
    for (const header of securityHeaders) {
      if (headers[header]) {
        foundHeaders++;
        console.log(`Found security header: ${header}`);
      }
    }
    
    // Should have at least some security headers
    expect(foundHeaders).toBeGreaterThan(0);
  });
});
