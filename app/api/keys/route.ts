// app/api/keys/route.ts — Clerk + Prisma (post-Supabase migration).
//
// Migrated 2026-06-19 from supabase.auth.getUser() + .from('api_keys') to
// Clerk auth() + Prisma db.apiKey.*. Ownership is enforced by the
// `getOrCreateUser()` step (Clerk session -> local user.id), followed by
// `withUserContext` which binds Postgres RLS via SET LOCAL app.current_user_id.
//
// All SEC-FIX 2026-06-19 audit hooks, CSRF, and rate-limiting are preserved.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

import { getOrCreateUser, unauthorized } from '@/lib/user';
import { withUserContext } from '@/lib/rls';
import { generateApiKey } from '@/utils/api-keys';
import { rateLimit, rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import {
  logAuditEvent,
  AuditEventType,
  AuditSeverity,
} from '@/lib/audit-trail';

export const dynamic = 'force-dynamic';

const createKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  mode: z.enum(['live', 'test']).default('live'),
});

const deleteKeySchema = z.object({
  id: z.string().uuid('Invalid key ID'),
});

function getAuditContext(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  return {
    ipAddress: forwarded ? forwarded.split(',')[0].trim() : undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

export async function GET(request: NextRequest) {
  const { userId: clerkId } = auth();
  if (!clerkId) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      resource: '/api/keys',
      action: 'GET',
      metadata: { reason: 'unauthenticated' },
      ...getAuditContext(request),
    });
    return unauthorized();
  }

  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys,
  );
  if (rateLimitResult) {
    await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'GET',
      ...getAuditContext(request),
    });
    return rateLimitResult;
  }

  try {
    const keys = await withUserContext(user.id, (tx) =>
      tx.apiKey.findMany({
        where: { userId: user.id, revoked: false },
        orderBy: { createdAt: 'desc' },
      }),
    );

    await logAuditEvent(AuditEventType.DATA_ACCESSED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'api_keys',
      action: 'list',
      metadata: { count: keys.length },
      ...getAuditContext(request),
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Unexpected error in GET /api/keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = auth();
  if (!clerkId) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      resource: '/api/keys',
      action: 'POST',
      metadata: { reason: 'unauthenticated' },
      ...getAuditContext(request),
    });
    return unauthorized();
  }

  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys,
  );
  if (rateLimitResult) {
    await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'POST',
      ...getAuditContext(request),
    });
    return rateLimitResult;
  }

  const csrfResult = await csrfProtection(request);
  if (csrfResult) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'POST',
      metadata: { reason: 'csrf_failed' },
      ...getAuditContext(request),
    });
    return csrfResult;
  }

  try {
    const body = await request.json();
    const validatedData = createKeySchema.parse(body);

    const count = await withUserContext(user.id, (tx) =>
      tx.apiKey.count({ where: { userId: user.id, revoked: false } }),
    );

    if (count >= 10) {
      return NextResponse.json(
        { error: 'Maximum number of API keys reached (10)' },
        { status: 400 },
      );
    }

    const { key, prefix, hash } = generateApiKey(validatedData.mode);

    const apiKey = await withUserContext(user.id, (tx) =>
      tx.apiKey.create({
        data: {
          userId: user.id,
          name: validatedData.name,
          prefix,
          hashedKey: hash,
        },
      }),
    );

    await logAuditEvent(AuditEventType.API_KEY_CREATED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'api_keys',
      action: 'create',
      metadata: {
        keyId: apiKey.id,
        keyPrefix: prefix,
        mode: validatedData.mode,
        name: validatedData.name,
      },
      ...getAuditContext(request),
    });

    return NextResponse.json({ apiKey: { ...apiKey, key } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 },
      );
    }
    console.error('Unexpected error in POST /api/keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { userId: clerkId } = auth();
  if (!clerkId) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      resource: '/api/keys',
      action: 'DELETE',
      metadata: { reason: 'unauthenticated' },
      ...getAuditContext(request),
    });
    return unauthorized();
  }

  const user = await getOrCreateUser();
  if (!user) return unauthorized();

  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys,
  );
  if (rateLimitResult) {
    await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'DELETE',
      ...getAuditContext(request),
    });
    return rateLimitResult;
  }

  const csrfResult = await csrfProtection(request);
  if (csrfResult) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'DELETE',
      metadata: { reason: 'csrf_failed' },
      ...getAuditContext(request),
    });
    return csrfResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    const validatedData = deleteKeySchema.parse({ id: keyId });

    const existingKey = await withUserContext(user.id, (tx) =>
      tx.apiKey.findUnique({
        where: { id: validatedData.id },
        select: { id: true, userId: true, prefix: true, revoked: true },
      }),
    );

    if (!existingKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    if (existingKey.userId !== user.id) {
      await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
        severity: AuditSeverity.CRITICAL,
        userId: user.id,
        resource: 'api_keys',
        action: 'delete',
        metadata: {
          reason: 'ownership_mismatch',
          keyId: validatedData.id,
          ownerUserId: existingKey.userId,
        },
        ...getAuditContext(request),
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await withUserContext(user.id, (tx) =>
      tx.apiKey.update({
        where: { id: validatedData.id },
        data: { revoked: true },
      }),
    );

    await logAuditEvent(AuditEventType.API_KEY_REVOKED, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: 'api_keys',
      action: 'revoke',
      metadata: { keyId: validatedData.id, keyPrefix: existingKey.prefix },
      ...getAuditContext(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 },
      );
    }
    console.error('Unexpected error in DELETE /api/keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
