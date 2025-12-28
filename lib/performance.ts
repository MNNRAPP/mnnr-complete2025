/**
 * Performance Optimization Utilities for MNNR
 * 
 * Provides:
 * - Request deduplication
 * - Batch processing
 * - Lazy loading helpers
 * - Performance measurement
 * - Resource hints
 */

// ============================================================================
// REQUEST DEDUPLICATION
// ============================================================================

type PendingRequest<T> = {
  promise: Promise<T>;
  timestamp: number;
};

const pendingRequests = new Map<string, PendingRequest<unknown>>();
const DEDUP_WINDOW = 100; // ms

/**
 * Deduplicate identical requests within a time window
 */
export async function deduplicateRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const pending = pendingRequests.get(key);

  // Return existing promise if within dedup window
  if (pending && now - pending.timestamp < DEDUP_WINDOW) {
    return pending.promise as Promise<T>;
  }

  // Create new request
  const promise = fetcher().finally(() => {
    // Clean up after completion
    setTimeout(() => pendingRequests.delete(key), DEDUP_WINDOW);
  });

  pendingRequests.set(key, { promise, timestamp: now });
  return promise;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

interface BatchConfig {
  maxBatchSize: number;
  maxWaitTime: number;
}

type BatchProcessor<TInput, TOutput> = (items: TInput[]) => Promise<TOutput[]>;

/**
 * Batch multiple requests into a single operation
 */
export function createBatcher<TInput, TOutput>(
  processor: BatchProcessor<TInput, TOutput>,
  config: BatchConfig = { maxBatchSize: 50, maxWaitTime: 10 }
) {
  let batch: TInput[] = [];
  let resolvers: Array<{
    resolve: (value: TOutput) => void;
    reject: (error: Error) => void;
  }> = [];
  let timeout: NodeJS.Timeout | null = null;

  const flush = async () => {
    if (batch.length === 0) return;

    const currentBatch = batch;
    const currentResolvers = resolvers;
    batch = [];
    resolvers = [];
    timeout = null;

    try {
      const results = await processor(currentBatch);
      currentResolvers.forEach((resolver, index) => {
        resolver.resolve(results[index]);
      });
    } catch (error) {
      currentResolvers.forEach((resolver) => {
        resolver.reject(error as Error);
      });
    }
  };

  return (item: TInput): Promise<TOutput> => {
    return new Promise((resolve, reject) => {
      batch.push(item);
      resolvers.push({ resolve, reject });

      if (batch.length >= config.maxBatchSize) {
        if (timeout) clearTimeout(timeout);
        flush();
      } else if (!timeout) {
        timeout = setTimeout(flush, config.maxWaitTime);
      }
    });
  };
}

// ============================================================================
// PERFORMANCE MEASUREMENT
// ============================================================================

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const metrics: PerformanceMetric[] = [];
const MAX_METRICS = 1000;

/**
 * Measure execution time of an async function
 */
export async function measure<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    recordMetric(name, duration, metadata);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    recordMetric(`${name}:error`, duration, { ...metadata, error: String(error) });
    throw error;
  }
}

/**
 * Measure execution time of a sync function
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, unknown>
): T {
  const start = performance.now();
  
  try {
    const result = fn();
    const duration = performance.now() - start;
    
    recordMetric(name, duration, metadata);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    recordMetric(`${name}:error`, duration, { ...metadata, error: String(error) });
    throw error;
  }
}

function recordMetric(
  name: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  metrics.push({
    name,
    duration,
    timestamp: Date.now(),
    metadata,
  });

  // Keep metrics bounded
  if (metrics.length > MAX_METRICS) {
    metrics.shift();
  }
}

/**
 * Get performance statistics
 */
export function getPerformanceStats(name?: string): {
  count: number;
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
} {
  const filtered = name
    ? metrics.filter((m) => m.name === name)
    : metrics;

  if (filtered.length === 0) {
    return { count: 0, avg: 0, min: 0, max: 0, p50: 0, p95: 0, p99: 0 };
  }

  const durations = filtered.map((m) => m.duration).sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);

  return {
    count: durations.length,
    avg: sum / durations.length,
    min: durations[0],
    max: durations[durations.length - 1],
    p50: durations[Math.floor(durations.length * 0.5)],
    p95: durations[Math.floor(durations.length * 0.95)],
    p99: durations[Math.floor(durations.length * 0.99)],
  };
}

/**
 * Clear metrics
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

// ============================================================================
// LAZY LOADING
// ============================================================================

/**
 * Create a lazy-loaded value
 */
export function lazy<T>(initializer: () => T): () => T {
  let value: T | undefined;
  let initialized = false;

  return () => {
    if (!initialized) {
      value = initializer();
      initialized = true;
    }
    return value as T;
  };
}

/**
 * Create an async lazy-loaded value
 */
export function lazyAsync<T>(initializer: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;

  return () => {
    if (!promise) {
      promise = initializer();
    }
    return promise;
  };
}

// ============================================================================
// DEBOUNCE & THROTTLE
// ============================================================================

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ============================================================================
// RESOURCE HINTS
// ============================================================================

/**
 * Preload a resource
 */
export function preload(url: string, as: 'script' | 'style' | 'image' | 'font'): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

/**
 * Prefetch a resource
 */
export function prefetch(url: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Preconnect to a domain
 */
export function preconnect(url: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

// ============================================================================
// IDLE CALLBACK
// ============================================================================

/**
 * Run function when browser is idle
 */
export function runWhenIdle(fn: () => void, timeout: number = 1000): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn, { timeout });
  } else {
    setTimeout(fn, 1);
  }
}

// ============================================================================
// INTERSECTION OBSERVER HELPER
// ============================================================================

/**
 * Create a visibility observer for lazy loading
 */
export function createVisibilityObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// ============================================================================
// CHUNK PROCESSING
// ============================================================================

/**
 * Process large arrays in chunks to avoid blocking
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => R | Promise<R>,
  chunkSize: number = 100,
  delayBetweenChunks: number = 0
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);

    if (delayBetweenChunks > 0 && i + chunkSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenChunks));
    }
  }

  return results;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const Performance = {
  measure,
  measureSync,
  getStats: getPerformanceStats,
  clearMetrics,
  deduplicateRequest,
  createBatcher,
  lazy,
  lazyAsync,
  debounce,
  throttle,
  preload,
  prefetch,
  preconnect,
  runWhenIdle,
  createVisibilityObserver,
  processInChunks,
};
