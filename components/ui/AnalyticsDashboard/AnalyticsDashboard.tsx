'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnalyticsOverview } from '@/types/analytics';
import { Sparkline } from './Sparkline';

interface AnalyticsDashboardProps {
  initialData: AnalyticsOverview;
}

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
}

function MetricCard({ label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-200">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      {helper && <p className="mt-2 text-sm text-zinc-400">{helper}</p>}
    </div>
  );
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function formatPercent(value: number) {
  const clamped = Math.max(0, Math.min(value, 1));
  return `${(clamped * 100).toFixed(0)}%`;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasData = data.status.ok;

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/analytics/overview', {
        cache: 'no-store'
      });
      const payload = await response.json();
      if (response.ok) {
        setData(payload);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const topPlans = data.revenue.topPlans.slice(0, 3);
  const topEventSeries = data.usage.eventTrends;

  const summaryMetrics = useMemo(
    () => [
      {
        label: 'Active Subscriptions',
        value: data.summary.activeSubscriptions.toString(),
        helper: `${data.summary.trialingSubscriptions} trials in progress`
      },
      {
        label: 'Monthly Recurring Revenue',
        value: formatCurrency(data.summary.mrr, data.revenue.currency),
        helper: `${formatCurrency(data.summary.arr, data.revenue.currency)} ARR`
      },
      {
        label: 'Trial Conversion Rate',
        value: formatPercent(data.summary.trialConversionRate || 0),
        helper:
          data.summary.averageDaysToConvert !== null
            ? `${data.summary.averageDaysToConvert.toFixed(1)} days average to convert`
            : 'No trial conversions yet'
      },
      {
        label: 'Net Growth (30d)',
        value: `${data.summary.netGrowth30Days >= 0 ? '+' : ''}${data.summary.netGrowth30Days}`,
        helper: `${data.summary.churnedLast30Days} churned last 30 days`
      }
    ],
    [data]
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Advanced analytics</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Operational telemetry sourced from Stripe, Supabase, and your SDK integrations.
            Refresh in real time once your service role key and ingestion secret are configured.
          </p>
          {!data.status.ok && (
            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
              {data.status.message}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? 'Refreshing…' : 'Refresh now'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Usage signals</h3>
                <p className="text-sm text-zinc-400">
                  {formatCurrency(data.summary.averageRevenuePerUser, data.revenue.currency)} ARPU ·
                  {` ${data.usage.totalEvents30Days} events last 30 days`}
                </p>
              </div>
              <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                SDK
              </span>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {topEventSeries.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
                  Connect a server-side ingestion key to see live product usage trends.
                </div>
              )}
              {topEventSeries.map((series) => (
                <div key={series.event} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{series.event}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                        {series.total} events
                      </p>
                    </div>
                  </div>
                  <Sparkline data={series.data} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Plan performance</h3>
            <p className="text-sm text-zinc-400">Top revenue contributors ordered by MRR.</p>
            <div className="mt-6 space-y-4">
              {topPlans.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-400">
                  Stripe plans will appear here once subscriptions are active.
                </div>
              )}
              {topPlans.map((plan) => (
                <div
                  key={plan.planName}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{plan.planName}</p>
                    <p className="text-xs text-zinc-500">{plan.customers} customers</p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-200">
                    {formatCurrency(plan.monthlyRecurringRevenue, data.revenue.currency)} / mo
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Integration health</h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              <li className="flex items-center justify-between">
                <span>USDC on-chain checkout</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    data.integrations.usdcEnabled
                      ? 'bg-emerald-400/10 text-emerald-200'
                      : 'bg-amber-400/10 text-amber-200'
                  }`}
                >
                  {data.integrations.usdcEnabled ? 'Enabled' : 'Configure'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>SDK ingestion</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    hasData ? 'bg-emerald-400/10 text-emerald-200' : 'bg-amber-400/10 text-amber-200'
                  }`}
                >
                  {hasData ? 'Streaming' : 'Waiting for key'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Service role analytics</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    data.status.ok
                      ? 'bg-emerald-400/10 text-emerald-200'
                      : 'bg-rose-500/10 text-rose-200'
                  }`}
                >
                  {data.status.ok ? 'Healthy' : 'Action needed'}
                </span>
              </li>
            </ul>
            <button
              type="button"
              onClick={refresh}
              className="mt-6 inline-flex items-center text-sm font-semibold text-emerald-200 hover:text-emerald-100"
            >
              Re-run checks ↻
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Event spotlight</h3>
            <p className="text-sm text-zinc-400">
              Top five events from the past 30 days aggregated via the SDK ingestion API.
            </p>
            <ol className="mt-4 space-y-3 text-sm text-zinc-300">
              {data.usage.topEvents.length === 0 && (
                <li className="rounded-xl border border-dashed border-white/10 p-4 text-zinc-400">
                  No events yet. Use the SDK helper packages to stream signals.
                </li>
              )}
              {data.usage.topEvents.map((event) => (
                <li key={event.event} className="flex items-center justify-between">
                  <span>{event.event}</span>
                  <span className="text-xs text-zinc-500">{event.count}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
