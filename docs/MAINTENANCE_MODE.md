# Maintenance Mode Documentation

## EDGE-033: Maintenance Kill-Switch

### Overview
The maintenance mode feature allows instant traffic gating during incidents, deployments, or emergencies.

### Activation

**Via Vercel CLI:**
```bash
vercel env add MAINTENANCE_MODE true --scope production
```

**Via Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add or update `MAINTENANCE_MODE` = `true`
3. Redeploy or wait for next request (edge config)

**Via Emergency Script:**
```bash
# scripts/enable-maintenance.sh
#!/bin/bash
vercel env add MAINTENANCE_MODE true --scope production
echo "✅ Maintenance mode enabled"
```

### Deactivation

```bash
vercel env add MAINTENANCE_MODE false --scope production
```

Or remove the environment variable entirely.

### Behavior

When `MAINTENANCE_MODE=true`:
- **HTTP Status:** 503 Service Unavailable
- **Retry-After Header:** 3600 seconds (1 hour)
- **Response:** Clean HTML maintenance page
- **Scope:** All requests (pages, API, webhooks)

### Testing Locally

```bash
# .env.local
MAINTENANCE_MODE=true

npm run dev
# Navigate to http://localhost:3000
# Should see maintenance page
```

### Response Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Maintenance Mode</title>
  <meta charset="utf-8">
  <style>
    body {
      font-family: system-ui;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .container { text-align: center; padding: 2rem; }
    h1 { color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Service Temporarily Unavailable</h1>
    <p>We're performing scheduled maintenance. Please check back shortly.</p>
  </div>
</body>
</html>
```

### Use Cases

1. **Incident Response**
   - Data breach containment
   - Security vulnerability patching
   - System compromise investigation

2. **Planned Maintenance**
   - Database migrations
   - Major deployments
   - Infrastructure upgrades

3. **Emergency Shutoff**
   - DDoS attack mitigation
   - Resource exhaustion
   - Critical bug fixes

### Integration with Incident Playbook

Maintenance mode is automatically enabled by the incident containment script:

```bash
# scripts/incident-containment.sh
vercel env add MAINTENANCE_MODE true --scope production
```

See: [Incident Response Documentation](./INCIDENT_RESPONSE.md)

### Monitoring

Maintenance mode activation should trigger alerts:
- **P1 Alert:** Maintenance mode enabled
- **Notification:** Slack, PagerDuty, Email
- **Dashboard:** Status page updated

### SLA Impact

When maintenance mode is active:
- Uptime SLA is paused
- Status page shows "Maintenance"
- Customer communications sent automatically

---

**Last Updated:** 2025-10-06
**Owner:** Infrastructure Team
