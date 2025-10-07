/**
 * Environment variable validation
 * Ensures all required env vars are set before app starts
 */

// Keep the global required set minimal so the app doesn't crash in production
// when optional backend integrations are not yet configured. Specific routes
// (like /api/webhooks) will still check their own required secrets at runtime.
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const;

const optionalEnvVars = [
  'NEXT_PUBLIC_SITE_URL',
  'TRIAL_PERIOD_DAYS',
  // Redis for distributed rate limiting
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  // Sentry for error monitoring
  'SENTRY_DSN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
  // Log aggregation
  'LOG_LEVEL',
  'ENABLE_LOG_AGGREGATION'
] as const;

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate environment variables
 * @throws Error if critical env vars are missing
 */
export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Stripe secrets: allow either STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_LIVE
  const hasStripeSecret = Boolean(
    process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_LIVE
  );
  if (!hasStripeSecret) {
    warnings.push(
      'Stripe secret key not set (STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_LIVE). Stripe features will be disabled.'
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    warnings.push(
      'Stripe webhook secret (STRIPE_WEBHOOK_SECRET) not set. Webhook endpoint /api/webhooks will return 500.'
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push(
      'SUPABASE_SERVICE_ROLE_KEY not set. Admin operations (e.g., in Stripe webhook handlers) will not function.'
    );
  }

  // Check for common mistakes
  if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push(
      'WARNING: Found NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY - this exposes admin privileges! Use SUPABASE_SERVICE_ROLE_KEY instead.'
    );
  }

  if (process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY) {
    warnings.push(
      'CRITICAL: Found NEXT_PUBLIC_STRIPE_SECRET_KEY - this exposes your Stripe secret key! Use STRIPE_SECRET_KEY instead.'
    );
  }

  // Validate URL formats
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    } catch {
      warnings.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    }
  }

  // Check webhook secret length
  if (process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET.length < 20) {
    warnings.push('STRIPE_WEBHOOK_SECRET appears to be too short');
  }

  const result: ValidationResult = {
    valid: missing.length === 0 && warnings.filter(w => w.includes('CRITICAL')).length === 0,
    missing,
    warnings
  };

  return result;
}

/**
 * Validate and throw if environment is invalid
 * Call this at app startup
 */
export function assertValidEnv(): void {
  const result = validateEnv();

  if (result.warnings.length > 0) {
    result.warnings.forEach(warning => {
      console.warn(`⚠️  ${warning}`);
    });
  }

  if (!result.valid) {
    const errorMessage = [
      '❌ Environment validation failed!',
      '',
      'Missing required environment variables:',
      ...result.missing.map(key => `  - ${key}`),
      '',
      'Please check your .env.local file and ensure all required variables are set.',
      'See .env.local.example for reference.'
    ].join('\n');

    throw new Error(errorMessage);
  }

  console.log('✅ Environment variables validated successfully');
}

/**
 * Get environment variable with runtime validation
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set and has no default value`);
  }

  return value || defaultValue!;
}

/**
 * Type-safe environment variable access
 */
export const env = {
  supabase: {
    url: () => getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: () => getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: () => getEnv('SUPABASE_SERVICE_ROLE_KEY')
  },
  stripe: {
    secretKey: () => getEnv('STRIPE_SECRET_KEY'),
    webhookSecret: () => getEnv('STRIPE_WEBHOOK_SECRET')
  },
  site: {
    url: () => getEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000')
  },
  trial: {
    periodDays: () => parseInt(getEnv('TRIAL_PERIOD_DAYS', '0'), 10)
  },
  redis: {
    url: () => process.env.UPSTASH_REDIS_REST_URL,
    token: () => process.env.UPSTASH_REDIS_REST_TOKEN
  },
  sentry: {
    dsn: () => process.env.SENTRY_DSN,
    org: () => process.env.SENTRY_ORG,
    project: () => process.env.SENTRY_PROJECT
  },
  logging: {
    level: () => getEnv('LOG_LEVEL', 'info'),
    enableAggregation: () => getEnv('ENABLE_LOG_AGGREGATION', 'false') === 'true'
  }
};
