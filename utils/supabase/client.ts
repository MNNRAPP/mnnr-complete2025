/**
 * @module supabase/client
 * @description Creates a typed Supabase client for browser-side (client component) operations.
 *
 * Uses `@supabase/ssr`'s `createBrowserClient` with the project's generated `Database`
 * types for full type safety on queries, inserts, and RPC calls.
 */

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';

/**
 * Creates and returns a Supabase browser client.
 * Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars.
 * @returns A typed `SupabaseClient<Database>` for client-side use.
 */
export const createClient = () =>
  createBrowserClient<Database>(
    // Pass Supabase URL and anonymous key from the environment to the client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
