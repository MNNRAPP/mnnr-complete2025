#!/bin/bash
# IR-070: Incident Containment Script
# Automates emergency response procedures

set -e

echo "═══════════════════════════════════════════════════════════"
echo "🚨 INCIDENT CONTAINMENT SCRIPT"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "This script will:"
echo "  1. Enable maintenance mode (gates all traffic)"
echo "  2. Create database snapshot"
echo "  3. Guide key rotation procedures"
echo "  4. Log incident in audit trail"
echo ""
echo "⚠️  WARNING: This will make the application unavailable!"
echo ""
echo "Type 'CONFIRM' to proceed:"
read -r confirmation

if [ "$confirmation" != "CONFIRM" ]; then
  echo "❌ Aborted. No changes made."
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📋 PRE-FLIGHT CHECKS"
echo "═══════════════════════════════════════════════════════════"

# Check required tools
command -v vercel >/dev/null 2>&1 || { echo "❌ vercel CLI not found. Install: npm i -g vercel"; exit 1; }
command -v pg_dump >/dev/null 2>&1 || echo "⚠️  pg_dump not found. Database snapshot will be skipped."

echo "✅ Required tools available"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🚧 STEP 1: ENABLE MAINTENANCE MODE"
echo "═══════════════════════════════════════════════════════════"

echo "Enabling maintenance mode in Vercel..."
vercel env add MAINTENANCE_MODE true --scope production --yes || {
  echo "❌ Failed to enable maintenance mode"
  exit 1
}

echo "✅ Maintenance mode ENABLED"
echo "   Application is now returning 503 to all requests"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📸 STEP 2: DATABASE SNAPSHOT"
echo "═══════════════════════════════════════════════════════════"

if command -v pg_dump >/dev/null 2>&1; then
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  SNAPSHOT_FILE="incident_snapshot_${TIMESTAMP}.sql"

  if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Enter manually or skip:"
    read -r DATABASE_URL
  fi

  if [ -n "$DATABASE_URL" ]; then
    echo "Creating database snapshot: $SNAPSHOT_FILE"
    pg_dump "$DATABASE_URL" > "$SNAPSHOT_FILE" || {
      echo "❌ Database snapshot failed"
    }
    echo "✅ Database snapshot saved: $SNAPSHOT_FILE"
    echo "   Store this file securely for forensic analysis"
  else
    echo "⚠️  Skipping database snapshot (no DATABASE_URL)"
  fi
else
  echo "⚠️  Skipping database snapshot (pg_dump not available)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔑 STEP 3: KEY ROTATION GUIDE"
echo "═══════════════════════════════════════════════════════════"

echo ""
echo "Next steps for key rotation:"
echo ""
echo "1. Stripe Keys:"
echo "   → Dashboard: https://dashboard.stripe.com/apikeys"
echo "   → Click 'Create secret key'"
echo "   → Update: vercel env add STRIPE_SECRET_KEY --scope production"
echo "   → Docs: docs/STRIPE_KEY_ROTATION.md"
echo ""
echo "2. Stripe Webhook Secret:"
echo "   → Dashboard: https://dashboard.stripe.com/webhooks"
echo "   → Click webhook → 'Roll secret'"
echo "   → Update: vercel env add STRIPE_WEBHOOK_SECRET --scope production"
echo ""
echo "3. Supabase Service Role Key:"
echo "   → Dashboard: https://app.supabase.com/project/_/settings/api"
echo "   → Click 'Generate new service role key'"
echo "   → Update: vercel env add SUPABASE_SERVICE_ROLE_KEY --scope production"
echo "   → Docs: docs/KEY_ROTATION.md"
echo ""
echo "4. Database Password:"
echo "   → Dashboard: https://app.supabase.com/project/_/settings/database"
echo "   → Click 'Reset database password'"
echo "   → Update connection strings"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "📝 STEP 4: INCIDENT LOGGING"
echo "═══════════════════════════════════════════════════════════"

INCIDENT_LOG="incident_log_$(date +%Y%m%d_%H%M%S).txt"
cat > "$INCIDENT_LOG" <<EOF
INCIDENT CONTAINMENT LOG
========================
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Executed By: $(whoami)@$(hostname)

Actions Taken:
--------------
✅ Maintenance mode enabled
✅ Database snapshot created (if available)
⚠️  Key rotation required (manual step)

Next Steps:
-----------
1. Investigate incident cause
2. Rotate all keys (see guide above)
3. Review audit logs: SELECT * FROM public.audit_log WHERE severity='critical'
4. Review Supabase logs for unauthorized access
5. Check Stripe dashboard for suspicious activity
6. Disable maintenance mode when safe: vercel env add MAINTENANCE_MODE false --scope production

Snapshot Files:
---------------
- Database: $SNAPSHOT_FILE (if created)
- Incident Log: $INCIDENT_LOG

Documentation:
--------------
- Incident Response: docs/INCIDENT_RESPONSE.md
- Key Rotation: docs/KEY_ROTATION.md, docs/STRIPE_KEY_ROTATION.md
EOF

echo "✅ Incident log saved: $INCIDENT_LOG"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ CONTAINMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Status:"
echo "  🚧 Application: MAINTENANCE MODE (503 responses)"
echo "  📸 Snapshot: $SNAPSHOT_FILE"
echo "  📝 Log: $INCIDENT_LOG"
echo ""
echo "Next Actions:"
echo "  1. Investigate incident cause"
echo "  2. Follow key rotation guide above"
echo "  3. Review logs and dashboards"
echo "  4. Disable maintenance mode when safe"
echo ""
echo "To disable maintenance mode:"
echo "  vercel env add MAINTENANCE_MODE false --scope production"
echo ""
echo "═══════════════════════════════════════════════════════════"
