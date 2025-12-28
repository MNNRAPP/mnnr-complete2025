import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { checkRateLimit, getClientIp, createRateLimitResponse } from '@/utils/rate-limit';

// EDGE-033: Maintenance mode kill-switch
const isMaintenanceMode = () => process.env.MAINTENANCE_MODE === 'true';

// EDGE-032: Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://mnnr.app',
  'https://www.mnnr.app',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : [])
];

// EDGE-031: Rate limit configuration based on path
function getRateLimitConfig(pathname: string, isAuthenticated: boolean) {
  if (pathname.startsWith('/api/webhooks')) {
    return { interval: 3600 * 1000, maxRequests: 100 }; // 100/hour
  }
  if (pathname.startsWith('/api/auth')) {
    return { interval: 60 * 1000, maxRequests: 10 }; // 10/min
  }
  if (pathname.startsWith('/api/admin')) {
    return { interval: 60 * 1000, maxRequests: 20 }; // 20/min
  }
  if (pathname.startsWith('/api')) {
    return isAuthenticated
      ? { interval: 60 * 1000, maxRequests: 60 } // 60/min auth
      : { interval: 60 * 1000, maxRequests: 5 }; // 5/min unauth
  }
  return { interval: 60 * 1000, maxRequests: 30 }; // Default
}

export async function middleware(request: NextRequest) {
  // EDGE-033: Check maintenance mode first
  if (isMaintenanceMode()) {
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <title>Maintenance Mode</title>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
    .container { text-align: center; padding: 2rem; }
    h1 { color: #333; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Service Temporarily Unavailable</h1>
    <p>We're performing scheduled maintenance. Please check back shortly.</p>
  </div>
</body>
</html>`,
      {
        status: 503,
        headers: {
          'Content-Type': 'text/html',
          'Retry-After': '3600'
        }
      }
    );
  }

  // EDGE-032: CORS check
  const origin = request.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse('CORS policy violation', { status: 403 });
  }

  // Update Supabase session
  const response = await updateSession(request);

  // EDGE-031: Rate limiting
  const clientIp = getClientIp(request);
  const pathname = request.nextUrl.pathname;

  // Check if user is authenticated (simplified - will get user from session)
  const isAuthenticated = request.cookies.has('sb-access-token');

  const rateLimitConfig = getRateLimitConfig(pathname, isAuthenticated);
  const rateLimitResult = await checkRateLimit(clientIp, rateLimitConfig);

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult.resetTime);
  }

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

  // EDGE-030: Add security headers
  const nonce = crypto.randomUUID();

  // HSTS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // CSP - Report-only mode initially
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://js.stripe.com https://cdn.posthog.com;
    connect-src 'self' https://*.supabase.co https://api.stripe.com https://us.i.posthog.com;
    img-src 'self' data: https:;
    style-src 'self' 'unsafe-inline';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    frame-src https://js.stripe.com;
  `.replace(/\s+/g, ' ').trim();

  // Enforce CSP in production, report-only in development
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', csp);
  } else {
    response.headers.set('Content-Security-Policy-Report-Only', csp);
  }

  // Other security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');

  // Additional advanced security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // EDGE-032: CORS headers for allowed origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
