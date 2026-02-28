import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { db, sql } from '@/lib/db';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get user with password hash
    const result = await sql`SELECT * FROM users WHERE email = ${normalizedEmail}`;
    const user = result[0];

    if (!user || !user.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password using timing-safe comparison
    const inputHash = createHash('sha256').update(password).digest('hex');
    const storedHash = String(user.password_hash);

    if (inputHash.length !== storedHash.length) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = timingSafeEqual(Buffer.from(inputHash), Buffer.from(storedHash));
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session
    const ip = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    const { token, expiresAt } = await createSession(user.id, ip, userAgent);

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
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
