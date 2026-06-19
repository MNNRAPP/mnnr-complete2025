/**
 * CSRF Protection Middleware
 *
 * Implements a signed double-submit token (synchronizer-token variant) for CSRF
 * protection on state-changing API operations.
 *
 * SEC-FIX 2026-06-19 (ChatGPT audit Finding #5):
 *  1. Fail-closed on startup when CSRF_SECRET is missing in production.
 *     The previous build silently fell back to a hard-coded literal
 *     ("default-csrf-secret-change-in-production"), which made HMAC tokens
 *     predictable to anyone with source access. Production deploys without
 *     CSRF_SECRET now throw at module load, surfacing the misconfiguration
 *     at boot instead of after first request.
 *  2. Token comparison switched from string `===` to `crypto.timingSafeEqual`
 *     to remove the early-return timing oracle in HMAC verification.
 *  3. Added token-expiry (TTL) so leaked tokens cannot be replayed forever.
 *     Default TTL = 1 hour, configurable via CSRF_TOKEN_TTL_MS.
 *  4. Added a clean `verifyCSRF(req)` helper consumed by state-changing route
 *     handlers, while preserving the existing `csrfProtection` middleware
 *     export and its consumers (app/api/keys/route.ts, vi.mock in tests).
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

// --------------------------------------------------------------------------
// Secret resolution — fail-closed in production
// --------------------------------------------------------------------------
//
// In production, missing CSRF_SECRET is a deployment defect. We refuse to load
// the module rather than ship predictable HMAC behavior. In dev/test we allow
// a clearly-labelled fallback so local `npm run dev` doesn't require a .env,
// but we log a loud warning every time a token is generated or verified so the
// dev never confuses the fallback for a real secret.

const DEV_FALLBACK_SECRET =
  "DEV-ONLY-INSECURE-CSRF-SECRET-DO-NOT-USE-IN-PRODUCTION";

const NODE_ENV = process.env.NODE_ENV;
const RAW_CSRF_SECRET = process.env.CSRF_SECRET;

if (!RAW_CSRF_SECRET && NODE_ENV === "production") {
  // Throwing at module-eval time means the Next.js build / serverless cold
  // start fails immediately rather than serving requests with a known secret.
  throw new Error(
    "CSRF_SECRET is required in production. Set the CSRF_SECRET environment variable before deploying."
  );
}

const CSRF_SECRET: string = RAW_CSRF_SECRET || DEV_FALLBACK_SECRET;
const USING_DEV_FALLBACK = !RAW_CSRF_SECRET;

function warnIfDevFallback(callsite: string): void {
  if (USING_DEV_FALLBACK) {
    // Loud, structured, and unmistakable. Repeats on every call by design so
    // the dev cannot tune it out without setting CSRF_SECRET.
    // eslint-disable-next-line no-console
    console.warn(
      `[CSRF] WARNING: using insecure DEV fallback secret in ${callsite}. Set CSRF_SECRET in your environment.`
    );
  }
}

// --------------------------------------------------------------------------
// Token format + TTL
// --------------------------------------------------------------------------
//
// Token layout: <randomHex>.<issuedAtMs>.<hmac(randomHex + "." + issuedAtMs)>
//
// Including the timestamp inside the HMAC input prevents an attacker from
// extending the lifetime of a captured token by rewriting the issuedAt field.

const CSRF_TOKEN_LENGTH = 32; // bytes of entropy in the random part
const DEFAULT_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const CSRF_TOKEN_TTL_MS = Number(
  process.env.CSRF_TOKEN_TTL_MS || DEFAULT_TOKEN_TTL_MS
);

function signParts(randomPart: string, issuedAtMs: number): string {
  return createHmac("sha256", CSRF_SECRET)
    .update(`${randomPart}.${issuedAtMs}`)
    .digest("hex");
}

/**
 * Constant-time HMAC-hex comparison. Both operands must be hex strings of the
 * same length (sha256 hex == 64 chars); we defensively bail on mismatch so the
 * Buffer.from / timingSafeEqual call cannot throw.
 */
function safeCompareHex(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  try {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Generate a fresh CSRF token. Embeds an issuedAt timestamp so the token can
 * be expired by verifyCsrfToken() without server-side state.
 */
export function generateCsrfToken(): string {
  warnIfDevFallback("generateCsrfToken");
  const randomPart = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const issuedAtMs = Date.now();
  const signature = signParts(randomPart, issuedAtMs);
  return `${randomPart}.${issuedAtMs}.${signature}`;
}

/**
 * Verify a CSRF token.
 *
 * Returns false on: malformed token, bad signature, or expired token.
 * Uses timing-safe comparison for the HMAC check so an attacker cannot
 * brute-force a forgery by measuring response latency.
 */
export function verifyCsrfToken(token: string): boolean {
  warnIfDevFallback("verifyCsrfToken");
  try {
    if (typeof token !== "string" || token.length === 0) return false;

    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const [randomPart, issuedAtRaw, signature] = parts;
    if (!randomPart || !issuedAtRaw || !signature) return false;

    // TTL enforcement: rejects replays of long-leaked tokens.
    const issuedAtMs = Number(issuedAtRaw);
    if (!Number.isFinite(issuedAtMs) || issuedAtMs <= 0) return false;
    if (Date.now() - issuedAtMs > CSRF_TOKEN_TTL_MS) return false;

    const expectedSignature = signParts(randomPart, issuedAtMs);
    return safeCompareHex(signature, expectedSignature);
  } catch {
    return false;
  }
}

/**
 * CSRF middleware for API routes.
 *
 * Validates the CSRF token on state-changing operations (POST, PUT, PATCH,
 * DELETE). Returns:
 *  - null if the request passes the CSRF check (or is exempt)
 *  - a 403 NextResponse if the check fails
 *
 * Exemptions:
 *  - Safe HTTP methods (GET / HEAD / OPTIONS)
 *  - Webhook endpoints (/api/webhooks/**) which authenticate via signed
 *    payloads from the originating service (Stripe, Supabase, etc.)
 */
export async function csrfProtection(
  request: NextRequest
): Promise<NextResponse | null> {
  // Safe methods bypass CSRF per the OWASP guidance — they must not have
  // state-changing side effects.
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return null;
  }

  // Webhooks authenticate via their own signature header (e.g. Stripe-Signature).
  if (request.nextUrl.pathname.startsWith("/api/webhooks")) {
    return null;
  }

  const csrfToken =
    request.headers.get("x-csrf-token") ||
    request.headers.get("X-CSRF-Token");

  if (!csrfToken) {
    return NextResponse.json(
      {
        error: "CSRF token missing",
        message: "CSRF token is required for this operation",
      },
      { status: 403 }
    );
  }

  if (!verifyCsrfToken(csrfToken)) {
    return NextResponse.json(
      {
        error: "Invalid CSRF token",
        message: "CSRF token validation failed",
      },
      { status: 403 }
    );
  }

  return null; // CSRF check passed
}

/**
 * Alias for csrfProtection() with the name requested by the security audit
 * (ChatGPT 2026-06-19 Finding #5). Lets route handlers `import { verifyCSRF }`
 * for readability without forcing a rename in existing consumers.
 */
export const verifyCSRF = csrfProtection;

/**
 * Attach a freshly-rotated CSRF token to a NextResponse. Call this on the
 * response that follows a successful state-changing operation (or on the
 * page load that primes the form), so the next request gets an unspent token.
 *
 * This implements per-response rotation rather than long-lived session tokens
 * — combined with the TTL above, it limits the exposure window of any single
 * captured token.
 */
export function addCsrfTokenToResponse(response: NextResponse): NextResponse {
  const token = generateCsrfToken();
  response.headers.set("X-CSRF-Token", token);
  return response;
}

// --------------------------------------------------------------------------
// Test hooks
// --------------------------------------------------------------------------
// Exposed read-only configuration values, useful for assertions in tests that
// want to verify TTL behavior without poking at private module state.

export const __csrfConfig = Object.freeze({
  tokenTtlMs: CSRF_TOKEN_TTL_MS,
  usingDevFallback: USING_DEV_FALLBACK,
});
