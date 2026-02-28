/**
 * Health Check API Endpoint
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const dbHealthy = await db.healthCheck();

    const healthData = {
      status: dbHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      config: {
        databaseConfigured: Boolean(process.env.DATABASE_URL),
        databaseHealthy: dbHealthy,
        stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_LIVE),
        webhooksConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        resendConfigured: Boolean(process.env.RESEND_API_KEY),
      },
    };

    return NextResponse.json(healthData, {
      status: dbHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
