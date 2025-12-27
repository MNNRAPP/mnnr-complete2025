# Supabase Database Setup Instructions

## Project Information
- **Project ID**: wlzhczcvrjfxcspzasoz
- **Project URL**: https://wlzhczcvrjfxcspzasoz.supabase.co
- **Dashboard**: https://app.supabase.com/project/wlzhczcvrjfxcspzasoz

## Apply Database Schema

### Option 1: Supabase Dashboard (Recommended)

1. Go to [SQL Editor](https://app.supabase.com/project/wlzhczcvrjfxcspzasoz/sql/new)
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
NEXT_PUBLIC_SUPABASE_URL=https://wlzhczcvrjfxcspzasoz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xXbFuzZXbBB4YHTDbZ7l4A_wiffwk5I
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_xXbFuzZXbBB4YHTDbZ7l4A_wiffwk5I
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
