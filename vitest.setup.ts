import { afterEach, vi } from 'vitest';

// React Testing Library is optional — only loaded when component tests opt into jsdom.
// We try-load so node-only suites don't blow up on missing peer deps.
let cleanup: (() => void) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  const rtl = require('@testing-library/react');
  cleanup = rtl.cleanup;
} catch {
  // No-op — not running React component tests in this worker.
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@testing-library/jest-dom/vitest');
} catch {
  // No-op.
}

// Cleanup after each test
afterEach(() => {
  if (cleanup) cleanup();
  vi.clearAllMocks();
});

// Mock environment variables — must be set before any module under test reads them.
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key-min-20-chars';
process.env.UPSTASH_REDIS_REST_URL = 'https://test-redis.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token-16chars';
process.env.CSRF_SECRET = 'test-csrf-secret-with-enough-entropy-32+';
process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';
process.env.RESEND_API_KEY = 're_test_key';
process.env.NEON_DATABASE_URL = 'postgres://user:pass@localhost:5432/test';
