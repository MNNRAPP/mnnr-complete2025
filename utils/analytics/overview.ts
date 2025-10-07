import { createAdminClient } from '@/utils/supabase/admin';
import { AnalyticsOverview, EventTrendSeries, RevenuePlanBreakdown } from '@/types/analytics';

interface SubscriptionRecord {
  id: string;
  status: string | null;
  created: string | null;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  price_id: string | null;
  prices: {
    unit_amount: number | null;
    currency: string | null;
    interval: string | null;
    interval_count: number | null;
    products: {
      name: string | null;
    } | null;
  } | null;
}

interface UsageEventRecord {
  created_at: string | null;
  event_name: string | null;
}

const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const monthlyAmountFromPrice = (record: SubscriptionRecord): number => {
  const price = record.prices;
  if (!price?.unit_amount) {
    return 0;
  }

  const amount = price.unit_amount / 100;
  const interval = price.interval ?? 'month';
  const intervalCount = price.interval_count ?? 1;

  if (interval === 'year') {
    return amount / (12 / intervalCount);
  }

  if (interval === 'week') {
    return (amount * 52) / (12 * intervalCount);
  }

  if (interval === 'day') {
    return (amount * 365) / (12 * intervalCount);
  }

  return amount / intervalCount;
};

const computeEventTrends = (events: UsageEventRecord[]): EventTrendSeries[] => {
  const trends = new Map<string, Map<string, number>>();

  for (const event of events) {
    if (!event.event_name || !event.created_at) continue;
    const date = new Date(event.created_at);
    const key = date.toISOString().split('T')[0];

    if (!trends.has(event.event_name)) {
      trends.set(event.event_name, new Map());
    }

    const series = trends.get(event.event_name)!;
    series.set(key, (series.get(key) ?? 0) + 1);
  }

  return Array.from(trends.entries()).map(([event, series]) => {
    const orderedDates = Array.from(series.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    return {
      event,
      data: orderedDates,
      total: orderedDates.reduce((acc, point) => acc + point.count, 0)
    };
  });
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const usdcEnabled = Boolean(process.env.COINBASE_COMMERCE_API_KEY);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      generatedAt: new Date().toISOString(),
      status: {
        ok: false,
        message:
          'SUPABASE_SERVICE_ROLE_KEY is not configured. Add it to enable analytics aggregation.'
      },
      summary: {
        activeSubscriptions: 0,
        trialingSubscriptions: 0,
        churnedLast30Days: 0,
        mrr: 0,
        arr: 0,
        averageRevenuePerUser: 0,
        netGrowth30Days: 0,
        trialConversionRate: 0,
        averageDaysToConvert: null
      },
      usage: {
        totalEvents30Days: 0,
        averageDailyEvents: 0,
        topEvents: [],
        eventTrends: []
      },
      revenue: {
        currency: 'USD',
        topPlans: []
      },
      integrations: {
        usdcEnabled
      }
    };
  }

  const supabaseAdmin = createAdminClient();
  const since = daysAgo(30).toISOString();

  const { data: subscriptions = [] } = await supabaseAdmin
    .from('subscriptions')
    .select(
      `id, status, created, canceled_at, trial_start, trial_end, price_id,
       prices:prices!inner(unit_amount, currency, interval, interval_count, products(name))`
    )
    .gte('created', daysAgo(365).toISOString());

  const { data: eventsRaw, error: eventsError } = await supabaseAdmin
    .from('usage_events')
    .select('created_at, event_name')
    .gte('created_at', since);

  const events = eventsError ? [] : eventsRaw ?? [];

  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'active'
  );
  const trialingSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === 'trialing'
  );
  const churnedLast30Days = subscriptions.filter((subscription) => {
    if (!subscription.canceled_at) return false;
    return new Date(subscription.canceled_at) >= new Date(since);
  });

  const mrr = activeSubscriptions.reduce(
    (acc, subscription) => acc + monthlyAmountFromPrice(subscription),
    0
  );
  const arr = mrr * 12;
  const averageRevenuePerUser = activeSubscriptions.length
    ? mrr / activeSubscriptions.length
    : 0;

  const newSubscriptions = subscriptions.filter((subscription) => {
    if (!subscription.created) return false;
    return new Date(subscription.created) >= new Date(since);
  });

  const netGrowth30Days =
    newSubscriptions.filter((sub) => sub.status === 'active').length -
    churnedLast30Days.length;

  const trialsWithEnd = subscriptions.filter(
    (subscription) => subscription.trial_start && subscription.trial_end
  );
  const trialConversionRate = trialsWithEnd.length
    ? activeSubscriptions.length / trialsWithEnd.length
    : 0;

  const averageDaysToConvert = trialsWithEnd.length
    ?
        trialsWithEnd.reduce((acc, subscription) => {
          const start = subscription.trial_start
            ? new Date(subscription.trial_start)
            : null;
          const end = subscription.trial_end ? new Date(subscription.trial_end) : null;
          if (!start || !end) return acc;
          const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
          return acc + diff;
        }, 0) / trialsWithEnd.length
    : null;

  const planBreakdownMap = new Map<string, RevenuePlanBreakdown>();
  for (const subscription of activeSubscriptions) {
    const productName = subscription.prices?.products?.name ?? 'Unknown Plan';
    const plan = planBreakdownMap.get(productName) ?? {
      planName: productName,
      customers: 0,
      monthlyRecurringRevenue: 0
    };

    plan.customers += 1;
    plan.monthlyRecurringRevenue += monthlyAmountFromPrice(subscription);
    planBreakdownMap.set(productName, plan);
  }

  const topPlans = Array.from(planBreakdownMap.values()).sort(
    (a, b) => b.monthlyRecurringRevenue - a.monthlyRecurringRevenue
  );

  const totalEvents30Days = events.length;
  const averageDailyEvents = totalEvents30Days / 30;

  const eventCounts = events.reduce((acc, event) => {
    if (!event.event_name) return acc;
    acc.set(event.event_name, (acc.get(event.event_name) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  const topEvents = Array.from(eventCounts.entries())
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const eventTrends = computeEventTrends(events).filter((series) =>
    topEvents.some((topEvent) => topEvent.event === series.event)
  );

  return {
    generatedAt: new Date().toISOString(),
    status: {
      ok: true
    },
    summary: {
      activeSubscriptions: activeSubscriptions.length,
      trialingSubscriptions: trialingSubscriptions.length,
      churnedLast30Days: churnedLast30Days.length,
      mrr,
      arr,
      averageRevenuePerUser,
      netGrowth30Days,
      trialConversionRate,
      averageDaysToConvert
    },
    usage: {
      totalEvents30Days,
      averageDailyEvents,
      topEvents,
      eventTrends
    },
    revenue: {
      currency:
        activeSubscriptions[0]?.prices?.currency?.toUpperCase() ?? 'USD',
      topPlans
    },
    integrations: {
      usdcEnabled
    }
  };
}
