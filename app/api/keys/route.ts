import { createClient } from '@/utils/supabase/server';
import { generateApiKey } from '@/utils/api-keys';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import {
  logAuditEvent,
  AuditEventType,
  AuditSeverity,
} from '@/lib/audit-trail';
import { z } from 'zod';

// Input validation schemas
const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  mode: z.enum(['live', 'test']).default('live'),
});

const deleteKeySchema = z.object({
  id: z.string().uuid("Invalid key ID"),
});

// SEC-FIX 2026-06-19 (ChatGPT audit response):
// Helper to capture request context for audit-trail entries. Keeps every audit
// payload consistent so a reviewer can correlate Gateway logs with audit log
// without re-parsing the route handler.
function getAuditContext(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  return {
    ipAddress: forwarded ? forwarded.split(',')[0].trim() : undefined,
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

export async function GET(request: NextRequest) {
  const supabase = createClient();

  // SEC-FIX 2026-06-19: Real Supabase server-side identity is required. No
  // header-based x-user-id lookup and no test@mnnr.app fallback path exist.
  // Anonymous / spoofed-header requests get a 401 immediately.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    // SEC-FIX 2026-06-19: audit failed-auth attempts so a brute-force or
    // probe against /api/keys leaves a forensic trail.
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      resource: '/api/keys',
      action: 'GET',
      metadata: { reason: 'unauthenticated' },
      ...getAuditContext(request),
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting (keyed on authenticated user id, not raw IP — per
  // lib/rate-limit.ts getClientIdentifier).
  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) {
    await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'GET',
      ...getAuditContext(request),
    });
    return rateLimitResult;
  }

  try {
    // SEC-FIX 2026-06-19: Ownership enforcement — the .eq('user_id', user.id)
    // clause means a caller can ONLY ever read their own keys, even if the
    // table had no RLS. Defense in depth alongside Supabase RLS.
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

    // SEC-FIX 2026-06-19: audit key listing (partial reveal — caller only
    // ever sees prefixes/hashes, not full keys, but we still log the access).
    await logAuditEvent(AuditEventType.DATA_ACCESSED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'api_keys',
      action: 'list',
      metadata: { count: keys?.length ?? 0 },
      ...getAuditContext(request),
    });

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

  // SEC-FIX 2026-06-19: Real Supabase server-side identity required. No
  // x-user-id header path, no test@mnnr.app fallback.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      resource: '/api/keys',
      action: 'POST',
      metadata: { reason: 'unauthenticated' },
      ...getAuditContext(request),
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) {
    await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'POST',
      ...getAuditContext(request),
    });
    return rateLimitResult;
  }

  // SEC-FIX 2026-06-19: CSRF required on every state-changing call.
  // lib/csrf.ts double-submit cookie pattern; 403 if header missing/bad.
  const csrfResult = await csrfProtection(request);
  if (csrfResult) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'POST',
      metadata: { reason: 'csrf_failed' },
      ...getAuditContext(request),
    });
    return csrfResult;
  }

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

    // SEC-FIX 2026-06-19: audit key creation. Never log the raw key — only
    // its prefix + id. The full key is returned to the caller once and never
    // again (line below) so it must not enter durable audit logs.
    await logAuditEvent(AuditEventType.API_KEY_CREATED, {
      severity: AuditSeverity.INFO,
      userId: user.id,
      resource: 'api_keys',
      action: 'create',
      metadata: {
        keyId: apiKey?.id,
        keyPrefix: prefix,
        mode: validatedData.mode,
        name: validatedData.name,
      },
      ...getAuditContext(request),
    });

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

  // SEC-FIX 2026-06-19: Real Supabase server-side identity required.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      resource: '/api/keys',
      action: 'DELETE',
      metadata: { reason: 'unauthenticated' },
      ...getAuditContext(request),
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) {
    await logAuditEvent(AuditEventType.SECURITY_RATE_LIMIT_EXCEEDED, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'DELETE',
      ...getAuditContext(request),
    });
    return rateLimitResult;
  }

  // SEC-FIX 2026-06-19: CSRF required.
  const csrfResult = await csrfProtection(request);
  if (csrfResult) {
    await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: '/api/keys',
      action: 'DELETE',
      metadata: { reason: 'csrf_failed' },
      ...getAuditContext(request),
    });
    return csrfResult;
  }

  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    const validatedData = deleteKeySchema.parse({ id: keyId });

    // SEC-FIX 2026-06-19: Explicit ownership pre-check before mutation.
    // The .eq('user_id', user.id) on the update guards the write, but a
    // pre-fetch lets us return a clean 403 (vs. silent 0-row update) and
    // populate the audit log with the actual prior key state.
    const { data: existingKey, error: fetchError } = await supabase
      .from('api_keys')
      .select('id, user_id, key_prefix, is_active')
      .eq('id', validatedData.id)
      .single();

    if (fetchError || !existingKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    if (existingKey.user_id !== user.id) {
      // Cross-user access attempt — log and refuse.
      await logAuditEvent(AuditEventType.SECURITY_BREACH_ATTEMPT, {
        severity: AuditSeverity.CRITICAL,
        userId: user.id,
        resource: 'api_keys',
        action: 'delete',
        metadata: {
          reason: 'ownership_mismatch',
          keyId: validatedData.id,
          ownerUserId: existingKey.user_id,
        },
        ...getAuditContext(request),
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // SEC-FIX 2026-06-19: audit key revocation.
    await logAuditEvent(AuditEventType.API_KEY_REVOKED, {
      severity: AuditSeverity.WARNING,
      userId: user.id,
      resource: 'api_keys',
      action: 'revoke',
      metadata: {
        keyId: validatedData.id,
        keyPrefix: existingKey.key_prefix,
      },
      ...getAuditContext(request),
    });

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
