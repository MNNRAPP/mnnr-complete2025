'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

interface AnalyticsData {
  summary: {
    total_requests: number;
    total_tokens: number;
    active_keys: number;
    models_used: number;
    active_days: number;
    trends: {
      requests: string;
      tokens: string;
    };
  };
  charts: {
    daily: Array<{
      date: string;
      requests: number;
      tokens: number;
      active_keys: number;
      models: number;
    }>;
    by_model: Array<{
      model: string;
      requests: number;
      tokens: number;
    }>;
    by_key: Array<{
      name: string;
      prefix: string;
      requests: number;
      tokens: number;
      last_used: string | null;
    }>;
    hourly: Array<{
      hour: number;
      requests: number;
      tokens: number;
    }>;
  };
}

const COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

export default function UsageCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/analytics?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load analytics');
      }
    } catch (e) {
      setError('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
        {error || 'No data available'}
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Usage Analytics</h2>
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === p
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Requests"
          value={formatNumber(data.summary.total_requests)}
          trend={data.summary.trends.requests}
        />
        <SummaryCard
          label="Total Tokens"
          value={formatNumber(data.summary.total_tokens)}
          trend={data.summary.trends.tokens}
        />
        <SummaryCard
          label="Active Keys"
          value={data.summary.active_keys.toString()}
        />
        <SummaryCard
          label="Models Used"
          value={data.summary.models_used.toString()}
        />
      </div>

      {/* Daily Usage Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Daily Usage</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.charts.daily}>
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#666"
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <YAxis
                yAxisId="tokens"
                orientation="left"
                tickFormatter={formatNumber}
                stroke="#666"
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <YAxis
                yAxisId="requests"
                orientation="right"
                tickFormatter={formatNumber}
                stroke="#666"
                tick={{ fill: '#888', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                labelFormatter={formatDate}
              />
              <Legend />
              <Area
                yAxisId="tokens"
                type="monotone"
                dataKey="tokens"
                stroke="#10b981"
                fill="url(#tokenGradient)"
                strokeWidth={2}
                name="Tokens"
              />
              <Area
                yAxisId="requests"
                type="monotone"
                dataKey="requests"
                stroke="#06b6d4"
                fill="url(#requestGradient)"
                strokeWidth={2}
                name="Requests"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Usage by Model */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Usage by Model</h3>
          {data.charts.by_model.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-white/40">
              No usage data yet
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.by_model}
                    dataKey="tokens"
                    nameKey="model"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={{ stroke: '#666' }}
                  >
                    {data.charts.by_model.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => formatNumber(Number(value || 0))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Hourly Distribution (Last 24h)
          </h3>
          {data.charts.hourly.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-white/40">
              No usage in last 24 hours
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.hourly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(h) => `${h}:00`}
                    stroke="#666"
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={formatNumber}
                    stroke="#666"
                    tick={{ fill: '#888', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(h) => `${h}:00 - ${h}:59`}
                  />
                  <Bar dataKey="requests" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Usage by API Key */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Usage by API Key</h3>
        {data.charts.by_key.length === 0 ? (
          <div className="text-center py-8 text-white/40">No API keys yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Key Name</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Prefix</th>
                  <th className="text-right py-3 px-4 text-white/60 font-medium">Requests</th>
                  <th className="text-right py-3 px-4 text-white/60 font-medium">Tokens</th>
                  <th className="text-right py-3 px-4 text-white/60 font-medium">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {data.charts.by_key.map((key, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{key.name}</td>
                    <td className="py-3 px-4 text-white/60 font-mono text-sm">
                      {key.prefix}...
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400">
                      {formatNumber(key.requests)}
                    </td>
                    <td className="py-3 px-4 text-right text-cyan-400">
                      {formatNumber(key.tokens)}
                    </td>
                    <td className="py-3 px-4 text-right text-white/40 text-sm">
                      {key.last_used
                        ? new Date(key.last_used).toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: string;
}) {
  const isPositive = trend?.startsWith('+');
  const isNegative = trend?.startsWith('-');

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-bold text-emerald-400 mb-1">{value}</div>
          <div className="text-white/50 text-sm">{label}</div>
        </div>
        {trend && (
          <div
            className={`text-sm font-medium px-2 py-1 rounded ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : isNegative
                ? 'bg-red-500/10 text-red-400'
                : 'bg-white/5 text-white/40'
            }`}
          >
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
