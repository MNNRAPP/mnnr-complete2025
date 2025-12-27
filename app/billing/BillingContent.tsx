/**
 * Billing Content Component
 * 
 * Created: 2025-12-26 23:15:00 EST
 * Action #21 in 19-hour optimization
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePaymentMethods, useInvoices, useCancelSubscription } from '@/hooks/useApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { toast } from '@/components/ui/Toasts/toasts';

interface BillingContentProps {
  user: any;
  subscriptions: any[];
  customer: any;
}

export default function BillingContent({
  user,
  subscriptions: initialSubscriptions,
  customer,
}: BillingContentProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions || []);
  const { data: paymentMethods, loading: pmLoading, refetch: refetchPM } = usePaymentMethods();
  const { data: invoices, loading: invoicesLoading } = useInvoices({ limit: 10 });
  const { mutate: cancelSubscription, loading: canceling } = useCancelSubscription({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Subscription canceled successfully' });
      // Refresh subscriptions
    },
  });

  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === 'active' || sub.status === 'trialing'
  );

  const handleCancelSubscription = async (id: string, immediately = false) => {
    if (confirm(`Are you sure you want to cancel ${immediately ? 'immediately' : 'at period end'}?`)) {
      await cancelSubscription({ id, immediately });
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your active subscription and billing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSubscription ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {activeSubscription.prices?.products?.name || 'Pro Plan'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    ${(activeSubscription.prices?.unit_amount / 100).toFixed(2)}/
                    {activeSubscription.prices?.interval}
                  </p>
                </div>
                <Badge
                  variant={
                    activeSubscription.status === 'active' ? 'success' : 'warning'
                  }
                >
                  {activeSubscription.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Billing Period
                  </p>
                  <p className="font-medium">
                    {new Date(activeSubscription.current_period_start * 1000).toLocaleDateString()} -{' '}
                    {new Date(activeSubscription.current_period_end * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Next Payment
                  </p>
                  <p className="font-medium">
                    {new Date(activeSubscription.current_period_end * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/pricing">
                  <Button variant="outline">Change Plan</Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={() => handleCancelSubscription(activeSubscription.id, false)}
                  disabled={canceling}
                >
                  {canceling ? 'Canceling...' : 'Cancel Subscription'}
                </Button>
              </div>

              {activeSubscription.cancel_at_period_end && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Your subscription will be canceled on{' '}
                    {new Date(activeSubscription.current_period_end * 1000).toLocaleDateString()}
                  </p>
                </div>
              )}
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

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods for subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pmLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : paymentMethods?.payment_methods && paymentMethods.payment_methods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.payment_methods.map((pm: any) => (
                <div
                  key={pm.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-xs font-bold uppercase">
                        {pm.card?.brand}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        •••• {pm.card?.last4}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Expires {pm.card?.exp_month}/{pm.card?.exp_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pm.id === customer?.default_payment_method && (
                      <Badge variant="info">Default</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Add Payment Method
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No payment methods added
              </p>
              <Button>Add Payment Method</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : invoices?.invoices && invoices.invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.invoices.map((invoice: any) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <p className="font-medium">
                      {invoice.number || `Invoice #${invoice.id.slice(-8)}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(invoice.created * 1000).toLocaleDateString()} •{' '}
                      ${(invoice.amount_paid / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
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
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              No invoices yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
