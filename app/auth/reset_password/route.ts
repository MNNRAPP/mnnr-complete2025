import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  // Password reset callback route
  // TODO: Implement password reset token verification flow
  const requestUrl = new URL(request.url);

  return NextResponse.redirect(
    getErrorRedirect(
      `${requestUrl.origin}/sign-in`,
      'Password reset not yet implemented',
      'Please contact support to reset your password.'
    )
  );
}
