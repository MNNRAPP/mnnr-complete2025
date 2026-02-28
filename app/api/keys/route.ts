import { getAuthenticatedUser } from '@/lib/auth';
import { generateApiKey } from '@/lib/api-key-utils';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import { z } from 'zod';

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  mode: z.enum(['live', 'test']).default('live'),
});

const deleteKeySchema = z.object({
  id: z.string().uuid("Invalid key ID"),
});

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) return rateLimitResult;

  try {
    const keys = await db.getApiKeysByUserId(user.id);
    return NextResponse.json({ keys });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) return rateLimitResult;

  const csrfResult = await csrfProtection(request);
  if (csrfResult) return csrfResult;

  try {
    const body = await request.json();
    const validatedData = createKeySchema.parse(body);

    const count = await db.getActiveApiKeyCount(user.id);
    if (count >= 10) {
      return NextResponse.json(
        { error: 'Maximum number of API keys reached (10)' },
        { status: 400 }
      );
    }

    const { key, prefix, hash } = generateApiKey(validatedData.mode);
    const apiKey = await db.createApiKey(user.id, validatedData.name, hash, prefix);

    return NextResponse.json({
      apiKey: { ...apiKey, key }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateLimitResult = await rateLimit(
    getClientIdentifier(user.id, request),
    rateLimiters.apiKeys
  );
  if (rateLimitResult) return rateLimitResult;

  const csrfResult = await csrfProtection(request);
  if (csrfResult) return csrfResult;

  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    const validatedData = deleteKeySchema.parse({ id: keyId });

    await db.deactivateApiKey(validatedData.id, user.id);
    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
