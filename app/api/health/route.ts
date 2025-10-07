/**
 * Health Check API Endpoint
 * GET /api/health
 * 
 * Simple health check that returns system status
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Safe env presence checks (booleans only, never return values)
    const envFlags = {
      NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY_LIVE),
      STRIPE_WEBHOOK_SECRET: Boolean(process.env.STRIPE_WEBHOOK_SECRET)
    };

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
      config: {
        webhooksConfigured: envFlags.STRIPE_WEBHOOK_SECRET,
        supabaseConfigured: envFlags.NEXT_PUBLIC_SUPABASE_URL && envFlags.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        stripeConfigured: envFlags.STRIPE_SECRET_KEY
      }
    };

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    });
  }
}
