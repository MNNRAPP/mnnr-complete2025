/**
 * API Keys Management - v1
 * POST /api/v1/keys - Create new API key
 * GET /api/v1/keys - List API keys
 * DELETE /api/v1/keys?id=xxx - Revoke API key
 * 
 * Uses Neon directly - no Supabase dependency
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateApiKey } from '@/lib/api-key-utils';

// Simple auth: check for user_id in header or session
// TODO: Replace with proper auth
async function getAuthenticatedUser(request: NextRequest) {
  // For now, use a header-based auth or default test user
  const userId = request.headers.get('x-user-id');
  
  if (userId) {
    return db.getUserById(userId);
  }
  
  // Default to test user for development
  return db.getUserByEmail('test@mnnr.app');
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keys = await db.getApiKeysByUserId(user.id);
    
    // Don't return the hash, just metadata
    const safeKeys = keys.map(k => ({
      id: k.id,
      name: k.name,
      prefix: k.key_prefix,
      created_at: k.created_at,
      last_used_at: k.last_used_at,
      scopes: k.scopes,
      rate_limit: k.rate_limit,
    }));

    return NextResponse.json({ 
      success: true,
      keys: safeKeys,
      count: safeKeys.length
    });
  } catch (error) {
    console.error('GET /api/v1/keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, mode = 'live' } = body;

    if (!name || typeof name !== 'string' || name.length < 1) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Name too long (max 100 chars)' }, { status: 400 });
    }

    // Check key limit (max 10 per user)
    const existingKeys = await db.getApiKeysByUserId(user.id);
    if (existingKeys.length >= 10) {
      return NextResponse.json({ error: 'Maximum 10 API keys allowed' }, { status: 400 });
    }

    // Generate new key
    const { key, prefix, hash } = generateApiKey(mode as 'live' | 'test');
    
    // Store in database
    const apiKey = await db.createApiKey(user.id, name, hash, prefix);

    return NextResponse.json({
      success: true,
      api_key: {
        id: apiKey.id,
        name: apiKey.name,
        key: key, // Only returned ONCE on creation
        prefix: apiKey.key_prefix,
        created_at: apiKey.created_at,
      },
      warning: 'Save this key now. It will not be shown again.'
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/v1/keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
    }

    const success = await db.revokeApiKey(keyId, user.id);

    if (!success) {
      return NextResponse.json({ error: 'Key not found or already revoked' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'API key revoked' });

  } catch (error) {
    console.error('DELETE /api/v1/keys error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
