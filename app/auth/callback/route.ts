import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  // The `/auth/callback` route handles both OAuth code exchange and magic link verification
  // OAuth: code parameter for OAuth flows
  // Magic Link: token + type parameters for email-based OTP authentication
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');

  const supabase = createClient();

  // Handle OAuth code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }

    // OAuth successful, redirect to account
    return NextResponse.redirect(
      getStatusRedirect(
        `${requestUrl.origin}/account`,
        'Success!',
        'You are now signed in.'
      )
    );
  }

  // Handle magic link (OTP token from email)
  if (token && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token,
        type: type as 'signup' | 'recovery' | 'invite' | 'email_change' | 'phone_change'
      });

      if (error) {
        console.error('Magic link verification error:', error);
        return NextResponse.redirect(
          getErrorRedirect(
            `${requestUrl.origin}/signin`,
            'Invalid or expired magic link',
            'Please request a new sign in link.'
          )
        );
      }

      // Magic link successful, redirect to account
      return NextResponse.redirect(
        getStatusRedirect(
          `${requestUrl.origin}/account`,
          'Success!',
          'You are now signed in.'
        )
      );
    } catch (err) {
      console.error('Magic link error:', err);
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          'Authentication failed',
          'Please try again or request a new magic link.'
        )
      );
    }
  }

  // No code or token provided, redirect to signin
  return NextResponse.redirect(
    getErrorRedirect(
      `${requestUrl.origin}/signin`,
      'Invalid callback',
      'No authentication code or token provided.'
    )
  );
}
