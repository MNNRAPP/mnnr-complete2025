import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${normalizedEmail}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Hash password
    const passwordHash = createHash('sha256').update(password).digest('hex');

    // Create user
    const result = await sql`
      INSERT INTO users (id, email, name, full_name, password_hash, created_at, updated_at)
      VALUES (gen_random_uuid(), ${normalizedEmail}, ${name || null}, ${name || null}, ${passwordHash}, NOW(), NOW())
      RETURNING id, email
    `;
    const user = result[0];

    // Create session
    const ip = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const { token, expiresAt } = await createSession(user.id, ip, userAgent);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });
    response.cookies.set('mnnr_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
