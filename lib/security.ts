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
import crypto from 'crypto';

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
    id: crypto.randomUUID(),
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
  return crypto.createHash('sha256').update(toHash).digest('hex');
}

/**
 * Generate HMAC
 */
export function generateHMAC(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC
 */
export function verifyHMAC(data: string, secret: string, signature: string): boolean {
  const expected = generateHMAC(data, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
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
};
