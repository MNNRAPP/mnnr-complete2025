/**
 * Agent Marketplace API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * TODO(clerk-migrate): The `marketplace_listings` table is not yet modelled
 * in Prisma. Clerk auth is enforced; listing storage will be re-wired in a
 * follow-up migration that adds the model.
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
    listings: [
      {
        id: 'listing_demo_1',
        title: 'GPT-4 Research Agent',
        category: 'research',
        pricing_model: 'per_request',
        base_price_usd: 0.05,
        rating: 4.7,
      },
    ],
    total: 1,
    message: 'Marketplace API - Demo data (listings table pending migration).',
  });
}

export async function POST() {
  const { userId: clerkId } = auth();
  if (!clerkId) return unauthorized();
  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  return NextResponse.json(
    { error: 'Listing creation is pending Prisma migration', code: 'NOT_IMPLEMENTED' },
    { status: 501 },
  );
}
