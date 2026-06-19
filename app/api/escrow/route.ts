/**
 * Programmable Escrow API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * TODO(clerk-migrate): The `escrows` table is not yet modelled in Prisma.
 * The legacy Supabase handler returned demo data; we preserve that shape and
 * enforce Clerk auth at the door. A follow-up migration must add the model
 * before this route can persist state.
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
    escrows: [
      {
        id: 'escrow_demo_1',
        amount: 500.0,
        currency: 'usd',
        from: 'Account Balance',
        to: 'Contractor Agent',
        condition: 'outcome_verified',
        status: 'pending',
      },
    ],
    total: 1,
    message: 'Escrow API - Demo data (escrows table pending migration).',
  });
}

export async function POST() {
  const { userId: clerkId } = auth();
  if (!clerkId) return unauthorized();
  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  return NextResponse.json(
    { error: 'Escrow creation is pending Prisma migration', code: 'NOT_IMPLEMENTED' },
    { status: 501 },
  );
}
