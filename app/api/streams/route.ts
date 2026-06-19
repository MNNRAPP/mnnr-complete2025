/**
 * Payment Streams API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * TODO(clerk-migrate): The `payment_streams` table is not yet modelled in
 * Prisma. Clerk auth is enforced; stream storage is pending a follow-up
 * migration.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser, unauthorized } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId: clerkId } = auth();
  if (!clerkId) return unauthorized();
  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  return NextResponse.json({
    streams: [
      {
        id: 'stream_demo_1',
        from: 'Account Balance',
        to: 'Research Agent',
        rate: '$0.01 per second',
        status: 'active',
        total_streamed: 45.2,
        started_at: new Date(Date.now() - 4520000).toISOString(),
      },
    ],
    total: 1,
    active_count: 1,
    total_streaming: 45.2,
    message: 'Streaming Payments API - Demo data (streams table pending migration).',
  });
}

export async function POST() {
  const { userId: clerkId } = auth();
  if (!clerkId) return unauthorized();
  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  return NextResponse.json(
    { error: 'Stream creation is pending Prisma migration', code: 'NOT_IMPLEMENTED' },
    { status: 501 },
  );
}
