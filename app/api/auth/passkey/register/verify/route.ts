/**
 * Passkey Registration Verification Endpoint
 * POST /api/auth/passkey/register/verify
 * Verifies WebAuthn registration response and stores passkey
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyPasskeyRegistration } from '@/utils/webauthn';
import { logger } from '@/utils/logger';
import { applyRateLimit } from '@/utils/redis-rate-limit';
import { logAuditEvent, AuditEventType } from '@/utils/audit-logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const rateLimitResponse = await applyRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const supabase = createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { response, friendlyName } = body;

    if (!response) {
      return NextResponse.json(
        { error: 'Missing registration response' },
        { status: 400 }
      );
    }

    // Verify the WebAuthn registration
    const result = await verifyPasskeyRegistration(
      user.id,
      response,
      friendlyName || `Passkey ${new Date().toLocaleDateString()}`
    );

    if (!result.verified) {
      await logAuditEvent(AuditEventType.MFA_SETUP_FAILED, {
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        action: 'Passkey registration verification failed',
        status: 'failure',
      });

      logger.warn('Passkey registration verification failed', {
        userId: user.id,
      });

      return NextResponse.json(
        { error: 'Passkey registration verification failed' },
        { status: 400 }
      );
    }

    // Success - audit log
    await logAuditEvent(AuditEventType.MFA_ENABLED, {
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      action: 'Passkey registered successfully',
      status: 'success',
      metadata: {
        passkeyId: result.passkey?.id,
        deviceType: result.passkey?.device_type,
        friendlyName: result.passkey?.friendly_name,
      },
    });

    logger.info('Passkey registered successfully', {
      userId: user.id,
      passkeyId: result.passkey?.id,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      passkey: {
        id: result.passkey?.id,
        friendly_name: result.passkey?.friendly_name,
        device_type: result.passkey?.device_type,
        created_at: result.passkey?.created_at,
      },
    });

  } catch (error) {
    logger.error('Failed to verify passkey registration', error);

    return NextResponse.json(
      {
        error: 'Failed to verify passkey registration',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
