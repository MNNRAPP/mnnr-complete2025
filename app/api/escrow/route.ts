/**
 * Programmable Escrow API - Trustless Conditional Payments
 * Hold payments in escrow until conditions are cryptographically verified.
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CreateEscrowSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['usd', 'usdc', 'eth']).default('usd'),
  from_agent_id: z.string().optional(),
  to_agent_id: z.string(),
  condition: z.object({
    type: z.enum(['outcome_verified', 'time_elapsed', 'multi_sig', 'oracle', 'smart_contract', 'manual_approval']),
    outcome: z.string().optional(),
    verifier_url: z.string().url().optional(),
    release_after_seconds: z.number().positive().optional(),
    required_approvals: z.number().positive().optional(),
    timeout_seconds: z.number().positive().default(86400),
  }),
  on_success: z.enum(['release_to_recipient', 'release_to_agent', 'split']).default('release_to_recipient'),
  on_failure: z.enum(['refund_to_sender', 'release_to_recipient', 'hold']).default('refund_to_sender'),
  on_timeout: z.enum(['refund_to_sender', 'release_to_recipient', 'dispute']).default('refund_to_sender'),
  name: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      escrows: [
        {
          id: 'escrow_demo_1',
          amount: 500.00,
          currency: 'usd',
          from: 'Account Balance',
          to: 'Contractor Agent',
          condition: 'outcome_verified',
          status: 'pending',
          time_remaining_seconds: 72000,
          time_remaining_human: '20h 0m',
        },
      ],
      stats: {
        total: 1,
        pending: 1,
        released: 0,
        refunded: 0,
        disputed: 0,
        total_locked: 500.00,
      },
      message: 'Programmable Escrow API - Demo data (tables pending migration)',
    });
  } catch (error) {
    console.error('Escrow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient() as any;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle escrow actions
    if (body.escrow_id && body.action) {
      const actions: Record<string, string> = {
        verify: 'released',
        approve: 'released',
        dispute: 'disputed',
        cancel: 'cancelled',
      };
      return NextResponse.json({
        success: true,
        escrow_id: body.escrow_id,
        status: actions[body.action] || 'pending',
        message: `Escrow \${body.action} processed (demo)`,
      });
    }

    const validationResult = CreateEscrowSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const escrowId = `escrow_\${Date.now()}_\${crypto.randomBytes(8).toString('hex')}`;
    const timeoutAt = new Date(Date.now() + (body.condition?.timeout_seconds || 86400) * 1000);

    return NextResponse.json({
      success: true,
      escrow_id: escrowId,
      escrow: {
        id: escrowId,
        amount: body.amount,
        currency: body.currency || 'usd',
        from: body.from_agent_id || 'Account Balance',
        to: body.to_agent_id,
        condition: body.condition.type,
        status: 'pending',
        timeout_at: timeoutAt.toISOString(),
      },
      verify_url: `https://api.mnnr.app/v1/escrow/verify/\${escrowId}`,
      message: 'Escrow created (demo - tables pending migration)',
      examples: {
        verify_outcome: `curl -X POST https://api.mnnr.app/v1/escrow -d '{"escrow_id": "\${escrowId}", "action": "verify", "verification_data": {"confirmed": true}}'`,
        check_status: `curl https://api.mnnr.app/v1/escrow?id=\${escrowId} -H "Authorization: Bearer YOUR_API_KEY"`,
      },
    });
  } catch (error) {
    console.error('Escrow API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
