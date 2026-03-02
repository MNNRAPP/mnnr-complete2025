import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/sign-in',
  '/sign-up',
  '/api/health',
  '/api/v1/usage',
  '/api/v1/keys',
  '/api/v1/track',
  '/api/v1/status',
  '/api/v1/analytics',
  '/api/webhooks',
  '/api/newsletter',
  '/api/marketplace',
  '/api/x402',
  '/api/internal/config',
  '/docs',
  '/legal',
  '/about',
  '/pricing',
  '/status',
];

// Routes that are always accessible (static assets, etc.)
const IGNORED_PREFIXES = [
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/icons',
  '/mnnr-',
  '/apple-touch-icon',
];

function isPublicRoute(pathname: string): boolean {
  // Check exact matches and prefix matches
  for (const route of PUBLIC_ROUTES) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return true;
    }
  }
  return false;
}

function isIgnoredRoute(pathname: string): boolean {
  for (const prefix of IGNORED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }
  // Static file extensions
  if (/\.\w+$/.test(pathname)) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow ignored routes
  if (isIgnoredRoute(pathname)) {
    return NextResponse.next();
  }

  // Always allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken = request.cookies.get('mnnr_session')?.value;

  if (!sessionToken) {
    // API routes return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Page routes redirect to sign-in
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Session exists - allow through (actual validation happens in route handlers)
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
