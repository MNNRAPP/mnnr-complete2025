/**
 * Usage/Analytics API Endpoint
 *
 * Created: 2025-12-26 22:52:00 EST
 * Action #8 in 19-hour optimization
 *
 * Purpose: Track and retrieve user usage data for analytics and billing
 *
 * Endpoints:
 * - GET /api/usage - Get user's usage statistics
 * - POST /api/usage - Record a usage event
 *
 * SEC-FIX 2026-06-19 (ChatGPT audit response):
 *  - Hardened to require real Supabase server-side identity (no
 *    placeholder x-user-id / test@mnnr.app paths exist; explicit ownership
 *    filter on every query).
 *  - Added Upstash sliding-window rate limit on both GET and POST.
 *  - Added CSRF double-submit check on POST (state-changing).
 *  - Added Zod input validation on POST body + GET query params.
 *  - Added audit-trail logging on data access, recording, failed auth,
 *    and rate-limit hits.
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import {
  logAuditEvent,
  AuditEventType,
  AuditSeverity,
} from '@/lib/audit-trail';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// SEC-FIX 2026-06-19: Zod schemas keep the route from trusting whatever the
// client sends. Period is restricted to the supported enum; metric is bounded
// in length; value is non-negative.
const usageQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year', 'all']).default('month'),
  metric: z.string().min(1).max(100).optional(),
});

const recordUsageSchema = z.object({
  metric: z.string().min(1, 'Metric is required').max(100, 'Metric too long'),
  value: z.number().nonnegative().default(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// SEC-FIX 2026-06-19: Same audit-context helper as /api/keys — keep payload
// shape consistent across routes for downstream forensic correlation.
function getAuditContext(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  return {
    ipAddress: forwarded ? forwarded.split(',')[0].trim() : undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

/**
 * GET /api/usage
 * Get usage statistics for the current user
 *
 * Query Parameters:
 * - period: Time period (day, week, month, year, all)
 * - metric: Specific metric to retrieve (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // SEC-FIX 2026-06-19: Real Supabase identity required — no header-based
    // x-user-id, no test@mnnr.app fallback.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
        severity: AuditSeverity.WARNING,
        resource: '/api/usage',
        action: 'GET',
        metadata: { reason: 'unauthenticated' },
        ...getAuditContext(request),
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SEC-FIX 2026-06-19: Rate limit keyed on authenticated user id.
    const rateLimitResult = await rateLimit(
      getClientIdentifier(user.id, request),
      rateLimiters.api
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

    // SEC-FIX 2026-06-19: Validate query params via Zod before use.
    const { searchParams } = new URL(request.url);
    const validatedQuery = usageQuerySchema.parse({
      period: searchParams.get('period') ?? undefined,
      metric: searchParams.get('metric') ?? undefined,
    });
    const { period, metric } = validatedQuery;

    // Calculate date range
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
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // SEC-FIX 2026-06-19: Ownership filter — caller can ONLY read their own
    // usage events. The .eq('user_id', user.id) is enforced at the query
    // layer in addition to Supabase RLS.
    let query = supabase
      .from('usage_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Filter by metric if specified
    if (metric) {
      query = query.eq('metric', metric);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Usage fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch usage data' },
        { status: 500 }
      );
    }

    // Aggregate usage data
    const aggregated: Record<string, { count: number; total: number }> = {};

    events?.forEach((event) => {
      if (!aggregated[event.metric]) {
        aggregated[event.metric] = { count: 0, total: 0 };
      }
      aggregated[event.metric].count++;
      aggregated[event.metric].total += event.value || 1;
    });

    // SEC-FIX 2026-06-19: audit data access (billing-relevant data).
    await logAuditEvent(AuditEventType.DATA_ACCESSED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'usage_events',
      action: 'read',
      metadata: {
        period,
        metric: metric ?? null,
        eventCount: events?.length ?? 0,
      },
      ...getAuditContext(request),
    });

    return NextResponse.json({
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      metrics: aggregated,
      events: events || [],
      total_events: events?.length || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usage
 * Record a usage event
 *
 * Body:
 * - metric: string (required) - Name of the metric
 * - value: number (optional) - Value to record (default: 1)
 * - metadata: object (optional) - Additional data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // SEC-FIX 2026-06-19: Real Supabase identity required.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
        severity: AuditSeverity.WARNING,
        resource: '/api/usage',
        action: 'POST',
        metadata: { reason: 'unauthenticated' },
        ...getAuditContext(request),
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SEC-FIX 2026-06-19: Rate limit on writes too — usage_events is a
    // billing-input table; a flood of POSTs from one user is suspicious.
    const rateLimitResult = await rateLimit(
      getClientIdentifier(user.id, request),
      rateLimiters.api
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

    // SEC-FIX 2026-06-19: CSRF required (state-changing).
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

    // SEC-FIX 2026-06-19: Validate body via Zod before insert.
    const body = await request.json();
    const validatedData = recordUsageSchema.parse(body);
    const { metric, value, metadata } = validatedData;

    // SEC-FIX 2026-06-19: user_id from auth context, NOT from request body —
    // a caller cannot impersonate another user's usage even if they spoof
    // the body.
    const { data, error } = await supabase
      .from('usage_events')
      .insert({
        user_id: user.id,
        metric,
        value,
        metadata,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Usage recording error:', error);
      return NextResponse.json(
        { error: 'Failed to record usage event' },
        { status: 500 }
      );
    }

    // SEC-FIX 2026-06-19: audit the write (billing-input mutation).
    await logAuditEvent(AuditEventType.DATA_MODIFIED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'usage_events',
      action: 'create',
      metadata: {
        eventId: data?.id,
        metric,
        value,
      },
      ...getAuditContext(request),
    });

    return NextResponse.json({
      success: true,
      event: data,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
