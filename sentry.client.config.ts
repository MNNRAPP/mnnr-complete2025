import * as Sentry from '@sentry/nextjs';
import { env } from '@/utils/env-validation';

const sentryDsn = env.sentry.dsn();

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    
    // Performance monitoring
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out non-critical errors in development
      if (process.env.NODE_ENV === 'development') {
        return null;
      }
      
      // Don't send certain known client-side errors
      const error = hint.originalException;
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (
          message.includes('network error') ||
          message.includes('loading chunk') ||
          message.includes('script error')
        ) {
          return null;
        }
      }
      
      return event;
    },
    
    // Session tracking
    autoSessionTracking: true,
    
    // Additional options
    environment: process.env.NODE_ENV,
    
    // Privacy
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive data
      if (breadcrumb.category === 'console' && breadcrumb.data) {
        // Remove sensitive console logs
        delete breadcrumb.data.arguments;
      }
      return breadcrumb;
    },
  });
}