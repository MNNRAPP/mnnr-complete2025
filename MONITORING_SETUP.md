# Security Monitoring & Alerting Setup Guide

## Overview

This guide provides step-by-step instructions for setting up enterprise-grade security monitoring and alerting using **FREE** and open-source tools. All recommendations are based on tools with generous free tiers suitable for startups and small-to-medium sized applications.

---

## Table of Contents

1. [Error Tracking & Monitoring (Sentry)](#1-error-tracking--monitoring-sentry)
2. [Log Management (Better Stack)](#2-log-management-better-stack)
3. [Uptime Monitoring (UptimeRobot)](#3-uptime-monitoring-uptimerobot)
4. [Security Event Monitoring](#4-security-event-monitoring)
5. [Dependency Vulnerability Scanning](#5-dependency-vulnerability-scanning)
6. [Certificate Monitoring](#6-certificate-monitoring)
7. [Alert Configuration](#7-alert-configuration)
8. [Dashboard Setup](#8-dashboard-setup)
9. [Incident Response](#9-incident-response)

---

## 1. Error Tracking & Monitoring (Sentry)

### Why Sentry?
- **Free Tier:** 10,000 errors/month
- Real-time error tracking
- Performance monitoring
- Release tracking
- Source map support
- Integrations: Slack, PagerDuty, GitHub

### Setup Instructions

#### Step 1: Create Sentry Account
1. Visit [sentry.io](https://sentry.io/signup/)
2. Sign up for free account
3. Create new project (Next.js)
4. Copy your DSN

#### Step 2: Install Sentry SDK

```bash
npm install --save @sentry/nextjs
```

#### Step 3: Initialize Sentry

```bash
npx @sentry/wizard@latest -i nextjs
```

This will create:
- `sentry.client.config.js`
- `sentry.server.config.js`
- `sentry.edge.config.js`

#### Step 4: Configure Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

#### Step 5: Update Logger Integration

Update `utils/logger.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

export const logger = {
  error(message: string, error?: Error, metadata?: LogMetadata) {
    const sanitized = metadata ? sanitizeData(metadata) : {};
    
    if (process.env.NODE_ENV === 'production') {
      // Send to Sentry
      if (error) {
        Sentry.captureException(error, {
          tags: { message },
          extra: sanitized
        });
      } else {
        Sentry.captureMessage(message, {
          level: 'error',
          extra: sanitized
        });
      }
      
      console.error(formatForProduction('error', message, sanitized));
    } else {
      console.error(`[ERROR] ${message}`, error || '', sanitized);
    }
  }
};
```

#### Step 6: Configure Alerts

In Sentry Dashboard:
1. Go to **Alerts** → **Create Alert Rule**
2. Create rules for:
   - Error rate > 10/minute
   - New error introduced
   - Regression (reappearing error)
   - Critical errors (database failures, auth errors)

**Alert Channels:**
- Email: Immediate for critical
- Slack: #alerts channel
- PagerDuty: For on-call rotation (optional)

#### Step 7: Set Up Performance Monitoring

In `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  // ... existing config
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

**Cost:** FREE (up to 10k errors/month)  
**Setup Time:** 30-60 minutes  
**Priority:** P0 - CRITICAL

---

## 2. Log Management (Better Stack)

### Why Better Stack (Logtail)?
- **Free Tier:** 1GB logs/month (~ 2-5M log lines)
- Real-time log aggregation
- Structured logging support
- Powerful query language
- Live tailing
- Alerts and notifications

### Setup Instructions

#### Step 1: Create Better Stack Account
1. Visit [betterstack.com/logtail](https://betterstack.com/logtail)
2. Sign up for free account
3. Create new source (HTTP)
4. Copy source token

#### Step 2: Configure Logger

Update `utils/logger.ts`:

```typescript
import https from 'https';

const LOGTAIL_TOKEN = process.env.LOGTAIL_SOURCE_TOKEN;

function sendToLogtail(level: LogLevel, message: string, metadata?: LogMetadata) {
  if (!LOGTAIL_TOKEN || process.env.NODE_ENV !== 'production') {
    return;
  }

  const logData = JSON.stringify({
    dt: new Date().toISOString(),
    level,
    message,
    ...sanitizeData(metadata || {}),
    service: 'mnnr-app',
    environment: process.env.VERCEL_ENV || 'development'
  });

  const options = {
    hostname: 'in.logtail.com',
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOGTAIL_TOKEN}`,
      'Content-Length': Buffer.byteLength(logData)
    }
  };

  const req = https.request(options, (res) => {
    // Consume response to avoid memory leaks
    res.on('data', () => {});
  });

  req.on('error', () => {
    // Silently fail - don't let logging failures crash the app
  });

  req.write(logData);
  req.end();
}

export const logger = {
  info(message: string, metadata?: LogMetadata) {
    sendToLogtail('info', message, metadata);
    // ... existing code
  },
  
  warn(message: string, metadata?: LogMetadata) {
    sendToLogtail('warn', message, metadata);
    // ... existing code
  },
  
  error(message: string, error?: Error, metadata?: LogMetadata) {
    sendToLogtail('error', message, { 
      ...metadata, 
      error: error?.message,
      stack: error?.stack 
    });
    // ... existing code
  }
};
```

#### Step 3: Add Environment Variable

Add to `.env.local`:
```bash
LOGTAIL_SOURCE_TOKEN=your_token_here
```

#### Step 4: Configure Alerts in Logtail

1. Go to **Alerts** → **New Alert**
2. Create alerts for:
   - Failed authentication attempts (>10/5min)
   - Rate limit violations
   - Database errors
   - Webhook signature failures
   - 5xx errors

**Cost:** FREE (1GB/month)  
**Setup Time:** 30 minutes  
**Priority:** P1 - HIGH

---

## 3. Uptime Monitoring (UptimeRobot)

### Why UptimeRobot?
- **Free Tier:** 50 monitors, 5-minute intervals
- HTTP(S), keyword, ping monitoring
- Multiple alert methods
- Status page
- Response time tracking

### Setup Instructions

#### Step 1: Create UptimeRobot Account
1. Visit [uptimerobot.com](https://uptimerobot.com/)
2. Sign up for free account

#### Step 2: Add Monitors

Create monitors for:

**1. Homepage Monitor**
- **Type:** HTTP(S)
- **URL:** `https://yourdomain.com`
- **Interval:** 5 minutes
- **Alert Threshold:** 1 down notification

**2. API Health Check**
- **Type:** HTTP(S)
- **URL:** `https://yourdomain.com/api/health`
- **Interval:** 5 minutes
- **Keyword:** "healthy" (create this endpoint)

**3. Database Connectivity**
- **Type:** HTTP(S)
- **URL:** `https://yourdomain.com/api/health?check=db`
- **Interval:** 5 minutes
- **Keyword:** "database:ok"

**4. Authentication Service**
- **Type:** HTTP(S)
- **URL:** `https://yourdomain.com/api/health?check=auth`
- **Interval:** 5 minutes

#### Step 3: Create Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const check = searchParams.get('check');
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, string>
  };

  try {
    // Database check
    if (!check || check === 'db') {
      const supabase = createClient();
      const { error } = await supabase.from('users').select('count').limit(1).single();
      health.checks.database = error ? 'unhealthy' : 'ok';
    }

    // Authentication check
    if (!check || check === 'auth') {
      health.checks.auth = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'ok' : 'missing';
    }

    // Environment check
    if (!check || check === 'env') {
      health.checks.env = process.env.NODE_ENV || 'unknown';
    }

    return NextResponse.json(health);
  } catch (error) {
    logger.error('Health check failed', error as Error);
    return NextResponse.json(
      { status: 'unhealthy', error: 'Health check failed' },
      { status: 503 }
    );
  }
}
```

#### Step 4: Configure Alerts

In UptimeRobot:
1. Go to **Settings** → **Alert Contacts**
2. Add:
   - Email alerts (immediate)
   - Slack webhook (optional)
   - SMS (paid feature)

**Cost:** FREE (50 monitors)  
**Setup Time:** 20 minutes  
**Priority:** P1 - HIGH

---

## 4. Security Event Monitoring

### Security Events to Monitor

1. **Authentication Events**
   - Failed login attempts
   - Account lockouts
   - Password reset requests
   - New account registrations

2. **Authorization Events**
   - Unauthorized access attempts
   - Privilege escalation attempts
   - Admin action logs

3. **Data Access Events**
   - Large data exports
   - Sensitive data access
   - Mass data deletions

4. **API Security Events**
   - Rate limit violations
   - Unusual traffic patterns
   - Webhook signature failures
   - Invalid API calls

### Implementation

Create `utils/security-monitor.ts`:

```typescript
import { logger } from './logger';

export interface SecurityEvent {
  type: 'auth' | 'authz' | 'data' | 'api';
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  userId?: string;
  ip?: string;
  metadata?: Record<string, any>;
}

export function logSecurityEvent(event: SecurityEvent) {
  const logMessage = `[SECURITY] ${event.severity.toUpperCase()} - ${event.action}`;
  
  const metadata = {
    ...event.metadata,
    userId: event.userId,
    ip: event.ip,
    type: event.type
  };

  if (event.severity === 'critical' || event.severity === 'high') {
    logger.error(logMessage, undefined, metadata);
  } else {
    logger.warn(logMessage, metadata);
  }

  // Store in audit log table (optional)
  if (process.env.ENABLE_AUDIT_LOG === 'true') {
    storeAuditLog(event);
  }
}

async function storeAuditLog(event: SecurityEvent) {
  // TODO: Store in Supabase audit_logs table
}

// Usage examples:
export function logFailedLogin(email: string, ip: string) {
  logSecurityEvent({
    type: 'auth',
    severity: 'medium',
    action: 'failed_login',
    ip,
    metadata: { email }
  });
}

export function logRateLimitViolation(ip: string, endpoint: string) {
  logSecurityEvent({
    type: 'api',
    severity: 'high',
    action: 'rate_limit_violation',
    ip,
    metadata: { endpoint }
  });
}
```

**Cost:** FREE  
**Setup Time:** 2-4 hours  
**Priority:** P2 - MEDIUM

---

## 5. Dependency Vulnerability Scanning

### GitHub Dependabot (FREE)
Already configured in `.github/dependabot.yml` ✅

### Snyk (FREE for Open Source)

#### Step 1: Create Snyk Account
1. Visit [snyk.io](https://snyk.io/)
2. Sign up with GitHub
3. Import your repository

#### Step 2: Add GitHub Action

Already configured in `.github/workflows/security-audit.yml` ✅

#### Step 3: Configure Snyk Alerts

1. Go to **Settings** → **Notifications**
2. Enable:
   - High/Critical vulnerabilities: Slack + Email
   - Weekly summary: Email

**Cost:** FREE for open source  
**Setup Time:** 15 minutes  
**Priority:** P0 - CRITICAL (Already done ✅)

---

## 6. Certificate Monitoring

### SSL Labs Monitoring (FREE)

1. Visit [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)
2. Test your domain
3. Subscribe to quarterly scans (free)

### Certificate Transparency Monitoring (FREE)

#### Using crt.sh
1. Visit [crt.sh](https://crt.sh/)
2. Search for your domain: `%.yourdomain.com`
3. Set up RSS feed: `https://crt.sh/atom?q=%.yourdomain.com`

#### Automated Monitoring Script

Create `scripts/check-certificates.sh`:

```bash
#!/bin/bash

DOMAIN="yourdomain.com"
DAYS_WARNING=30

# Get certificate expiration
EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | \
         openssl x509 -noout -dates | grep notAfter | cut -d= -f2)

# Convert to timestamp
EXPIRY_TIMESTAMP=$(date -d "$EXPIRY" +%s)
NOW=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_TIMESTAMP - $NOW) / 86400 ))

echo "Certificate expires in $DAYS_LEFT days"

if [ $DAYS_LEFT -lt $DAYS_WARNING ]; then
  echo "WARNING: Certificate expires soon!"
  # Send alert (implement notification)
  exit 1
fi
```

Schedule in GitHub Actions (weekly):

```yaml
# .github/workflows/cert-check.yml
name: Certificate Check
on:
  schedule:
    - cron: '0 9 * * 1' # Weekly Monday 9am

jobs:
  check-cert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check certificate
        run: bash scripts/check-certificates.sh
```

**Cost:** FREE  
**Setup Time:** 30 minutes  
**Priority:** P2 - MEDIUM

---

## 7. Alert Configuration

### Alert Severity Levels

| Severity | Response Time | Notification Method | Example |
|----------|--------------|---------------------|---------|
| **Critical** | Immediate | Slack + Email + SMS | Database down, Auth failure |
| **High** | <15 minutes | Slack + Email | Rate limit violations, High error rate |
| **Medium** | <2 hours | Slack | Failed logins, API errors |
| **Low** | Next business day | Email only | Warnings, Info logs |

### Alert Routing

**Critical/High:**
- Slack: #critical-alerts channel
- Email: On-call engineer
- PagerDuty: (optional, $19/user/month)

**Medium/Low:**
- Slack: #monitoring channel
- Email: Team distribution list

### Alert Fatigue Prevention

1. **Rate limiting:** Max 5 alerts per issue per hour
2. **Deduplication:** Group similar alerts
3. **Thresholds:** Only alert on trends (not single events)
4. **Business hours:** Route low-severity alerts during business hours

**Cost:** FREE (Slack is free, email is free)  
**Setup Time:** 1 hour  
**Priority:** P1 - HIGH

---

## 8. Dashboard Setup

### Grafana Cloud (FREE)

**Free Tier:** 50GB logs, 10k metrics, 50GB traces

#### Step 1: Create Grafana Cloud Account
1. Visit [grafana.com](https://grafana.com/auth/sign-up/create-user)
2. Sign up for free account
3. Create stack (region: closest to your users)

#### Step 2: Configure Data Sources

**Add Sentry:**
1. Go to **Connections** → **Add new connection**
2. Search "Sentry"
3. Add Sentry plugin
4. Configure with your DSN

**Add Better Stack:**
1. Use Loki data source
2. Configure with Logtail API

#### Step 3: Create Dashboard

**Security Overview Dashboard:**

Panels to include:
- Error rate (last 24h)
- Failed authentication attempts
- Rate limit violations
- API response times (p50, p95, p99)
- Database query times
- Active users
- Security events timeline

Import pre-built dashboards:
- [Next.js Dashboard](https://grafana.com/grafana/dashboards/)
- [Security Monitoring Dashboard](https://grafana.com/grafana/dashboards/)

**Cost:** FREE (generous limits)  
**Setup Time:** 2-3 hours  
**Priority:** P2 - MEDIUM

---

## 9. Incident Response

### Incident Response Plan

#### 1. Detection (Automated)
- Alert received via Sentry/Logtail
- Uptime monitor detects outage
- User reports issue

#### 2. Triage (0-5 minutes)
- Determine severity
- Check dashboard for scope
- Review recent deployments

#### 3. Investigation (5-30 minutes)
- Check Sentry error details
- Review logs in Logtail
- Verify health checks
- Check database status

#### 4. Mitigation (Immediate)
- Rollback deployment if needed
- Scale resources
- Enable maintenance mode
- Apply hotfix

#### 5. Resolution (Varies)
- Deploy fix
- Verify resolution
- Monitor for 1 hour

#### 6. Post-Mortem (24-48 hours)
- Document incident
- Root cause analysis
- Action items to prevent recurrence

### Incident Communication

**Internal:**
- Slack: #incidents channel
- Status: Update internal status page

**External:**
- Status page (statuspage.io free tier)
- Twitter/X
- Email (critical customers only)

### Runbooks

Create runbooks in `docs/runbooks/`:
- `database-outage.md`
- `authentication-failure.md`
- `high-error-rate.md`
- `ddos-attack.md`

**Cost:** FREE  
**Setup Time:** 4-6 hours initial, ongoing maintenance  
**Priority:** P1 - HIGH

---

## Cost Summary

| Tool | Free Tier | Monthly Cost | Priority |
|------|-----------|--------------|----------|
| Sentry | 10k errors | $0 | P0 |
| Better Stack | 1GB logs | $0 | P1 |
| UptimeRobot | 50 monitors | $0 | P1 |
| Dependabot | Unlimited | $0 | P0 |
| Snyk | Open source | $0 | P0 |
| Grafana Cloud | 50GB logs | $0 | P2 |
| Certificate Monitoring | Unlimited | $0 | P2 |
| **Total** | | **$0** | |

**Optional Paid Upgrades:**
- PagerDuty: $19/user/month (on-call rotation)
- Better Stack Pro: $18/month (more logs)
- Sentry Pro: $29/month (more errors)

**Total for Scale:** $0-50/month depending on traffic

---

## Quick Start Checklist

### Week 1 (Critical)
- [ ] Set up Sentry error tracking
- [ ] Configure Dependabot (already done ✅)
- [ ] Create health check endpoint
- [ ] Set up UptimeRobot monitors
- [ ] Configure Slack alerts

### Week 2-3 (High Priority)
- [ ] Implement Better Stack logging
- [ ] Create security event monitoring
- [ ] Set up Grafana dashboard
- [ ] Configure alert routing
- [ ] Test incident response process

### Month 2 (Medium Priority)
- [ ] Certificate monitoring
- [ ] Quarterly security reviews
- [ ] Incident response runbooks
- [ ] Team training on monitoring tools

---

## Testing Your Setup

### Test Alerts

1. **Test Sentry:**
   ```typescript
   throw new Error('Test error from monitoring setup');
   ```

2. **Test Uptime Monitor:**
   - Temporarily break health endpoint
   - Verify alert received within 5 minutes

3. **Test Log Aggregation:**
   ```typescript
   logger.error('Test error log', new Error('Test'));
   ```
   - Check Logtail dashboard

4. **Test Security Events:**
   - Trigger rate limit
   - Failed login attempt
   - Verify alerts received

### Verify Alert Routing

- [ ] Critical alert → Slack + Email within 1 minute
- [ ] High alert → Slack + Email within 5 minutes  
- [ ] Medium alert → Slack within 15 minutes
- [ ] Low alert → Email next business day

---

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Better Stack Documentation](https://betterstack.com/docs/)
- [Grafana Tutorials](https://grafana.com/tutorials/)
- [Incident Response Best Practices](https://www.pagerduty.com/resources/learn/incident-response-best-practices/)

---

**Last Updated:** 2025-10-04  
**Next Review:** 2025-11-04  
**Owner:** DevOps Team  
**Version:** 1.0
