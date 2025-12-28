import { createClient } from '@/utils/supabase/server';
import { generateApiKey } from '@/utils/api-keys';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import { z } from 'zod';

// Input validation schemas
const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  mode: z.enum(['live', 'test']).default('live'),
});

const deleteKeySchema = z.object({
  id: z.string().uuid("Invalid key ID"),
});

export async function GET(request: NextRequest) {
  const supabase = createClient();
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) return rateLimitResult;

  try {
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json(
        { error: 'Failed to fetch API keys' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Unexpected error in GET /api/keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) return rateLimitResult;

  // CSRF protection
  const csrfResult = await csrfProtection(request);
  if (csrfResult) return csrfResult;

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = createKeySchema.parse(body);

    // Check if user has reached key limit (max 10 keys per user)
    const { count, error: countError } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (countError) {
      console.error('Error counting keys:', countError);
      return NextResponse.json(
        { error: 'Failed to check key limit' },
        { status: 500 }
      );
    }

    if (count && count >= 10) {
      return NextResponse.json(
        { error: 'Maximum number of API keys reached (10)' },
        { status: 400 }
      );
    }

    // Generate new API key
    const { key, prefix, hash } = generateApiKey(validatedData.mode);

    // Store in database
    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        key_prefix: prefix,
        key_hash: hash,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating API key:', error);
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      );
    }

    // Return the full key only once (it won't be shown again)
    return NextResponse.json({
      apiKey: {
        ...apiKey,
        key // Only returned on creation
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.issues 
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  
  // Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) return rateLimitResult;

  // CSRF protection
  const csrfResult = await csrfProtection(request);
  if (csrfResult) return csrfResult;

  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    const validatedData = deleteKeySchema.parse({ id: keyId });

    // Soft delete (deactivate) instead of hard delete
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', validatedData.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting API key:', error);
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.issues 
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error in DELETE /api/keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
