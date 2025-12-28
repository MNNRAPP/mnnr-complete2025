/**
 * Advanced Caching System for MNNR
 * 
 * Provides multi-layer caching with:
 * - In-memory LRU cache (L1)
 * - Redis cache (L2)
 * - Stale-while-revalidate pattern
 * - Cache invalidation strategies
 * - Performance metrics
 */

import { Redis } from '@upstash/redis';

// ============================================================================
// TYPES
// ============================================================================

interface CacheConfig {
  ttl: number;           // Time to live in seconds
  staleTime?: number;    // Time before stale (for SWR pattern)
  maxSize?: number;      // Max items in memory cache
  namespace?: string;    // Cache key namespace
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  staleTime?: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  staleHits: number;
  errors: number;
  avgLatency: number;
}

type CacheFetcher<T> = () => Promise<T>;

// ============================================================================
// LRU CACHE (In-Memory L1)
// ============================================================================

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;

  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: string): CacheEntry<T> | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, entry);
    }
    return entry;
  }

  set(key: string, entry: CacheEntry<T>): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, entry);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  prune(): number {
    const now = Date.now();
    let pruned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl * 1000) {
        this.cache.delete(key);
        pruned++;
      }
    }
    
    return pruned;
  }
}

// ============================================================================
// ADVANCED CACHE CLASS
// ============================================================================

export class AdvancedCache {
  private l1Cache: LRUCache<unknown>;
  private redis: Redis | null;
  private stats: CacheStats;
  private namespace: string;
  private latencies: number[];

  constructor(config: { maxMemoryItems?: number; namespace?: string } = {}) {
    this.l1Cache = new LRUCache(config.maxMemoryItems || 1000);
    this.namespace = config.namespace || 'mnnr';
    this.stats = {
      hits: 0,
      misses: 0,
      staleHits: 0,
      errors: 0,
      avgLatency: 0,
    };
    this.latencies = [];

    // Initialize Redis if available
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
      } else {
        this.redis = null;
      }
    } catch {
      this.redis = null;
    }

    // Periodic cleanup
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.l1Cache.prune(), 60000); // Every minute
    }
  }

  private buildKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  private recordLatency(latency: number): void {
    this.latencies.push(latency);
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }
    this.stats.avgLatency = this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.timestamp + entry.ttl * 1000;
  }

  private isStale(entry: CacheEntry<unknown>): boolean {
    if (!entry.staleTime) return this.isExpired(entry);
    return Date.now() > entry.timestamp + entry.staleTime * 1000;
  }

  /**
   * Get value from cache with stale-while-revalidate pattern
   */
  async get<T>(
    key: string,
    fetcher: CacheFetcher<T>,
    config: CacheConfig
  ): Promise<T> {
    const startTime = Date.now();
    const fullKey = this.buildKey(key);

    try {
      // Check L1 (memory) cache first
      const l1Entry = this.l1Cache.get(fullKey) as CacheEntry<T> | undefined;
      
      if (l1Entry) {
        if (!this.isExpired(l1Entry)) {
          this.stats.hits++;
          this.recordLatency(Date.now() - startTime);
          
          // If stale, revalidate in background
          if (this.isStale(l1Entry)) {
            this.stats.staleHits++;
            this.revalidateInBackground(key, fetcher, config);
          }
          
          return l1Entry.data;
        }
      }

      // Check L2 (Redis) cache
      if (this.redis) {
        try {
          const redisData = await this.redis.get<CacheEntry<T>>(fullKey);
          
          if (redisData && !this.isExpired(redisData)) {
            this.stats.hits++;
            
            // Populate L1 cache
            this.l1Cache.set(fullKey, redisData);
            
            this.recordLatency(Date.now() - startTime);
            
            // If stale, revalidate in background
            if (this.isStale(redisData)) {
              this.stats.staleHits++;
              this.revalidateInBackground(key, fetcher, config);
            }
            
            return redisData.data;
          }
        } catch (redisError) {
          console.warn('Redis cache error:', redisError);
          this.stats.errors++;
        }
      }

      // Cache miss - fetch fresh data
      this.stats.misses++;
      const data = await fetcher();
      
      // Store in both caches
      await this.set(key, data, config);
      
      this.recordLatency(Date.now() - startTime);
      return data;

    } catch (error) {
      this.stats.errors++;
      this.recordLatency(Date.now() - startTime);
      throw error;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, data: T, config: CacheConfig): Promise<void> {
    const fullKey = this.buildKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl,
      staleTime: config.staleTime,
    };

    // Set in L1 cache
    this.l1Cache.set(fullKey, entry);

    // Set in L2 cache (Redis)
    if (this.redis) {
      try {
        await this.redis.set(fullKey, entry, { ex: config.ttl });
      } catch (error) {
        console.warn('Redis set error:', error);
        this.stats.errors++;
      }
    }
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(key: string): Promise<void> {
    const fullKey = this.buildKey(key);
    
    // Remove from L1
    this.l1Cache.delete(fullKey);
    
    // Remove from L2
    if (this.redis) {
      try {
        await this.redis.del(fullKey);
      } catch (error) {
        console.warn('Redis delete error:', error);
        this.stats.errors++;
      }
    }
  }

  /**
   * Invalidate all entries matching a pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    const fullPattern = this.buildKey(pattern);
    let count = 0;

    // Clear matching L1 entries (simplified - clears all for pattern)
    this.l1Cache.clear();
    count++;

    // Clear matching L2 entries
    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${fullPattern}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          count += keys.length;
        }
      } catch (error) {
        console.warn('Redis pattern delete error:', error);
        this.stats.errors++;
      }
    }

    return count;
  }

  /**
   * Revalidate cache entry in background
   */
  private async revalidateInBackground<T>(
    key: string,
    fetcher: CacheFetcher<T>,
    config: CacheConfig
  ): Promise<void> {
    // Don't await - run in background
    fetcher()
      .then((data) => this.set(key, data, config))
      .catch((error) => {
        console.warn('Background revalidation failed:', error);
        this.stats.errors++;
      });
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number; memorySize: number } {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      memorySize: this.l1Cache.size(),
    };
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    this.l1Cache.clear();
    
    if (this.redis) {
      try {
        const keys = await this.redis.keys(`${this.namespace}:*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        console.warn('Redis clear error:', error);
        this.stats.errors++;
      }
    }
  }
}

// ============================================================================
// CACHE INSTANCES
// ============================================================================

// Global cache instance
export const cache = new AdvancedCache({ namespace: 'mnnr' });

// Specialized cache instances
export const apiCache = new AdvancedCache({ namespace: 'mnnr:api', maxMemoryItems: 500 });
export const userCache = new AdvancedCache({ namespace: 'mnnr:user', maxMemoryItems: 200 });
export const priceCache = new AdvancedCache({ namespace: 'mnnr:price', maxMemoryItems: 50 });

// ============================================================================
// CACHE PRESETS
// ============================================================================

export const CachePresets = {
  // Short-lived cache for frequently changing data
  SHORT: { ttl: 60, staleTime: 30 },
  
  // Medium cache for semi-static data
  MEDIUM: { ttl: 300, staleTime: 180 },
  
  // Long cache for rarely changing data
  LONG: { ttl: 3600, staleTime: 1800 },
  
  // Very long cache for static data
  STATIC: { ttl: 86400, staleTime: 43200 },
  
  // API response cache
  API: { ttl: 60, staleTime: 30 },
  
  // User data cache
  USER: { ttl: 300, staleTime: 120 },
  
  // Pricing data cache
  PRICING: { ttl: 3600, staleTime: 1800 },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Cache decorator for functions
 */
export function cached<T>(
  keyGenerator: (...args: unknown[]) => string,
  config: CacheConfig
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const key = keyGenerator(...args);
      return cache.get<T>(key, () => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}

/**
 * Simple cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fetcher: CacheFetcher<T>,
  config: CacheConfig = CachePresets.MEDIUM
): Promise<T> {
  return cache.get(key, fetcher, config);
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  ttl: number = 300
): T {
  const memoCache = new Map<string, { value: ReturnType<T>; expires: number }>();

  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const cached = memoCache.get(key);
    
    if (cached && Date.now() < cached.expires) {
      return cached.value;
    }

    const result = fn(...args);
    memoCache.set(key, { value: result as ReturnType<T>, expires: Date.now() + ttl * 1000 });
    
    return result;
  }) as T;
}
