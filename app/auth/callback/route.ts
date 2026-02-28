import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  // OAuth callback route - currently not in use (email/password auth only)
  // This route can be extended to support OAuth providers in the future
  const requestUrl = new URL(request.url);

  return NextResponse.redirect(
    getErrorRedirect(
      `${requestUrl.origin}/sign-in`,
      'OAuth not configured',
      'Please sign in with email and password.'
    )
  );
}
