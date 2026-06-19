/**
 * Rate Limiting Middleware using Upstash Redis
 *
 * SEC-FIX 2026-06-19 (Finding #7): Hardened per ChatGPT audit.
 *   - Fail-CLOSED by default on backend errors for sensitive endpoints
 *     (auth / API-key / payment / webhook). Optional 'degraded' mode for
 *     low-stakes public endpoints (allow + logged warning + in-memory fallback).
 *   - Production REQUIRES Upstash Redis env (UPSTASH_REDIS_REST_URL +
 *     UPSTASH_REDIS_REST_TOKEN). Missing env in production throws at module
 *     load. Dev falls back to in-memory with a prominent warning.
 *   - Multi-dimensional limits via composite keys
 *     (rl:{route}:{dimension}:{value}) — per-IP, per-user, per-API-key, per-route.
 *   - Sliding-window algorithm via @upstash/ratelimit (token bucket optional —
 *     see RateLimits preset block; sliding window chosen for simplicity).
 *   - Audit logging on denial via lib/audit-trail.ts (logAuditEvent).
 *   - Strict named presets for sensitive routes (AUTH_LOGIN, AUTH_SIGNUP,
 *     PASSWORD_RESET, API_KEYS, X402, NEWSLETTER, WEBHOOK, PUBLIC_GET).
 *
 * BACKWARDS COMPATIBLE: the legacy `rateLimit(identifier, limiter)` signature
 * and the `rateLimiters` registry continue to work for existing call sites in
 * app/api/keys/route.ts etc. New code should prefer `enforceRateLimit(opts)`.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { logAuditEvent, AuditEventType, AuditSeverity } from "@/lib/audit-trail";

// -------------------------------------------------------------------------
// Environment / backend selection
// -------------------------------------------------------------------------

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const IS_PROD = process.env.NODE_ENV === "production";
const HAS_REDIS = Boolean(REDIS_URL && REDIS_TOKEN);

if (!HAS_REDIS && IS_PROD) {
  // Fail at module load in production — no Redis means no real rate limiting,
  // which means a single noisy actor can knock the app over. Block deploy.
  throw new Error(
    "[rate-limit] UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are required in production. " +
      "In-memory fallback is dev-only because it does not coordinate across serverless instances."
  );
}

if (!HAS_REDIS && !IS_PROD) {
  // Dev-only: prominent warning so nobody mistakes the fallback for real protection.
   
  console.warn(
    "\x1b[33m[rate-limit] WARNING: UPSTASH_REDIS_REST_* not set. Falling back to PROCESS-LOCAL " +
      "in-memory rate limiting. This is DEV-ONLY. It does not share state across instances or " +
      "survive restarts. Production builds will refuse to start without Redis.\x1b[0m"
  );
}

// Initialize Redis client only when configured.
const redis = HAS_REDIS ? Redis.fromEnv() : null;

// -------------------------------------------------------------------------
// In-memory fallback (DEV ONLY)
// -------------------------------------------------------------------------

interface MemBucket {
  count: number;
  resetAt: number; // epoch ms
}

const memStore = new Map<string, MemBucket>();

function memLimit(
  key: string,
  max: number,
  windowSec: number
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const bucket = memStore.get(key);
  if (!bucket || bucket.resetAt <= now) {
    const fresh: MemBucket = { count: 1, resetAt: now + windowSec * 1000 };
    memStore.set(key, fresh);
    return { success: true, limit: max, remaining: max - 1, reset: fresh.resetAt };
  }
  bucket.count += 1;
  const remaining = Math.max(0, max - bucket.count);
  return {
    success: bucket.count <= max,
    limit: max,
    remaining,
    reset: bucket.resetAt,
  };
}

// Periodic GC for the in-memory store (no-op in prod since memStore is unused).
if (!IS_PROD && !HAS_REDIS && typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memStore.entries()) {
      if (v.resetAt <= now) memStore.delete(k);
    }
  }, 60_000).unref?.();
}

// -------------------------------------------------------------------------
// Legacy registry (kept for back-compat with existing call sites)
// -------------------------------------------------------------------------

function buildLegacyLimiter(max: number, window: `${number} s`, prefix: string) {
  if (!redis) {
    // Stub — calls will route through memLimit via the legacy `rateLimit` shim.
    return null;
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    analytics: true,
    prefix,
  });
}

export const rateLimiters = {
  // API key operations: 10 requests per 10 seconds
  apiKeys: buildLegacyLimiter(10, "10 s", "@upstash/ratelimit:api-keys"),
  // Authentication: 5 requests per 60 seconds
  auth: buildLegacyLimiter(5, "60 s", "@upstash/ratelimit:auth"),
  // General API: 100 requests per 60 seconds
  api: buildLegacyLimiter(100, "60 s", "@upstash/ratelimit:api"),
  // Stripe webhooks: 1000 requests per 60 seconds (high volume)
  webhooks: buildLegacyLimiter(1000, "60 s", "@upstash/ratelimit:webhooks"),
} as const;

// Static metadata so the dev/in-memory fallback knows the right max/window
// per legacy limiter — same numbers as the Upstash configs above.
const LEGACY_META: Record<
  keyof typeof rateLimiters,
  { max: number; window: number; route: string; failureMode: FailureMode }
> = {
  apiKeys: { max: 10, window: 10, route: "legacy:apiKeys", failureMode: "closed" },
  auth: { max: 5, window: 60, route: "legacy:auth", failureMode: "closed" },
  api: { max: 100, window: 60, route: "legacy:api", failureMode: "degraded" },
  webhooks: { max: 1000, window: 60, route: "legacy:webhooks", failureMode: "closed" },
};

// -------------------------------------------------------------------------
// New options-based API
// -------------------------------------------------------------------------

export type FailureMode = "closed" | "degraded";

export interface RateLimitOptions {
  /** Unique identifier for the rate-limit dimension (user id, IP, API key id). */
  key: string;
  /** Route/group label (e.g. "/api/v1/keys"). Becomes part of the composite key. */
  route: string;
  /** Max requests allowed per window. */
  max: number;
  /** Window length in seconds. */
  window: number;
  /**
   * Backend failure policy.
   *  - 'closed' (default): if Redis errors, DENY the request. Use for auth,
   *    payments, API keys, webhooks, anything security-sensitive.
   *  - 'degraded': if Redis errors, fall back to in-memory + log a warning.
   *    Use only for low-stakes public endpoints (e.g. health checks).
   */
  failureMode?: FailureMode;
  /**
   * Optional logical dimension tag — included in audit metadata so you can tell
   * an IP-based denial from a user-based denial in the audit trail.
   */
  dimension?: "ip" | "user" | "api_key" | "route" | "global";
  /** Optional already-resolved user id for audit logging. */
  userId?: string;
  /** Optional actor IP for audit logging. */
  actorIp?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Epoch ms at which the window resets. */
  resetAt: number;
  /** Short reason code when denied (e.g. 'rate_limited', 'backend_error_failclosed'). */
  reason?: string;
}

/**
 * Build the canonical composite key, e.g. `rl:user:{uid}:route:/api/v1/keys`.
 */
function compositeKey(opts: RateLimitOptions): string {
  const dim = opts.dimension ?? "key";
  // route is normalized — strip leading slash so the segment count is stable
  const route = opts.route.startsWith("/") ? opts.route.slice(1) : opts.route;
  return `rl:${dim}:${opts.key}:route:${route}:w${opts.window}:m${opts.max}`;
}

/**
 * Per-(max,window,prefix) cached Upstash limiter. Building a Ratelimit on every
 * request would re-allocate; cache them on a Map.
 */
const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(max: number, window: number): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${max}:${window}`;
  let l = limiterCache.get(cacheKey);
  if (!l) {
    l = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${window} s` as `${number} s`),
      analytics: true,
      prefix: "rl:v2",
    });
    limiterCache.set(cacheKey, l);
  }
  return l;
}

/**
 * Core check. Returns a structured result rather than a NextResponse so callers
 * can build their own 429 payload (CSP, custom headers, JSON shape, etc.).
 */
export async function enforceRateLimit(
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const failureMode: FailureMode = opts.failureMode ?? "closed";
  const key = compositeKey(opts);

  // Path A: Redis configured — try Upstash first.
  const upstash = getUpstashLimiter(opts.max, opts.window);
  if (upstash) {
    try {
      const r = await upstash.limit(key);
      const result: RateLimitResult = {
        allowed: r.success,
        remaining: r.remaining,
        resetAt: r.reset,
        reason: r.success ? undefined : "rate_limited",
      };
      if (!result.allowed) {
        await safeAuditDenial(opts, "rate_limited");
      }
      return result;
    } catch (err) {
      // Redis blew up. Decide based on failure mode.
       
      console.error("[rate-limit] Upstash backend error", {
        route: opts.route,
        dimension: opts.dimension,
        err: err instanceof Error ? err.message : String(err),
      });

      if (failureMode === "closed") {
        await safeAuditDenial(opts, "backend_error_failclosed");
        return {
          allowed: false,
          remaining: 0,
          resetAt: Date.now() + opts.window * 1000,
          reason: "backend_error_failclosed",
        };
      }
      // failureMode === 'degraded' → fall through to in-memory.
       
      console.warn(
        "[rate-limit] DEGRADED fallback to in-memory for route=%s key=%s (failureMode=degraded)",
        opts.route,
        opts.key
      );
      const m = memLimit(key, opts.max, opts.window);
      const result: RateLimitResult = {
        allowed: m.success,
        remaining: m.remaining,
        resetAt: m.reset,
        reason: m.success ? "degraded_inmem" : "rate_limited_degraded",
      };
      if (!result.allowed) {
        await safeAuditDenial(opts, "rate_limited_degraded");
      }
      return result;
    }
  }

  // Path B: No Redis configured (dev only — production already threw at module load).
  // Use in-memory regardless of failure mode; it's already the only option.
  const m = memLimit(key, opts.max, opts.window);
  const result: RateLimitResult = {
    allowed: m.success,
    remaining: m.remaining,
    resetAt: m.reset,
    reason: m.success ? undefined : "rate_limited",
  };
  if (!result.allowed) {
    await safeAuditDenial(opts, "rate_limited");
  }
  return result;
}

async function safeAuditDenial(opts: RateLimitOptions, reason: string): Promise<void> {
  // Audit logging is best-effort — it must not itself block the request or
  // throw out of the rate limiter.
  try {
    await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
      severity:
        reason === "backend_error_failclosed"
          ? AuditSeverity.ERROR
          : AuditSeverity.WARNING,
      userId: opts.userId,
      ipAddress: opts.actorIp,
      resource: opts.route,
      action: "rate_limit",
      metadata: {
        outcome: "denied",
        reason,
        max: opts.max,
        window: opts.window,
        dimension: opts.dimension ?? "key",
        failureMode: opts.failureMode ?? "closed",
      },
    });
  } catch (err) {
     
    console.error("[rate-limit] audit log failed", err);
  }
}

// -------------------------------------------------------------------------
// Strict-limit presets for sensitive routes
// -------------------------------------------------------------------------

export interface RateLimitPreset {
  max: number;
  window: number;
  failureMode: FailureMode;
}

/**
 * Named presets — apply consistently across routes so you don't fat-finger the
 * thresholds in each handler.
 *
 * Usage:
 *   const r = await enforceRateLimit({
 *     ...RateLimits.AUTH_LOGIN,
 *     key: ip, route: '/api/auth/login', dimension: 'ip', actorIp: ip,
 *   });
 *   if (!r.allowed) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
 */
export const RateLimits = {
  AUTH_LOGIN: { max: 5, window: 60, failureMode: "closed" } as RateLimitPreset,
  AUTH_SIGNUP: { max: 3, window: 300, failureMode: "closed" } as RateLimitPreset,
  PASSWORD_RESET: { max: 3, window: 600, failureMode: "closed" } as RateLimitPreset,
  API_KEYS: { max: 30, window: 60, failureMode: "closed" } as RateLimitPreset,
  X402: { max: 10, window: 60, failureMode: "closed" } as RateLimitPreset,
  NEWSLETTER: { max: 3, window: 600, failureMode: "closed" } as RateLimitPreset,
  WEBHOOK: { max: 100, window: 60, failureMode: "closed" } as RateLimitPreset,
  PUBLIC_GET: { max: 200, window: 60, failureMode: "degraded" } as RateLimitPreset,
} as const;

// -------------------------------------------------------------------------
// Legacy shim — preserves the old signature used by app/api/keys/route.ts etc.
// -------------------------------------------------------------------------

/**
 * Legacy rate-limit middleware (preserved interface).
 *
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param limiter - Rate limiter instance (or null if Redis not configured).
 *                  In dev with no Redis, routes through in-memory fallback.
 * @returns NextResponse with 429 status if rate limited, null otherwise.
 *
 * SEC-FIX: this used to fail OPEN unconditionally on backend errors. Now it
 * resolves the limiter's metadata against LEGACY_META and applies the configured
 * failureMode (closed for auth/apiKeys/webhooks, degraded for general api).
 */
export async function rateLimit(
  identifier: string,
  limiter: Ratelimit | null
): Promise<NextResponse | null> {
  // Figure out which legacy bucket this limiter belongs to so we know the
  // failure mode + the max/window for the in-memory fallback path.
  let meta: { max: number; window: number; route: string; failureMode: FailureMode } | null = null;
  let bucketName: keyof typeof rateLimiters | null = null;
  for (const [name, l] of Object.entries(rateLimiters) as [
    keyof typeof rateLimiters,
    Ratelimit | null,
  ][]) {
    if (l === limiter) {
      bucketName = name;
      meta = LEGACY_META[name];
      break;
    }
  }
  // Fallback if the caller passed a custom Ratelimit not in the registry:
  // treat as 'closed' with conservative defaults.
  if (!meta) {
    meta = { max: 60, window: 60, route: "legacy:unknown", failureMode: "closed" };
  }

  try {
    let success: boolean;
    let limit: number;
    let remaining: number;
    let reset: number;

    if (limiter && redis) {
      const r = await limiter.limit(identifier);
      success = r.success;
      limit = r.limit;
      remaining = r.remaining;
      reset = r.reset;
    } else {
      // No Redis (dev) — in-memory fallback. Composite key so different
      // legacy buckets don't collide on identifier alone.
      const key = `legacy:${bucketName ?? "unknown"}:${identifier}`;
      const m = memLimit(key, meta.max, meta.window);
      success = m.success;
      limit = m.limit;
      remaining = m.remaining;
      reset = m.reset;
    }

    const headers: Record<string, string> = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": new Date(reset).toISOString(),
    };

    if (!success) {
      await safeAuditDenial(
        {
          key: identifier,
          route: meta.route,
          max: meta.max,
          window: meta.window,
          failureMode: meta.failureMode,
          dimension: identifier.startsWith("user:")
            ? "user"
            : identifier.startsWith("ip:")
              ? "ip"
              : "key",
        },
        "rate_limited"
      );
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
     
    console.error("[rate-limit] backend error (legacy path)", {
      bucket: bucketName,
      err: error instanceof Error ? error.message : String(error),
    });

    if (meta.failureMode === "closed") {
      // Fail CLOSED — deny the request.
      await safeAuditDenial(
        {
          key: identifier,
          route: meta.route,
          max: meta.max,
          window: meta.window,
          failureMode: "closed",
        },
        "backend_error_failclosed"
      );
      return NextResponse.json(
        {
          error: "Service temporarily unavailable",
          message:
            "Rate limit backend unavailable. Request denied for safety. Please retry.",
        },
        {
          status: 503,
          headers: { "Retry-After": "30" },
        }
      );
    }

    // failureMode === 'degraded' — allow + warn. This matches the OLD behavior
    // only for explicitly-low-stakes buckets (currently: legacy 'api').
     
    console.warn(
      "[rate-limit] DEGRADED — allowing request despite backend error (bucket=%s)",
      bucketName
    );
    return null;
  }
}

/**
 * Get client identifier for rate limiting.
 * Uses user ID if authenticated, otherwise falls back to IP address.
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
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : "unknown";

  return `ip:${ip || "unknown"}`;
}

/**
 * Convenience helper to extract a usable IP for the new options API.
 */
export function getActorIp(request?: Request): string {
  const forwarded = request?.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : null;
  return ip || request?.headers.get("x-real-ip") || "unknown";
}
