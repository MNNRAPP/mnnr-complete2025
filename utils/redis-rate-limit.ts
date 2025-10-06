/**
 * Redis-based rate limiting utility
 * Provides distributed rate limiting using Upstash Redis
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

/**
 * Apply rate limiting to a client
 * @param clientId - Unique identifier for the client (e.g., IP address, user ID)
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns Rate limit result
 */
export async function applyRateLimit(
  clientId: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<RateLimitResult> {
  const key = `ratelimit:${clientId}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // If Redis is not configured, allow all requests
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
        totalRequests: 1,
      };
    }

    // Use Upstash Redis REST API
    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['ZREMRANGEBYSCORE', key, '-inf', windowStart.toString()],
        ['ZCARD', key],
        ['ZADD', key, now.toString(), now.toString()],
        ['EXPIRE', key, Math.ceil(windowMs / 1000).toString()],
      ]),
    });

    if (!response.ok) {
      // If Redis fails, allow the request
      console.warn('Redis rate limit check failed, allowing request');
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
        totalRequests: 1,
      };
    }

    const data = await response.json();
    const requestCount = parseInt(data[1].result) || 0;

    const allowed = requestCount < maxRequests;
    const remaining = Math.max(0, maxRequests - requestCount - 1);
    const resetTime = now + windowMs;

    return {
      allowed,
      remaining,
      resetTime,
      totalRequests: requestCount + 1,
    };

  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request to prevent blocking legitimate users
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
      totalRequests: 1,
    };
  }
}

/**
 * Check rate limit status without incrementing the counter
 * @param clientId - Unique identifier for the client
 * @param maxRequests - Maximum requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns Rate limit status
 */
export async function checkRateLimit(
  clientId: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const key = `ratelimit:${clientId}`;
  const now = Date.now();
  const _windowStart = now - windowMs;

  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: now + windowMs,
        totalRequests: 0,
      };
    }

    const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/zcard/${encodeURIComponent(key)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });

    if (!response.ok) {
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: now + windowMs,
        totalRequests: 0,
      };
    }

    const requestCount = parseInt(await response.text()) || 0;
    const allowed = requestCount < maxRequests;
    const remaining = Math.max(0, maxRequests - requestCount);
    const resetTime = now + windowMs;

    return {
      allowed,
      remaining,
      resetTime,
      totalRequests: requestCount,
    };

  } catch (error) {
    console.error('Rate limit check error:', error);
    return {
      allowed: true,
      remaining: maxRequests,
      resetTime: now + windowMs,
      totalRequests: 0,
    };
  }
}

/**
 * Reset rate limit for a client
 * @param clientId - Unique identifier for the client
 */
export async function resetRateLimit(clientId: string): Promise<void> {
  const key = `ratelimit:${clientId}`;

  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return;
    }

    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/del/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      },
    });
  } catch (error) {
    console.error('Rate limit reset error:', error);
  }
}