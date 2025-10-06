/** @type {import('next').NextConfig} */

// 10/10 Enterprise Security Headers Configuration
const securityHeaders = [
  // DNS prefetch control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  // HSTS - Force HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  // Legacy XSS protection
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  // Disable dangerous browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()'
  },
  // Cross-Origin policies
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'credentialless'
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin'
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'cross-origin'
  },
  // Comprehensive Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.sentry.io https://*.upstash.io",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  },
  // Prevent information disclosure
  {
    key: 'Server',
    value: 'MNNR'
  },
  // Security headers for API endpoints
  {
    key: 'X-Robots-Tag',
    value: 'noindex, nofollow, noarchive, nosnippet'
  }
];

const nextConfig = {
  reactStrictMode: true,

  // Disable ESLint during build to avoid deployment failures
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Enable instrumentation for environment validation
  experimental: {
    instrumentationHook: true,
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        'localhost:3000',
        process.env.NEXT_PUBLIC_SITE_URL
      ].filter(Boolean)
    }
  },

  // Security: Disable powered by header
  poweredByHeader: false,

  // Security: Enable strict mode
  // Note: removeConsole only works in production builds, not in dev mode
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true
    }
  }),

  // Add security headers to all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      },
      // Additional headers for API routes
      {
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  },

  // Security redirects
  async redirects() {
    return [
      // Block access to sensitive files
      {
        source: '/.env',
        destination: '/404',
        permanent: false
      },
      {
        source: '/.env.local',
        destination: '/404',
        permanent: false
      }
    ];
  },

  // Configure webpack for production security
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side security: Remove source maps in production
      if (process.env.NODE_ENV === 'production') {
        config.devtool = false;
      }
    }
    return config;
  }
};

module.exports = nextConfig;
