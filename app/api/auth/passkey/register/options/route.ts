/**
 * Passkey Registration Options Endpoint
 * POST /api/auth/passkey/register/options
 * Generates WebAuthn registration options for passwordless auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generatePasskeyRegistrationOptions } from '@/utils/webauthn';
import { logger } from '@/utils/logger';
import { applyRateLimit } from '@/utils/redis-rate-limit';
import { logAuditEvent, AuditEventType } from '@/utils/audit-logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 15 minutes (prevent abuse)
    const rateLimitResponse = await applyRateLimit(request, 'auth');
    if (rateLimitResponse) return rateLimitResponse;

    const supabase = createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuditEvent(AuditEventType.ACCESS_DENIED, {
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        action: 'POST /api/auth/passkey/register/options',
        status: 'failure',
        errorMessage: 'Unauthorized - user not authenticated',
      });

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile for display name
    const { data: profile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Generate WebAuthn registration options
    const options = await generatePasskeyRegistrationOptions(
      user.id,
      user.email!,
      profile?.full_name || user.email?.split('@')[0]
    );

    // Audit log
    await logAuditEvent(AuditEventType.MFA_SETUP_INITIATED, {
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
      action: 'Passkey registration options generated',
      status: 'success',
    });

    logger.info('Passkey registration options generated', {
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      options,
    });

  } catch (error) {
    logger.error('Failed to generate passkey registration options', error);

    return NextResponse.json(
      {
        error: 'Failed to generate registration options',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
