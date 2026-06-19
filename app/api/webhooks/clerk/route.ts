// app/api/webhooks/clerk/route.ts — Clerk → Neon user provisioning.
//
// Purpose
//   Provision (and de-provision) the local `users` row when Clerk says a user
//   was created / deleted. Keeps the synchronous hot path out of every API
//   call so first-API-hit doesn't pay a write to Neon.
//
// Verification
//   svix-signed. We MUST verify the signature before trusting the payload;
//   otherwise anyone who knows the URL can mint a session.
//
// Setup (manual, not part of this PR)
//   1. Deploy this code.
//   2. In Clerk Dashboard → Webhooks, create an endpoint pointing at
//      https://mnnr.app/api/webhooks/clerk subscribed to user.created +
//      user.deleted + user.updated.
//   3. Copy the signing secret into CLERK_WEBHOOK_SECRET (Netlify env).

import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type ClerkUserEvent = {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string; id?: string }>;
    primary_email_address_id?: string | null;
  };
};

function pickPrimaryEmail(data: ClerkUserEvent['data']): string {
  const list = data.email_addresses ?? [];
  if (data.primary_email_address_id) {
    const match = list.find((e) => e.id === data.primary_email_address_id);
    if (match?.email_address) return match.email_address;
  }
  return list[0]?.email_address ?? `${data.id}@clerk.placeholder`;
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET missing — refusing webhook');
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
  }

  const payload = await req.text();
  const hdrs = headers();
  const svixId = hdrs.get('svix-id');
  const svixTimestamp = hdrs.get('svix-timestamp');
  const svixSignature = hdrs.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'missing svix headers' }, { status: 400 });
  }

  let evt: ClerkUserEvent;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent;
  } catch (err) {
    console.error('clerk webhook verification failed', err);
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  try {
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const email = pickPrimaryEmail(evt.data);
      await db.user.upsert({
        where: { clerkId: evt.data.id },
        create: { clerkId: evt.data.id, email },
        update: { email },
      });
    } else if (evt.type === 'user.deleted') {
      await db.user.deleteMany({ where: { clerkId: evt.data.id } });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('clerk webhook handler failed', err);
    return NextResponse.json({ error: 'handler failed' }, { status: 500 });
  }
}
