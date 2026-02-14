/**
 * Redis Caching Utilities
 *
 * This module provides a production-grade caching layer using Upstash Redis
 * for the MNNR platform. It implements various caching patterns to reduce
 * database load, improve API response times, and enhance user experience.
 *
 * **Features:**
 * - Distributed caching with Upstash Redis
 * - Multiple TTL (Time-To-Live) configurations
 * - Cache-aside pattern implementation
 * - Pattern-based cache invalidation
 * - Type-safe cache operations
 * - Automatic error handling and fallback
 *
 * **Use Cases:**
 * - API response caching
 * - Database query result caching
 * - User session data caching
 * - Expensive computation result caching
 * - Rate limiting data storage
 *
 * @module lib/cache
 *
 * @example
 * ```typescript
 * import { getCached, setCached, getOrSetCached, CACHE_TTL, cacheKeys } from '@/lib/cache';
 *
 * // Simple cache get/set
 * const user = await getCached<User>(cacheKeys.userProfile('user-123'));
 * if (!user) {
 *   const freshUser = await db.getUser('user-123');
 *   await setCached(cacheKeys.userProfile('user-123'), freshUser, CACHE_TTL.LONG);
 * }
 *
 * // Cache-aside pattern (recommended)
 * const subscription = await getOrSetCached(
 *   cacheKeys.subscription('user-123'),
 *   () => db.getSubscription('user-123'),
 *   CACHE_TTL.MEDIUM
 * );
 * ```
 */

import { Redis } from "@upstash/redis";

/**
 * Redis client instance
 * Initialized from environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
const redis = Redis.fromEnv();

/**
 * Cache Time-To-Live (TTL) Constants
 *
 * Predefined TTL values in seconds for different caching scenarios.
 * Choose appropriate TTL based on data freshness requirements.
 *
 * @constant
 * @type {Object}
 * @property {number} SHORT - 1 minute (60s) - For rapidly changing data
 * @property {number} MEDIUM - 5 minutes (300s) - Default for most API responses
 * @property {number} LONG - 1 hour (3600s) - For relatively static data
 * @property {number} DAY - 24 hours (86400s) - For very static data like configuration
 *
 * @example
 * ```typescript
 * // Cache API response for 5 minutes
 * await setCached('api:response', data, CACHE_TTL.MEDIUM);
 *
 * // Cache configuration for 24 hours
 * await setCached('config:app', config, CACHE_TTL.DAY);
 * ```
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

/**
 * Retrieve cached data from Redis
 *
 * Attempts to fetch data from the Redis cache. Returns null if the key doesn't
 * exist or if an error occurs. This function never throws - errors are caught
 * and logged, ensuring graceful degradation.
 *
 * @template T - The expected type of the cached data
 * @param {string} key - The cache key to retrieve
 * @returns {Promise<T | null>} The cached data or null if not found/error
 *
 * @example
 * ```typescript
 * // Get user profile from cache
 * const user = await getCached<User>('user:profile:123');
 * if (user) {
 *   console.log('Cache hit!', user);
 * } else {
 *   console.log('Cache miss - fetch from database');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Type-safe caching
 * interface ApiResponse {
 *   data: any[];
 *   total: number;
 * }
 * const response = await getCached<ApiResponse>('api:users:list');
 * if (response) {
 *   console.log(`Found ${response.total} users in cache`);
 * }
 * ```
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    return cached as T | null;
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

/**
 * Store data in Redis cache with expiration
 *
 * Saves data to Redis with an optional TTL (Time-To-Live). Data is automatically
 * JSON-serialized before storage. If an error occurs, it's logged but doesn't throw,
 * allowing the application to continue without caching.
 *
 * @template T - The type of data being cached
 * @param {string} key - The cache key under which to store the data
 * @param {T} data - The data to cache (will be JSON-serialized)
 * @param {number} [ttl=CACHE_TTL.MEDIUM] - Time-to-live in seconds (default: 5 minutes)
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * // Cache user data for 1 hour
 * await setCached(
 *   'user:profile:123',
 *   { id: '123', name: 'Alice', email: 'alice@example.com' },
 *   CACHE_TTL.LONG
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Cache API response for 1 minute
 * const apiData = await fetchFromExternalAPI();
 * await setCached('api:external:data', apiData, CACHE_TTL.SHORT);
 * ```
 *
 * @example
 * ```typescript
 * // Cache with custom TTL (30 seconds)
 * await setCached('temp:data', tempData, 30);
 * ```
 */
export async function setCached<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
}

/**
 * Delete a cached entry from Redis
 *
 * Removes a specific key from the cache. Useful for cache invalidation when
 * data is updated or deleted. Errors are caught and logged.
 *
 * @param {string} key - The cache key to delete
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * // Invalidate user cache after profile update
 * await updateUserProfile(userId, newData);
 * await deleteCached(`user:profile:${userId}`);
 * ```
 *
 * @example
 * ```typescript
 * // Clear cache after data mutation
 * await createNewPost(postData);
 * await deleteCached('posts:list'); // Invalidate cached post list
 * ```
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
}

/**
 * Cache-Aside Pattern Implementation
 *
 * The recommended way to use caching. This function implements the cache-aside
 * (lazy-loading) pattern:
 * 1. Try to get data from cache
 * 2. If cache miss, fetch fresh data using the provided fetcher function
 * 3. Store the fresh data in cache
 * 4. Return the data
 *
 * This pattern ensures data is only fetched when needed and automatically
 * populates the cache.
 *
 * @template T - The type of data being cached
 * @param {string} key - The cache key
 * @param {() => Promise<T>} fetcher - Function to fetch fresh data on cache miss
 * @param {number} [ttl=CACHE_TTL.MEDIUM] - Time-to-live in seconds (default: 5 minutes)
 * @returns {Promise<T>} The cached or freshly fetched data
 *
 * @example
 * ```typescript
 * // Fetch user with automatic caching
 * const user = await getOrSetCached(
 *   cacheKeys.userProfile(userId),
 *   async () => {
 *     const { data } = await supabase
 *       .from('users')
 *       .select('*')
 *       .eq('id', userId)
 *       .single();
 *     return data;
 *   },
 *   CACHE_TTL.LONG
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Cache expensive API call
 * const prices = await getOrSetCached(
 *   cacheKeys.prices(),
 *   async () => {
 *     const prices = await stripe.prices.list({ active: true });
 *     return prices.data;
 *   },
 *   CACHE_TTL.LONG
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Cache complex calculation
 * const analytics = await getOrSetCached(
 *   `analytics:${userId}:${date}`,
 *   () => calculateComplexAnalytics(userId, date),
 *   CACHE_TTL.DAY
 * );
 * ```
 */
export async function getOrSetCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const fresh = await fetcher();

  // Store in cache
  await setCached(key, fresh, ttl);

  return fresh;
}

/**
 * Invalidate multiple cache entries by pattern
 *
 * Deletes all cache keys matching a given pattern. Useful for bulk cache
 * invalidation when data is updated. Uses Redis KEYS command followed by
 * batch deletion.
 *
 * **Warning:** The KEYS command can be slow on large datasets. Use with
 * caution in production or consider using Redis SCAN for better performance.
 *
 * @param {string} pattern - Redis key pattern (supports * wildcards)
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * // Invalidate all user-related caches
 * await invalidateCachePattern('user:*');
 * ```
 *
 * @example
 * ```typescript
 * // Invalidate all caches for a specific user
 * await invalidateCachePattern(`user:profile:${userId}:*`);
 * ```
 *
 * @example
 * ```typescript
 * // Clear all API response caches
 * await invalidateCachePattern('api:response:*');
 * ```
 *
 * @example
 * ```typescript
 * // Invalidate usage caches for an API key
 * await invalidateCachePattern(`usage:${apiKeyId}:*`);
 * ```
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Cache invalidation error for pattern ${pattern}:`, error);
  }
}

/**
 * Standard Cache Key Generators
 *
 * Centralized cache key generation to ensure consistency across the application.
 * All cache keys follow the pattern: `resource:identifier` or
 * `resource:identifier:subresource`.
 *
 * **Benefits:**
 * - Prevents typos and inconsistencies
 * - Makes cache invalidation easier
 * - Provides type-safe key generation
 * - Documents available cache keys
 *
 * @constant
 * @type {Object}
 *
 * @example
 * ```typescript
 * // Get user API keys from cache
 * const keys = await getCached(cacheKeys.apiKeys(userId));
 *
 * // Cache user profile
 * await setCached(cacheKeys.userProfile(userId), profile, CACHE_TTL.LONG);
 *
 * // Get subscription with cache-aside pattern
 * const sub = await getOrSetCached(
 *   cacheKeys.subscription(userId),
 *   () => fetchSubscriptionFromDB(userId),
 *   CACHE_TTL.MEDIUM
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Invalidate all caches for a user
 * await invalidateCachePattern(`api_keys:${userId}*`);
 * await invalidateCachePattern(`user_profile:${userId}*`);
 * await invalidateCachePattern(`subscription:${userId}*`);
 * ```
 */
export const cacheKeys = {
  /** API keys for a specific user: `api_keys:${userId}` */
  apiKeys: (userId: string) => `api_keys:${userId}`,

  /** User profile data: `user_profile:${userId}` */
  userProfile: (userId: string) => `user_profile:${userId}`,

  /** User subscription data: `subscription:${userId}` */
  subscription: (userId: string) => `subscription:${userId}`,

  /** Usage metrics for an API key and period: `usage:${apiKeyId}:${period}` */
  usage: (apiKeyId: string, period: string) => `usage:${apiKeyId}:${period}`,

  /** Stripe prices list (global): `stripe:prices` */
  prices: () => `stripe:prices`,
};
