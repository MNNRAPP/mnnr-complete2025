# Migration Guide: Supabase to Neon + NextAuth

## Why Migrate?

**Current Problem:**
- Supabase bill outstanding = Auth doesn't work
- Supabase combines Auth + Database = vendor lock-in
- Can't use one without the other

**Solution:**
- **Neon** = PostgreSQL database (FREE tier: 3GB, 191 compute hours/month)
- **NextAuth.js** = Authentication (FREE, self-hosted)
- **Result** = Working auth with $0/month cost

---

## Part 1: Setup Neon Database (10 minutes)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up" → Use GitHub OAuth
3. No credit card required

### Step 2: Create Project
1. Click "Create Project"
2. Name: `mnnr-production`
3. Region: `US East (N. Virginia)` (closest to Vercel)
4. Postgres version: `16`
5. Click "Create Project"

### Step 3: Get Connection String
After creation, you'll see:
```
postgres://[user]:[password]@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Step 4: Add to Vercel
1. Go to Vercel → Project Settings → Environment Variables
2. Add: `DATABASE_URL` = your connection string
3. Redeploy

---

## Part 2: Install NextAuth (20 minutes)

### Step 1: Install Dependencies
```bash
npm install next-auth @auth/drizzle-adapter drizzle-orm postgres
```

### Step 2: Create Auth Configuration
Create `lib/auth.ts`:
```typescript
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
});
```

### Step 3: Create Database Connection
Create `lib/db.ts`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```

### Step 4: Create Auth API Route
Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

### Step 5: Create Database Schema
Run in Neon SQL Editor:
```sql
-- NextAuth required tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  email TEXT UNIQUE,
  "emailVerified" TIMESTAMP,
  image TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY(identifier, token)
);

-- MNNR specific tables
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usage_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  api_key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  tokens INTEGER NOT NULL,
  user_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_events_api_key ON usage_events(api_key_id);
CREATE INDEX idx_usage_events_created ON usage_events(created_at);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
```

### Step 6: Setup GitHub OAuth

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `MNNR`
   - Homepage URL: `https://mnnr.app`
   - Authorization callback URL: `https://mnnr.app/api/auth/callback/github`
4. Click "Register application"
5. Copy Client ID and generate Client Secret

### Step 7: Add Environment Variables
Add to Vercel:
```
NEXTAUTH_URL=https://mnnr.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
GITHUB_ID=<your client id>
GITHUB_SECRET=<your client secret>
```

---

## Part 3: Update Auth Components (15 minutes)

### Update Sign In Page
Replace Supabase auth with NextAuth:

```typescript
// app/signin/page.tsx
import { signIn } from '@/lib/auth';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <h2 className="text-3xl font-bold text-center">Sign in to MNNR</h2>
        
        <form action={async () => {
          'use server';
          await signIn('github', { redirectTo: '/dashboard' });
        }}>
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800"
          >
            <GitHubIcon />
            Continue with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
```

### Update Dashboard
```typescript
// app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/signin');
  }
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.name || session.user.email}</p>
    </div>
  );
}
```

### Add Sign Out Button
```typescript
import { signOut } from '@/lib/auth';

export function SignOutButton() {
  return (
    <form action={async () => {
      'use server';
      await signOut({ redirectTo: '/' });
    }}>
      <button type="submit">Sign Out</button>
    </form>
  );
}
```

---

## Part 4: Remove Supabase (10 minutes)

### Step 1: Remove Dependencies
```bash
npm uninstall @supabase/supabase-js @supabase/ssr
```

### Step 2: Remove Supabase Utils
Delete:
- `utils/supabase/client.ts`
- `utils/supabase/server.ts`
- `utils/supabase/admin.ts`
- `utils/supabase/middleware.ts`
- `utils/supabase/queries.ts`

### Step 3: Update Middleware
Replace Supabase middleware with NextAuth:
```typescript
// middleware.ts
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/dashboard/:path*', '/api/keys/:path*'],
};
```

### Step 4: Remove Environment Variables
Remove from Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Part 5: Update API Routes (15 minutes)

### Example: Update Keys API
```typescript
// app/api/keys/route.ts
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.userId, session.user.id),
    orderBy: [desc(apiKeys.createdAt)],
  });
  
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { name } = await request.json();
  
  const { key, prefix, hash } = generateApiKey();
  
  const newKey = await db.insert(apiKeys).values({
    userId: session.user.id,
    name,
    keyPrefix: prefix,
    keyHash: hash,
  }).returning();
  
  return NextResponse.json({ 
    apiKey: { ...newKey[0], key } 
  }, { status: 201 });
}
```

---

## Part 6: Test Migration

### Checklist
- [ ] Neon database created
- [ ] Schema applied
- [ ] GitHub OAuth configured
- [ ] NextAuth installed and configured
- [ ] Environment variables set in Vercel
- [ ] Supabase code removed
- [ ] Sign in works
- [ ] Dashboard loads
- [ ] API keys can be created

### Test Locally
```bash
npm run dev
# Open http://localhost:3000/signin
# Click "Continue with GitHub"
# Verify redirect to dashboard
```

### Deploy
```bash
git add .
git commit -m "feat: migrate from Supabase to Neon + NextAuth"
git push
```

---

## Cost Comparison

| Service | Supabase | Neon + NextAuth |
|---------|----------|-----------------|
| Database | $25/month | $0 (free tier) |
| Auth | Included | $0 (NextAuth) |
| Monthly Total | $25+ | $0 |

---

## Troubleshooting

### "NEXTAUTH_SECRET is missing"
Generate one:
```bash
openssl rand -base64 32
```

### "OAuth callback error"
Verify GitHub OAuth callback URL matches exactly:
`https://mnnr.app/api/auth/callback/github`

### "Database connection error"
Check `DATABASE_URL` format:
```
postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Session not persisting
Add to `next.config.js`:
```javascript
module.exports = {
  experimental: {
    serverActions: true,
  },
};
```

---

## Summary

**Before:**
- Supabase (Auth + DB) = $25+/month
- Outstanding bill = broken auth

**After:**
- Neon (Database) = $0/month
- NextAuth (Auth) = $0/month
- Working auth = priceless

Total migration time: ~1 hour
