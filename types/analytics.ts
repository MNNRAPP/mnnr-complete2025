export interface RevenuePlanBreakdown {
  planName: string;
  customers: number;
  monthlyRecurringRevenue: number;
}

export interface EventTrendPoint {
  date: string;
  count: number;
}

export interface EventTrendSeries {
  event: string;
  data: EventTrendPoint[];
  total: number;
}

export interface AnalyticsSummary {
  activeSubscriptions: number;
  trialingSubscriptions: number;
  churnedLast30Days: number;
  mrr: number;
  arr: number;
  averageRevenuePerUser: number;
  netGrowth30Days: number;
  trialConversionRate: number;
  averageDaysToConvert: number | null;
}

export interface UsageOverview {
  totalEvents30Days: number;
  averageDailyEvents: number;
  topEvents: { event: string; count: number }[];
  eventTrends: EventTrendSeries[];
}

export interface AnalyticsOverview {
  generatedAt: string;
  status: {
    ok: boolean;
    message?: string;
  };
  summary: AnalyticsSummary;
  usage: UsageOverview;
  revenue: {
    currency: string;
    topPlans: RevenuePlanBreakdown[];
  };
  integrations: {
    usdcEnabled: boolean;
  };
}
