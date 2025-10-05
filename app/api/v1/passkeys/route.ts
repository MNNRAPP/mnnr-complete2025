/**
 * API v1 - Passkeys Management Endpoint
 * GET /api/v1/passkeys - List user's passkeys
 * DELETE /api/v1/passkeys - Delete a passkey
 * PATCH /api/v1/passkeys - Rename a passkey
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserPasskeys, deletePasskey, renamePasskey } from '@/utils/webauthn';
import { logger } from '@/utils/logger';
import { logAuditEvent, AuditEventType } from '@/utils/audit-logger';
import { applyRateLimit } from '@/utils/redis-rate-limit';

/**
 * GET /api/v1/passkeys - Get all passkeys for current user
 */
export async function GET(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, 'api');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const passkeys = await getUserPasskeys(user.id);

    // Don't expose sensitive data
    const sanitizedPasskeys = passkeys.map((p) => ({
      id: p.id,
      friendly_name: p.friendly_name,
      device_type: p.device_type,
      created_at: p.created_at,
      last_used_at: p.last_used_at,
    }));

    await logAuditEvent(AuditEventType.DATA_ACCESSED, {
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      resourceType: 'passkeys',
      action: 'GET /api/v1/passkeys',
      status: 'success',
    });

    return NextResponse.json({ data: sanitizedPasskeys });

  } catch (error) {
    logger.error('API v1 passkeys GET error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/passkeys?id={passkeyId} - Delete a passkey
 */
export async function DELETE(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, 'api');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const passkeyId = searchParams.get('id');

    if (!passkeyId) {
      return NextResponse.json({ error: 'Missing passkey ID' }, { status: 400 });
    }

    const success = await deletePasskey(user.id, passkeyId);

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete passkey' }, { status: 500 });
    }

    await logAuditEvent(AuditEventType.DATA_DELETED, {
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      resourceType: 'passkey',
      resourceId: passkeyId,
      action: 'DELETE /api/v1/passkeys',
      status: 'success',
    });

    return NextResponse.json({ message: 'Passkey deleted successfully' });

  } catch (error) {
    logger.error('API v1 passkeys DELETE error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/passkeys - Rename a passkey
 */
export async function PATCH(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, 'api');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, friendlyName } = body;

    if (!id || !friendlyName) {
      return NextResponse.json(
        { error: 'Missing passkey ID or friendly name' },
        { status: 400 }
      );
    }

    const success = await renamePasskey(user.id, id, friendlyName);

    if (!success) {
      return NextResponse.json({ error: 'Failed to rename passkey' }, { status: 500 });
    }

    await logAuditEvent(AuditEventType.DATA_UPDATED, {
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      resourceType: 'passkey',
      resourceId: id,
      action: 'PATCH /api/v1/passkeys',
      status: 'success',
      metadata: { friendlyName },
    });

    return NextResponse.json({ message: 'Passkey renamed successfully' });

  } catch (error) {
    logger.error('API v1 passkeys PATCH error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
