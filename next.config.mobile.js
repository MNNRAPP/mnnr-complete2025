/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export', // Enable static export for Capacitor
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Better compatibility with mobile webviews
  
  // Disable features not compatible with static export
  experimental: {
    // Remove server actions for mobile build
  },
}

module.exports = nextConfig
