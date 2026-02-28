/**
 * Database types - re-exported from lib/db.ts
 * This file exists for backwards compatibility with components
 * that used to import from the Supabase-generated types.
 */

export type {
  User,
  ApiKey,
  UsageEvent,
  Customer,
  Product,
  Price,
  Subscription,
  StripeEvent,
  Session,
} from '@/lib/db';
