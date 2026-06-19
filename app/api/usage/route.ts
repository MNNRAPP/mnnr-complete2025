/**
 * Usage/Analytics API Endpoint — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * Tracks and retrieves usage events for the authenticated user.
 *
 * Endpoints:
 *  - GET /api/usage    — aggregated usage for the period, filtered by event name
 *  - POST /api/usage   — record a usage event
 *
 * Schema mapping vs. legacy Supabase columns:
 *  - prior `metric` -> Prisma `event`
 *  - prior `value`  -> folded into Prisma `meta` Json (model has no value column)
 *  - prior `metadata` -> Prisma `meta` Json
 *
 * Defense-in-depth (preserved from SEC-FIX 2026-06-19):
 *  - Clerk auth required (no header-based x-user-id, no test@mnnr.app)
 *  - Upstash rate limit on both GET and POST
 *  - CSRF double-submit check on POST
 *  - Zod body + query validation
 *  - Audit-trail logging on access, write, failed auth, rate-limit
 *  - withUserContext binds Postgres RLS for every query
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

import { getOrCreateUser, unauthorized } from '@/lib/user';
import { withUserContext } from '@/lib/rls';
import { rateLimit, rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import {
  logAuditEvent,
  AuditEventType,
  AuditSeverity,
} from '@/lib/audit-trail';

export const dynamic = 'force-dynamic';

const usageQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year', 'all']).default('month'),
  metric: z.string().min(1).max(100).optional(),
});

const recordUsageSchema = z.object({
  metric: z.string().min(1, 'Metric is required').max(100, 'Metric too long'),
  value: z.number().nonnegative().default(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

function getAuditContext(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  return {
    ipAddress: forwarded ? forwarded.split(',')[0].trim() : undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
        severity: AuditSeverity.WARNING,
        resource: '/api/usage',
        action: 'GET',
        metadata: { reason: 'unauthenticated' },
        ...getAuditContext(request),
      });
      return unauthorized();
    }

    const user = await getOrCreateUser();
    if (!user) return unauthorized();

    const rateLimitResult = await rateLimit(
      getClientIdentifier(user.id, request),
      rateLimiters.api,
    );
    if (rateLimitResult) {
      await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
        severity: AuditSeverity.WARNING,
        userId: user.id,
        resource: '/api/usage',
        action: 'GET',
        ...getAuditContext(request),
      });
      return rateLimitResult;
    }

    const { searchParams } = new URL(request.url);
    const { period, metric } = usageQuerySchema.parse({
      period: searchParams.get('period') ?? undefined,
      metric: searchParams.get('metric') ?? undefined,
    });

    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    const events = await withUserContext(user.id, (tx) =>
      tx.usageEvent.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
          ...(metric ? { event: metric } : {}),
        },
        orderBy: { createdAt: 'desc' },
      }),
    );

    const aggregated: Record<string, { count: number; total: number }> = {};
    for (const ev of events) {
      const key = ev.event;
      if (!aggregated[key]) aggregated[key] = { count: 0, total: 0 };
      aggregated[key].count++;
      const valueFromMeta =
        typeof ev.meta === 'object' && ev.meta !== null && 'value' in ev.meta
          ? Number((ev.meta as Record<string, unknown>).value) || 1
          : 1;
      aggregated[key].total += valueFromMeta;
    }

    await logAuditEvent(AuditEventType.DATA_ACCESSED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'usage_events',
      action: 'read',
      metadata: {
        period,
        metric: metric ?? null,
        eventCount: events.length,
      },
      ...getAuditContext(request),
    });

    return NextResponse.json({
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      metrics: aggregated,
      events: events.map((e) => ({ ...e, id: e.id.toString() })),
      total_events: events.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 },
      );
    }
    console.error('Usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) {
      await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
        severity: AuditSeverity.WARNING,
        resource: '/api/usage',
        action: 'POST',
        metadata: { reason: 'unauthenticated' },
        ...getAuditContext(request),
      });
      return unauthorized();
    }

    const user = await getOrCreateUser();
    if (!user) return unauthorized();

    const rateLimitResult = await rateLimit(
      getClientIdentifier(user.id, request),
      rateLimiters.api,
    );
    if (rateLimitResult) {
      await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
        severity: AuditSeverity.WARNING,
        userId: user.id,
        resource: '/api/usage',
        action: 'POST',
        ...getAuditContext(request),
      });
      return rateLimitResult;
    }

    const csrfResult = await csrfProtection(request);
    if (csrfResult) {
      await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
        severity: AuditSeverity.WARNING,
        userId: user.id,
        resource: '/api/usage',
        action: 'POST',
        metadata: { reason: 'csrf_failed' },
        ...getAuditContext(request),
      });
      return csrfResult;
    }

    const body = await request.json();
    const { metric, value, metadata } = recordUsageSchema.parse(body);

    const event = await withUserContext(user.id, (tx) =>
      tx.usageEvent.create({
        data: {
          userId: user.id,
          event: metric,
          meta: { value, ...metadata },
        },
      }),
    );

    await logAuditEvent(AuditEventType.DATA_MODIFIED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'usage_events',
      action: 'create',
      metadata: { eventId: event.id.toString(), metric, value },
      ...getAuditContext(request),
    });

    return NextResponse.json({
      success: true,
      event: { ...event, id: event.id.toString() },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 },
      );
    }
    console.error('Usage API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
