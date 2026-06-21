// app/api/user/onboarding/complete/route.ts — stamp User.onboardedAt.
//
// Called from app/onboarding/OnboardingStepFour.tsx when the user reaches
// the finish line. Idempotent — re-runs are no-ops.
//
// Auth: Clerk session required. CSRF: double-submit cookie (same protocol
// as /api/keys POST). Rate-limit: cheap shared keys rate-limiter; the route
// is called at most once per user lifetime in the normal path.

import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { getOrCreateUser, unauthorized } from '@/lib/user';
import { csrfProtection } from '@/lib/csrf';
import { rateLimit, rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import {
  logAuditEvent,
  AuditEventType,
  AuditSeverity,
} from '@/lib/audit-trail';

export const dynamic = 'force-dynamic';

function getAuditContext(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  return {
    ipAddress: forwarded ? forwarded.split(',')[0].trim() : undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  };
}

export async function POST(request: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  // Reuse the apiKeys rate-limit bucket — cheap, per-user, prevents a
  // misbehaving client from hammering this endpoint.
  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys,
  );
  if (rateLimitResult) return rateLimitResult;

  const csrfResult = await csrfProtection(request);
  if (csrfResult) return csrfResult;

  try {
    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        // Only stamp if not already set — keeps "first onboarded" timestamp
        // honest if the route is called twice.
        onboardedAt: user.onboardedAt ?? new Date(),
      },
      select: { id: true, onboardedAt: true },
    });

    await logAuditEvent(AuditEventType.DATA_MODIFIED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'users',
      action: 'onboarding_complete',
      metadata: { onboardedAt: updated.onboardedAt?.toISOString() },
      ...getAuditContext(request),
    });

    return NextResponse.json({
      ok: true,
      onboardedAt: updated.onboardedAt?.toISOString() ?? null,
    });
  } catch (err) {
    console.error('Failed to mark onboarding complete', err);
    return NextResponse.json(
      { error: 'Failed to mark onboarding complete' },
      { status: 500 },
    );
  }
}
