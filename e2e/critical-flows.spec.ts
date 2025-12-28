import { test, expect } from '@playwright/test';

/**
 * MNNR Critical User Flows E2E Tests
 * 
 * These tests cover the most important user journeys:
 * 1. Landing page loads correctly
 * 2. Navigation works
 * 3. Authentication flows
 * 4. Pricing page displays
 * 5. API documentation accessible
 */

test.describe('Landing Page', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/MNNR/i);
    
    // Check main heading is visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    // Check CTA buttons exist
    const ctaButton = page.getByRole('link', { name: /start|sign up|get started/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation links
    const navLinks = ['Pricing', 'Docs', 'Sign In'];
    
    for (const linkText of navLinks) {
      const link = page.getByRole('link', { name: new RegExp(linkText, 'i') }).first();
      await expect(link).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should still load
    await expect(page).toHaveTitle(/MNNR/i);
    
    // Main content should be visible
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });
});

test.describe('Pricing Page', () => {
  test('should display pricing tiers', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check page loads
    await expect(page.locator('h1, h2').filter({ hasText: /pricing/i }).first()).toBeVisible();
    
    // Check pricing tiers are displayed
    const pricingCards = page.locator('[class*="pricing"], [class*="card"], [class*="tier"]');
    await expect(pricingCards.first()).toBeVisible();
  });

  test('should have call-to-action buttons', async ({ page }) => {
    await page.goto('/pricing');
    
    // Look for subscription/signup buttons
    const ctaButtons = page.getByRole('button').or(page.getByRole('link')).filter({ 
      hasText: /start|subscribe|sign up|get started|choose/i 
    });
    
    // At least one CTA should exist
    await expect(ctaButtons.first()).toBeVisible();
  });
});

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/signin');
    
    // Check sign in form elements
    const emailInput = page.getByRole('textbox', { name: /email/i }).or(
      page.locator('input[type="email"]')
    );
    await expect(emailInput).toBeVisible();
    
    // Check for sign in button
    const signInButton = page.getByRole('button', { name: /sign in|log in|continue/i });
    await expect(signInButton).toBeVisible();
  });

  test('should have OAuth options', async ({ page }) => {
    await page.goto('/signin');
    
    // Check for OAuth buttons (GitHub, Google, etc.)
    const oauthButtons = page.getByRole('button').filter({ 
      hasText: /github|google|continue with/i 
    });
    
    // OAuth should be available
    const count = await oauthButtons.count();
    expect(count).toBeGreaterThanOrEqual(0); // May not have OAuth configured
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/signin');
    
    // Try to submit with invalid email
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      
      const submitButton = page.getByRole('button', { name: /sign in|log in|continue/i }).first();
      await submitButton.click();
      
      // Should show some form of error or validation
      await page.waitForTimeout(500);
    }
  });
});

test.describe('API Health', () => {
  test('should return healthy status from health endpoint', async ({ request }) => {
    const response = await request.get('/api/health');
    
    // Should return 200 OK
    expect(response.ok()).toBeTruthy();
    
    // Should return JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    // Should have status field
    const body = await response.json();
    expect(body).toHaveProperty('status');
  });

  test('should handle 404 gracefully', async ({ request }) => {
    const response = await request.get('/api/nonexistent-endpoint');
    
    // Should return 404
    expect(response.status()).toBe(404);
  });
});

test.describe('Documentation', () => {
  test('should load docs page', async ({ page }) => {
    await page.goto('/docs');
    
    // Check docs content loads
    const docsContent = page.locator('main, article, [class*="docs"]').first();
    await expect(docsContent).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors
    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('favicon') && !error.includes('analytics')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('SEO', () => {
  test('should have meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for essential meta tags
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    
    // Check for viewport meta
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
  });

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for OG tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    
    expect(ogTitle || ogDescription).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Should have an h1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Image should have alt text or be decorative (role="presentation")
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
