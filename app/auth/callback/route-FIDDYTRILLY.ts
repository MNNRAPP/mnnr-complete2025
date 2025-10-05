import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { logger } from '@/utils/logger';

// Allowed origins for redirects (prevent open redirect vulnerability)
const getAllowedOrigins = (): string[] => {
  const origins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter((url): url is string => Boolean(url));

  return origins;
};

const isAllowedOrigin = (origin: string): boolean => {
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
};

export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  // Validate the origin to prevent open redirect attacks
  if (!isAllowedOrigin(requestUrl.origin)) {
    logger.warn('Auth callback received from unauthorized origin', {
      origin: requestUrl.origin
    });
    return NextResponse.redirect(
      new URL('/signin', getAllowedOrigins()[0] || 'http://localhost:3000')
    );
  }

  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error('Auth code exchange failed', error);
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/account`,
      'Success!',
      'You are now signed in.'
    )
  );
}
