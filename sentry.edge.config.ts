import * as Sentry from '@sentry/nextjs';
import { env } from '@/utils/env-validation';

const sentryDsn = env.sentry.dsn();

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    
    // Reduced sampling for edge runtime
    tracesSampleRate: 0.05,
    
    // Edge runtime options
    environment: process.env.NODE_ENV,
  });
}