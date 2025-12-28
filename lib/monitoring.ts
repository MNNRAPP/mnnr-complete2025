/**
 * Performance Monitoring and Analytics
 * 
 * Track API performance, errors, and usage metrics
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Performance metrics tracker
 */
export class PerformanceMonitor {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
  }

  /**
   * End tracking and record metrics
   */
  end(metadata?: Record<string, any>): number {
    const duration = Date.now() - this.startTime;

    // Log to Sentry
    Sentry.addBreadcrumb({
      category: "performance",
      message: `${this.operation} completed`,
      level: "info",
      data: {
        duration,
        ...metadata,
      },
    });

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation: ${this.operation} took ${duration}ms`, metadata);
    }

    return duration;
  }
}

/**
 * Track API endpoint performance
 */
export async function trackApiPerformance<T>(
  endpoint: string,
  fn: () => Promise<T>
): Promise<T> {
  const monitor = new PerformanceMonitor(`API: ${endpoint}`);

  try {
    const result = await fn();
    monitor.end({ success: true });
    return result;
  } catch (error) {
    monitor.end({ success: false, error: (error as Error).message });
    throw error;
  }
}

/**
 * Track database query performance
 */
export async function trackDbQuery<T>(
  query: string,
  fn: () => Promise<T>
): Promise<T> {
  const monitor = new PerformanceMonitor(`DB: ${query}`);

  try {
    const result = await fn();
    monitor.end({ success: true });
    return result;
  } catch (error) {
    monitor.end({ success: false, error: (error as Error).message });
    throw error;
  }
}

/**
 * Analytics event tracker
 */
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

export function trackEvent(event: AnalyticsEvent): void {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("Analytics event:", event);
  }

  // Send to Sentry as breadcrumb
  Sentry.addBreadcrumb({
    category: "analytics",
    message: event.event,
    level: "info",
    data: event.properties,
  });

  // TODO: Send to PostHog or other analytics service
  // posthog.capture(event.event, event.properties);
}

/**
 * Track user actions
 */
export const analytics = {
  // API Key events
  apiKeyCreated: (userId: string, keyId: string) =>
    trackEvent({
      event: "api_key_created",
      userId,
      properties: { keyId },
    }),

  apiKeyDeleted: (userId: string, keyId: string) =>
    trackEvent({
      event: "api_key_deleted",
      userId,
      properties: { keyId },
    }),

  // Subscription events
  subscriptionCreated: (userId: string, planId: string) =>
    trackEvent({
      event: "subscription_created",
      userId,
      properties: { planId },
    }),

  subscriptionCancelled: (userId: string, planId: string) =>
    trackEvent({
      event: "subscription_cancelled",
      userId,
      properties: { planId },
    }),

  // Auth events
  userSignedUp: (userId: string, method: string) =>
    trackEvent({
      event: "user_signed_up",
      userId,
      properties: { method },
    }),

  userSignedIn: (userId: string, method: string) =>
    trackEvent({
      event: "user_signed_in",
      userId,
      properties: { method },
    }),

  // Usage events
  apiCallMade: (userId: string, endpoint: string, statusCode: number) =>
    trackEvent({
      event: "api_call_made",
      userId,
      properties: { endpoint, statusCode },
    }),
};

/**
 * Error tracking
 */
export function trackError(error: Error, context?: Record<string, any>): void {
  console.error("Error tracked:", error, context);

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string): void {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}
