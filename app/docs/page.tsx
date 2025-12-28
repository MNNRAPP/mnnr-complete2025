import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Documentation - MNNR',
  description: 'Complete documentation for MNNR platform features, security, and deployment guides.',
};

const docSections = [
  {
    title: 'Quick Start',
    description: 'Get up and running in under 5 minutes with our step-by-step integration guide.',
    href: '/docs/quick-start',
    icon: '⚡',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    borderColor: 'border-emerald-500/30',
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation for usage tracking, billing, and key management.',
    href: '/docs/api',
    icon: '🔌',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Security Guide',
    description: 'Enterprise-grade security with SOC 2 readiness and comprehensive audit logging.',
    href: '/docs/security',
    icon: '🔐',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
  },
  {
    title: 'Deployment',
    description: 'Production deployment guides for Vercel, AWS, and self-hosted environments.',
    href: '/docs/deployment',
    icon: '🚀',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'Enterprise',
    description: 'Advanced features including SSO, custom SLAs, and dedicated infrastructure.',
    href: '/docs/enterprise',
    icon: '🏢',
    gradient: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'border-orange-500/30',
  },
  {
    title: 'Changelog',
    description: 'Track all updates, security improvements, and new feature releases.',
    href: '/docs/changelog',
    icon: '📋',
    gradient: 'from-gray-500/20 to-slate-500/20',
    borderColor: 'border-gray-500/30',
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-emerald-400 text-sm font-medium">📚 Documentation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Build with{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                confidence
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to integrate MNNR into your autonomous systems. 
              From quick start to enterprise deployment.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-6 py-4 pl-14 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Documentation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {docSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={`group relative bg-gradient-to-br ${section.gradient} border ${section.borderColor} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="absolute inset-0 bg-black/60 rounded-2xl" />
                <div className="relative">
                  <div className="text-4xl mb-4">{section.icon}</div>
                  <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {section.description}
                  </p>
                  <span className="inline-flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                    Read docs
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Security Badge */}
          <div className="relative bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Security Score: <span className="text-emerald-400">10/10</span>
              </h3>
              <p className="text-gray-400 max-w-xl mx-auto">
                Enterprise-grade security with SOC 2 readiness, Redis rate limiting, 
                Sentry monitoring, and comprehensive audit logging.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  SOC 2 Ready
                </span>
                <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  GDPR Compliant
                </span>
                <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  PCI DSS Ready
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Topics</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/docs/quick-start#authentication" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span className="text-emerald-400">→</span> Authentication Setup
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api#usage-tracking" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span className="text-emerald-400">→</span> Usage Tracking API
                  </Link>
                </li>
                <li>
                  <Link href="/docs/api#webhooks" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span className="text-emerald-400">→</span> Webhook Integration
                  </Link>
                </li>
                <li>
                  <Link href="/docs/deployment#vercel" className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2">
                    <span className="text-emerald-400">→</span> Vercel Deployment
                  </Link>
                </li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <p className="text-gray-400 mb-4">
                Can't find what you're looking for? Our team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:support@mnnr.app"
                  className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>📧</span> Email Support
                </a>
                <a
                  href="https://github.com/MNNRAPP/mnnr-complete2025/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>💬</span> Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
