/**
 * Enterprise-grade logging utility
 * Prevents sensitive data exposure in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMetadata {
  [key: string]: any;
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'stripe_customer_id',
  'customer_id',
  'card',
  'ssn',
  'social_security'
];

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitiveKey =>
      lowerKey.includes(sensitiveKey.toLowerCase())
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Format log message for production logging service
 */
function formatForProduction(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata
): string {
  const timestamp = new Date().toISOString();
  const sanitized = metadata ? sanitizeData(metadata) : {};

  return JSON.stringify({
    timestamp,
    level,
    message,
    metadata: sanitized,
    environment: process.env.NODE_ENV
  });
}

/**
 * Logger instance with methods for different log levels
 */
export const logger = {
  debug(message: string, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, metadata || '');
    }
  },

  info(message: string, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service (e.g., CloudWatch, Datadog, Sentry)
      console.info(formatForProduction('info', message, metadata));
    } else {
      console.info(`[INFO] ${message}`, metadata || '');
    }
  },

  warn(message: string, metadata?: LogMetadata) {
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to logging service with warning level
      console.warn(formatForProduction('warn', message, metadata));
    } else {
      console.warn(`[WARN] ${message}`, metadata || '');
    }
  },

  error(message: string, error?: Error | unknown, metadata?: LogMetadata) {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : { error: String(error) };

    const combinedMetadata = { ...metadata, error: errorData };

    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
      console.error(formatForProduction('error', message, combinedMetadata));
    } else {
      console.error(`[ERROR] ${message}`, combinedMetadata);
    }
  },

  /**
   * Log webhook events (special handling for Stripe webhooks)
   */
  webhook(eventType: string, metadata?: LogMetadata) {
    this.info(`Webhook received: ${eventType}`, {
      eventType,
      ...metadata
    });
  },

  /**
   * Log subscription events
   */
  subscription(action: string, subscriptionId: string, userId: string) {
    this.info(`Subscription ${action}`, {
      action,
      subscriptionId: subscriptionId.substring(0, 8) + '...', // Partial ID
      userId: userId.substring(0, 8) + '...' // Partial ID
    });
  }
};
