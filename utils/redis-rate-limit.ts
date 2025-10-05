/**
 * Production-Grade Redis Rate Limiting with Upstash
 * Replaces in-memory rate limiting for distributed systems
 */

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Rate limit configurations for different endpoints
 */
export const redisRateLimiters = {
  // API endpoints - 60 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Authentication - 5 requests per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // Webhooks - 100 requests per minute
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:webhook',
  }),

  // Password reset - 3 requests per hour
  passwordReset: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    analytics: true,
    prefix: 'ratelimit:password',
  }),

  // MFA verification - 10 requests per 5 minutes
  mfa: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '5 m'),
    analytics: true,
    prefix: 'ratelimit:mfa',
  }),

  // GraphQL - 100 requests per minute (for future use)
  graphql: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:graphql',
  }),
};

export type RateLimiterType = keyof typeof redisRateLimiters;

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: NextRequest, userId?: string): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() :
             request.headers.get('x-real-ip') ||
             'unknown';

  return `ip:${ip}`;
}

/**
 * Check rate limit using Redis
 */
export async function checkRedisRateLimit(
  identifier: string,
  limiterType: RateLimiterType = 'api'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}> {
  try {
    const limiter = redisRateLimiters[limiterType];
    const result = await limiter.limit(identifier);

    if (!result.success) {
      logger.warn('Rate limit exceeded', {
        identifier,
        limiterType,
        limit: result.limit,
        reset: new Date(result.reset).toISOString(),
      });
    }

    return result;
  } catch (error) {
    logger.error('Redis rate limit check failed', error, { identifier, limiterType });

    // Fail open - allow request if Redis is down
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
      pending: Promise.resolve(),
    };
  }
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.reset).toISOString());
  return headers;
}

/**
 * Create rate limit exceeded response
 */
export function createRateLimitExceededResponse(reset: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      resetAt: new Date(reset).toISOString(),
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    }
  );
}

/**
 * Middleware helper to apply rate limiting
 */
export async function applyRateLimit(
  request: NextRequest,
  limiterType: RateLimiterType = 'api',
  userId?: string
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request, userId);
  const result = await checkRedisRateLimit(identifier, limiterType);

  if (!result.success) {
    return createRateLimitExceededResponse(result.reset);
  }

  return null; // No rate limit hit, continue
}

/**
 * Get rate limit analytics for monitoring dashboard
 */
export async function getRateLimitAnalytics(
  limiterType: RateLimiterType,
  timeRange: '1h' | '24h' | '7d' = '24h'
): Promise<{
  totalRequests: number;
  blockedRequests: number;
  topIdentifiers: Array<{ identifier: string; requests: number }>;
}> {
  try {
    const prefix = redisRateLimiters[limiterType].prefix || 'ratelimit';
    const keys = await redis.keys(`${prefix}:*`);

    let totalRequests = 0;
    let blockedRequests = 0;
    const identifierCounts: Record<string, number> = {};

    // This is simplified - in production, use Redis analytics features
    for (const key of keys) {
      const data = await redis.get(key);
      if (typeof data === 'number') {
        totalRequests += data;
        // Extract identifier from key
        const identifier = key.split(':').slice(2).join(':');
        identifierCounts[identifier] = (identifierCounts[identifier] || 0) + data;
      }
    }

    const topIdentifiers = Object.entries(identifierCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([identifier, requests]) => ({ identifier, requests }));

    return {
      totalRequests,
      blockedRequests,
      topIdentifiers,
    };
  } catch (error) {
    logger.error('Failed to get rate limit analytics', error);
    return {
      totalRequests: 0,
      blockedRequests: 0,
      topIdentifiers: [],
    };
  }
}

/**
 * Reset rate limit for a specific identifier (admin function)
 */
export async function resetRateLimit(
  identifier: string,
  limiterType: RateLimiterType
): Promise<void> {
  try {
    const prefix = redisRateLimiters[limiterType].prefix || 'ratelimit';
    await redis.del(`${prefix}:${identifier}`);
    logger.info('Rate limit reset', { identifier, limiterType });
  } catch (error) {
    logger.error('Failed to reset rate limit', error, { identifier, limiterType });
    throw error;
  }
}

/**
 * Block an identifier permanently (ban hammer)
 */
export async function blockIdentifier(
  identifier: string,
  reason: string,
  expiresAt?: Date
): Promise<void> {
  try {
    const key = `blocked:${identifier}`;
    const data = {
      reason,
      blockedAt: new Date().toISOString(),
      expiresAt: expiresAt?.toISOString(),
    };

    if (expiresAt) {
      const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
      await redis.setex(key, ttl, JSON.stringify(data));
    } else {
      await redis.set(key, JSON.stringify(data));
    }

    logger.warn('Identifier blocked', { identifier, reason });
  } catch (error) {
    logger.error('Failed to block identifier', error, { identifier });
    throw error;
  }
}

/**
 * Check if an identifier is blocked
 */
export async function isIdentifierBlocked(identifier: string): Promise<{
  blocked: boolean;
  reason?: string;
  expiresAt?: string;
}> {
  try {
    const key = `blocked:${identifier}`;
    const data = await redis.get(key);

    if (!data) {
      return { blocked: false };
    }

    const blockData = typeof data === 'string' ? JSON.parse(data) : data;
    return {
      blocked: true,
      reason: blockData.reason,
      expiresAt: blockData.expiresAt,
    };
  } catch (error) {
    logger.error('Failed to check if identifier is blocked', error, { identifier });
    return { blocked: false };
  }
}

/**
 * Health check for Redis connection
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed', error);
    return false;
  }
}
