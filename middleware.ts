import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
    "/legal(.*)",
    "/about(.*)",
    "/pricing(.*)",
    "/docs(.*)",
  ],
  
  // Routes that can be accessed while signed out
  ignoredRoutes: [
    "/api/public(.*)",
  ],

  // Add custom logic after authentication
  afterAuth(auth, req) {
    // Handle maintenance mode
    if (process.env.MAINTENANCE_MODE === 'true') {
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

    // Allow access to public routes
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Continue to the route
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
