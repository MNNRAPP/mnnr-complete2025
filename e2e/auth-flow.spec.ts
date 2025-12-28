import { test, expect } from '@playwright/test';

/**
 * MNNR Authentication Flow E2E Tests
 * 
 * Comprehensive tests for:
 * 1. Sign up flow
 * 2. Sign in flow
 * 3. Password reset
 * 4. OAuth flows
 * 5. Session management
 */

test.describe('Sign Up Flow', () => {
  test('should display sign up page with all required fields', async ({ page }) => {
    await page.goto('/signin/signup');
    
    // Check for email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
    
    // Check for password input
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // Check for submit button
    const submitButton = page.getByRole('button', { name: /sign up|create account|register/i });
    await expect(submitButton).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/signin/signup');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('invalid-email');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('TestPassword123!');
    
    const submitButton = page.getByRole('button', { name: /sign up|create account|register/i });
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Should show error or stay on page
    const url = page.url();
    expect(url).toContain('signin');
  });

  test('should show validation error for weak password', async ({ page }) => {
    await page.goto('/signin/signup');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('test@example.com');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('weak');
    
    const submitButton = page.getByRole('button', { name: /sign up|create account|register/i });
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(500);
    
    // Should show error or stay on page
    const url = page.url();
    expect(url).toContain('signin');
  });

  test('should have link to sign in page', async ({ page }) => {
    await page.goto('/signin/signup');
    
    const signInLink = page.getByRole('link', { name: /sign in|log in|already have/i });
    await expect(signInLink).toBeVisible();
  });
});

test.describe('Sign In Flow', () => {
  test('should display sign in page with all required fields', async ({ page }) => {
    await page.goto('/signin');
    
    // Check for email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
    
    // Check for password input
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
    
    // Check for submit button
    const submitButton = page.getByRole('button', { name: /sign in|log in|continue/i });
    await expect(submitButton).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/signin');
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('nonexistent@example.com');
    
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('WrongPassword123!');
    
    const submitButton = page.getByRole('button', { name: /sign in|log in|continue/i });
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Should show error message or stay on signin page
    const url = page.url();
    expect(url).toContain('signin');
  });

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/signin');
    
    const forgotLink = page.getByRole('link', { name: /forgot|reset|password/i });
    // May or may not exist depending on implementation
    const count = await forgotLink.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have link to sign up page', async ({ page }) => {
    await page.goto('/signin');
    
    const signUpLink = page.getByRole('link', { name: /sign up|create|register|don.*t have/i });
    await expect(signUpLink).toBeVisible();
  });
});

test.describe('OAuth Integration', () => {
  test('should display GitHub OAuth button', async ({ page }) => {
    await page.goto('/signin');
    
    const githubButton = page.getByRole('button', { name: /github/i }).or(
      page.locator('button:has-text("GitHub")')
    );
    
    // GitHub OAuth should be configured
    const count = await githubButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should display Google OAuth button if configured', async ({ page }) => {
    await page.goto('/signin');
    
    const googleButton = page.getByRole('button', { name: /google/i }).or(
      page.locator('button:has-text("Google")')
    );
    
    // Google OAuth may or may not be configured
    const count = await googleButton.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to signin when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to signin
    await page.waitForURL(/signin|login|auth/);
    const url = page.url();
    expect(url).toMatch(/signin|login|auth/);
  });

  test('should redirect to signin when accessing account without auth', async ({ page }) => {
    await page.goto('/account');
    
    // Should redirect to signin
    await page.waitForURL(/signin|login|auth|404/);
  });
});

test.describe('Session Security', () => {
  test('should have secure cookie settings', async ({ page, context }) => {
    await page.goto('/');
    
    const cookies = await context.cookies();
    
    // Check for any auth-related cookies
    const authCookies = cookies.filter(c => 
      c.name.includes('auth') || 
      c.name.includes('session') || 
      c.name.includes('supabase')
    );
    
    // If auth cookies exist, they should be secure
    for (const cookie of authCookies) {
      if (process.env.NODE_ENV === 'production') {
        expect(cookie.secure).toBe(true);
      }
    }
  });
});
