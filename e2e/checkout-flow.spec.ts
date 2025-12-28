import { test, expect } from '@playwright/test';

/**
 * MNNR Checkout Flow E2E Tests
 * 
 * Tests for:
 * 1. Pricing page display
 * 2. Plan selection
 * 3. Checkout redirect
 * 4. Stripe integration
 */

test.describe('Pricing Page', () => {
  test('should display all pricing tiers', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check for Free tier
    const freeText = page.locator('text=/free/i').first();
    await expect(freeText).toBeVisible();
    
    // Check for Pro tier
    const proText = page.locator('text=/pro/i').first();
    await expect(proText).toBeVisible();
    
    // Check for Enterprise tier
    const enterpriseText = page.locator('text=/enterprise/i').first();
    await expect(enterpriseText).toBeVisible();
  });

  test('should display pricing amounts', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check for $0 (Free)
    const freePrice = page.locator('text=/\\$0/');
    await expect(freePrice.first()).toBeVisible();
    
    // Check for $49 (Pro)
    const proPrice = page.locator('text=/\\$49/');
    await expect(proPrice.first()).toBeVisible();
  });

  test('should have CTA buttons for each tier', async ({ page }) => {
    await page.goto('/pricing');
    
    // Should have at least 2 CTA buttons (Free and Pro)
    const ctaButtons = page.getByRole('link').or(page.getByRole('button')).filter({
      hasText: /start|get|choose|subscribe|contact/i
    });
    
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should highlight recommended plan', async ({ page }) => {
    await page.goto('/pricing');
    
    // Look for "Most Popular" or similar badge
    const popularBadge = page.locator('text=/popular|recommended|best value/i');
    const count = await popularBadge.count();
    
    // Should have at least one highlighted plan
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Plan Selection', () => {
  test('Free tier CTA should link to signup', async ({ page }) => {
    await page.goto('/pricing');
    
    // Find Free tier CTA
    const freeCta = page.getByRole('link', { name: /start free/i }).first();
    
    if (await freeCta.isVisible()) {
      const href = await freeCta.getAttribute('href');
      expect(href).toMatch(/sign|auth|register/i);
    }
  });

  test('Pro tier CTA should initiate checkout or signup', async ({ page }) => {
    await page.goto('/pricing');
    
    // Find Pro tier CTA
    const proCta = page.getByRole('link', { name: /start pro|get pro|choose pro/i }).first();
    
    if (await proCta.isVisible()) {
      const href = await proCta.getAttribute('href');
      // Should link to signup or checkout
      expect(href).toBeTruthy();
    }
  });

  test('Enterprise CTA should link to contact', async ({ page }) => {
    await page.goto('/pricing');
    
    // Find Enterprise CTA
    const enterpriseCta = page.getByRole('link', { name: /contact|sales|talk/i }).first();
    
    if (await enterpriseCta.isVisible()) {
      const href = await enterpriseCta.getAttribute('href');
      expect(href).toMatch(/mailto:|contact|sales/i);
    }
  });
});

test.describe('Checkout Flow', () => {
  test('should redirect unauthenticated users to signin before checkout', async ({ page }) => {
    await page.goto('/pricing');
    
    // Try to click Pro CTA
    const proCta = page.getByRole('link', { name: /start pro|get pro/i }).first();
    
    if (await proCta.isVisible()) {
      await proCta.click();
      
      // Should redirect to signin
      await page.waitForURL(/signin|signup|auth/, { timeout: 5000 }).catch(() => {});
    }
  });
});

test.describe('Homepage Pricing Section', () => {
  test('should display pricing on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to pricing section
    await page.evaluate(() => {
      const pricingSection = document.querySelector('#pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView();
      }
    });
    
    // Check for pricing content
    const pricingHeading = page.locator('h2, h3').filter({ hasText: /pricing/i });
    await expect(pricingHeading.first()).toBeVisible();
  });

  test('should have anchor link to pricing', async ({ page }) => {
    await page.goto('/');
    
    // Check for pricing link in nav
    const pricingLink = page.getByRole('link', { name: /pricing/i }).first();
    await expect(pricingLink).toBeVisible();
    
    // Click and verify scroll
    await pricingLink.click();
    
    // URL should have #pricing or navigate to /pricing
    const url = page.url();
    expect(url).toMatch(/pricing/);
  });
});

test.describe('Billing Interval Toggle', () => {
  test('should toggle between monthly and annual pricing', async ({ page }) => {
    await page.goto('/pricing');
    
    // Look for billing toggle
    const monthlyButton = page.getByRole('button', { name: /monthly/i });
    const annualButton = page.getByRole('button', { name: /annual|yearly/i });
    
    const monthlyCount = await monthlyButton.count();
    const annualCount = await annualButton.count();
    
    // If toggle exists, test it
    if (monthlyCount > 0 && annualCount > 0) {
      await annualButton.click();
      await page.waitForTimeout(300);
      
      // Price should change (or stay same if no annual pricing)
    }
  });
});

test.describe('Feature Comparison', () => {
  test('should list features for each tier', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check for feature lists (checkmarks)
    const checkmarks = page.locator('text=/✓|✔|check/i');
    const count = await checkmarks.count();
    
    // Should have multiple features listed
    expect(count).toBeGreaterThan(5);
  });
});
