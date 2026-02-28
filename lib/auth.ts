/**
 * Authentication utilities using Neon sessions
 * Replaces Clerk + Supabase Auth with direct session management
 */

import { cookies } from 'next/headers';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';

const SESSION_COOKIE_NAME = 'mnnr_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Hash a session token for storage
 */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically secure session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Get the currently authenticated user from the session cookie.
 * Returns null if not authenticated.
 */
export async function getAuthenticatedUser(): Promise<{ id: string; email: string } | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const tokenHash = hashSessionToken(sessionCookie.value);
    const session = await db.getSessionByTokenHash(tokenHash);

    if (!session) {
      return null;
    }

    return { id: session.user_id, email: session.email };
  } catch {
    return null;
  }
}

/**
 * Get session token from request headers (for API routes that receive the token via header)
 */
export async function getAuthenticatedUserFromRequest(request: Request): Promise<{ id: string; email: string } | null> {
  // Try cookie first
  const cookieHeader = request.headers.get('cookie') || '';
  const sessionMatch = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  const token = sessionMatch?.[1];

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await db.getSessionByTokenHash(tokenHash);

  if (!session) {
    return null;
  }

  return { id: session.user_id, email: session.email };
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string, ip?: string, userAgent?: string) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.createSession(userId, tokenHash, expiresAt, ip, userAgent);

  return { token, expiresAt };
}

/**
 * Destroy the current session
 */
export async function destroySession(token: string) {
  const tokenHash = hashSessionToken(token);
  await db.deleteSession(tokenHash);
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
