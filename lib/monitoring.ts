/**
 * Performance Monitoring and Analytics
 *
 * This module provides comprehensive monitoring, analytics, and error tracking
 * for the MNNR platform using Sentry. It helps identify performance bottlenecks,
 * track user behavior, and debug production issues.
 *
 * **Features:**
 * - Real-time performance monitoring
 * - Error tracking and alerting via Sentry
 * - User behavior analytics
 * - Database query performance tracking
 * - API endpoint performance tracking
 * - Slow operation detection and logging
 * - User context management for debugging
 *
 * **Integration:**
 * - Sentry for error tracking and performance monitoring
 * - Console logging in development mode
 * - Ready for PostHog or other analytics services
 *
 * **Use Cases:**
 * - Monitoring API response times
 * - Tracking database query performance
 * - Recording user actions for analytics
 * - Debugging production errors with context
 * - Identifying slow operations
 * - Tracking business metrics (subscriptions, API key creation, etc.)
 *
 * **Performance Thresholds:**
 * - Operations > 1000ms are logged as slow operations
 * - All operations are tracked in Sentry breadcrumbs
 * - Errors include full context for debugging
 *
 * @module lib/monitoring
 *
 * @example
 * ```typescript
 * import {
 *   PerformanceMonitor,
 *   trackApiPerformance,
 *   trackDbQuery,
 *   analytics,
 *   trackError
 * } from '@/lib/monitoring';
 *
 * // Track API endpoint performance
 * const result = await trackApiPerformance('POST /api/keys', async () => {
 *   return await createApiKey(userId, name);
 * });
 *
 * // Track database query
 * const users = await trackDbQuery('fetch-users', async () => {
 *   return await db.from('users').select('*');
 * });
 *
 * // Record analytics event
 * analytics.apiKeyCreated(userId, keyId);
 *
 * // Track errors with context
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   trackError(error, { userId, operation: 'riskyOperation' });
 * }
 * ```
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Performance Metrics Tracker
 *
 * A class for tracking the duration of operations and logging performance metrics.
 * Automatically detects slow operations and reports metrics to Sentry.
 *
 * **How It Works:**
 * 1. Create instance with operation name
 * 2. Perform your operation
 * 3. Call end() to record duration and metadata
 *
 * **Slow Operation Detection:**
 * Operations taking longer than 1000ms (1 second) are automatically logged
 * as warnings for investigation.
 *
 * @class PerformanceMonitor
 *
 * @example
 * ```typescript
 * // Track custom operation
 * const monitor = new PerformanceMonitor('Complex Calculation');
 *
 * const result = performComplexCalculation();
 *
 * const duration = monitor.end({
 *   itemCount: result.length,
 *   cacheHit: false
 * });
 *
 * console.log(`Operation took ${duration}ms`);
 * ```
 *
 * @example
 * ```typescript
 * // Track file processing
 * const monitor = new PerformanceMonitor('Process Upload');
 *
 * try {
 *   const processed = await processFile(file);
 *   monitor.end({
 *     fileSize: file.size,
 *     format: file.type,
 *     success: true
 *   });
 * } catch (error) {
 *   monitor.end({ success: false, error: error.message });
 *   throw error;
 * }
 * ```
 */
export class PerformanceMonitor {
  private startTime: number;
  private operation: string;

  /**
   * Create a new performance monitor
   *
   * @param {string} operation - Descriptive name of the operation being tracked
   */
  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
  }

  /**
   * End tracking and record metrics
   *
   * Calculates the duration since monitor creation, logs to Sentry as a breadcrumb,
   * and warns if the operation was slow (>1000ms).
   *
   * @param {Record<string, any>} [metadata] - Additional metadata to log
   * @returns {number} Duration in milliseconds
   *
   * @example
   * ```typescript
   * const monitor = new PerformanceMonitor('Database Query');
   * const data = await db.query('SELECT * FROM users');
   *
   * monitor.end({
   *   rowCount: data.length,
   *   cached: false
   * });
   * ```
   */
  end(metadata?: Record<string, any>): number {
    const duration = Date.now() - this.startTime;

    // Log to Sentry as breadcrumb for error context
    Sentry.addBreadcrumb({
      category: "performance",
      message: `${this.operation} completed`,
      level: "info",
      data: {
        duration,
        ...metadata,
      },
    });

    // Log slow operations for investigation
    if (duration > 1000) {
      console.warn(`Slow operation: ${this.operation} took ${duration}ms`, metadata);
    }

    return duration;
  }
}

/**
 * Track API endpoint performance
 *
 * Wraps an API operation with automatic performance monitoring. Measures
 * execution time and logs success/failure to Sentry. This is the recommended
 * way to track all API endpoint operations.
 *
 * **What Gets Tracked:**
 * - Operation duration in milliseconds
 * - Success/failure status
 * - Error messages for failures
 * - Slow operation warnings (>1000ms)
 *
 * **When to Use:**
 * - All API route handlers
 * - External API calls
 * - Any operation critical to API performance
 *
 * @template T - The return type of the operation
 * @param {string} endpoint - Descriptive name of the endpoint (e.g., "POST /api/keys")
 * @param {() => Promise<T>} fn - The async operation to track
 * @returns {Promise<T>} The result of the operation
 * @throws {Error} Re-throws any error from the operation after logging
 *
 * @example
 * ```typescript
 * // Track API key creation
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *
 *   const apiKey = await trackApiPerformance('POST /api/keys', async () => {
 *     const { name, mode } = apiKeyCreateSchema.parse(body);
 *     return await createApiKey(userId, name, mode);
 *   });
 *
 *   return NextResponse.json(apiKey);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Track external API call
 * const prices = await trackApiPerformance('Stripe: List Prices', async () => {
 *   const response = await stripe.prices.list({ active: true });
 *   return response.data;
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Track with error handling
 * try {
 *   const result = await trackApiPerformance('GET /api/users', async () => {
 *     return await fetchUsers();
 *   });
 *   return NextResponse.json(result);
 * } catch (error) {
 *   // Error is logged and re-thrown
 *   return NextResponse.json(
 *     { error: 'Failed to fetch users' },
 *     { status: 500 }
 *   );
 * }
 * ```
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
 *
 * Wraps a database operation with automatic performance monitoring. Helps
 * identify slow queries and database bottlenecks. Essential for maintaining
 * optimal database performance.
 *
 * **What Gets Tracked:**
 * - Query execution time
 * - Success/failure status
 * - Error messages for failures
 * - Slow query warnings (>1000ms)
 *
 * **When to Use:**
 * - Complex database queries
 * - Operations that may be slow
 * - Queries that need optimization monitoring
 * - Critical data fetching operations
 *
 * **Best Practices:**
 * - Use descriptive query names
 * - Include table names in the description
 * - Track all queries that fetch large datasets
 *
 * @template T - The return type of the query
 * @param {string} query - Descriptive name of the query (e.g., "fetch-user-subscriptions")
 * @param {() => Promise<T>} fn - The async database operation to track
 * @returns {Promise<T>} The query result
 * @throws {Error} Re-throws any error from the query after logging
 *
 * @example
 * ```typescript
 * // Track Supabase query
 * const apiKeys = await trackDbQuery('fetch-user-api-keys', async () => {
 *   const { data, error } = await supabase
 *     .from('api_keys')
 *     .select('*')
 *     .eq('user_id', userId)
 *     .order('created_at', { ascending: false });
 *
 *   if (error) throw error;
 *   return data;
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Track complex join query
 * const usageStats = await trackDbQuery('aggregate-usage-stats', async () => {
 *   const { data } = await supabase.rpc('calculate_usage_stats', {
 *     user_id: userId,
 *     start_date: startDate,
 *     end_date: endDate
 *   });
 *   return data;
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Track bulk insert
 * await trackDbQuery('insert-usage-events', async () => {
 *   return await supabase
 *     .from('usage_events')
 *     .insert(events);
 * });
 * ```
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
 * Analytics Event Interface
 *
 * Defines the structure for analytics events tracked throughout the application.
 * All events should follow this format for consistency.
 *
 * @interface AnalyticsEvent
 * @property {string} event - Event name in snake_case (e.g., "api_key_created")
 * @property {Record<string, any>} [properties] - Additional event properties/metadata
 * @property {string} [userId] - User ID associated with the event (for user tracking)
 *
 * @example
 * ```typescript
 * const event: AnalyticsEvent = {
 *   event: "subscription_created",
 *   userId: "user_123",
 *   properties: {
 *     plan: "premium",
 *     price: 29.99,
 *     trial: false
 *   }
 * };
 * ```
 */
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

/**
 * Track an analytics event
 *
 * Records user actions and application events for analytics purposes. Events
 * are logged to the console in development and sent to Sentry as breadcrumbs
 * for error context. Ready to integrate with PostHog or other analytics services.
 *
 * **Event Naming Convention:**
 * Use snake_case for event names (e.g., "api_key_created", "subscription_cancelled")
 *
 * **When to Track:**
 * - User actions (sign up, sign in, create resource)
 * - Business events (subscription created, payment successful)
 * - Feature usage (feature enabled, setting changed)
 * - Important state changes (trial ended, limit reached)
 *
 * **Privacy Considerations:**
 * - Don't track PII unnecessarily
 * - Follow GDPR/CCPA compliance requirements
 * - Allow users to opt out of analytics
 *
 * @param {AnalyticsEvent} event - The event to track
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Track user sign up
 * trackEvent({
 *   event: "user_signed_up",
 *   userId: user.id,
 *   properties: {
 *     method: "google",
 *     referrer: "landing_page"
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Track feature usage
 * trackEvent({
 *   event: "export_data_clicked",
 *   userId: userId,
 *   properties: {
 *     format: "csv",
 *     rowCount: 1500
 *   }
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Track business metric
 * trackEvent({
 *   event: "subscription_upgraded",
 *   userId: userId,
 *   properties: {
 *     fromPlan: "starter",
 *     toPlan: "premium",
 *     revenue: 29.99
 *   }
 * });
 * ```
 */
export function trackEvent(event: AnalyticsEvent): void {
  // Log to console in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.log("Analytics event:", event);
  }

  // Send to Sentry as breadcrumb for error context
  Sentry.addBreadcrumb({
    category: "analytics",
    message: event.event,
    level: "info",
    data: event.properties,
  });

  // TODO: Send to PostHog or other analytics service
  // Example PostHog integration:
  // if (posthog) {
  //   posthog.capture(event.event, {
  //     ...event.properties,
  //     distinct_id: event.userId
  //   });
  // }
}

/**
 * Pre-defined Analytics Event Trackers
 *
 * Provides type-safe, consistent tracking functions for common user actions
 * and business events. Using these pre-defined trackers ensures consistency
 * in event naming and properties across the application.
 *
 * **Event Categories:**
 * - API Key events: Creation, deletion
 * - Subscription events: Creation, cancellation
 * - Auth events: Sign up, sign in
 * - Usage events: API calls
 *
 * **Benefits:**
 * - Consistent event naming across the app
 * - Type-safe parameters
 * - Easy to use and discover
 * - Single source of truth for analytics events
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * // Track API key creation
 * import { analytics } from '@/lib/monitoring';
 *
 * export async function POST(request: Request) {
 *   const apiKey = await createApiKey(userId, name);
 *
 *   // Track the event
 *   analytics.apiKeyCreated(userId, apiKey.id);
 *
 *   return NextResponse.json(apiKey);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Track subscription lifecycle
 * // On creation
 * analytics.subscriptionCreated(userId, subscription.id);
 *
 * // On cancellation
 * analytics.subscriptionCancelled(userId, subscription.id);
 * ```
 *
 * @example
 * ```typescript
 * // Track authentication events
 * // After successful sign up
 * analytics.userSignedUp(user.id, "google");
 *
 * // After successful sign in
 * analytics.userSignedIn(user.id, "email");
 * ```
 */
export const analytics = {
  /**
   * Track API key creation
   *
   * @param {string} userId - The user who created the key
   * @param {string} keyId - The ID of the created API key
   *
   * @example
   * ```typescript
   * const apiKey = await createApiKey(userId, "Production Key", "live");
   * analytics.apiKeyCreated(userId, apiKey.id);
   * ```
   */
  apiKeyCreated: (userId: string, keyId: string) =>
    trackEvent({
      event: "api_key_created",
      userId,
      properties: { keyId },
    }),

  /**
   * Track API key deletion
   *
   * @param {string} userId - The user who deleted the key
   * @param {string} keyId - The ID of the deleted API key
   *
   * @example
   * ```typescript
   * await deleteApiKey(keyId);
   * analytics.apiKeyDeleted(userId, keyId);
   * ```
   */
  apiKeyDeleted: (userId: string, keyId: string) =>
    trackEvent({
      event: "api_key_deleted",
      userId,
      properties: { keyId },
    }),

  /**
   * Track subscription creation
   *
   * @param {string} userId - The user who created the subscription
   * @param {string} planId - The Stripe price/plan ID
   *
   * @example
   * ```typescript
   * const subscription = await stripe.subscriptions.create({
   *   customer: customerId,
   *   items: [{ price: priceId }]
   * });
   * analytics.subscriptionCreated(userId, priceId);
   * ```
   */
  subscriptionCreated: (userId: string, planId: string) =>
    trackEvent({
      event: "subscription_created",
      userId,
      properties: { planId },
    }),

  /**
   * Track subscription cancellation
   *
   * @param {string} userId - The user who cancelled the subscription
   * @param {string} planId - The Stripe price/plan ID
   *
   * @example
   * ```typescript
   * await stripe.subscriptions.update(subscriptionId, {
   *   cancel_at_period_end: true
   * });
   * analytics.subscriptionCancelled(userId, subscription.plan.id);
   * ```
   */
  subscriptionCancelled: (userId: string, planId: string) =>
    trackEvent({
      event: "subscription_cancelled",
      userId,
      properties: { planId },
    }),

  /**
   * Track user sign up
   *
   * @param {string} userId - The newly created user ID
   * @param {string} method - Sign up method (e.g., "google", "email", "github")
   *
   * @example
   * ```typescript
   * // After successful OAuth sign up
   * analytics.userSignedUp(user.id, "google");
   *
   * // After email sign up
   * analytics.userSignedUp(user.id, "email");
   * ```
   */
  userSignedUp: (userId: string, method: string) =>
    trackEvent({
      event: "user_signed_up",
      userId,
      properties: { method },
    }),

  /**
   * Track user sign in
   *
   * @param {string} userId - The user ID
   * @param {string} method - Sign in method (e.g., "google", "email", "github")
   *
   * @example
   * ```typescript
   * // After successful sign in
   * analytics.userSignedIn(user.id, "email");
   * ```
   */
  userSignedIn: (userId: string, method: string) =>
    trackEvent({
      event: "user_signed_in",
      userId,
      properties: { method },
    }),

  /**
   * Track API call
   *
   * @param {string} userId - The user making the API call
   * @param {string} endpoint - The API endpoint called
   * @param {number} statusCode - The HTTP status code returned
   *
   * @example
   * ```typescript
   * // Track successful API call
   * analytics.apiCallMade(userId, "/api/users", 200);
   *
   * // Track failed API call
   * analytics.apiCallMade(userId, "/api/protected", 403);
   * ```
   */
  apiCallMade: (userId: string, endpoint: string, statusCode: number) =>
    trackEvent({
      event: "api_call_made",
      userId,
      properties: { endpoint, statusCode },
    }),
};

/**
 * Track and report errors to Sentry
 *
 * Records errors with full context for debugging. Errors are logged to the
 * console and sent to Sentry for alerting and analysis. Always use this
 * function instead of bare console.error for production errors.
 *
 * **What Gets Tracked:**
 * - Complete error stack trace
 * - Error message and type
 * - Custom context data
 * - Current user information (if set)
 * - Performance breadcrumbs
 * - Analytics event breadcrumbs
 *
 * **When to Use:**
 * - Catch blocks for important operations
 * - Unexpected errors that should never happen
 * - Errors that need investigation
 * - Production issues requiring alerting
 *
 * **When NOT to Use:**
 * - Expected validation errors (use proper responses instead)
 * - Normal control flow (don't use exceptions for flow control)
 * - Debugging during development (use console.log)
 *
 * @param {Error} error - The error object to track
 * @param {Record<string, any>} [context] - Additional context for debugging
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Track error with context
 * try {
 *   await createApiKey(userId, name);
 * } catch (error) {
 *   trackError(error as Error, {
 *     userId,
 *     operation: 'createApiKey',
 *     keyName: name,
 *     timestamp: new Date().toISOString()
 *   });
 *
 *   return NextResponse.json(
 *     { error: 'Failed to create API key' },
 *     { status: 500 }
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Track external API error
 * try {
 *   const response = await fetchWithRetry(externalApiUrl);
 *   return response.json();
 * } catch (error) {
 *   trackError(error as Error, {
 *     service: 'stripe',
 *     endpoint: externalApiUrl,
 *     userId
 *   });
 *   throw error;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Track database error
 * const { data, error } = await supabase
 *   .from('users')
 *   .select('*')
 *   .eq('id', userId)
 *   .single();
 *
 * if (error) {
 *   trackError(new Error(error.message), {
 *     table: 'users',
 *     operation: 'select',
 *     userId,
 *     code: error.code
 *   });
 *   throw error;
 * }
 * ```
 */
export function trackError(error: Error, context?: Record<string, any>): void {
  // Log to console for immediate visibility
  console.error("Error tracked:", error, context);

  // Send to Sentry with context
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Set user context for error tracking
 *
 * Associates subsequent errors and events with a specific user. This makes
 * debugging much easier by showing which users are affected by errors.
 * Call this after successful authentication.
 *
 * **When to Call:**
 * - Immediately after user signs in
 * - After auth state is restored on page load
 * - When switching between users (admin impersonation)
 *
 * **Privacy Considerations:**
 * - Only include necessary user identifiers
 * - Don't include sensitive PII beyond email
 * - Follow GDPR/CCPA data handling requirements
 *
 * @param {string} userId - The unique user identifier
 * @param {string} [email] - Optional email for additional context
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Set user context after sign in
 * export async function POST(request: Request) {
 *   const { email, password } = await request.json();
 *
 *   const { data, error } = await supabase.auth.signInWithPassword({
 *     email,
 *     password
 *   });
 *
 *   if (error) throw error;
 *
 *   // Set user context for error tracking
 *   setUserContext(data.user.id, data.user.email);
 *
 *   return NextResponse.json({ user: data.user });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Set user context on app initialization
 * useEffect(() => {
 *   const session = await getSession();
 *   if (session?.user) {
 *     setUserContext(session.user.id, session.user.email);
 *   }
 * }, []);
 * ```
 *
 * @example
 * ```typescript
 * // Update user context after profile update
 * const updatedUser = await updateUserEmail(userId, newEmail);
 * setUserContext(userId, newEmail);
 * ```
 */
export function setUserContext(userId: string, email?: string): void {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Clear user context on logout
 *
 * Removes user identification from error tracking. Call this when a user
 * signs out to prevent their identity from being associated with subsequent
 * errors (which might be from a different user on a shared device).
 *
 * **When to Call:**
 * - User signs out
 * - Session expires
 * - Before clearing auth state
 *
 * **Why This Matters:**
 * Prevents privacy issues where errors from one user are attributed to
 * a previously logged-in user on shared devices.
 *
 * @returns {void}
 *
 * @example
 * ```typescript
 * // Clear context on sign out
 * export async function POST(request: Request) {
 *   await supabase.auth.signOut();
 *
 *   // Clear user context from error tracking
 *   clearUserContext();
 *
 *   return NextResponse.json({ success: true });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Clear context in client-side logout
 * const handleLogout = async () => {
 *   await signOut();
 *   clearUserContext();
 *   router.push('/login');
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Clear context on session expiration
 * useEffect(() => {
 *   const checkSession = async () => {
 *     const session = await getSession();
 *     if (!session) {
 *       clearUserContext();
 *     }
 *   };
 *   checkSession();
 * }, []);
 * ```
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}
