/**
 * Usage Stats API - v1
 * GET /api/v1/usage - Get usage statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashApiKey } from '@/lib/api-key-utils';

export async function GET(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing Authorization header'
      }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const keyHash = hashApiKey(apiKey);
    const storedKey = await db.getApiKeyByHash(keyHash);

    if (!storedKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    // Get usage events
    const events = await db.getUsageByApiKey(storedKey.id, days);

    // Calculate summary
    const totalQuantity = events.reduce((sum, e) => sum + Number(e.quantity || 0), 0);
    const unitBreakdown: Record<string, number> = {};
    
    events.forEach(e => {
      const unit = e.unit || 'unknown';
      unitBreakdown[unit] = (unitBreakdown[unit] || 0) + Number(e.quantity || 0);
    });

    return NextResponse.json({
      success: true,
      period_days: days,
      summary: {
        total_requests: events.length,
        total_quantity: totalQuantity,
        units: unitBreakdown,
      },
      recent_events: events.slice(0, 100).map(e => ({
        id: e.id,
        quantity: e.quantity,
        unit: e.unit,
        event_type: e.event_type,
        created_at: e.created_at,
        metadata: e.metadata,
      }))
    });

  } catch (error) {
    console.error('GET /api/v1/usage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
