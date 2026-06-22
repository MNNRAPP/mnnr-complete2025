/**
 * Security Middleware and Utilities for MNNR
 * 
 * Provides:
 * - Security headers
 * - Input sanitization
 * - SQL injection prevention
 * - XSS prevention
 * - Request validation
 * - IP blocking
 * - Audit logging
 */

import { NextRequest, NextResponse } from 'next/server';
// YOLO 2026-06-19: lazy-load Node crypto so middleware (Edge runtime) doesn't
// drag it into the edge bundle. Functions that need Node-only APIs require()
// it on first call; functions reachable from middleware (generateCspNonce) use
// Web Crypto via globalThis.crypto.
type NodeCrypto = typeof import('crypto');
let _nodeCrypto: NodeCrypto | null = null;
function getNodeCrypto(): NodeCrypto {
  if (!_nodeCrypto) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _nodeCrypto = require('crypto');
  }
  return _nodeCrypto!;
}

// ============================================================================
// TYPES
// ============================================================================

interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableFrameOptions: boolean;
  enableContentTypeOptions: boolean;
  trustedDomains: string[];
  blockedIPs: string[];
  maxRequestSize: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  userId?: string;
  ip: string;
  userAgent: string;
  resource: string;
  method: string;
  status: number;
  duration: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const defaultConfig: SecurityConfig = {
  enableCSP: true,
  enableHSTS: true,
  enableXSSProtection: true,
  enableFrameOptions: true,
  enableContentTypeOptions: true,
  trustedDomains: [
    'mnnr.app',
    '*.mnnr.app',
    'supabase.co',
    '*.supabase.co',
    'stripe.com',
    '*.stripe.com',
    'sentry.io',
    '*.sentry.io',
  ],
  blockedIPs: [],
  maxRequestSize: 10 * 1024 * 1024, // 10MB
};

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Generate Content Security Policy header
 *
 * Legacy form retained for backwards-compatibility with `applySecurityHeaders`
 * callers that still pass `trustedDomains`. New code MUST use `generateCsp(nonce)`
 * below — the hardened, nonce-based production policy that removes
 * `'unsafe-inline'` and `'unsafe-eval'` per Finding #6 (ChatGPT 2026-06-19 audit).
 */
function generateCSP(trustedDomains: string[]): string {
  const domains = trustedDomains.join(' ');

  return [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${domains}`,
    `style-src 'self' 'unsafe-inline' ${domains}`,
    `img-src 'self' data: blob: ${domains}`,
    `font-src 'self' data: ${domains}`,
    `connect-src 'self' ${domains} wss://*.supabase.co`,
    `frame-src 'self' ${domains}`,
    `frame-ancestors 'self'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');
}

// ============================================================================
// HARDENED CSP — nonce-based, no unsafe-inline / unsafe-eval (Finding #6)
// ============================================================================
//
// Whitelisted third-party origins — verified against current product wiring:
// package.json deps, app/layout.tsx (ClerkProvider + PostHogProvider),
// providers/PostHogProvider.tsx, middleware.ts (Clerk), next.config.js (Sentry).
//   - https://challenges.cloudflare.com         -> Turnstile bot-challenge widget
//   - https://js.stripe.com / hooks.stripe.com  -> Stripe.js + 3DS/redirect frames
//   - https://api.stripe.com / m.stripe.{com,network} -> Stripe API + fraud signals
//   - https://*.clerk.accounts.dev / *.clerk.com / clerk.mnnr.app -> Clerk auth UI
//   - https://us.i.posthog.com / us-assets.i.posthog.com -> PostHog analytics
//   - https://*.ingest.sentry.io / *.ingest.us.sentry.io / *.sentry.io -> Sentry
//   - https://fonts.googleapis.com / fonts.gstatic.com -> Google Fonts (defensive)
//   - https://*.neon.tech                       -> Neon Postgres (Hyperdrive/direct)
//   - https://{eth,base}-mainnet.g.alchemy.com  -> Alchemy RPC (x402 / wallet flows)
//
// WITHOUT Clerk + PostHog + Sentry here, the production nonce-CSP silently
// blocks the auth UI (→ blank dashboard), product analytics, and error
// reporting. See audits/20260622_csp_audit.md for the gap analysis.
//
// Inline <script> and <style> blocks MUST carry the per-request nonce exposed
// via the `x-nonce` response header (set by middleware.ts). App Router pages
// can read it server-side from next/headers `headers().get('x-nonce')`.
//
// Violations are reported to /api/csp-report.

/**
 * Origins permitted as Content-Security-Policy sources, broken out by
 * directive so the policy can be extended without touching the templater.
 */
export const CSP_ALLOWED_ORIGINS = {
  script: [
    'https://challenges.cloudflare.com', // Turnstile
    'https://js.stripe.com',             // Stripe.js
    'https://*.clerk.accounts.dev',      // Clerk JS (hosted + dev instances)
    'https://*.clerk.com',               // Clerk assets
    'https://clerk.mnnr.app',            // Clerk Frontend API (prod CNAME, if configured)
    'https://*.clerk.services',          // Clerk Frontend API service tier
    'https://clerk-telemetry.com',       // Clerk telemetry
    'https://us-assets.i.posthog.com',   // PostHog array.js / session recorder
  ],
  style: [
    'https://fonts.googleapis.com',      // Google Fonts stylesheet (defensive)
  ],
  font: [
    'https://fonts.gstatic.com',         // Google Fonts files (defensive)
  ],
  connect: [
    'https://*.neon.tech',
    'https://challenges.cloudflare.com',
    'https://api.stripe.com',
    'https://m.stripe.com',              // Stripe fraud/telemetry
    'https://m.stripe.network',          // Stripe fraud/telemetry
    'https://eth-mainnet.g.alchemy.com',
    'https://base-mainnet.g.alchemy.com',
    'https://*.clerk.accounts.dev',      // Clerk Frontend API (XHR/websocket)
    'https://*.clerk.com',
    'https://clerk.mnnr.app',
    'https://*.clerk.services',          // Clerk Frontend API service tier
    'https://clerk-telemetry.com',       // Clerk telemetry
    'https://us.i.posthog.com',          // PostHog event ingest
    'https://us-assets.i.posthog.com',
    'https://*.ingest.sentry.io',        // Sentry event ingest
    'https://*.ingest.us.sentry.io',
    'https://*.sentry.io',
  ],
  frame: [
    'https://challenges.cloudflare.com',
    'https://js.stripe.com',
    'https://hooks.stripe.com',          // Stripe 3DS / redirect frames
    'https://*.clerk.services',          // Clerk embedded components
  ],
  worker: [
    'blob:',                             // Clerk + PostHog spin up blob workers
  ],
} as const;

/**
 * Build the production Content-Security-Policy header value.
 *
 * The returned policy:
 *   - has NO `'unsafe-inline'` and NO `'unsafe-eval'`
 *   - binds inline <script> + <style> to a per-request nonce
 *   - forbids framing (frame-ancestors 'none')
 *   - reports violations to /api/csp-report
 *
 * @param nonce Base64 nonce minted per-request in middleware
 */
export function generateCsp(nonce: string): string {
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, ...CSP_ALLOWED_ORIGINS.script].join(' ');
  const styleSrc = ["'self'", `'nonce-${nonce}'`, ...CSP_ALLOWED_ORIGINS.style].join(' ');
  const fontSrc = ["'self'", 'data:', ...CSP_ALLOWED_ORIGINS.font].join(' ');
  const connectSrc = ["'self'", ...CSP_ALLOWED_ORIGINS.connect].join(' ');
  const frameSrc = ["'self'", ...CSP_ALLOWED_ORIGINS.frame].join(' ');
  const workerSrc = ["'self'", ...CSP_ALLOWED_ORIGINS.worker].join(' ');

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src 'self' data: blob: https:`,
    `font-src ${fontSrc}`,
    `connect-src ${connectSrc}`,
    `frame-src ${frameSrc}`,
    `worker-src ${workerSrc}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
    `report-uri /api/csp-report`,
  ].join('; ');
}

/**
 * Mint a Base64 nonce suitable for use in `generateCsp`.
 * Exposed here so middleware + tests use the exact same construction.
 */
export function generateCspNonce(): string {
  // Use Web Crypto (available in Edge runtime + Node 19+). btoa is also runtime-agnostic.
  const uuid = (globalThis as any).crypto?.randomUUID?.() ?? '00000000-0000-0000-0000-000000000000';
  // btoa is available in both Edge and Node; on Node use Buffer fallback if missing.
  if (typeof btoa === 'function') return btoa(uuid);
  // eslint-disable-next-line no-undef
  return (globalThis as any).Buffer?.from(uuid).toString('base64') ?? uuid;
}

/**
 * Static (non-CSP) security headers applied at the Next.js framework layer
 * via `next.config.js` `async headers()`. CSP is intentionally NOT included
 * here — it MUST be set per-request in middleware so the nonce is fresh.
 *
 * Defense-in-depth: the same static headers are also duplicated at the CDN
 * edge in the repo-root `_headers` file for Cloudflare Pages.
 */
export const SECURITY_HEADERS_STATIC: ReadonlyArray<{ key: string; value: string }> = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value:
      'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  },
  // `same-origin-allow-popups` keeps cross-origin isolation for the document
  // while preserving the popup postMessage handshake used by Clerk OAuth and
  // Stripe Checkout. Plain `same-origin` severs window.opener and breaks them.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  // COEP must NOT be `require-corp`: it blocks every cross-origin embed that
  // doesn't send CORP/COEP headers — Stripe.js (js.stripe.com), Clerk widgets,
  // and the Turnstile iframe — yielding blank payment/auth UIs in production.
  // The app uses no SharedArrayBuffer / cross-origin-isolation features.
  { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Download-Options', value: 'noopen' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

/**
 * App Router helper — read the per-request CSP nonce that middleware exposed
 * via the `x-nonce` response header (forwarded into RSC `headers()`).
 *
 * Usage in a Server Component:
 *   import { headers } from 'next/headers';
 *   import { getCspNonceFromHeaders } from '@/lib/security';
 *   const nonce = getCspNonceFromHeaders(headers());
 *   <Script nonce={nonce} ... />
 */
export function getCspNonceFromHeaders(
  h: { get(name: string): string | null }
): string | null {
  return h.get('x-nonce');
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: Partial<SecurityConfig> = {}
): NextResponse {
  const cfg = { ...defaultConfig, ...config };

  // Content Security Policy
  if (cfg.enableCSP) {
    response.headers.set('Content-Security-Policy', generateCSP(cfg.trustedDomains));
  }

  // HTTP Strict Transport Security
  if (cfg.enableHSTS) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // XSS Protection
  if (cfg.enableXSSProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  // Frame Options
  if (cfg.enableFrameOptions) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }

  // Content Type Options
  if (cfg.enableContentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  return response;
}

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

// ============================================================================
// SQL INJECTION PREVENTION
// ============================================================================

/**
 * Check for SQL injection patterns
 */
export function hasSqlInjection(input: string): boolean {
  if (typeof input !== 'string') return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
    /(\b(UNION|JOIN|WHERE|FROM|INTO)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
    /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(\bxp_)/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Escape SQL special characters
 */
export function escapeSql(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\x00/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

/**
 * Validate request origin
 */
export function validateOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  if (!origin && !referer) {
    // Allow requests without origin (e.g., direct API calls)
    return true;
  }

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);
  
  if (!requestOrigin) return true;

  return allowedOrigins.some((allowed) => {
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return requestOrigin.endsWith(domain) || requestOrigin === `https://${domain}`;
    }
    return requestOrigin === `https://${allowed}` || requestOrigin === `http://${allowed}`;
  });
}

/**
 * Check if IP is blocked
 */
export function isBlockedIP(ip: string, blockedIPs: string[]): boolean {
  return blockedIPs.includes(ip);
}

/**
 * Get client IP from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1';
}

/**
 * Validate request size
 */
export function validateRequestSize(
  contentLength: number | null,
  maxSize: number
): boolean {
  if (contentLength === null) return true;
  return contentLength <= maxSize;
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

const auditLog: AuditLogEntry[] = [];
const MAX_AUDIT_ENTRIES = 10000;

/**
 * Log security-relevant action
 */
export function logAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  const auditEntry: AuditLogEntry = {
    ...entry,
    id: (globalThis as any).crypto?.randomUUID?.() ?? getNodeCrypto().randomUUID(),
    timestamp: new Date().toISOString(),
  };

  auditLog.push(auditEntry);

  // Keep log bounded
  if (auditLog.length > MAX_AUDIT_ENTRIES) {
    auditLog.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(auditEntry));
  }
}

/**
 * Get audit log entries
 */
export function getAuditLog(
  filter?: Partial<Pick<AuditLogEntry, 'userId' | 'action' | 'resource'>>
): AuditLogEntry[] {
  if (!filter) return [...auditLog];

  return auditLog.filter((entry) => {
    if (filter.userId && entry.userId !== filter.userId) return false;
    if (filter.action && entry.action !== filter.action) return false;
    if (filter.resource && entry.resource !== filter.resource) return false;
    return true;
  });
}

/**
 * Clear audit log
 */
export function clearAuditLog(): void {
  auditLog.length = 0;
}

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

/**
 * Create security middleware for API routes
 */
export function createSecurityMiddleware(config: Partial<SecurityConfig> = {}) {
  const cfg = { ...defaultConfig, ...config };

  return async function securityMiddleware(
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now();
    const ip = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check blocked IPs
    if (isBlockedIP(ip, cfg.blockedIPs)) {
      logAuditEntry({
        action: 'BLOCKED_IP',
        ip,
        userAgent,
        resource: request.url,
        method: request.method,
        status: 403,
        duration: Date.now() - startTime,
      });

      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate origin
    if (!validateOrigin(request, cfg.trustedDomains)) {
      logAuditEntry({
        action: 'INVALID_ORIGIN',
        ip,
        userAgent,
        resource: request.url,
        method: request.method,
        status: 403,
        duration: Date.now() - startTime,
      });

      return new NextResponse(JSON.stringify({ error: 'Invalid origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate request size
    const contentLength = request.headers.get('content-length');
    if (!validateRequestSize(contentLength ? parseInt(contentLength) : null, cfg.maxRequestSize)) {
      logAuditEntry({
        action: 'REQUEST_TOO_LARGE',
        ip,
        userAgent,
        resource: request.url,
        method: request.method,
        status: 413,
        duration: Date.now() - startTime,
      });

      return new NextResponse(JSON.stringify({ error: 'Request too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Execute handler
    let response: NextResponse;
    let status = 200;

    try {
      response = await handler(request);
      status = response.status;
    } catch (error) {
      status = 500;
      response = new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Apply security headers
    response = applySecurityHeaders(response, cfg);

    // Log request
    logAuditEntry({
      action: 'API_REQUEST',
      ip,
      userAgent,
      resource: request.url,
      method: request.method,
      status,
      duration: Date.now() - startTime,
    });

    return response;
  };
}

// ============================================================================
// HASH UTILITIES
// ============================================================================

/**
 * Generate secure hash
 */
export function secureHash(data: string, salt?: string): string {
  const toHash = salt ? `${data}:${salt}` : data;
  return getNodeCrypto().createHash('sha256').update(toHash).digest('hex');
}

/**
 * Generate HMAC
 */
export function generateHMAC(data: string, secret: string): string {
  return getNodeCrypto().createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC
 */
export function verifyHMAC(data: string, secret: string, signature: string): boolean {
  const expected = generateHMAC(data, secret);
  return getNodeCrypto().timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return getNodeCrypto().randomBytes(length).toString('hex');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const Security = {
  applySecurityHeaders,
  sanitizeString,
  sanitizeObject,
  stripHtml,
  sanitizeUrl,
  hasSqlInjection,
  escapeSql,
  validateOrigin,
  isBlockedIP,
  getClientIP,
  validateRequestSize,
  logAuditEntry,
  getAuditLog,
  clearAuditLog,
  createSecurityMiddleware,
  secureHash,
  generateHMAC,
  verifyHMAC,
  generateSecureToken,
  // Hardened CSP (Finding #6)
  generateCsp,
  generateCspNonce,
  getCspNonceFromHeaders,
  SECURITY_HEADERS_STATIC,
  CSP_ALLOWED_ORIGINS,
};
