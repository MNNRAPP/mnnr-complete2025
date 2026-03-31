import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/en(.*)',
    '/de(.*)',
    '/fr(.*)',
    '/es(.*)',
    '/it(.*)',
    '/nl(.*)',
    '/pt(.*)',
    '/pl(.*)',
    '/sv(.*)',
    '/da(.*)',
    '/fi(.*)',
    '/el(.*)',
    '/cs(.*)',
    '/ro(.*)',
    '/bg(.*)',
    '/hr(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/signin(.*)',
    '/signup(.*)',
    '/api/health',
    '/api/v1/usage',
    '/api/v1/keys',
    '/api/webhooks(.*)',
    '/api/newsletter',
    '/docs(.*)',
    '/legal(.*)',
    '/about',
    '/pricing',
    '/status',
    '/privacy',
    '/terms',
    '/cookies',
    '/design-partner',
  ],
  
  // Routes that can always be accessed (even while logged in)
  ignoredRoutes: [
    '/api/health',
    '/api/webhooks(.*)',
    '/api/newsletter',
    '/_next(.*)',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/icons(.*)',
    '/mnnr-logo(.*)',
    '/mnnr-icon(.*)',
    '/opengraph-image(.*)',
    '/apple-touch-icon(.*)',
    '/favicon(.*)',
  ],

  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    
    // Redirect logged-in users away from auth pages
    if (auth.userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
