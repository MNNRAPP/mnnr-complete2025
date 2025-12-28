/**
 * Agent Economic Identity API
 * 
 * THIS IS WHAT MAKES MNNR DIFFERENT FROM PAID.AI
 * 
 * Paid.ai: Tracks what agents do → sends invoices
 * MNNR: Gives agents their own economic identity with wallets, reputation, and autonomous spending
 * 
 * This is the foundation of the autonomous economy.
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CreateAgentSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['ai_agent', 'bot', 'service', 'device', 'protocol']).default('ai_agent'),
  initial_balance: z.number().min(0).default(0),
  spending_limit_per_tx: z.number().min(0).optional(),
  daily_spending_limit: z.number().min(0).optional(),
  monthly_spending_limit: z.number().min(0).optional(),
  autonomy_level: z.enum(['supervised', 'semi_autonomous', 'fully_autonomous']).default('supervised'),
  allowed_actions: z.array(z.string()).default(['*']),
  blocked_actions: z.array(z.string()).default([]),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  webhook_url: z.string().url().optional(),
});

const FundAgentSchema = z.object({
  agent_id: z.string(),
  amount: z.number().positive(),
  source: z.enum(['account_balance', 'card', 'crypto']).default('account_balance'),
});

const AgentPaymentSchema = z.object({
  from_agent_id: z.string(),
  to: z.string(),
  amount: z.number().positive(),
  reason: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * GET /api/agents - List all agents with their economic status
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient() as any;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('id');

    if (agentId) {
      // Return mock agent data for now (tables not yet created)
      return NextResponse.json({
        agent: {
          id: agentId,
          name: 'Demo Agent',
          type: 'ai_agent',
          balance: 100.00,
          reputation_score: 85,
          status: 'active',
        },
        reputation: {
          score: 85,
          badges: ['reliable', 'established'],
        },
        message: 'Agent Economy API - Tables pending migration',
      });
    }

    // Return demo agents list
    return NextResponse.json({
      agents: [
        {
          id: 'agent_demo_1',
          name: 'Sales Agent',
          type: 'ai_agent',
          balance: 250.00,
          reputation_score: 92,
          status: 'active',
        },
        {
          id: 'agent_demo_2',
          name: 'Research Agent',
          type: 'ai_agent',
          balance: 180.00,
          reputation_score: 88,
          status: 'active',
        },
      ],
      total: 2,
      total_balance: 430.00,
      message: 'Agent Economy API - Demo data (tables pending migration)',
    });
  } catch (error) {
    console.error('Agents API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/agents - Create a new agent with economic identity
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient() as any;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Handle fund operation
    if (body.operation === 'fund') {
      const validationResult = FundAgentSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: validationResult.error.issues },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        agent_id: body.agent_id,
        amount_funded: body.amount,
        new_balance: 350.00,
        message: 'Agent funded (demo - tables pending migration)',
      });
    }

    // Handle payment operation
    if (body.operation === 'pay') {
      const validationResult = AgentPaymentSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: validationResult.error.issues },
          { status: 400 }
        );
      }
      const txId = `tx_\${Date.now()}_\${crypto.randomBytes(8).toString('hex')}`;
      return NextResponse.json({
        success: true,
        transaction_id: txId,
        from: body.from_agent_id,
        to: body.to,
        amount: body.amount,
        new_balance: 200.00,
        message: 'Payment processed (demo - tables pending migration)',
      });
    }

    // Create new agent
    const validationResult = CreateAgentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const agentData = validationResult.data;
    const agentId = `agent_\${Date.now()}_\${crypto.randomBytes(8).toString('hex')}`;
    const agentApiKey = `sk_agent_\${crypto.randomBytes(32).toString('hex')}`;
    const agentPublicId = `did:mnnr:\${crypto.randomBytes(16).toString('hex')}`;

    return NextResponse.json({
      success: true,
      agent: {
        id: agentId,
        public_id: agentPublicId,
        name: agentData.name,
        type: agentData.type,
        balance: agentData.initial_balance,
        autonomy_level: agentData.autonomy_level,
        status: 'active',
      },
      api_key: agentApiKey,
      warning: 'Save this API key - it will not be shown again',
      message: 'Agent created (demo - tables pending migration)',
      examples: {
        track_signal: `curl -X POST https://api.mnnr.app/v1/signals -H "Authorization: Bearer \${agentApiKey}" -d '{"action": "task_completed", "value": 10.00}'`,
        make_payment: `curl -X POST https://api.mnnr.app/v1/agents -H "Authorization: Bearer \${agentApiKey}" -d '{"operation": "pay", "to": "service_provider", "amount": 0.50, "reason": "API call"}'`,
        check_balance: `curl https://api.mnnr.app/v1/agents/\${agentId}/balance -H "Authorization: Bearer \${agentApiKey}"`,
      },
    });
  } catch (error) {
    console.error('Agents API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
