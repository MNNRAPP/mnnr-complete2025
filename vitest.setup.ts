import { afterEach, vi } from 'vitest';

// React Testing Library + jest-dom matchers — only loaded when component
// tests opt into jsdom via environmentMatchGlobs in vitest.config.ts.
// Node-only suites in lib/ + app/api/ don't need RTL.

// jest-dom registers extended matchers (toBeInTheDocument, toHaveClass, etc.)
// via side effect on import. This MUST use ESM `import` — the package's
// /vitest entry refuses to load via CommonJS require().
import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
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
process.env.CLERK_SECRET_KEY = 'sk_test_dummy';
process.env.CLERK_PUBLISHABLE_KEY = 'pk_test_dummy';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_dummy';
