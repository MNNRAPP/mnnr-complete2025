/**
 * Usage Tracking API - v1
 * POST /api/v1/track - Track usage event
 * 
 * This is the core API that customers call to track their AI usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashApiKey } from '@/lib/api-key-utils';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing or invalid Authorization header',
        hint: 'Use: Authorization: Bearer mnnr_live_xxxxx'
      }, { status: 401 });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer '
    
    // Validate key format
    if (!apiKey.startsWith('mnnr_')) {
      return NextResponse.json({ 
        error: 'Invalid API key format',
        hint: 'Keys should start with mnnr_live_ or mnnr_test_'
      }, { status: 401 });
    }

    // Find key in database
    const keyHash = hashApiKey(apiKey);
    const storedKey = await db.getApiKeyByHash(keyHash);

    if (!storedKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Check if key is expired
    if (storedKey.expires_at && new Date(storedKey.expires_at) < new Date()) {
      return NextResponse.json({ error: 'API key has expired' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { model, tokens, quantity, unit = 'tokens', event_type = 'track', metadata } = body;

    // Support both 'tokens' and 'quantity' for backwards compatibility
    const actualQuantity = quantity ?? tokens;

    // Validate required fields
    if (typeof actualQuantity !== 'number' || actualQuantity < 0) {
      return NextResponse.json({ 
        error: 'Invalid quantity/tokens value',
        hint: 'quantity must be a non-negative number'
      }, { status: 400 });
    }

    // Track the usage - include model in metadata if provided
    const fullMetadata = { ...metadata, model: model || null };
    
    await db.trackUsage(
      storedKey.id,
      event_type,
      actualQuantity,
      unit,
      fullMetadata
    );

    // Update last used timestamp
    await db.updateApiKeyLastUsed(storedKey.id);

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      tracked: {
        quantity: actualQuantity,
        unit,
        model: model || null,
        event_type,
        timestamp: new Date().toISOString(),
      },
      response_time_ms: responseTime
    });

  } catch (error) {
    console.error('POST /api/v1/track error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Also support GET for simple health check
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/track',
    method: 'POST',
    description: 'Track AI usage events',
    example: {
      headers: {
        'Authorization': 'Bearer mnnr_live_xxxxx',
        'Content-Type': 'application/json'
      },
      body: {
        model: 'gpt-4',
        tokens: 1500,
        event_type: 'completion',
        metadata: { user_id: 'optional' }
      }
    }
  });
}
