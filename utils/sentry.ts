/**
 * Sentry Error Monitoring Integration
 * Enterprise error tracking and performance monitoring
 */

// Install with: npm install @sentry/nextjs

/**
 * Initialize Sentry (call in instrumentation.ts)
 */
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production') {
    // Dynamic import to avoid loading Sentry in development
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // Performance Monitoring
        tracesSampleRate: 0.1, // 10% of transactions

        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of errors

        // Environment
        environment: process.env.NODE_ENV,

        // Release tracking
        release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

        // Error filtering
        beforeSend(event, hint) {
          // Don't send errors in development
          if (process.env.NODE_ENV === 'development') {
            return null;
          }

          // Filter out specific errors
          const error = hint.originalException;

          // Ignore network errors from client
          if (error instanceof Error && error.message.includes('fetch')) {
            return null;
          }

          // Scrub sensitive data
          if (event.request) {
            delete event.request.cookies;
            if (event.request.headers) {
              delete event.request.headers['Authorization'];
              delete event.request.headers['Cookie'];
            }
          }

          return event;
        },

        // Integrations
        integrations: [
          new Sentry.BrowserTracing({
            tracePropagationTargets: ['localhost', /^\//],
          }),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
      });
    });
  }
}

/**
 * Capture exception manually
 */
export async function captureException(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(error, {
      contexts: {
        custom: context
      }
    });
  } else {
    console.error('Sentry (dev):', error, context);
  }
}

/**
 * Capture message manually
 */
export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'production') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureMessage(message, level);
  } else {
    console.log(`Sentry ${level} (dev):`, message);
  }
}

/**
 * Set user context for error tracking
 */
export async function setUserContext(user: { id: string; email?: string }) {
  if (process.env.NODE_ENV === 'production') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.setUser({
      id: user.id,
      email: user.email
    });
  }
}

/**
 * Clear user context
 */
export async function clearUserContext() {
  if (process.env.NODE_ENV === 'production') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export async function addBreadcrumb(message: string, category: string, data?: any) {
  if (process.env.NODE_ENV === 'production') {
    const Sentry = await import('@sentry/nextjs');
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info'
    });
  }
}

/**
 * Start a transaction for performance monitoring
 */
export async function startTransaction(name: string, op: string) {
  if (process.env.NODE_ENV === 'production') {
    const Sentry = await import('@sentry/nextjs');
    return Sentry.startTransaction({ name, op });
  }
  return null;
}
