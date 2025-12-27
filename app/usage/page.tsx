/**
 * Usage Page
 * 
 * Created: 2025-12-26 23:17:00 EST
 * Action #22 in 19-hour optimization
 * 
 * Purpose: Usage tracking and analytics dashboard
 */

'use client';

import { useState } from 'react';
import { useUsage } from '@/hooks/useApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const PERIODS = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

export default function UsagePage() {
  const [period, setPeriod] = useState('month');
  const { data: usage, loading, refetch } = useUsage({ period });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Usage Analytics
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your usage metrics and stay within limits
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : usage?.metrics && Object.keys(usage.metrics).length > 0 ? (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(usage.metrics).map(([metric, data]: [string, any]) => (
                <Card key={metric}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">
                      {metric.replace(/_/g, ' ')}
                    </CardTitle>
                    <CardDescription>
                      {PERIODS.find((p) => p.value === period)?.label}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{data.total}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          events
                        </span>
                      </div>
                      
                      {data.limit && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                (data.total / data.limit) * 100 > 90
                                  ? 'bg-red-600'
                                  : (data.total / data.limit) * 100 > 75
                                  ? 'bg-yellow-600'
                                  : 'bg-green-600'
                              }`}
                              style={{
                                width: `${Math.min((data.total / data.limit) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {data.total} / {data.limit}
                            </span>
                            <span className="font-medium">
                              {((data.total / data.limit) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}

                      {data.average && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Average: <span className="font-medium">{data.average.toFixed(2)}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Usage Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Timeline</CardTitle>
                <CardDescription>
                  Daily breakdown of your usage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usage.timeline && usage.timeline.length > 0 ? (
                  <div className="space-y-2">
                    {usage.timeline.map((day: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {new Date(day.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {day.events} events
                          </p>
                        </div>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(day.events / Math.max(...usage.timeline.map((d: any) => d.events))) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                    No timeline data available
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No usage data available for this period
                </p>
                <Button onClick={() => refetch()}>Refresh</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
