# Audit Logging & Monitoring Guide

**Repository**: MNNRAPP/mnnr-complete2025  
**Last Updated**: December 27, 2025  
**Purpose**: Implement comprehensive audit logging for security monitoring

---

## 🎯 Overview

Audit logging tracks security-relevant events in your application, enabling:

- **Incident Response**: Investigate security breaches
- **Compliance**: Meet regulatory requirements (SOC 2, GDPR, HIPAA)
- **Forensics**: Reconstruct event timelines
- **Monitoring**: Detect suspicious activity
- **Accountability**: Track user actions

---

## 📋 What to Log

### Critical Events (MUST Log)

#### Authentication & Authorization
- ✅ Login attempts (success/failure)
- ✅ Logout events
- ✅ Password changes/resets
- ✅ Account creation/deletion
- ✅ Permission changes
- ✅ Role assignments
- ✅ API key generation/revocation
- ✅ 2FA enable/disable
- ✅ Session creation/termination

#### Data Access
- ✅ Sensitive data access (PII, financial)
- ✅ Database queries on sensitive tables
- ✅ File downloads/exports
- ✅ Bulk data operations
- ✅ Data deletion/modification

#### Administrative Actions
- ✅ Configuration changes
- ✅ User management
- ✅ System settings modifications
- ✅ Deployment events
- ✅ Backup/restore operations

#### Security Events
- ✅ Failed authentication attempts
- ✅ Rate limit violations
- ✅ Suspicious activity detection
- ✅ Firewall rule changes
- ✅ Certificate updates
- ✅ Encryption key rotation

### Important Events (SHOULD Log)

- ⚠️ API requests (rate-limited)
- ⚠️ Payment transactions
- ⚠️ Email sends
- ⚠️ Webhook deliveries
- ⚠️ Background job execution
- ⚠️ Error occurrences

### Optional Events (MAY Log)

- 📊 Page views (analytics)
- 📊 Feature usage
- 📊 Performance metrics
- 📊 Debug information (dev only)

---

## 🔐 Log Format

### Standard Log Entry

```json
{
  "timestamp": "2025-12-27T03:45:12.123Z",
  "event_type": "authentication.login.success",
  "severity": "info",
  "actor": {
    "user_id": "user_123",
    "email": "user@example.com",
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0..."
  },
  "resource": {
    "type": "user_account",
    "id": "account_456"
  },
  "action": "login",
  "result": "success",
  "metadata": {
    "session_id": "sess_789",
    "mfa_used": true,
    "login_method": "password"
  },
  "request_id": "req_abc123",
  "trace_id": "trace_def456"
}
```

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `timestamp` | ISO 8601 timestamp | `2025-12-27T03:45:12.123Z` |
| `event_type` | Dot-notation event identifier | `auth.login.success` |
| `severity` | Log level | `info`, `warning`, `error`, `critical` |
| `actor.user_id` | User performing action | `user_123` |
| `actor.ip_address` | Source IP address | `192.168.1.100` |
| `resource.type` | Resource being acted upon | `user_account` |
| `resource.id` | Resource identifier | `account_456` |
| `action` | Action performed | `login`, `delete`, `update` |
| `result` | Outcome | `success`, `failure`, `error` |
| `request_id` | Unique request identifier | `req_abc123` |

---

## 🛠️ Implementation

### Next.js API Route Example

```typescript
// lib/audit-log.ts
import { headers } from 'next/headers';

export interface AuditLogEntry {
  timestamp: string;
  event_type: string;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  actor: {
    user_id?: string;
    email?: string;
    ip_address?: string;
    user_agent?: string;
  };
  resource: {
    type: string;
    id: string;
  };
  action: string;
  result: 'success' | 'failure' | 'error';
  metadata?: Record<string, any>;
  request_id: string;
  trace_id?: string;
}

export async function logAuditEvent(entry: Partial<AuditLogEntry>) {
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');
  const userAgent = headersList.get('user-agent');
  
  const fullEntry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    severity: 'info',
    result: 'success',
    request_id: crypto.randomUUID(),
    actor: {
      ip_address: ip || 'unknown',
      user_agent: userAgent || 'unknown',
      ...entry.actor,
    },
    ...entry,
  } as AuditLogEntry;

  // Log to console (development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[AUDIT]', JSON.stringify(fullEntry, null, 2));
  }

  // Send to logging service (production)
  if (process.env.NODE_ENV === 'production') {
    await sendToLoggingService(fullEntry);
  }

  // Store in database (optional)
  await storeInDatabase(fullEntry);
}

async function sendToLoggingService(entry: AuditLogEntry) {
  // Send to Sentry, Datadog, CloudWatch, etc.
  // Example: Sentry
  if (process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureMessage(`Audit: ${entry.event_type}`, {
      level: entry.severity as any,
      extra: entry,
    });
  }
}

async function storeInDatabase(entry: AuditLogEntry) {
  // Store in your database
  // Example: Supabase
  if (process.env.SUPABASE_URL) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY!
    );
    
    await supabase.from('audit_logs').insert(entry);
  }
}
```

### Usage in API Routes

```typescript
// app/api/auth/login/route.ts
import { logAuditEvent } from '@/lib/audit-log';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  try {
    const user = await authenticateUser(email, password);
    
    // Log successful login
    await logAuditEvent({
      event_type: 'authentication.login.success',
      severity: 'info',
      actor: {
        user_id: user.id,
        email: user.email,
      },
      resource: {
        type: 'user_account',
        id: user.id,
      },
      action: 'login',
      result: 'success',
      metadata: {
        login_method: 'password',
        mfa_used: user.mfa_enabled,
      },
    });
    
    return Response.json({ success: true });
  } catch (error) {
    // Log failed login
    await logAuditEvent({
      event_type: 'authentication.login.failure',
      severity: 'warning',
      actor: {
        email,
      },
      resource: {
        type: 'user_account',
        id: 'unknown',
      },
      action: 'login',
      result: 'failure',
      metadata: {
        error: error.message,
      },
    });
    
    return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  }
}
```

### Database Schema

```sql
-- Supabase/PostgreSQL
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  
  -- Actor information
  actor_user_id TEXT,
  actor_email TEXT,
  actor_ip_address TEXT,
  actor_user_agent TEXT,
  
  -- Resource information
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  
  -- Action details
  action TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'error')),
  
  -- Additional data
  metadata JSONB,
  request_id TEXT NOT NULL,
  trace_id TEXT,
  
  -- Indexes for common queries
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- No one can update or delete audit logs (immutable)
-- (No policies = no access)
```

---

## 📊 Monitoring & Alerting

### Critical Alerts

Set up alerts for:

1. **Multiple Failed Logins**
   - Threshold: 5 failures in 5 minutes
   - Action: Lock account, notify security team

2. **Unusual Access Patterns**
   - Example: Access from new country
   - Action: Require 2FA, notify user

3. **Privilege Escalation**
   - Example: Role change to admin
   - Action: Notify security team immediately

4. **Bulk Data Export**
   - Example: >1000 records exported
   - Action: Notify security team, log detailed info

5. **Configuration Changes**
   - Example: Security settings modified
   - Action: Notify admins, require approval

### Monitoring Dashboards

Create dashboards showing:

- **Authentication metrics**: Login success/failure rates
- **User activity**: Active users, session durations
- **Security events**: Failed attempts, suspicious activity
- **System health**: Error rates, performance metrics
- **Compliance**: Audit log coverage, retention status

---

## 🔍 Querying Audit Logs

### Common Queries

```sql
-- Failed login attempts in last hour
SELECT *
FROM audit_logs
WHERE event_type = 'authentication.login.failure'
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;

-- User activity for specific user
SELECT *
FROM audit_logs
WHERE actor_user_id = 'user_123'
  AND timestamp > NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;

-- All admin actions
SELECT *
FROM audit_logs
WHERE resource_type = 'admin_action'
  OR event_type LIKE 'admin.%'
ORDER BY timestamp DESC
LIMIT 100;

-- Suspicious activity (multiple IPs for same user)
SELECT actor_user_id, COUNT(DISTINCT actor_ip_address) as ip_count
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY actor_user_id
HAVING COUNT(DISTINCT actor_ip_address) > 3;

-- Data access patterns
SELECT resource_type, action, COUNT(*) as count
FROM audit_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY resource_type, action
ORDER BY count DESC;
```

---

## 🔒 Security Best Practices

### 1. Log Immutability

- ✅ Never allow updates or deletes
- ✅ Use append-only storage
- ✅ Implement tamper detection
- ✅ Regular backups

### 2. Access Control

- ✅ Restrict log access to admins only
- ✅ Implement role-based access control
- ✅ Log all log access attempts
- ✅ Use separate credentials for log access

### 3. Data Protection

- ✅ Encrypt logs at rest
- ✅ Encrypt logs in transit
- ✅ Redact sensitive data (passwords, tokens)
- ✅ Hash PII when possible

### 4. Retention

- ✅ Define retention policies (e.g., 90 days)
- ✅ Archive old logs securely
- ✅ Comply with regulations (GDPR, HIPAA)
- ✅ Automate cleanup

### 5. Performance

- ✅ Use async logging
- ✅ Batch log writes
- ✅ Index frequently queried fields
- ✅ Partition large tables

---

## 📝 Compliance Requirements

### SOC 2

- ✅ Log all authentication events
- ✅ Log all data access
- ✅ Log all configuration changes
- ✅ Retain logs for 1 year minimum
- ✅ Implement tamper protection

### GDPR

- ✅ Log data subject requests
- ✅ Log consent changes
- ✅ Enable log export for users
- ✅ Implement right to erasure
- ✅ Pseudonymize PII in logs

### HIPAA

- ✅ Log all PHI access
- ✅ Log all security events
- ✅ Retain logs for 6 years
- ✅ Implement audit controls
- ✅ Regular log reviews

---

## 🛠️ Tools & Services

### Logging Services

- **Sentry**: Error tracking + audit logs
- **Datadog**: Full observability platform
- **CloudWatch**: AWS native logging
- **Splunk**: Enterprise log management
- **ELK Stack**: Self-hosted (Elasticsearch, Logstash, Kibana)

### Monitoring Tools

- **Grafana**: Dashboards and alerts
- **Prometheus**: Metrics collection
- **New Relic**: APM + logging
- **PagerDuty**: Incident management

---

## ✅ Implementation Checklist

- [ ] Define audit log schema
- [ ] Create database table/storage
- [ ] Implement logging library
- [ ] Add logging to critical endpoints
- [ ] Set up log retention policy
- [ ] Configure access controls
- [ ] Create monitoring dashboards
- [ ] Set up critical alerts
- [ ] Test log queries
- [ ] Document logging procedures
- [ ] Train team on audit logs
- [ ] Schedule regular log reviews

---

## 🎯 Quick Start

1. **Create audit log table** (see Database Schema)
2. **Implement logging library** (see Implementation)
3. **Add to critical endpoints** (authentication, data access)
4. **Set up monitoring** (dashboard + alerts)
5. **Test and verify** (query logs, trigger alerts)

---

**For questions or implementation help, contact the security team.**

**Last Updated**: December 27, 2025  
**Maintained by**: MNNR Security Team
