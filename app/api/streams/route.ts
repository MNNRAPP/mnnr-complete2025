/**
 * Payment Streams API - Real-Time Continuous Payments
 * Pay per second, per action, per outcome - in real-time.
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const CreateStreamSchema = z.object({
  from_agent_id: z.string().optional(),
  to_agent_id: z.string(),
  rate_type: z.enum(['per_second', 'per_minute', 'per_action', 'per_outcome']),
  rate_amount: z.number().positive(),
  max_amount: z.number().positive().optional(),
  max_duration_seconds: z.number().positive().optional(),
  name: z.string().optional(),
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
      streams: [
        {
          id: 'stream_demo_1',
          from: 'Account Balance',
          to: 'Research Agent',
          rate: '$0.01 per second',
          status: 'active',
          total_streamed: 45.20,
          started_at: new Date(Date.now() - 4520000).toISOString(),
        },
      ],
      total: 1,
      active_count: 1,
      total_streaming: 45.20,
      message: 'Streaming Payments API - Demo data (tables pending migration)',
    });
  } catch (error) {
    console.error('Streams API error:', error);
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

    // Handle stream actions
    if (body.stream_id && body.action) {
      return NextResponse.json({
        success: true,
        stream_id: body.stream_id,
        action: body.action,
        new_status: body.action === 'stop' ? 'completed' : body.action === 'pause' ? 'paused' : 'active',
        message: 'Stream action processed (demo)',
      });
    }

    const validationResult = CreateStreamSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const streamId = `stream_\${Date.now()}_\${crypto.randomBytes(8).toString('hex')}`;

    return NextResponse.json({
      success: true,
      stream_id: streamId,
      stream: {
        id: streamId,
        from: body.from_agent_id || 'Account Balance',
        to: body.to_agent_id,
        rate: `$\${body.rate_amount} \${body.rate_type.replace('_', ' ')}`,
        status: 'active',
        max_amount: body.max_amount,
      },
      monitor_url: `wss://api.mnnr.app/v1/streams/\${streamId}/live`,
      message: 'Stream created (demo - tables pending migration)',
      examples: {
        check_status: `curl https://api.mnnr.app/v1/streams?id=\${streamId} -H "Authorization: Bearer YOUR_API_KEY"`,
        pause_stream: `curl -X POST https://api.mnnr.app/v1/streams -d '{"stream_id": "\${streamId}", "action": "pause"}'`,
        stop_stream: `curl -X POST https://api.mnnr.app/v1/streams -d '{"stream_id": "\${streamId}", "action": "stop"}'`,
      },
    });
  } catch (error) {
    console.error('Streams API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
