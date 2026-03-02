/**
 * Analytics API - Usage analytics and metrics
 * GET /api/v1/analytics - Get usage analytics
 * GET /api/v1/analytics?period=7d|30d|90d - Get analytics for period
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getAuthenticatedUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';
  
  // Parse period
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;

  try {
    const userId = user.id;

    // Get daily usage for the period (scoped to user's keys)
    const dailyUsage = await sql`
      SELECT
        DATE(ue.created_at) as date,
        COUNT(*) as requests,
        COALESCE(SUM(ue.quantity), 0) as tokens,
        COUNT(DISTINCT ue.api_key_id) as active_keys,
        COUNT(DISTINCT ue.unit) as models
      FROM usage_events ue
      JOIN api_keys ak ON ue.api_key_id = ak.id
      WHERE ak.user_id = ${userId}
        AND ue.created_at > NOW() - INTERVAL '1 day' * ${days}
      GROUP BY DATE(ue.created_at)
      ORDER BY date ASC
    `;

    // Get usage by model/unit
    const usageByModel = await sql`
      SELECT
        ue.unit as model,
        COUNT(*) as requests,
        COALESCE(SUM(ue.quantity), 0) as tokens
      FROM usage_events ue
      JOIN api_keys ak ON ue.api_key_id = ak.id
      WHERE ak.user_id = ${userId}
        AND ue.created_at > NOW() - INTERVAL '1 day' * ${days}
      GROUP BY ue.unit
      ORDER BY tokens DESC
      LIMIT 10
    `;

    // Get usage by API key
    const usageByKey = await sql`
      SELECT
        ak.name as key_name,
        ak.key_prefix,
        COUNT(ue.id) as requests,
        COALESCE(SUM(ue.quantity), 0) as tokens,
        MAX(ue.created_at) as last_used
      FROM api_keys ak
      LEFT JOIN usage_events ue ON ak.id = ue.api_key_id
        AND ue.created_at > NOW() - INTERVAL '1 day' * ${days}
      WHERE ak.user_id = ${userId} AND ak.revoked_at IS NULL
      GROUP BY ak.id, ak.name, ak.key_prefix
      ORDER BY tokens DESC
    `;

    // Get hourly distribution (last 24 hours)
    const hourlyDistribution = await sql`
      SELECT
        EXTRACT(HOUR FROM ue.created_at) as hour,
        COUNT(*) as requests,
        COALESCE(SUM(ue.quantity), 0) as tokens
      FROM usage_events ue
      JOIN api_keys ak ON ue.api_key_id = ak.id
      WHERE ak.user_id = ${userId}
        AND ue.created_at > NOW() - INTERVAL '24 hours'
      GROUP BY EXTRACT(HOUR FROM ue.created_at)
      ORDER BY hour ASC
    `;

    // Get totals
    const totals = await sql`
      SELECT
        COUNT(*) as total_requests,
        COALESCE(SUM(ue.quantity), 0) as total_tokens,
        COUNT(DISTINCT ue.api_key_id) as active_keys,
        COUNT(DISTINCT ue.unit) as models_used,
        COUNT(DISTINCT DATE(ue.created_at)) as active_days
      FROM usage_events ue
      JOIN api_keys ak ON ue.api_key_id = ak.id
      WHERE ak.user_id = ${userId}
        AND ue.created_at > NOW() - INTERVAL '1 day' * ${days}
    `;

    // Calculate trends (compare to previous period)
    const previousTotals = await sql`
      SELECT
        COUNT(*) as total_requests,
        COALESCE(SUM(ue.quantity), 0) as total_tokens
      FROM usage_events ue
      JOIN api_keys ak ON ue.api_key_id = ak.id
      WHERE ak.user_id = ${userId}
        AND ue.created_at > NOW() - INTERVAL '1 day' * ${days * 2}
        AND ue.created_at <= NOW() - INTERVAL '1 day' * ${days}
    `;

    const currentRequests = Number(totals[0]?.total_requests || 0);
    const previousRequests = Number(previousTotals[0]?.total_requests || 0);
    const currentTokens = Number(totals[0]?.total_tokens || 0);
    const previousTokens = Number(previousTotals[0]?.total_tokens || 0);

    const requestsTrend = previousRequests > 0 
      ? ((currentRequests - previousRequests) / previousRequests * 100).toFixed(1)
      : currentRequests > 0 ? '100' : '0';
    
    const tokensTrend = previousTokens > 0
      ? ((currentTokens - previousTokens) / previousTokens * 100).toFixed(1)
      : currentTokens > 0 ? '100' : '0';

    return NextResponse.json({
      success: true,
      period,
      days,
      summary: {
        total_requests: currentRequests,
        total_tokens: currentTokens,
        active_keys: Number(totals[0]?.active_keys || 0),
        models_used: Number(totals[0]?.models_used || 0),
        active_days: Number(totals[0]?.active_days || 0),
        trends: {
          requests: `${Number(requestsTrend) >= 0 ? '+' : ''}${requestsTrend}%`,
          tokens: `${Number(tokensTrend) >= 0 ? '+' : ''}${tokensTrend}%`,
        }
      },
      charts: {
        daily: dailyUsage.map(d => ({
          date: d.date,
          requests: Number(d.requests),
          tokens: Number(d.tokens),
          active_keys: Number(d.active_keys),
          models: Number(d.models),
        })),
        by_model: usageByModel.map(m => ({
          model: m.model || 'unknown',
          requests: Number(m.requests),
          tokens: Number(m.tokens),
        })),
        by_key: usageByKey.map(k => ({
          name: k.key_name,
          prefix: k.key_prefix,
          requests: Number(k.requests),
          tokens: Number(k.tokens),
          last_used: k.last_used,
        })),
        hourly: hourlyDistribution.map(h => ({
          hour: Number(h.hour),
          requests: Number(h.requests),
          tokens: Number(h.tokens),
        })),
      },
      generated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
