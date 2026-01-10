# Neon.tech Database Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up" (use GitHub OAuth for fastest setup)
3. No credit card required for free tier

### Step 2: Create Database
1. Click "Create Project"
2. Name: `mnnr-production`
3. Region: Choose closest to your users (US East recommended)
4. Postgres version: 16 (latest)
5. Click "Create Project"

### Step 3: Get Connection String
After project creation, you'll see:
```
postgres://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Add to Environment Variables
Create `.env.local` in project root:
```bash
DATABASE_URL="postgres://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

### Step 5: Run Database Schema
```bash
cd /path/to/mnnr-complete2025
npm install
npm run db:push
```

---

## Free Tier Limits

| Resource | Limit |
|----------|-------|
| Storage | 3 GB |
| Compute | 191.9 hours/month |
| Branches | 10 |
| Projects | 1 |

**Perfect for MVP!** Upgrade when you hit limits.

---

## Connection Details

### For Drizzle ORM (already configured):
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);
```

### For Direct SQL:
```typescript
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!);
const result = await sql`SELECT * FROM users`;
```

---

## Migration Path

When ready to move to Supabase:
1. Export data: `pg_dump neondb > backup.sql`
2. Import to Supabase: `psql supabase_url < backup.sql`
3. Update `DATABASE_URL` in environment variables
4. No code changes needed (same Postgres)

---

## Troubleshooting

### Connection Error
- Check SSL mode: `?sslmode=require` at end of URL
- Verify IP allowlist (Neon allows all by default)

### Schema Not Created
```bash
npm run db:push --force
```

### Need to Reset Database
1. Go to Neon dashboard
2. Settings → Delete Project
3. Create new project
4. Run schema again

---

## Next Steps

After database is set up:
1. Test connection: `npm run db:push`
2. Seed test data: `npm run db:seed` (if available)
3. Start dev server: `npm run dev`
4. Verify dashboard loads

---

## Cost Estimate

- **Month 1-6:** $0 (free tier)
- **Month 7+:** $19/month (if you exceed free tier)
- **Migration to Supabase:** Seamless (same Postgres)

**Recommendation:** Start free, upgrade when you have paying customers.
