// app/api/user/profile/route.ts — Clerk + Prisma (post-Supabase migration).
//
// Returns the local user row stitched to the Clerk identity. The Clerk
// session is the source-of-truth for email; we mirror it into the Neon
// `users` row via getOrCreateUser() so downstream JOINs work.

import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser, unauthorized } from '@/lib/user';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId: clerkId } = auth();
    if (!clerkId) return unauthorized();

    const user = await getOrCreateUser();
    if (!user) return unauthorized();

    const cu = await currentUser();

    return NextResponse.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      createdAt: user.createdAt,
      firstName: cu?.firstName ?? null,
      lastName: cu?.lastName ?? null,
      imageUrl: cu?.imageUrl ?? null,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
