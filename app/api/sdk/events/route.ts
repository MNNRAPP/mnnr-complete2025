import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import type { Json } from '@/types_db';

interface EventPayload {
  event: string;
  userId?: string;
  properties?: Record<string, Json>;
  occurredAt?: string;
}

const isConfigured = () =>
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SDK_INGEST_SECRET);

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: 'Ingestion disabled. Configure SUPABASE_SERVICE_ROLE_KEY and SDK_INGEST_SECRET.' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer', '').trim();

  if (token !== process.env.SDK_INGEST_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: EventPayload;
  try {
    payload = (await request.json()) as EventPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload?.event) {
    return NextResponse.json({ error: 'Missing event name' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const timestamp = payload.occurredAt ? new Date(payload.occurredAt) : new Date();

  const metadata = (payload.properties ?? {}) as Json;

  const { error } = await supabase.from('usage_events').insert({
    event_name: payload.event,
    user_id: payload.userId ?? null,
    metadata,
    created_at: timestamp.toISOString()
  });

  if (error) {
    return NextResponse.json(
      { error: error.message ?? 'Unable to persist event' },
      { status: 500 }
    );
  }

  if (process.env.POSTHOG_API_KEY) {
    try {
      await fetch(
        `${process.env.POSTHOG_HOST || 'https://app.posthog.com'}/capture/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            api_key: process.env.POSTHOG_API_KEY,
            event: payload.event,
            properties: payload.properties ?? {},
            distinct_id: payload.userId ?? 'anonymous',
            timestamp: timestamp.toISOString()
          })
        }
      );
    } catch (error) {
      console.warn('Failed to forward event to PostHog', error);
    }
  }

  return NextResponse.json({ success: true });
}
