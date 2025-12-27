/**
 * Dashboard Content Component
 * 
 * Created: 2025-12-26 23:08:00 EST
 * Action #16 in 19-hour optimization
 * 
 * Purpose: Client-side dashboard content with interactive features
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSubscriptions, useInvoices, useUsage } from '@/hooks/useApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface DashboardContentProps {
  user: any;
  profile: any;
  subscription: any;
}

export default function DashboardContent({
  user,
  profile,
  subscription: initialSubscription,
}: DashboardContentProps) {
  const { data: subscriptions, loading: subsLoading } = useSubscriptions();
  const { data: invoices, loading: invoicesLoading } = useInvoices({ limit: 5 });
  const { data: usage, loading: usageLoading } = useUsage({ period: 'month' });

  const activeSubscription = subscriptions?.subscriptions?.[0] || initialSubscription;

  return (
    <div className="space-y-6">
      {/* Subscription Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>
            Your current plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subsLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {activeSubscription.prices?.products?.name || 'Pro Plan'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeSubscription.prices?.description || 'Active subscription'}
                  </p>
                </div>
                <Badge
                  variant={
                    activeSubscription.status === 'active'
                      ? 'success'
                      : activeSubscription.status === 'trialing'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {activeSubscription.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Amount
                  </p>
                  <p className="text-xl font-bold">
                    ${(activeSubscription.prices?.unit_amount / 100).toFixed(2)}
                    <span className="text-sm font-normal text-gray-600">
                      /{activeSubscription.prices?.interval}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Next Billing Date
                  </p>
                  <p className="text-xl font-bold">
                    {new Date(
                      activeSubscription.current_period_end * 1000
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/account">
                  <Button variant="outline">Manage Subscription</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="ghost">Change Plan</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No active subscription
              </p>
              <Link href="/pricing">
                <Button>View Plans</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>
            Track your usage and stay within limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usageLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ) : usage?.metrics && Object.keys(usage.metrics).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(usage.metrics).map(([metric, data]: [string, any]) => (
                <div key={metric}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {metric.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {data.total} / ∞
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                </div>
              ))}
              <Link href="/usage">
                <Button variant="ghost" className="w-full">
                  View Detailed Usage
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-4">
              No usage data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Your billing history and payment receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : invoices?.invoices && invoices.invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.invoices.map((invoice: any) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {invoice.number || `Invoice #${invoice.id.slice(-8)}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(invoice.created * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold">
                        ${(invoice.amount_paid / 100).toFixed(2)}
                      </p>
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'success'
                            : invoice.status === 'open'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    {invoice.invoice_pdf && (
                      <a
                        href={invoice.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              <Link href="/account">
                <Button variant="ghost" className="w-full">
                  View All Invoices
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-4">
              No invoices yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/account">
              <Button variant="outline" className="w-full">
                Account Settings
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="w-full">
                Documentation
              </Button>
            </Link>
            <Link href="/docs/api">
              <Button variant="outline" className="w-full">
                API Reference
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
