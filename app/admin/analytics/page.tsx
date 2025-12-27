/**
 * Admin Analytics Page
 * 
 * Created: 2025-12-27 00:15:00 EST
 * Part of 2-hour completion plan - Phase 2
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AnalyticsContent from './AnalyticsContent';

export const metadata = {
  title: 'Analytics | Admin | MNNR',
  description: 'Platform-wide analytics and metrics',
};

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?redirect=/admin/analytics');
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch analytics data
  const period = searchParams.period || 'month';

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
      startDate = new Date(0); // All time
  }

  // Fetch user metrics
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: newUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate.toISOString());

  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Fetch subscription metrics (mock data - replace with real Stripe data)
  const subscriptionMetrics = {
    total: 150,
    active: 120,
    trial: 20,
    canceled: 10,
    revenue: 15000,
    mrr: 12000,
  };

  // Fetch usage metrics (mock data - replace with real data)
  const usageMetrics = {
    totalEvents: 50000,
    eventsThisPeriod: 15000,
    avgEventsPerUser: 125,
  };

  // User growth data (mock - replace with real data)
  const userGrowthData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    users: Math.floor(Math.random() * 50) + 100,
  }));

  // Revenue data (mock - replace with real Stripe data)
  const revenueData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
    revenue: Math.floor(Math.random() * 5000) + 10000,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Platform-wide metrics and insights
          </p>
        </div>

        <AnalyticsContent
          userMetrics={{
            total: totalUsers || 0,
            new: newUsers || 0,
            active: activeUsers || 0,
          }}
          subscriptionMetrics={subscriptionMetrics}
          usageMetrics={usageMetrics}
          userGrowthData={userGrowthData}
          revenueData={revenueData}
          period={period}
        />
      </div>
    </div>
  );
}
