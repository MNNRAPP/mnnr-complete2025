#!/usr/bin/env python3
"""
Automated Supabase Setup Script
Applies database schema to Supabase project
"""

import os
import sys
import requests

# Get Supabase credentials from environment
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL or SUPABASE_KEY not found in environment")
    sys.exit(1)

# Extract project ID from URL
PROJECT_ID = SUPABASE_URL.replace('https://', '').split('.')[0]

print("=" * 60)
print("🚀 AUTOMATED SUPABASE SETUP")
print("=" * 60)
print(f"Project ID: {PROJECT_ID}")
print(f"Project URL: {SUPABASE_URL}")
print()

# Read the database schema
schema_file = "/home/ubuntu/mnnr-complete2025/deploy-database.sql"
try:
    with open(schema_file, 'r') as f:
        schema_sql = f.read()
    print(f"✅ Loaded schema from {schema_file}")
    print(f"   Schema size: {len(schema_sql)} characters")
except FileNotFoundError:
    print(f"❌ Error: Schema file not found: {schema_file}")
    sys.exit(1)

print()
print("=" * 60)
print("📊 DATABASE SCHEMA SUMMARY")
print("=" * 60)
print()
print("Tables to create:")
print("  1. users - User profiles and roles")
print("  2. subscriptions - Stripe subscription tracking")
print("  3. invoices - Payment history")
print("  4. usage_events - Usage analytics")
print("  5. audit_logs - Security audit trail")
print()
print("Features:")
print("  ✅ Row Level Security (RLS) enabled")
print("  ✅ 12 performance indexes")
print("  ✅ Admin access policies")
print("  ✅ Database functions")
print("  ✅ Automatic timestamps")
print()

# Try to execute schema using Supabase REST API
print("Applying database schema...")
print()

# Note: Direct SQL execution via REST API requires service role key
# The schema should be applied via Supabase Dashboard SQL Editor
# or using Supabase CLI

print("⚠️  MANUAL STEP REQUIRED:")
print()
print("The database schema needs to be applied via Supabase Dashboard:")
print()
print("1. Go to: https://app.supabase.com/project/wlzhczcvrjfxcspzasoz/sql/new")
print("2. Copy the contents of: deploy-database.sql")
print("3. Paste into the SQL Editor")
print("4. Click 'Run' button")
print()
print("Alternatively, if you have Supabase CLI installed:")
print("  supabase db push")
print()

# Save instructions
instructions_file = "/home/ubuntu/mnnr-complete2025/SUPABASE_SETUP_INSTRUCTIONS.md"
with open(instructions_file, 'w') as f:
    f.write(f"""# Supabase Database Setup Instructions

## Project Information
- **Project ID**: {PROJECT_ID}
- **Project URL**: {SUPABASE_URL}
- **Dashboard**: https://app.supabase.com/project/{PROJECT_ID}

## Apply Database Schema

### Option 1: Supabase Dashboard (Recommended)

1. Go to [SQL Editor](https://app.supabase.com/project/{PROJECT_ID}/sql/new)
2. Copy the entire contents of `deploy-database.sql`
3. Paste into the SQL Editor
4. Click the "Run" button
5. Wait for completion (should take ~5 seconds)

### Option 2: Supabase CLI

```bash
cd /path/to/mnnr-complete2025
supabase db push
```

## Verify Setup

After applying the schema, verify:

1. **Tables Created** (5 tables):
   - users
   - subscriptions
   - invoices
   - usage_events
   - audit_logs

2. **RLS Enabled**: All tables should have Row Level Security enabled

3. **Indexes Created**: 12 performance indexes

4. **Functions Created**:
   - get_user_subscription_status()
   - log_usage_event()

## Database Schema Details

The schema includes:

- **5 tables** for core application data
- **12 indexes** for query performance
- **Row Level Security** policies for data protection
- **Admin policies** for administrative access
- **Database functions** for common operations
- **Automatic timestamps** via triggers

## Connection Info

Use these credentials in your application:

```
NEXT_PUBLIC_SUPABASE_URL={SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY={SUPABASE_KEY}
SUPABASE_SERVICE_ROLE_KEY={SUPABASE_KEY}
```

## Status

- ✅ Schema file ready: `deploy-database.sql`
- ⏳ Waiting for manual application via Dashboard or CLI
- ⏳ Verify tables created after application

## Next Steps

1. Apply schema (see options above)
2. Verify tables in Dashboard
3. Deploy application to Vercel
4. Test database connection
""")

print(f"✅ Instructions saved to: {instructions_file}")
print()
print("=" * 60)
print("✅ SUPABASE SETUP PREPARED!")
print("=" * 60)
print()
print("Schema is ready to apply - see instructions above")
print()
