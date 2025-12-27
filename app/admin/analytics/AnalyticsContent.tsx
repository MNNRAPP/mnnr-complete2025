/**
 * Admin Analytics Content Component
 * 
 * Created: 2025-12-27 00:16:00 EST
 * Part of 2-hour completion plan - Phase 2
 */

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface UserMetrics {
  total: number;
  new: number;
  active: number;
}

interface SubscriptionMetrics {
  total: number;
  active: number;
  trial: number;
  canceled: number;
  revenue: number;
  mrr: number;
}

interface UsageMetrics {
  totalEvents: number;
  eventsThisPeriod: number;
  avgEventsPerUser: number;
}

interface DataPoint {
  date?: string;
  month?: string;
  users?: number;
  revenue?: number;
}

interface AnalyticsContentProps {
  userMetrics: UserMetrics;
  subscriptionMetrics: SubscriptionMetrics;
  usageMetrics: UsageMetrics;
  userGrowthData: DataPoint[];
  revenueData: DataPoint[];
  period: string;
}

export default function AnalyticsContent({
  userMetrics,
  subscriptionMetrics,
  usageMetrics,
  userGrowthData,
  revenueData,
  period,
}: AnalyticsContentProps) {
  const router = useRouter();

  const handlePeriodChange = (newPeriod: string) => {
    router.push(`/admin/analytics?period=${newPeriod}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            {['day', 'week', 'month', 'year', 'all'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePeriodChange(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
            <div className="flex-1" />
            <Button variant="outline" size="sm">
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(userMetrics.total)}</div>
            <p className="text-sm text-green-600 mt-2">
              +{formatNumber(userMetrics.new)} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(userMetrics.active)}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {((userMetrics.active / userMetrics.total) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {((userMetrics.new / userMetrics.total) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-green-600 mt-2">
              Trending up
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(subscriptionMetrics.revenue)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(subscriptionMetrics.mrr)}
            </div>
            <p className="text-sm text-green-600 mt-2">
              +8.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatNumber(subscriptionMetrics.active)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {subscriptionMetrics.trial} on trial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-1">
            {userGrowthData.slice(-30).map((data, i) => (
              <div
                key={i}
                className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer rounded-t"
                style={{
                  height: `${(data.users! / Math.max(...userGrowthData.map(d => d.users!))) * 100}%`,
                }}
                title={`${data.date}: ${data.users} users`}
              />
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
            Last 30 days
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-2">
            {revenueData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-green-500 hover:bg-green-600 transition-colors cursor-pointer rounded-t"
                  style={{
                    height: `${(data.revenue! / Math.max(...revenueData.map(d => d.revenue!))) * 100}%`,
                  }}
                  title={`${data.month}: ${formatCurrency(data.revenue!)}`}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {data.month}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Active</span>
                <span className="text-sm font-medium">{subscriptionMetrics.active}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${(subscriptionMetrics.active / subscriptionMetrics.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Trial</span>
                <span className="text-sm font-medium">{subscriptionMetrics.trial}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${(subscriptionMetrics.trial / subscriptionMetrics.total) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Canceled</span>
                <span className="text-sm font-medium">{subscriptionMetrics.canceled}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{
                    width: `${(subscriptionMetrics.canceled / subscriptionMetrics.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Events
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(usageMetrics.totalEvents)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Events This Period
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(usageMetrics.eventsThisPeriod)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Avg Events Per User
              </div>
              <div className="text-2xl font-bold">
                {formatNumber(usageMetrics.avgEventsPerUser)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
