/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Returns system status + safe presence flags for required env config.
 * Auth migration 2026-06-19: Supabase removed in favor of Clerk + Neon.
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envFlags = {
      NEON_DATABASE_URL: Boolean(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL),
      CLERK_PUBLISHABLE_KEY: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY),
      CLERK_SECRET_KEY: Boolean(process.env.CLERK_SECRET_KEY),
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
        neonConfigured: envFlags.NEON_DATABASE_URL,
        clerkConfigured: envFlags.CLERK_PUBLISHABLE_KEY && envFlags.CLERK_SECRET_KEY,
        stripeConfigured: envFlags.STRIPE_SECRET_KEY
      }
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'CDN-Cache-Control': 'no-store',
        'Netlify-CDN-Cache-Control': 'no-store',
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
        'CDN-Cache-Control': 'no-store',
        'Netlify-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
