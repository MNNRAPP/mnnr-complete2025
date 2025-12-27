/**
 * Admin Analytics API Endpoint
 * 
 * Created: 2025-12-26 22:54:00 EST
 * Action #10 in 19-hour optimization
 * 
 * Purpose: Provide administrative analytics and metrics
 * 
 * Endpoints:
 * - GET /api/admin/analytics - Get platform-wide analytics
 * 
 * Security: Requires admin role
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export const dynamic = 'force-dynamic';

/**
 * Check if user has admin role
 */
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();
  
  return !!data;
}

/**
 * GET /api/admin/analytics
 * Get platform-wide analytics and metrics
 * 
 * Query Parameters:
 * - period: Time period (day, week, month, year)
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

    // Check admin permission
    const hasAdminAccess = await isAdmin(supabase, user.id);
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

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
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get user metrics
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get subscription metrics
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('status');

    const activeSubscriptions = subscriptions?.filter(
      (s) => s.status === 'active'
    ).length || 0;

    const trialingSubscriptions = subscriptions?.filter(
      (s) => s.status === 'trialing'
    ).length || 0;

    const canceledSubscriptions = subscriptions?.filter(
      (s) => s.status === 'canceled'
    ).length || 0;

    // Get revenue metrics from Stripe
    const charges = await stripe.charges.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
      },
      limit: 100,
    });

    const revenue = charges.data
      .filter((charge) => charge.paid)
      .reduce((sum, charge) => sum + charge.amount, 0);

    const refunds = charges.data
      .filter((charge) => charge.refunded)
      .reduce((sum, charge) => sum + (charge.amount_refunded || 0), 0);

    // Get usage metrics
    const { count: totalUsageEvents } = await supabase
      .from('usage_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Calculate growth rates
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setTime(
      startDate.getTime() - (now.getTime() - startDate.getTime())
    );

    const { count: previousNewUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousPeriodStart.toISOString())
      .lt('created_at', startDate.toISOString());

    const userGrowthRate = previousNewUsers
      ? ((newUsers! - previousNewUsers) / previousNewUsers) * 100
      : 0;

    return NextResponse.json({
      period,
      date_range: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
      users: {
        total: totalUsers || 0,
        new: newUsers || 0,
        growth_rate: userGrowthRate.toFixed(2) + '%',
      },
      subscriptions: {
        active: activeSubscriptions,
        trialing: trialingSubscriptions,
        canceled: canceledSubscriptions,
        total: subscriptions?.length || 0,
      },
      revenue: {
        total: revenue,
        refunds: refunds,
        net: revenue - refunds,
        currency: 'usd',
      },
      usage: {
        total_events: totalUsageEvents || 0,
      },
    });
  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
