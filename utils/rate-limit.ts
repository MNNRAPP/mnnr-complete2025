/**
 * Rate limiting utility
 * Simple in-memory rate limiter for development
 * For production, use Redis-based solution like Upstash or Vercel KV
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store (replace with Redis in production)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if request is rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and retry information
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetTime < now) {
    // Create new record
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + config.interval
    };
    rateLimitStore.set(identifier, newRecord);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newRecord.resetTime
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(identifier, record);

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  webhook: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 100 // 100 requests per minute
  },
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 attempts per 15 minutes
  },
  api: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  },
  strict: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 10 // 10 requests per minute
  }
};

/**
 * Create rate limit response
 */
export function createRateLimitResponse(resetTime: number): Response {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  return new Response('Rate limit exceeded. Please try again later.', {
    status: 429,
    headers: {
      'Retry-After': retryAfter.toString(),
      'X-RateLimit-Reset': new Date(resetTime).toISOString()
    }
  });
}
