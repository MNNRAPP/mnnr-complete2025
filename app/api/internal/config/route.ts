// MON-061: Honeypot Endpoint
// Triggers P0 alert when accessed by unauthorized users

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Log critical security event
  logger.error('Honeypot triggered: /api/internal/config', undefined, {
    severity: 'critical',
    ip,
    userAgent,
    path: '/api/internal/config',
    method: 'GET',
    timestamp: new Date().toISOString()
  });

  // Return harmless response (don't reveal it's a honeypot)
  return NextResponse.json(
    { status: 'ok', version: '1.0.0' },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  logger.error('Honeypot triggered: /api/internal/config POST', undefined, {
    severity: 'critical',
    ip,
    method: 'POST'
  });

  return NextResponse.json({ status: 'received' }, { status: 200 });
}
