#!/usr/bin/env tsx
/**
 * Weekly Monitoring Script
 * Tracks user sign-ups and payment events
 * Runs every Monday at 9 AM
 */

import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

interface WeeklyMetrics {
  signups: {
    total: number;
    thisWeek: number;
    lastWeek: number;
    growth: number;
  };
  payments: {
    total: number;
    thisWeek: number;
    lastWeek: number;
    totalRevenue: number;
    weeklyRevenue: number;
  };
  activeUsers: number;
  churnRate: number;
}

async function getWeeklyMetrics(): Promise<WeeklyMetrics> {
  // Get sign-up metrics
  const signupStats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as this_week,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as last_week
    FROM users
  `;

  // Get payment metrics
  const paymentStats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as this_week,
      COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days') as last_week,
      SUM(amount_paid) as total_revenue,
      SUM(amount_paid) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as weekly_revenue
    FROM invoices
    WHERE status = 'paid'
  `;

  // Get active users (signed in within last 7 days)
  const activeUsers = await sql`
    SELECT COUNT(*) as count
    FROM users
    WHERE last_sign_in_at >= NOW() - INTERVAL '7 days'
  `;

  // Calculate churn rate (users who haven't signed in for 30+ days)
  const churnStats = await sql`
    SELECT 
      COUNT(*) FILTER (WHERE last_sign_in_at < NOW() - INTERVAL '30 days') as churned,
      COUNT(*) as total
    FROM users
    WHERE created_at < NOW() - INTERVAL '30 days'
  `;

  const signupGrowth = signupStats[0].last_week > 0
    ? ((signupStats[0].this_week - signupStats[0].last_week) / signupStats[0].last_week) * 100
    : 0;

  const churnRate = churnStats[0].total > 0
    ? (churnStats[0].churned / churnStats[0].total) * 100
    : 0;

  return {
    signups: {
      total: parseInt(signupStats[0].total),
      thisWeek: parseInt(signupStats[0].this_week),
      lastWeek: parseInt(signupStats[0].last_week),
      growth: signupGrowth,
    },
    payments: {
      total: parseInt(paymentStats[0].total),
      thisWeek: parseInt(paymentStats[0].this_week),
      lastWeek: parseInt(paymentStats[0].last_week),
      totalRevenue: parseFloat(paymentStats[0].total_revenue || 0),
      weeklyRevenue: parseFloat(paymentStats[0].weekly_revenue || 0),
    },
    activeUsers: parseInt(activeUsers[0].count),
    churnRate: churnRate,
  };
}

function formatMetricsReport(metrics: WeeklyMetrics): string {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
📊 MNNR Weekly Metrics Report
${date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👥 USER SIGN-UPS
  Total Users: ${metrics.signups.total}
  This Week: ${metrics.signups.thisWeek}
  Last Week: ${metrics.signups.lastWeek}
  Growth: ${metrics.signups.growth > 0 ? '+' : ''}${metrics.signups.growth.toFixed(1)}%

💰 PAYMENTS
  Total Invoices: ${metrics.payments.total}
  This Week: ${metrics.payments.thisWeek}
  Last Week: ${metrics.payments.lastWeek}
  Total Revenue: $${metrics.payments.totalRevenue.toFixed(2)}
  Weekly Revenue: $${metrics.payments.weeklyRevenue.toFixed(2)}

📈 ENGAGEMENT
  Active Users (7d): ${metrics.activeUsers}
  Churn Rate (30d): ${metrics.churnRate.toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 KEY INSIGHTS
${generateInsights(metrics)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next report: ${getNextMonday()}
`.trim();
}

function generateInsights(metrics: WeeklyMetrics): string {
  const insights: string[] = [];

  if (metrics.signups.thisWeek === 0) {
    insights.push('⚠️  No new sign-ups this week - time to increase outreach');
  } else if (metrics.signups.growth > 50) {
    insights.push('🚀 Sign-ups growing fast! Keep momentum going');
  } else if (metrics.signups.growth < -20) {
    insights.push('⚠️  Sign-ups declining - review marketing channels');
  }

  if (metrics.payments.thisWeek === 0 && metrics.signups.total > 10) {
    insights.push('💡 No payments this week - consider reaching out to users');
  } else if (metrics.payments.weeklyRevenue > 1000) {
    insights.push('💰 Strong revenue week! On track for growth');
  }

  if (metrics.churnRate > 30) {
    insights.push('⚠️  High churn rate - focus on user retention');
  } else if (metrics.churnRate < 10) {
    insights.push('✅ Low churn - users are engaged');
  }

  const conversionRate = metrics.signups.total > 0
    ? (metrics.payments.total / metrics.signups.total) * 100
    : 0;

  if (conversionRate < 5 && metrics.signups.total > 20) {
    insights.push('💡 Low conversion rate - improve onboarding or pricing');
  } else if (conversionRate > 20) {
    insights.push('🎯 Strong conversion rate - product-market fit looking good');
  }

  return insights.length > 0
    ? insights.map(i => `  ${i}`).join('\n')
    : '  📊 Steady progress - keep building';
}

function getNextMonday(): string {
  const today = new Date();
  const daysUntilMonday = (8 - today.getDay()) % 7 || 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  return nextMonday.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

async function main() {
  try {
    console.log('🔍 Fetching weekly metrics...\n');
    
    const metrics = await getWeeklyMetrics();
    const report = formatMetricsReport(metrics);
    
    console.log(report);
    console.log('\n✅ Weekly monitoring complete\n');
    
    // TODO: Send email notification
    // await sendEmailReport(report);
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating weekly report:', error);
    await sql.end();
    process.exit(1);
  }
}

main();
