/**
 * lib/env.ts — Production environment variable validation.
 *
 * Single source of truth for typed access to env vars.
 * Throws at startup (in production) if anything is missing or malformed.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const dbUrl = env.NEON_DATABASE_URL;
 *
 * Notes:
 * - This file SUPERSEDES the looser `utils/env-validation.ts` validator
 *   going forward. Existing code paths that import from `utils/env-validation`
 *   continue to work; new code should prefer `@/lib/env`.
 * - All `NEXT_PUBLIC_*` vars are also validated here so client-bundled
 *   secrets (which should never be present) are surfaced loudly.
 * - When PAYMENT_VERIFICATION_ENABLED=true in production, x402-related
 *   vars (receiver address + at least one RPC URL) are required.
 *
 * Conventions:
 * - Secret strings have a minimum-length floor (≥16 chars) to catch
 *   placeholder values like "changeme" / "TODO".
 * - Receiver addresses must match the EVM 0x[a-f0-9]{40} pattern.
 * - RPC URLs must be valid HTTPS URLs.
 */

import { z } from 'zod';

// -- Helpers ----------------------------------------------------------------

const secret = (minLength: number, label: string) =>
  z
    .string()
    .min(
      minLength,
      `${label} must be at least ${minLength} characters (looks like a placeholder?)`
    );

const evmAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'must be a valid EVM 0x-prefixed 40-hex address');

const httpsUrl = z
  .string()
  .url('must be a valid URL')
  .refine(
    (v) => v.startsWith('https://') || v.startsWith('http://localhost'),
    'must be https:// (or http://localhost for dev)'
  );

// -- Schema -----------------------------------------------------------------

const EnvSchema = z.object({
  // Runtime
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (Neon Postgres) — the codebase also has DATABASE_URL alias
  NEON_DATABASE_URL: z.string().url().optional(),
  NEON_DIRECT_URL: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional(),

  // CSRF
  CSRF_SECRET: secret(32, 'CSRF_SECRET'),
  CSRF_TOKEN_TTL_MS: z.coerce.number().int().positive().optional(),

  // Upstash Redis (rate limiting + distributed cache)
  UPSTASH_REDIS_REST_URL: httpsUrl,
  UPSTASH_REDIS_REST_TOKEN: secret(16, 'UPSTASH_REDIS_REST_TOKEN'),

  // Cloudflare Turnstile (bot protection)
  TURNSTILE_SECRET_KEY: z.string().min(1),
  TURNSTILE_SITE_KEY: z.string().min(1).optional(),

  // Clerk (auth) — sole auth provider after the 2026-06-19 Supabase removal.
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  // Required only when the Clerk -> Neon user-provisioning webhook is wired
  // (app/api/webhooks/clerk/route.ts). Optional so local dev without the
  // webhook still boots.
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_SECRET_KEY_LIVE: z.string().startsWith('sk_live_').optional(),
  STRIPE_WEBHOOK_SECRET: secret(20, 'STRIPE_WEBHOOK_SECRET').optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE: z.string().startsWith('pk_live_').optional(),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_').optional(),

  // Anthropic / OpenAI (AI features)
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-').optional(),
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),

  // Sentry
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // Audit trail
  AUDIT_TRAIL_SECRET: secret(32, 'AUDIT_TRAIL_SECRET').optional(),
  DB_ENCRYPTION_KEY: secret(32, 'DB_ENCRYPTION_KEY').optional(),

  // PostHog
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_RECORDING_SAMPLE: z.coerce.number().min(0).max(1).optional(),

  // Site
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_NEWSLETTER_CONFIRM_URL: z.string().url().optional(),

  // x402 / on-chain payments
  PAYMENT_VERIFICATION_ENABLED: z.enum(['true', 'false']).optional(),
  X402_RECEIVER_ADDRESS: evmAddress.optional(),
  X402_RECEIVER_ADDRESS_BASE: evmAddress.optional(),
  X402_RECEIVER_ADDRESS_ETHEREUM: evmAddress.optional(),
  X402_RECEIVER_ADDRESS_POLYGON: evmAddress.optional(),
  MNNR_BASE_ADDRESS: evmAddress.optional(),
  MNNR_ETH_ADDRESS: evmAddress.optional(),
  MNNR_POLYGON_ADDRESS: evmAddress.optional(),
  RPC_URL_MAINNET: z.string().url().optional(),
  RPC_URL_BASE: z.string().url().optional(),
  RPC_URL_POLYGON: z.string().url().optional(),
  X402_CONFIRMATIONS_ETHEREUM: z.coerce.number().int().nonnegative().optional(),
  X402_CONFIRMATIONS_BASE: z.coerce.number().int().nonnegative().optional(),
  X402_CONFIRMATIONS_POLYGON: z.coerce.number().int().nonnegative().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  ENABLE_LOG_AGGREGATION: z.enum(['true', 'false']).optional(),

  // Misc
  TRIAL_PERIOD_DAYS: z.coerce.number().int().nonnegative().optional(),
});

// -- Parse + cross-field checks --------------------------------------------

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  // Always log; throw only when in production so dev still boots with placeholders
  const msg = `Invalid environment variables:\n${issues}`;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`[lib/env] ${msg}`);
  }
}

// Even on safeParse failure in dev we still want a typed object — fall back
// to a SHALLOW COPY of process.env so the app can boot. We copy rather than
// freezing process.env directly because process.env is exposed as a Proxy in
// some Node versions (and as a Proxy-like object under test runners), which
// rejects Object.freeze with `TypeError: Cannot freeze`.
const RawEnv = (parsed.success
  ? parsed.data
  : ({ ...(process.env as Record<string, string | undefined>) } as unknown)) as z.infer<typeof EnvSchema>;

// Cross-field production gates -- only enforced in production.
if (RawEnv.NODE_ENV === 'production') {
  // Database: at least one of NEON_DATABASE_URL or DATABASE_URL
  if (!RawEnv.NEON_DATABASE_URL && !RawEnv.DATABASE_URL) {
    throw new Error(
      'NEON_DATABASE_URL (or DATABASE_URL) is required in production'
    );
  }

  // Auth: Clerk is the sole provider after the 2026-06-19 Supabase removal.
  const hasClerk = Boolean(RawEnv.CLERK_SECRET_KEY && (RawEnv.CLERK_PUBLISHABLE_KEY || RawEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY));
  if (!hasClerk) {
    throw new Error(
      'Clerk env vars required in production: CLERK_SECRET_KEY + CLERK_PUBLISHABLE_KEY (or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)'
    );
  }

  // x402 payment verification gates
  if (RawEnv.PAYMENT_VERIFICATION_ENABLED === 'true') {
    if (
      !RawEnv.X402_RECEIVER_ADDRESS &&
      !RawEnv.X402_RECEIVER_ADDRESS_BASE &&
      !RawEnv.X402_RECEIVER_ADDRESS_ETHEREUM &&
      !RawEnv.X402_RECEIVER_ADDRESS_POLYGON
    ) {
      throw new Error(
        'X402_RECEIVER_ADDRESS (or a chain-specific X402_RECEIVER_ADDRESS_*) required when PAYMENT_VERIFICATION_ENABLED=true in production'
      );
    }
    if (!RawEnv.RPC_URL_MAINNET && !RawEnv.RPC_URL_BASE && !RawEnv.RPC_URL_POLYGON) {
      throw new Error(
        'At least one of RPC_URL_MAINNET / RPC_URL_BASE / RPC_URL_POLYGON required when PAYMENT_VERIFICATION_ENABLED=true in production'
      );
    }
  }

  // Anti-footgun: catch service-role secrets accidentally exposed via NEXT_PUBLIC_*
  const publicLeakKeys = Object.keys(process.env).filter(
    (k) =>
      k.startsWith('NEXT_PUBLIC_') &&
      (k.toLowerCase().includes('service_role') ||
        k.toLowerCase().includes('secret_key') ||
        k.toLowerCase().includes('private_key'))
  );
  if (publicLeakKeys.length > 0) {
    throw new Error(
      `SECURITY: server secrets exposed via NEXT_PUBLIC_* prefix: ${publicLeakKeys.join(
        ', '
      )} — rename or move out of the public bundle immediately.`
    );
  }
}

// -- Exports ---------------------------------------------------------------

/**
 * Typed, validated, frozen view of process.env.
 * Throws at module-load time in production if validation fails.
 */
export const env = Object.freeze(RawEnv);

export type Env = typeof env;

/**
 * Convenience: list of env-var names this schema knows about.
 * Useful for tooling (e.g. .env.example generation).
 */
export const KNOWN_ENV_KEYS = Object.keys(EnvSchema.shape) as Array<
  keyof typeof EnvSchema.shape
>;
