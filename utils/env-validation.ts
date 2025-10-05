/**
 * Environment variable validation
 * Ensures all required env vars are set before app starts
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET'
] as const;

const optionalEnvVars = [
  'NEXT_PUBLIC_SITE_URL',
  'TRIAL_PERIOD_DAYS'
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
  }
};
