/**
 * Next.js instrumentation file
 * Called once when the server starts
 * Use this to validate environment variables and perform startup checks,
 * initialize OpenTelemetry, and load the Sentry SDK in the correct runtime.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only run on server-side, not in Edge runtime
    const { assertValidEnv } = await import('./utils/env-validation');

    try {
      assertValidEnv();
    } catch (error) {
      console.error('Environment validation failed:', error);
      // Do not crash the process; routes will guard themselves and return
      // helpful errors where needed (e.g., /api/webhooks).
    }

    // Initialize OpenTelemetry for distributed tracing
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      const { registerOTel } = await import('@vercel/otel');
      registerOTel({
        serviceName: 'mnnr-app',
      });
    }

    // Initialize Sentry server SDK (no-ops at the SDK layer if SENTRY_DSN
    // unset; the config file itself already guards on env.sentry.dsn()).
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Initialize Sentry edge SDK
    await import('./sentry.edge.config');
  }
}

/**
 * Next.js 15+ / Sentry hook: capture errors thrown from React Server
 * Components, Route Handlers, Server Actions, and middleware.
 * See https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#errors-from-nested-react-server-components
 */
export const onRequestError = async (
  err: unknown,
  request: Parameters<
    typeof import('@sentry/nextjs').captureRequestError
  >[1],
  context: Parameters<
    typeof import('@sentry/nextjs').captureRequestError
  >[2]
) => {
  const Sentry = await import('@sentry/nextjs');
  return Sentry.captureRequestError(err, request, context);
};
