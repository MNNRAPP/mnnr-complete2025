/**
 * Agent Economic Identity API — Clerk + Prisma (post-Supabase migration 2026-06-19).
 *
 * TODO(clerk-migrate): The `agents` table is not yet modelled in Prisma —
 * the Neon schema only carries User / UsageEvent / ApiKey / AuditEvent /
 * PaymentChallenge / UsedTxHash / NewsletterSubscriber. Until the agent
 * model is added in a follow-up migration, this route enforces Clerk auth
 * and returns the demo payload the legacy Supabase version returned (which
 * also never touched a real `agents` table — see the
 * "Demo data (tables pending migration)" string in git history).
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
    agents: [
      {
        id: 'agent_demo_research',
        name: 'Research Agent',
        type: 'ai_agent',
        balance_usd: 125.43,
        spent_today: 14.2,
        spent_this_month: 187.55,
        autonomy_level: 'semi_autonomous',
        reputation_score: 87,
        status: 'active',
      },
    ],
    total: 1,
    total_balance_usd: 125.43,
    message: 'Agent Economic Identity API - Demo data (agents table pending migration).',
  });
}

export async function POST() {
  const { userId: clerkId } = auth();
  if (!clerkId) return unauthorized();
  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  return NextResponse.json(
    { error: 'Agent creation is pending Prisma migration', code: 'NOT_IMPLEMENTED' },
    { status: 501 },
  );
}
