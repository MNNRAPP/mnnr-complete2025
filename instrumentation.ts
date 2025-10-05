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
      // In production, you might want to prevent the app from starting
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
}
