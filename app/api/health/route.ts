/**
 * Health Check API Endpoint
 * GET /api/health
 * 
 * Returns system status, database connectivity, and environment information
 * Used for monitoring, load balancers, and API documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Basic system info
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '0.2.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version
    };

    // Test database connectivity
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();
      
      healthData.database = error ? 'error' : 'connected';
      if (error) {
        healthData.database_error = error.message;
      }
    } catch (dbError) {
      healthData.database = 'error';
      healthData.database_error = dbError instanceof Error ? dbError.message : 'Unknown database error';
    }

    // Test Redis connectivity (if configured)
    if (process.env.UPSTASH_REDIS_REST_URL) {
      try {
        const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
          headers: {
            'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
          }
        });
        healthData.redis = response.ok ? 'connected' : 'error';
      } catch (redisError) {
        healthData.redis = 'error';
      }
    } else {
      healthData.redis = 'not_configured';
    }

    // Calculate response time
    healthData.response_time_ms = Date.now() - startTime;

    // Set cache headers for health checks
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    // Log health check (only in development or if there's an error)
    if (process.env.NODE_ENV === 'development' || healthData.database === 'error') {
      logger.info('Health check performed', {
        status: healthData.status,
        database: healthData.database,
        redis: healthData.redis,
        response_time: healthData.response_time_ms
      });
    }

    return NextResponse.json(healthData, { 
      status: 200,
      headers 
    });

  } catch (error) {
    logger.error('Health check failed', error);
    
    const errorResponse = {
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '0.2.0',
      error: error instanceof Error ? error.message : 'Unknown error',
      response_time_ms: Date.now() - startTime
    };

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    });
  }
}

// Handle other HTTP methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}