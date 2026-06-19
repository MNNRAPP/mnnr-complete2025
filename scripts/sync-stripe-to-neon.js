#!/usr/bin/env node

/**
 * Sync Stripe Products to Neon (Prisma) — stub.
 *
 * Created 2026-06-19 during the Supabase -> Clerk + Prisma migration.
 *
 * The legacy `sync-stripe-to-supabase.js` script wrote Stripe products /
 * prices into Supabase `products` and `prices` tables. The current Prisma
 * schema does NOT yet model those tables — runtime code reads Stripe at
 * request time (see app/api/subscriptions/route.ts + app/pricing/page.tsx).
 *
 * Restore this script once Product / Price Prisma models land. Until then,
 * running it is a no-op so CI / cron jobs that reference the path don't
 * blow up.
 *
 * Run: node scripts/sync-stripe-to-neon.js
 */

(async () => {
  console.log(
    '[sync-stripe-to-neon] Skipping sync: Prisma Product/Price models not yet defined.',
  );
  console.log(
    '[sync-stripe-to-neon] Runtime code reads Stripe directly. See app/api/subscriptions/route.ts and app/pricing/page.tsx.',
  );
  process.exit(0);
})();
