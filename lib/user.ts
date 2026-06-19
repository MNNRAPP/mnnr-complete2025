// lib/user.ts — Clerk → local User row bridge.
//
// Background
//   The Neon migration replaced Supabase Auth with Clerk. Clerk owns the
//   identity (clerkId, email verification, OAuth) but the application's
//   user-scoped tables still need a local UUID primary key to JOIN against.
//   This helper finds-or-creates that local row.
//
// Provisioning posture
//   - Webhook-first: `app/api/webhooks/clerk/route.ts` handles user.created
//     and provisions the row at sign-up. That keeps the synchronous hot path
//     out of every API call.
//   - Lazy fallback: if the webhook hasn't run (race at first sign-in, or
//     local dev without webhook configured), `getOrCreateUser()` will create
//     the row on first authenticated API call. Idempotent.

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from './db';

/**
 * Get the local User row for the current Clerk session, creating it if
 * missing. Returns null if there is no Clerk session.
 *
 * Safe to call from server components, route handlers, and server actions.
 */
export async function getOrCreateUser() {
  const { userId: clerkId } = auth();
  if (!clerkId) return null;

  const existing = await db.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  const cu = await currentUser();
  const email =
    cu?.primaryEmailAddress?.emailAddress ??
    cu?.emailAddresses?.[0]?.emailAddress ??
    `${clerkId}@clerk.placeholder`;

  // Upsert by clerkId guards against the webhook racing in between the
  // findUnique above and this create.
  return db.user.upsert({
    where: { clerkId },
    create: { clerkId, email },
    update: {},
  });
}

/**
 * Convenience: return the local user or throw a 401-shaped error. Use
 * this when you want a one-liner at the top of a handler.
 */
export async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) {
    const err = new Error('Unauthorized') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return user;
}

/**
 * Standard 401 response with WWW-Authenticate header (per the project's
 * Bearer-realm convention). Use:
 *   const user = await getOrCreateUser();
 *   if (!user) return unauthorized();
 */
import { NextResponse } from 'next/server';
export function unauthorized() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="mnnr-api"' } },
  );
}
