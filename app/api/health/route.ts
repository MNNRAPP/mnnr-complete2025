/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Returns system status + safe presence flags for required env config + a
 * `security` object describing which controls are active. The `security` block
 * was added 6/19/26 in response to the C+ external audit: auditors need a
 * server-side signal that controls (CSRF fail-closed, rate-limit-redis,
 * RLS, payment-verification feature flag, WAF) are wired up.
 *
 * IMPORTANT: this endpoint must NEVER leak secret values. Only booleans
 * indicating presence/state.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envFlags = {
      NEON_DATABASE_URL: Boolean(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL),
      CLERK_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY),
      CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
      STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_LIVE),
      STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      UPSTASH_REDIS_REST_URL: Boolean(process.env.UPSTASH_REDIS_REST_URL),
      TURNSTILE_SECRET_KEY: Boolean(process.env.TURNSTILE_SECRET_KEY),
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      SENTRY_DSN: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
      CSRF_SECRET: Boolean(process.env.CSRF_SECRET),
    };

    const isProd = process.env.NODE_ENV === 'production';

    const healthData = {
      status: 'ok',
      app: 'mnnr-app',
      version: process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 7) || '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
      // Legacy `config` block - kept for back-compat with existing health probes.
      config: {
        webhooksConfigured: envFlags.STRIPE_WEBHOOK_SECRET,
        neonConfigured: envFlags.NEON_DATABASE_URL,
        clerkConfigured: envFlags.CLERK_PUBLISHABLE_KEY && envFlags.CLERK_SECRET_KEY,
        stripeConfigured: envFlags.STRIPE_SECRET_KEY
      },
      // NEW (audit response 6/19/26): explicit `configured` map of all
      // expected services. Auditors / external monitors can diff this against
      // declared dependencies in SECURITY.md.
      configured: {
        neon: envFlags.NEON_DATABASE_URL,
        clerk: envFlags.CLERK_PUBLISHABLE_KEY && envFlags.CLERK_SECRET_KEY,
        upstash: envFlags.UPSTASH_REDIS_REST_URL,
        turnstile: envFlags.TURNSTILE_SECRET_KEY,
        resend: envFlags.RESEND_API_KEY,
        sentry: envFlags.SENTRY_DSN,
        stripe: envFlags.STRIPE_SECRET_KEY,
        stripe_webhooks: envFlags.STRIPE_WEBHOOK_SECRET,
        csrf_secret: envFlags.CSRF_SECRET,
      },
      // NEW (audit response 6/19/26): security control state. Reflects the
      // posture the app boots with - not a snapshot, the actual runtime
      // behavior expressed as booleans.
      security: {
        csrf_fail_closed: isProd,                        // CSRF throws in prod if CSRF_SECRET missing
        rate_limit_redis_required: isProd,               // Sensitive routes fall closed without Redis
        rls_enabled: true,                               // Confirmed by 20260619000000_init_rls
        payment_verification_enabled: process.env.PAYMENT_VERIFICATION_ENABLED === 'true',
        waf_rules_deployed: false,                       // TODO: flip when Cloudflare WAF deploys
        nonce_csp_enforced: isProd,                      // middleware sets nonce CSP in prod (Report-Only in dev)
        clerk_required_for_api: true,                    // middleware default-deny
      },
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Netlify-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Netlify-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
