/**
 * Public Status Endpoint - No Auth Required
 * GET /api/v1/status - Check API and database status
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  const status = {
    api: 'operational',
    database: 'unknown',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    latency_ms: 0,
    checks: {
      database_connected: false,
      users_table: false,
      api_keys_table: false,
    }
  };

  try {
    // Test database connection
    const dbHealthy = await db.healthCheck();
    status.checks.database_connected = dbHealthy;
    
    if (dbHealthy) {
      status.database = 'operational';
      
      // Check tables exist by trying a simple count
      try {
        const user = await db.getUserByEmail('test@mnnr.app');
        status.checks.users_table = true;
        status.checks.api_keys_table = user !== null;
      } catch {
        status.checks.users_table = false;
      }
    } else {
      status.database = 'error';
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    status.database = 'error';
  }

  status.latency_ms = Date.now() - startTime;

  const allHealthy = status.checks.database_connected;
  
  return NextResponse.json(status, { 
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    }
  });
}
