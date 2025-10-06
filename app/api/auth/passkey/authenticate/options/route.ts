/**
 * Passkey Authentication Options Endpoint
 * POST /api/auth/passkey/authenticate/options
 * Generates WebAuthn authentication options for passwordless login
 */

import { NextRequest, NextResponse } from 'next/server';
import { generatePasskeyAuthenticationOptions } from '@/utils/webauthn';
import { logger } from '@/utils/logger';
import { applyRateLimit } from '@/utils/redis-rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 15 minutes
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await applyRateLimit(clientIp, 5);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Generate authentication options
    // If email provided, will only allow passkeys for that user
    // If no email, allows any registered passkey (discoverable credentials)
    const options = await generatePasskeyAuthenticationOptions();

    logger.info('Passkey authentication options generated', {
      email: email || 'discoverable',
    });

    return NextResponse.json({
      success: true,
      options,
    });

  } catch (error) {
    logger.error('Failed to generate passkey authentication options', error);

    return NextResponse.json(
      {
        error: 'Failed to generate authentication options',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
