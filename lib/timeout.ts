/**
 * Timeout and Retry Utilities
 *
 * This module provides production-grade timeout handling and exponential backoff
 * retry logic for the MNNR platform. It helps build resilient applications by
 * gracefully handling transient failures, slow operations, and network issues.
 *
 * **Features:**
 * - Promise timeout enforcement with race conditions
 * - Exponential backoff retry with configurable parameters
 * - Fetch API wrappers with built-in timeout and retry
 * - Sleep utility for controlled delays
 * - Automatic error handling and logging
 * - Type-safe operations with TypeScript generics
 *
 * **Use Cases:**
 * - External API calls that may timeout or fail
 * - Database operations with transient connection issues
 * - Network requests requiring retry logic
 * - Rate-limited API calls needing backoff
 * - Any async operation requiring timeout enforcement
 *
 * **Retry Strategy:**
 * This module implements exponential backoff, which progressively increases
 * the delay between retry attempts. This prevents overwhelming failing services
 * and gives them time to recover.
 *
 * @module lib/timeout
 *
 * @example
 * ```typescript
 * import { withTimeout, withRetry, fetchWithRetry } from '@/lib/timeout';
 *
 * // Simple timeout enforcement
 * const result = await withTimeout(
 *   fetchData(),
 *   5000,
 *   'Data fetch timed out after 5s'
 * );
 *
 * // Retry with exponential backoff
 * const data = await withRetry(
 *   () => fetchFromUnreliableAPI(),
 *   { maxAttempts: 5, initialDelayMs: 500 }
 * );
 *
 * // Fetch with automatic retry
 * const response = await fetchWithRetry(
 *   'https://api.example.com/data',
 *   { method: 'GET' },
 *   { maxAttempts: 3 }
 * );
 * ```
 */

/**
 * Execute a promise with timeout enforcement
 *
 * Wraps a promise with a timeout constraint. If the promise doesn't resolve or
 * reject within the specified time, it will be rejected with a timeout error.
 * This uses Promise.race() to race the original promise against a timeout promise.
 *
 * **When to Use:**
 * - External API calls that may hang
 * - Database queries that could run indefinitely
 * - File operations that might stall
 * - Any async operation where you need guaranteed time bounds
 *
 * **How it Works:**
 * 1. Creates a timeout promise that rejects after timeoutMs
 * 2. Races the input promise against the timeout promise
 * 3. Returns whichever completes first
 *
 * @template T - The type of data returned by the promise
 * @param {Promise<T>} promise - The promise to execute with timeout
 * @param {number} timeoutMs - Timeout duration in milliseconds
 * @param {string} [errorMessage="Operation timed out"] - Custom error message for timeout
 * @returns {Promise<T>} The promise result if completed within timeout
 * @throws {Error} If the operation times out or the promise rejects
 *
 * @example
 * ```typescript
 * // Basic timeout enforcement
 * try {
 *   const data = await withTimeout(
 *     fetch('https://slow-api.com/data'),
 *     5000,
 *     'API call timed out'
 *   );
 *   console.log('Success:', data);
 * } catch (error) {
 *   console.error('Failed or timed out:', error.message);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Database query with timeout
 * const user = await withTimeout(
 *   supabase.from('users').select('*').eq('id', userId).single(),
 *   3000,
 *   'Database query timed out after 3s'
 * );
 * ```
 *
 * @example
 * ```typescript
 * // File operation with timeout
 * const fileContent = await withTimeout(
 *   readLargeFile('/path/to/large/file.json'),
 *   10000,
 *   'File read operation timed out'
 * );
 * ```
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Operation timed out"
): Promise<T> {
  // Create a promise that rejects after the timeout period
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  // Race the input promise against the timeout
  return Promise.race([promise, timeout]);
}

/**
 * Retry Configuration Interface
 *
 * Defines the parameters for exponential backoff retry behavior.
 * All timing values are in milliseconds.
 *
 * @interface RetryConfig
 * @property {number} maxAttempts - Maximum number of retry attempts (1-10 recommended)
 * @property {number} initialDelayMs - Initial delay before first retry in milliseconds
 * @property {number} maxDelayMs - Maximum delay cap to prevent excessive waits
 * @property {number} backoffMultiplier - Multiplier for exponential backoff (typically 2)
 * @property {number} [timeoutMs] - Optional timeout per attempt in milliseconds
 *
 * @example
 * ```typescript
 * // Aggressive retry for critical operations
 * const aggressiveConfig: RetryConfig = {
 *   maxAttempts: 5,
 *   initialDelayMs: 100,
 *   maxDelayMs: 5000,
 *   backoffMultiplier: 2,
 *   timeoutMs: 10000
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Conservative retry for rate-limited APIs
 * const conservativeConfig: RetryConfig = {
 *   maxAttempts: 3,
 *   initialDelayMs: 2000,
 *   maxDelayMs: 30000,
 *   backoffMultiplier: 3,
 *   timeoutMs: 60000
 * };
 * ```
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  timeoutMs?: number;
}

/**
 * Default Retry Configuration
 *
 * Sensible defaults for most use cases. Provides a balanced approach between
 * retry persistence and avoiding excessive delays.
 *
 * **Default Values:**
 * - maxAttempts: 3 (total of 3 tries: initial + 2 retries)
 * - initialDelayMs: 1000 (1 second initial delay)
 * - maxDelayMs: 10000 (10 second maximum delay cap)
 * - backoffMultiplier: 2 (doubles delay each retry: 1s, 2s, 4s...)
 * - timeoutMs: 30000 (30 second timeout per attempt)
 *
 * **Delay Progression:**
 * - Attempt 1: Immediate
 * - Attempt 2: After 1 second
 * - Attempt 3: After 2 seconds (total 3s from start)
 *
 * @constant
 * @type {RetryConfig}
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
};

/**
 * Execute a function with exponential backoff retry logic
 *
 * Implements a robust retry mechanism with exponential backoff. If the function
 * fails, it will retry with progressively longer delays between attempts. This
 * prevents overwhelming failing services while maximizing success probability.
 *
 * **Exponential Backoff:**
 * With default config (initialDelay=1000ms, multiplier=2):
 * - Attempt 1: Immediate execution
 * - Attempt 2: Wait 1000ms (1s)
 * - Attempt 3: Wait 2000ms (2s)
 * - Attempt 4: Wait 4000ms (4s)
 * - And so on, capped at maxDelayMs
 *
 * **Error Handling:**
 * - Logs each retry attempt with details
 * - Throws the last error if all attempts fail
 * - Includes attempt count in final error message
 *
 * **When to Use:**
 * - API calls to services with transient failures
 * - Database operations during high load
 * - Network requests that may fail temporarily
 * - Operations behind rate limiters
 *
 * @template T - The type of data returned by the function
 * @param {() => Promise<T>} fn - Async function to execute with retry
 * @param {Partial<RetryConfig>} [config={}] - Partial retry configuration (merged with defaults)
 * @returns {Promise<T>} The function result if successful within max attempts
 * @throws {Error} If all retry attempts fail, throws error with attempt count
 *
 * @example
 * ```typescript
 * // Retry database operation with defaults
 * const user = await withRetry(async () => {
 *   const { data, error } = await supabase
 *     .from('users')
 *     .select('*')
 *     .eq('id', userId)
 *     .single();
 *
 *   if (error) throw error;
 *   return data;
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Retry external API call with custom config
 * const prices = await withRetry(
 *   async () => {
 *     const response = await fetch('https://api.stripe.com/v1/prices');
 *     if (!response.ok) throw new Error('Failed to fetch prices');
 *     return response.json();
 *   },
 *   {
 *     maxAttempts: 5,
 *     initialDelayMs: 500,
 *     backoffMultiplier: 2
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Retry with timeout per attempt
 * const result = await withRetry(
 *   () => longRunningOperation(),
 *   {
 *     maxAttempts: 3,
 *     timeoutMs: 5000, // 5s timeout per attempt
 *     initialDelayMs: 1000
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Handling retry failures
 * try {
 *   const data = await withRetry(
 *     () => unreliableAPICall(),
 *     { maxAttempts: 3 }
 *   );
 *   console.log('Success:', data);
 * } catch (error) {
 *   // Error message includes attempt count
 *   console.error(error.message); // "Failed after 3 attempts: ..."
 * }
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  // Merge provided config with defaults
  const {
    maxAttempts,
    initialDelayMs,
    maxDelayMs,
    backoffMultiplier,
    timeoutMs,
  } = { ...DEFAULT_RETRY_CONFIG, ...config };

  let lastError: Error;
  let delayMs = initialDelayMs;

  // Attempt the operation up to maxAttempts times
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Execute with timeout if specified
      if (timeoutMs) {
        return await withTimeout(fn(), timeoutMs);
      } else {
        return await fn();
      }
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Log retry attempt for debugging
      console.warn(
        `Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}. Retrying in ${delayMs}ms...`
      );

      // Wait before retrying
      await sleep(delayMs);

      // Calculate next delay with exponential backoff, capped at maxDelayMs
      delayMs = Math.min(delayMs * backoffMultiplier, maxDelayMs);
    }
  }

  // All attempts failed, throw error with context
  throw new Error(
    `Failed after ${maxAttempts} attempts: ${lastError!.message}`
  );
}

/**
 * Sleep utility for controlled delays
 *
 * Returns a promise that resolves after the specified duration.
 * Useful for implementing delays, rate limiting, or backoff strategies.
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} Promise that resolves after the delay
 *
 * @example
 * ```typescript
 * // Simple delay
 * console.log('Starting...');
 * await sleep(2000);
 * console.log('2 seconds later...');
 * ```
 *
 * @example
 * ```typescript
 * // Rate limiting
 * for (const item of items) {
 *   await processItem(item);
 *   await sleep(100); // 100ms delay between items
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Polling with delay
 * while (true) {
 *   const status = await checkStatus();
 *   if (status === 'complete') break;
 *   await sleep(5000); // Check every 5 seconds
 * }
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout enforcement
 *
 * Performs a fetch request with automatic timeout using AbortController.
 * This is the recommended way to add timeout to fetch requests as it properly
 * cancels the underlying HTTP request, freeing up resources.
 *
 * **How it Works:**
 * 1. Creates an AbortController to manage request cancellation
 * 2. Sets a timeout that aborts the request after timeoutMs
 * 3. Executes fetch with the abort signal
 * 4. Cleans up the timeout in the finally block
 *
 * **Benefits over Promise.race:**
 * - Actually cancels the HTTP request (resource efficient)
 * - Browser can free network resources immediately
 * - Prevents memory leaks from hanging requests
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} [options={}] - Fetch options (method, headers, body, etc.)
 * @param {number} [timeoutMs=10000] - Timeout in milliseconds (default: 10s)
 * @returns {Promise<Response>} The fetch Response object
 * @throws {Error} If request times out or fails
 *
 * @example
 * ```typescript
 * // Basic GET request with timeout
 * const response = await fetchWithTimeout(
 *   'https://api.example.com/data',
 *   {},
 *   5000
 * );
 * const data = await response.json();
 * ```
 *
 * @example
 * ```typescript
 * // POST request with timeout
 * const response = await fetchWithTimeout(
 *   'https://api.example.com/users',
 *   {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ name: 'Alice' })
 *   },
 *   8000
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Custom timeout for slow endpoint
 * const response = await fetchWithTimeout(
 *   'https://api.example.com/heavy-report',
 *   { method: 'GET' },
 *   30000 // 30 second timeout
 * );
 * ```
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10000
): Promise<Response> {
  // Create abort controller for cancellation
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    // Clean up timeout to prevent memory leaks
    clearTimeout(timeout);
  }
}

/**
 * Fetch with automatic retry and timeout
 *
 * Combines timeout enforcement and exponential backoff retry for maximum
 * resilience. This is the recommended function for all external API calls.
 *
 * **Automatic Retry Behavior:**
 * - Automatically retries on 5xx server errors (transient failures)
 * - Does NOT retry on 4xx client errors (permanent failures)
 * - Uses exponential backoff between retries
 * - Each attempt has its own timeout
 *
 * **When to Use:**
 * - All external API calls
 * - Third-party service integrations (Stripe, etc.)
 * - Any HTTP request requiring high reliability
 * - Webhook delivery attempts
 *
 * **When NOT to Use:**
 * - Internal API routes (use regular fetch)
 * - Operations that must not be retried (idempotency concerns)
 * - Real-time requests where staleness matters
 *
 * @param {string} url - The URL to fetch
 * @param {RequestInit} [options={}] - Fetch options (method, headers, body, etc.)
 * @param {Partial<RetryConfig>} [config={}] - Retry configuration
 * @returns {Promise<Response>} The fetch Response object
 * @throws {Error} If all retry attempts fail or timeout
 *
 * @example
 * ```typescript
 * // Fetch from external API with auto-retry
 * try {
 *   const response = await fetchWithRetry(
 *     'https://api.stripe.com/v1/prices',
 *     {
 *       method: 'GET',
 *       headers: { 'Authorization': `Bearer ${apiKey}` }
 *     },
 *     {
 *       maxAttempts: 3,
 *       initialDelayMs: 1000,
 *       timeoutMs: 10000
 *     }
 *   );
 *
 *   const data = await response.json();
 *   return data;
 * } catch (error) {
 *   console.error('Failed after retries:', error);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Webhook delivery with retry
 * const deliverWebhook = async (url: string, payload: any) => {
 *   const response = await fetchWithRetry(
 *     url,
 *     {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(payload)
 *     },
 *     {
 *       maxAttempts: 5,
 *       initialDelayMs: 2000,
 *       backoffMultiplier: 2
 *     }
 *   );
 *
 *   return response.ok;
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Conservative retry for rate-limited API
 * const response = await fetchWithRetry(
 *   'https://rate-limited-api.com/data',
 *   { method: 'GET' },
 *   {
 *     maxAttempts: 5,
 *     initialDelayMs: 3000,
 *     maxDelayMs: 60000,
 *     backoffMultiplier: 3,
 *     timeoutMs: 30000
 *   }
 * );
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: Partial<RetryConfig> = {}
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetchWithTimeout(
        url,
        options,
        config.timeoutMs || 10000
      );

      // Retry on 5xx server errors (transient failures)
      // Don't retry on 4xx client errors (permanent failures)
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }

      return response;
    },
    config
  );
}
