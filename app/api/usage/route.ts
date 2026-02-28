/**
 * Usage/Analytics API Endpoint
 * GET /api/usage - Get user's usage statistics
 * POST /api/usage - Record a usage event
 */

import { getAuthenticatedUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const metric = searchParams.get('metric') || undefined;

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day': startDate.setDate(now.getDate() - 1); break;
      case 'week': startDate.setDate(now.getDate() - 7); break;
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
      case 'all': startDate = new Date(0); break;
      default: startDate.setMonth(now.getMonth() - 1);
    }

    const events = await db.getUsageEvents(user.id, startDate, metric);

    const aggregated: Record<string, { count: number; total: number }> = {};
    events.forEach((event) => {
      const key = event.metric || event.event_type || 'unknown';
      if (!aggregated[key]) {
        aggregated[key] = { count: 0, total: 0 };
      }
      aggregated[key].count++;
      aggregated[key].total += Number(event.value || event.quantity || 1);
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { metric, value = 1 } = body;

    if (!metric) {
      return NextResponse.json({ error: 'Metric is required' }, { status: 400 });
    }

    const event = await db.recordUsageEvent(user.id, metric, value);

    return NextResponse.json({ success: true, event });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
