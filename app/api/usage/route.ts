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
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/usage
 * Get usage statistics for the current user
 * 
 * Query Parameters:
 * - period: Time period (day, week, month, year, all)
 * - metric: Specific metric to retrieve (optional)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const metric = searchParams.get('metric');

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

    // Build query
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

    return NextResponse.json({
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      metrics: aggregated,
      events: events || [],
      total_events: events?.length || 0,
    });
  } catch (error) {
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
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { metric, value = 1, metadata = {} } = body;

    if (!metric) {
      return NextResponse.json(
        { error: 'Metric is required' },
        { status: 400 }
      );
    }

    // Record usage event
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

    return NextResponse.json({
      success: true,
      event: data,
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
