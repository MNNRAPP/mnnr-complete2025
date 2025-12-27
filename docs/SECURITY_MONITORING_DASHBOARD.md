# Security Monitoring Dashboard

**Repository**: MNNRAPP/mnnr-complete2025  
**Last Updated**: December 27, 2025  
**Purpose**: Real-time security monitoring and alerting

---

## 🎯 Overview

This document provides implementation guidance for a comprehensive security monitoring dashboard that tracks:

- **Vulnerability Status**: Dependabot, CodeQL, Secret Scanning alerts
- **Dependency Health**: Outdated packages, license compliance
- **Security Metrics**: Authentication failures, suspicious activity
- **Compliance Status**: SOC 2, GDPR, HIPAA requirements
- **Incident Response**: Active threats, response times

---

## 📊 Dashboard Components

### 1. Security Score Card

**Real-time security posture at a glance**

```typescript
// components/SecurityScoreCard.tsx
interface SecurityMetrics {
  overall_score: number; // 0-10
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  dependencies: {
    total: number;
    outdated: number;
    vulnerable: number;
  };
  compliance: {
    soc2: 'compliant' | 'non-compliant' | 'in-progress';
    gdpr: 'compliant' | 'non-compliant' | 'in-progress';
    hipaa: 'compliant' | 'non-compliant' | 'in-progress';
  };
}

export function SecurityScoreCard({ metrics }: { metrics: SecurityMetrics }) {
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'green';
    if (score >= 7) return 'yellow';
    return 'red';
  };

  return (
    <div className="security-score-card">
      <div className="score-circle" style={{ borderColor: getScoreColor(metrics.overall_score) }}>
        <span className="score">{metrics.overall_score}/10</span>
        <span className="label">Security Score</span>
      </div>
      
      <div className="metrics-grid">
        <MetricCard
          title="Vulnerabilities"
          critical={metrics.vulnerabilities.critical}
          high={metrics.vulnerabilities.high}
          medium={metrics.vulnerabilities.medium}
          low={metrics.vulnerabilities.low}
        />
        
        <MetricCard
          title="Dependencies"
          total={metrics.dependencies.total}
          outdated={metrics.dependencies.outdated}
          vulnerable={metrics.dependencies.vulnerable}
        />
        
        <ComplianceCard compliance={metrics.compliance} />
      </div>
    </div>
  );
}
```

### 2. Vulnerability Timeline

**Track vulnerability discovery and resolution over time**

```typescript
// components/VulnerabilityTimeline.tsx
interface VulnerabilityEvent {
  date: string;
  type: 'discovered' | 'fixed' | 'escalated';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  package?: string;
  cve?: string;
}

export function VulnerabilityTimeline({ events }: { events: VulnerabilityEvent[] }) {
  return (
    <div className="vulnerability-timeline">
      <h3>Vulnerability Timeline (Last 30 Days)</h3>
      <div className="timeline">
        {events.map((event, index) => (
          <TimelineEvent key={index} event={event} />
        ))}
      </div>
    </div>
  );
}
```

### 3. Real-time Alerts Feed

**Live stream of security events**

```typescript
// components/SecurityAlertsFeed.tsx
interface SecurityAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'authentication' | 'authorization' | 'data-access' | 'system';
  message: string;
  actor?: {
    user_id: string;
    email: string;
    ip_address: string;
  };
  action_required: boolean;
}

export function SecurityAlertsFeed() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  useEffect(() => {
    // Subscribe to real-time alerts
    const subscription = supabase
      .channel('security-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_logs',
        filter: 'severity=in.(critical,high,warning)',
      }, (payload) => {
        setAlerts(prev => [payload.new as SecurityAlert, ...prev].slice(0, 50));
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="alerts-feed">
      <h3>Security Alerts</h3>
      {alerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
```

### 4. Dependency Health Matrix

**Visual representation of dependency status**

```typescript
// components/DependencyHealthMatrix.tsx
interface Dependency {
  name: string;
  current_version: string;
  latest_version: string;
  vulnerabilities: number;
  license: string;
  last_updated: string;
  status: 'healthy' | 'outdated' | 'vulnerable' | 'critical';
}

export function DependencyHealthMatrix({ dependencies }: { dependencies: Dependency[] }) {
  return (
    <div className="dependency-matrix">
      <h3>Dependency Health</h3>
      <table>
        <thead>
          <tr>
            <th>Package</th>
            <th>Version</th>
            <th>Latest</th>
            <th>Vulnerabilities</th>
            <th>License</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {dependencies.map(dep => (
            <DependencyRow key={dep.name} dependency={dep} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 5. Authentication Analytics

**Monitor authentication patterns and anomalies**

```typescript
// components/AuthenticationAnalytics.tsx
interface AuthMetrics {
  total_logins: number;
  successful_logins: number;
  failed_logins: number;
  unique_users: number;
  mfa_adoption_rate: number;
  suspicious_attempts: number;
  blocked_ips: number;
}

export function AuthenticationAnalytics({ metrics }: { metrics: AuthMetrics }) {
  const successRate = (metrics.successful_logins / metrics.total_logins) * 100;

  return (
    <div className="auth-analytics">
      <h3>Authentication Analytics (Last 24 Hours)</h3>
      
      <div className="metrics-row">
        <Metric label="Total Logins" value={metrics.total_logins} />
        <Metric label="Success Rate" value={`${successRate.toFixed(1)}%`} />
        <Metric label="Failed Attempts" value={metrics.failed_logins} trend="down" />
        <Metric label="Suspicious Activity" value={metrics.suspicious_attempts} alert={metrics.suspicious_attempts > 0} />
      </div>

      <div className="charts-row">
        <LoginTrendChart />
        <FailureReasonsPieChart />
        <GeographicDistributionMap />
      </div>
    </div>
  );
}
```

---

## 🔔 Alerting System

### Alert Configuration

```typescript
// lib/alerting.ts
interface AlertRule {
  id: string;
  name: string;
  condition: (event: AuditLogEntry) => boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  notification_channels: ('email' | 'slack' | 'pagerduty' | 'sms')[];
  cooldown_minutes: number;
}

const ALERT_RULES: AlertRule[] = [
  {
    id: 'multiple-failed-logins',
    name: 'Multiple Failed Login Attempts',
    condition: (event) => {
      // Check if user has >5 failed logins in 5 minutes
      return checkFailedLoginThreshold(event.actor.user_id, 5, 5);
    },
    severity: 'high',
    notification_channels: ['email', 'slack'],
    cooldown_minutes: 15,
  },
  {
    id: 'privilege-escalation',
    name: 'Privilege Escalation Detected',
    condition: (event) => {
      return event.event_type === 'authorization.role_change' &&
             event.metadata?.new_role === 'admin';
    },
    severity: 'critical',
    notification_channels: ['email', 'slack', 'pagerduty', 'sms'],
    cooldown_minutes: 0,
  },
  {
    id: 'bulk-data-export',
    name: 'Bulk Data Export',
    condition: (event) => {
      return event.action === 'export' &&
             event.metadata?.record_count > 1000;
    },
    severity: 'high',
    notification_channels: ['email', 'slack'],
    cooldown_minutes: 60,
  },
  {
    id: 'suspicious-ip',
    name: 'Access from Suspicious IP',
    condition: (event) => {
      return checkSuspiciousIP(event.actor.ip_address);
    },
    severity: 'medium',
    notification_channels: ['slack'],
    cooldown_minutes: 30,
  },
];

export async function evaluateAlertRules(event: AuditLogEntry) {
  for (const rule of ALERT_RULES) {
    if (rule.condition(event)) {
      await triggerAlert(rule, event);
    }
  }
}

async function triggerAlert(rule: AlertRule, event: AuditLogEntry) {
  // Check cooldown
  if (await isInCooldown(rule.id)) {
    return;
  }

  // Send notifications
  for (const channel of rule.notification_channels) {
    await sendNotification(channel, {
      rule,
      event,
      severity: rule.severity,
    });
  }

  // Set cooldown
  await setCooldown(rule.id, rule.cooldown_minutes);
}
```

### Notification Channels

```typescript
// lib/notifications.ts
async function sendNotification(
  channel: string,
  alert: { rule: AlertRule; event: AuditLogEntry; severity: string }
) {
  switch (channel) {
    case 'email':
      await sendEmailAlert(alert);
      break;
    case 'slack':
      await sendSlackAlert(alert);
      break;
    case 'pagerduty':
      await sendPagerDutyAlert(alert);
      break;
    case 'sms':
      await sendSMSAlert(alert);
      break;
  }
}

async function sendSlackAlert(alert: any) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Security Alert: ${alert.rule.name}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 ${alert.rule.name}`,
          },
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Severity:* ${alert.severity}` },
            { type: 'mrkdwn', text: `*Time:* ${new Date(alert.event.timestamp).toLocaleString()}` },
            { type: 'mrkdwn', text: `*User:* ${alert.event.actor.email || 'Unknown'}` },
            { type: 'mrkdwn', text: `*IP:* ${alert.event.actor.ip_address}` },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Event:* ${alert.event.event_type}\n*Action:* ${alert.event.action}\n*Result:* ${alert.event.result}`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View Details' },
              url: `https://your-app.com/security/alerts/${alert.event.request_id}`,
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Acknowledge' },
              value: alert.event.request_id,
            },
          ],
        },
      ],
    }),
  });
}
```

---

## 📈 Metrics Collection

### GitHub Security Metrics

```typescript
// lib/github-security-metrics.ts
import { Octokit } from '@octokit/rest';

export async function fetchGitHubSecurityMetrics() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = 'MNNRAPP';
  const repo = 'mnnr-complete2025';

  // Dependabot alerts
  const dependabotAlerts = await octokit.dependabot.listAlertsForRepo({
    owner,
    repo,
    state: 'open',
  });

  // Code scanning alerts
  const codeScanningAlerts = await octokit.codeScanning.listAlertsForRepo({
    owner,
    repo,
    state: 'open',
  });

  // Secret scanning alerts
  const secretScanningAlerts = await octokit.secretScanning.listAlertsForRepo({
    owner,
    repo,
    state: 'open',
  });

  return {
    dependabot: {
      total: dependabotAlerts.data.length,
      by_severity: groupBySeverity(dependabotAlerts.data),
    },
    code_scanning: {
      total: codeScanningAlerts.data.length,
      by_severity: groupBySeverity(codeScanningAlerts.data),
    },
    secret_scanning: {
      total: secretScanningAlerts.data.length,
    },
  };
}

function groupBySeverity(alerts: any[]) {
  return alerts.reduce((acc, alert) => {
    const severity = alert.security_advisory?.severity || alert.rule?.security_severity_level || 'unknown';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});
}
```

### Dependency Metrics

```typescript
// lib/dependency-metrics.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function fetchDependencyMetrics() {
  // NPM audit
  const npmAudit = await execAsync('npm audit --json');
  const npmData = JSON.parse(npmAudit.stdout);

  // NPM outdated
  const npmOutdated = await execAsync('npm outdated --json');
  const outdatedData = JSON.parse(npmOutdated.stdout);

  return {
    vulnerabilities: {
      critical: npmData.metadata.vulnerabilities.critical || 0,
      high: npmData.metadata.vulnerabilities.high || 0,
      medium: npmData.metadata.vulnerabilities.moderate || 0,
      low: npmData.metadata.vulnerabilities.low || 0,
    },
    outdated: Object.keys(outdatedData).length,
    total: npmData.metadata.dependencies || 0,
  };
}
```

---

## 🎨 Dashboard UI Example

### Main Dashboard Page

```typescript
// app/security/dashboard/page.tsx
import { SecurityScoreCard } from '@/components/SecurityScoreCard';
import { VulnerabilityTimeline } from '@/components/VulnerabilityTimeline';
import { SecurityAlertsFeed } from '@/components/SecurityAlertsFeed';
import { DependencyHealthMatrix } from '@/components/DependencyHealthMatrix';
import { AuthenticationAnalytics } from '@/components/AuthenticationAnalytics';

export default async function SecurityDashboard() {
  const [
    securityMetrics,
    vulnerabilityEvents,
    dependencies,
    authMetrics,
  ] = await Promise.all([
    fetchSecurityMetrics(),
    fetchVulnerabilityEvents(),
    fetchDependencies(),
    fetchAuthMetrics(),
  ]);

  return (
    <div className="security-dashboard">
      <header>
        <h1>Security Monitoring Dashboard</h1>
        <div className="last-updated">
          Last updated: {new Date().toLocaleString()}
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="score-section">
          <SecurityScoreCard metrics={securityMetrics} />
        </section>

        <section className="alerts-section">
          <SecurityAlertsFeed />
        </section>

        <section className="timeline-section">
          <VulnerabilityTimeline events={vulnerabilityEvents} />
        </section>

        <section className="dependencies-section">
          <DependencyHealthMatrix dependencies={dependencies} />
        </section>

        <section className="auth-section">
          <AuthenticationAnalytics metrics={authMetrics} />
        </section>
      </div>
    </div>
  );
}
```

---

## 🔄 Auto-refresh & Real-time Updates

```typescript
// hooks/useRealtimeSecurityMetrics.ts
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useRealtimeSecurityMetrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetchMetrics().then(setMetrics);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMetrics().then(setMetrics);
    }, 30000);

    // Real-time updates via Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_KEY!
    );

    const subscription = supabase
      .channel('security-metrics')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'audit_logs',
      }, () => {
        fetchMetrics().then(setMetrics);
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  return metrics;
}
```

---

## ✅ Implementation Checklist

- [ ] Set up metrics collection (GitHub API, npm audit, etc.)
- [ ] Create database tables for audit logs
- [ ] Implement audit logging in API routes
- [ ] Build dashboard UI components
- [ ] Configure real-time updates
- [ ] Set up alert rules
- [ ] Configure notification channels (Slack, email, etc.)
- [ ] Create monitoring queries and reports
- [ ] Test alert triggers
- [ ] Document dashboard usage
- [ ] Train team on dashboard
- [ ] Schedule regular reviews

---

## 🎯 Next Steps

1. **Deploy dashboard** to production environment
2. **Configure alerts** for critical security events
3. **Train team** on dashboard usage and alert response
4. **Monitor metrics** daily for the first week
5. **Adjust thresholds** based on baseline activity
6. **Schedule reviews** weekly with security team

---

**For implementation questions, contact the security team.**

**Last Updated**: December 27, 2025  
**Maintained by**: MNNR Security Team
