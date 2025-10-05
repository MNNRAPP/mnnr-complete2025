import * as Sentry from '@sentry/nextjs';
import { env } from '@/utils/env-validation';

const sentryDsn = env.sentry.dsn();

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    
    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    
    // Error handling
    beforeSend(event, hint) {
      // Don't send certain non-critical errors
      const error = hint.originalException;
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (
          message.includes('econnreset') ||
          message.includes('timeout') ||
          message.includes('canceled')
        ) {
          return null;
        }
      }
      
      return event;
    },
    
    // Server-specific options
    environment: process.env.NODE_ENV,
  });
}