/**
 * Rate Limiting Middleware using Upstash Redis
 * 
 * Implements sliding window rate limiting to prevent API abuse
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Initialize Redis client
const redis = Redis.fromEnv();

// Create rate limiter instances for different endpoints
export const rateLimiters = {
  // API key operations: 10 requests per 10 seconds
  apiKeys: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit:api-keys",
  }),

  // Authentication: 5 requests per 60 seconds
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit:auth",
  }),

  // General API: 100 requests per 60 seconds
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit:api",
  }),

  // Stripe webhooks: 1000 requests per 60 seconds (high volume)
  webhooks: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "60 s"),
    analytics: true,
    prefix: "@upstash/ratelimit:webhooks",
  }),
};

/**
 * Rate limit middleware
 * 
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param limiter - Rate limiter instance to use
 * @returns NextResponse with 429 status if rate limited, null otherwise
 */
export async function rateLimit(
  identifier: string,
  limiter: Ratelimit
): Promise<NextResponse | null> {
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Add rate limit headers to response
    const headers = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(reset).toISOString(),
    };

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return null; // No rate limit hit
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open - don't block requests if rate limiting fails
    return null;
  }
}

/**
 * Get client identifier for rate limiting
 * Uses user ID if authenticated, otherwise falls back to IP address
 */
export function getClientIdentifier(
  userId?: string,
  request?: Request
): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from headers (Vercel provides this)
  const forwarded = request?.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  
  return `ip:${ip}`;
}
