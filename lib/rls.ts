// lib/rls.ts — Session-user-id binding helper for Postgres Row-Level Security.
//
// Background
//   The Neon migration replaces Supabase's `auth.uid()` with a session-local
//   setting `app.current_user_id`. Every RLS policy in
//   `prisma/migrations/20260619000000_init_rls/migration.sql` keys off
//   `current_setting('app.current_user_id', true)::uuid`.
//
//   To make those policies work, the application must set that variable
//   on the same Postgres session that runs the user-scoped queries.
//
// Usage
//   const rows = await withUserContext(userId, (tx) =>
//     tx.usageEvent.findMany({ where: { userId } })
//   );
//
//   The callback receives the transactional Prisma client (`tx`). You MUST
//   route every query through `tx` for the session variable to apply — using
//   the outer `db` client inside the callback escapes the transaction and
//   defeats RLS.

import { Prisma } from '@prisma/client';
import { db } from './db';

type TxClient = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Run `fn` inside a transaction with `app.current_user_id` bound to `userId`.
 * Postgres RLS policies that key off `current_setting('app.current_user_id', true)::uuid`
 * will filter rows accordingly.
 *
 * SET LOCAL scopes the variable to the current transaction — it resets when the
 * transaction ends, so connection pooling (PgBouncer / Neon pooler) is safe.
 */
export async function withUserContext<T>(
  userId: string,
  fn: (tx: TxClient) => Promise<T>,
): Promise<T> {
  if (!isUuid(userId)) {
    throw new Error('withUserContext: userId must be a valid UUID');
  }

  return db.$transaction(async (tx) => {
    // Parameterised SET LOCAL is not supported, so we hard-validate the UUID
    // above and then interpolate. A non-UUID would have thrown already.
    await tx.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${userId}'`);
    return fn(tx);
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return typeof value === 'string' && UUID_RE.test(value);
}
