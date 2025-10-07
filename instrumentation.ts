/**
 * Next.js instrumentation file
 * Called once when the server starts
 * Use this to validate environment variables and perform startup checks
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
  }
}
