/**
 * CSRF Protection Middleware
 * 
 * Implements double-submit cookie pattern for CSRF protection
 */

import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes } from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || "default-csrf-secret-change-in-production";
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  const token = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const signature = createHmac("sha256", CSRF_SECRET)
    .update(token)
    .digest("hex");
  
  return `${token}.${signature}`;
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string): boolean {
  try {
    const [tokenPart, signature] = token.split(".");
    
    if (!tokenPart || !signature) {
      return false;
    }

    const expectedSignature = createHmac("sha256", CSRF_SECRET)
      .update(tokenPart)
      .digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
}

/**
 * CSRF middleware for API routes
 * 
 * Validates CSRF token on state-changing operations (POST, PUT, DELETE, PATCH)
 */
export async function csrfProtection(
  request: NextRequest
): Promise<NextResponse | null> {
  // Skip CSRF check for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    return null;
  }

  // Skip CSRF check for webhooks (they use other authentication)
  if (request.nextUrl.pathname.startsWith("/api/webhooks")) {
    return null;
  }

  // Get CSRF token from header or body
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
 * Add CSRF token to response headers
 */
export function addCsrfTokenToResponse(response: NextResponse): NextResponse {
  const token = generateCsrfToken();
  response.headers.set("X-CSRF-Token", token);
  return response;
}
