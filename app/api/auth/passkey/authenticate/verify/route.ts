/**
 * Passkey Authentication Verification Endpoint
 * POST /api/auth/passkey/authenticate/verify
 * Verifies WebAuthn authentication and creates session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { verifyPasskeyAuthentication } from '@/utils/webauthn';
import { logger } from '@/utils/logger';
import { applyRateLimit } from '@/utils/redis-rate-limit';
import { logAuditEvent, AuditEventType } from '@/utils/audit-logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const rateLimitResponse = await applyRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    // Parse request body
    const body = await request.json();
    const { response, challengeId } = body;

    if (!response || !challengeId) {
      return NextResponse.json(
        { error: 'Missing authentication response or challenge ID' },
        { status: 400 }
      );
    }

    // Verify the WebAuthn authentication
    const result = await verifyPasskeyAuthentication(response, challengeId);

    if (!result.verified || !result.userId) {
      await logAuditEvent(AuditEventType.USER_LOGIN_FAILED, {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        action: 'Passkey authentication failed',
        status: 'failure',
        metadata: { method: 'passkey' },
      });

      logger.warn('Passkey authentication verification failed');

      return NextResponse.json(
        { error: 'Passkey authentication verification failed' },
        { status: 401 }
      );
    }

    // Create Supabase session
    const supabase = createClient();

    // Note: This requires service role key to create sessions
    // Alternative: Use Supabase's signInWithOtp or custom JWT
    const { data, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: (await supabase.from('users').select('email').eq('id', result.userId).single()).data?.email || '',
    });

    if (sessionError) {
      logger.error('Failed to create session after passkey auth', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Success - audit log
    await logAuditEvent(AuditEventType.USER_LOGIN, {
      userId: result.userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      action: 'Passkey authentication successful',
      status: 'success',
      metadata: { authMethod: 'passkey' },
    });

    logger.info('Passkey authentication successful', {
      userId: result.userId,
    });

    return NextResponse.json({
      success: true,
      verified: true,
      userId: result.userId,
      redirectUrl: '/dashboard', // Redirect to dashboard after login
    });

  } catch (error) {
    logger.error('Failed to verify passkey authentication', error);

    return NextResponse.json(
      {
        error: 'Failed to verify passkey authentication',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
