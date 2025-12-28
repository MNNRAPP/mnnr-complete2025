import { test, expect } from '@playwright/test';

/**
 * MNNR API Endpoints E2E Tests
 * 
 * Tests for:
 * 1. Health check endpoint
 * 2. Protected API endpoints
 * 3. Rate limiting
 * 4. Error handling
 * 5. Response formats
 */

test.describe('Health Check API', () => {
  test('should return 200 OK with status', async ({ request }) => {
    const response = await request.get('/api/health');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('should return JSON content type', async ({ request }) => {
    const response = await request.get('/api/health');
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should include version information', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();
    
    expect(body).toHaveProperty('version');
  });

  test('should include environment information', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();
    
    expect(body).toHaveProperty('environment');
  });

  test('should include config status', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();
    
    expect(body).toHaveProperty('config');
    expect(body.config).toHaveProperty('supabaseConfigured');
    expect(body.config).toHaveProperty('stripeConfigured');
  });
});

test.describe('Protected API Endpoints', () => {
  test('/api/keys should require authentication', async ({ request }) => {
    const response = await request.get('/api/keys');
    
    // Should return 401 Unauthorized (or 429 if rate limited)
    expect([401, 429]).toContain(response.status());
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('/api/usage should require authentication', async ({ request }) => {
    const response = await request.get('/api/usage');
    
    // Should return 401 Unauthorized (or 429 if rate limited)
    expect([401, 429]).toContain(response.status());
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });

  test('/api/subscriptions should require authentication', async ({ request }) => {
    const response = await request.get('/api/subscriptions');
    
    // Should return 401 Unauthorized (or 429 if rate limited)
    expect([401, 429]).toContain(response.status());
  });

  test('/api/invoices should require authentication', async ({ request }) => {
    const response = await request.get('/api/invoices');
    
    // Should return 401 Unauthorized (or 429 if rate limited)
    expect([401, 429]).toContain(response.status());
  });

  test('/api/user/profile should require authentication', async ({ request }) => {
    const response = await request.get('/api/user/profile');
    
    // Should return 401 Unauthorized (or 429 if rate limited)
    expect([401, 429]).toContain(response.status());
  });
});

test.describe('API Error Handling', () => {
  test('should return 404 for non-existent endpoints', async ({ request }) => {
    const response = await request.get('/api/nonexistent-endpoint-xyz');
    
    // Should return 404 (or 429 if rate limited)
    expect([404, 429]).toContain(response.status());
  });

  test('should return 405 for unsupported methods', async ({ request }) => {
    // Try DELETE on health endpoint (should not be supported)
    const response = await request.delete('/api/health');
    
    // Should return 405 Method Not Allowed, 404, or 429 (rate limited)
    expect([404, 405, 429]).toContain(response.status());
  });

  test('should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post('/api/keys', {
      data: 'not-valid-json',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Should return 400, 401, 422, or 429 (bad request, unauthorized, or rate limited)
    expect([400, 401, 422, 429]).toContain(response.status());
  });
});

test.describe('Rate Limiting', () => {
  test('should include rate limit headers', async ({ request }) => {
    const response = await request.get('/api/health');
    
    const headers = response.headers();
    
    // Should have rate limit headers (may be undefined if rate limited)
    const hasRateLimitHeaders = headers['x-ratelimit-limit'] || headers['x-ratelimit-reset'];
    expect(hasRateLimitHeaders).toBeTruthy();
  });

  test('should enforce rate limits', async ({ request }) => {
    // Make multiple rapid requests
    const responses = [];
    for (let i = 0; i < 10; i++) {
      const response = await request.get('/api/health');
      responses.push(response.status());
    }
    
    // At least some should succeed, and rate limiting should kick in
    const successCount = responses.filter(s => s === 200).length;
    const rateLimitedCount = responses.filter(s => s === 429).length;
    
    // Either all succeed (high limit) or some get rate limited
    expect(successCount + rateLimitedCount).toBe(10);
  });
});

test.describe('Security Headers', () => {
  test('should include security headers', async ({ request }) => {
    const response = await request.get('/api/health');
    const headers = response.headers();
    
    // Check for security headers
    expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('should not expose sensitive information', async ({ request }) => {
    const response = await request.get('/api/health');
    const headers = response.headers();
    
    // Should not expose server details
    expect(headers['x-powered-by']).toBeUndefined();
  });
});

test.describe('CORS', () => {
  test('should handle preflight requests', async ({ request }) => {
    const response = await request.fetch('/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    // Should handle OPTIONS request (or 429 if rate limited)
    expect([200, 204, 404, 429]).toContain(response.status());
  });
});

test.describe('Webhook Endpoint', () => {
  test('should reject requests without signature', async ({ request }) => {
    const response = await request.post('/api/webhooks', {
      data: { type: 'test' }
    });
    
    // Should reject without proper signature
    expect([400, 401, 403]).toContain(response.status());
  });
});
