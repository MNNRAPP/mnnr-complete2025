import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, createRateLimitResponse } from '@/utils/rate-limit';
import { generateCsp, generateCspNonce } from '@/lib/security';

// EDGE-032: Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://mnnr.app',
  'https://www.mnnr.app',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
];

// SEC-FIX 2026-06-19 (ChatGPT audit response):
// Rate-limit tiers per route prefix. Auth state drives unauth vs. auth quotas.
function getRateLimitConfig(pathname: string, isAuthenticated: boolean) {
  if (pathname.startsWith('/api/webhooks')) {
    return { interval: 3600 * 1000, maxRequests: 100 };
  }
  if (pathname.startsWith('/api/auth')) {
    return { interval: 60 * 1000, maxRequests: 10 };
  }
  if (pathname.startsWith('/api/admin')) {
    return { interval: 60 * 1000, maxRequests: 20 };
  }
  if (pathname.startsWith('/api')) {
    return isAuthenticated
      ? { interval: 60 * 1000, maxRequests: 60 }
      : { interval: 60 * 1000, maxRequests: 5 };
  }
  return { interval: 60 * 1000, maxRequests: 30 };
}

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
    // SEC-FIX 2026-06-19: REMOVED `/api/v1/usage` and `/api/v1/keys` from
    // publicRoutes (Audit Finding #1 — CRITICAL). These endpoints leaked the
    // hard-coded `test@mnnr.app` user data when called without auth. They are
    // now protected by Clerk's default-deny + handler-side ownership checks.
    '/api/webhooks(.*)',
    '/api/newsletter',
    '/api/csp-report',
    '/docs(.*)',
    '/legal(.*)',
    '/about',
    '/pricing',
    '/status',
    '/privacy',
    '/terms',
    '/cookies',
    '/design-partner',
    // SEC-FIX 2026-06-19 (C+ audit response):
    // /security is the public-facing proof page. No auth so external
    // auditors / monitors can probe without credentials.
    '/security',
  ],

  // Routes that can always be accessed (even while logged in)
  ignoredRoutes: [
    '/api/health',
    '/api/webhooks(.*)',
    '/api/newsletter',
    '/api/csp-report',
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

  async afterAuth(auth, req) {
    // EDGE-032: CORS check
    const origin = req.headers.get('origin');
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse('CORS policy violation', { status: 403 });
    }

    // Handle users who aren't authenticated on non-public routes.
    // API routes (/api/*) get a 401 JSON response with WWW-Authenticate
    // instead of a 307 redirect — programmatic clients need a status they
    // can act on, not a browser-shaped sign-in flow.
    if (!auth.userId && !auth.isPublicRoute) {
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          {
            status: 401,
            headers: { 'WWW-Authenticate': 'Bearer realm="mnnr-api"' },
          },
        );
      }
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Redirect logged-in users away from auth pages
    if (
      auth.userId &&
      (req.nextUrl.pathname.startsWith('/sign-in') ||
        req.nextUrl.pathname.startsWith('/sign-up'))
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // EDGE-031: Rate limiting (fail-closed for sensitive routes — handled inside checkRateLimit)
    const clientIp = getClientIp(req);
    const pathname = req.nextUrl.pathname;
    const isAuthenticated = Boolean(auth.userId);
    const rateLimitConfig = getRateLimitConfig(pathname, isAuthenticated);
    const rateLimitResult = await checkRateLimit(clientIp, rateLimitConfig);

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetTime);
    }

    const response = NextResponse.next();

    response.headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

    // ===== SECURITY_HEADERS_INJECTION_POINT (Finding #6) =====
    // Per-request nonce CSP. Static headers (HSTS, X-Frame-Options,
    // Permissions-Policy, COOP/CORP/COEP, etc.) are emitted by
    // `next.config.js` `async headers()` for ALL routes; this block adds the
    // nonce-bound CSP that cannot be expressed statically.
    const nonce = generateCspNonce();
    const csp = generateCsp(nonce);

    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Content-Security-Policy', csp);
    } else {
      response.headers.set('Content-Security-Policy-Report-Only', csp);
    }
    response.headers.set('x-nonce', nonce);
    // ===== /SECURITY_HEADERS_INJECTION_POINT =====

    // EDGE-032: CORS headers for allowed origins
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
