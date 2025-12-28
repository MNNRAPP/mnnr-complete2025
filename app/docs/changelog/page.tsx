import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Changelog - MNNR',
  description: 'Track all updates, security improvements, and new features in our detailed changelog.',
};

const releases = [
  {
    version: 'v2.0.0',
    title: 'Agent Economy Launch',
    date: 'December 28, 2025',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    borderColor: 'border-emerald-500/30',
    isLatest: true,
    sections: [
      {
        icon: '🤖',
        title: 'Agent Economy APIs',
        items: [
          'Agent Economic Identity with wallets and reputation',
          'Streaming payments for continuous micropayments',
          'Programmable escrow with conditional releases',
          'x402 protocol for HTTP 402 Payment Required',
          'Agent Marketplace for service discovery',
        ],
      },
      {
        icon: '🌍',
        title: 'Global Support',
        items: [
          'Multi-language support (EN, ZH, ES, JA, KO, DE, FR)',
          'Multi-currency display (USD, EUR, GBP, JPY, CNY)',
          'Regional payment method support',
          'Localized documentation',
        ],
      },
      {
        icon: '⚡',
        title: 'Performance',
        items: [
          'Lighthouse score improved to 90/100',
          'FCP/LCP reduced from 7.7s to 1.1s',
          'Edge function optimization',
          'Database query optimization',
        ],
      },
    ],
  },
  {
    version: 'v1.2.0',
    title: 'AI Integration & Automation',
    date: 'August 25, 2025',
    color: 'orange',
    gradient: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'border-orange-500/30',
    sections: [
      {
        icon: '🤖',
        title: 'AI Features',
        items: [
          'AI-powered payment risk assessment',
          'Automated fraud detection',
          'Smart routing for payment rails',
          'Predictive analytics dashboard',
        ],
      },
      {
        icon: '⚡',
        title: 'Automation',
        items: [
          'Automated payment reconciliation',
          'Smart retry logic for failed payments',
          'Automated scaling based on load',
          'Self-healing infrastructure',
        ],
      },
    ],
  },
  {
    version: 'v1.1.0',
    title: 'Enterprise Features',
    date: 'August 20, 2025',
    color: 'purple',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    sections: [
      {
        icon: '🏢',
        title: 'Enterprise',
        items: [
          'Advanced monitoring dashboard',
          'Role-based access control (RBAC)',
          'Audit logging for compliance',
          'Custom integration APIs',
        ],
      },
      {
        icon: '🔧',
        title: 'API Improvements',
        items: [
          'New webhook event types',
          'Enhanced API documentation',
          'Better error responses',
          'Request/response logging',
        ],
      },
    ],
  },
  {
    version: 'v1.0.1',
    title: 'Security & Performance Updates',
    date: 'August 17, 2025',
    color: 'blue',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    sections: [
      {
        icon: '🔒',
        title: 'Security',
        items: [
          'Enhanced WebAuthn implementation',
          'Improved rate limiting controls',
          'Updated dependencies for security patches',
          'Strengthened password policies',
        ],
      },
      {
        icon: '🐛',
        title: 'Bug Fixes',
        items: [
          'Fixed webhook signature verification',
          'Resolved memory leak in payment processing',
          'Improved error messages',
          'Fixed timezone handling in logs',
        ],
      },
    ],
  },
  {
    version: 'v1.0.0',
    title: 'Initial Release',
    date: 'August 16, 2025',
    color: 'gray',
    gradient: 'from-gray-500/20 to-slate-500/20',
    borderColor: 'border-gray-500/30',
    sections: [
      {
        icon: '✨',
        title: 'Features',
        items: [
          'Multi-rail payment processing',
          'WebAuthn passkey authentication',
          'Real-time payment verification',
          'SDK support for Python and JavaScript',
        ],
      },
      {
        icon: '🔒',
        title: 'Security',
        items: [
          'AES-256 encryption',
          'Redis-based rate limiting',
          'Sentry error monitoring',
          'Security headers and CORS',
        ],
      },
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(107,114,128,0.1),transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto px-6 py-20 relative">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              ← Back to Documentation
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gray-500/10 border border-gray-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-gray-400 text-sm font-medium">📋 Changelog</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What's{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                New
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Track all updates, security improvements, and new features 
              in the MNNR platform.
            </p>
          </div>

          {/* Current Version Banner */}
          <div className="relative bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-4 mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 font-medium">Current Version: v2.0.0</span>
            </div>
            <span className="text-gray-400 text-sm">Agent Economy Release</span>
          </div>

          {/* Release Timeline */}
          <div className="space-y-6 mb-16">
            {releases.map((release) => (
              <div
                key={release.version}
                className={`relative bg-gradient-to-br ${release.gradient} border ${release.borderColor} rounded-2xl p-6 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/60 rounded-2xl" />
                <div className="relative">
                  {/* Version Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`px-3 py-1 bg-${release.color}-500/20 border border-${release.color}-500/30 rounded-lg mr-4`}>
                        <span className={`text-${release.color}-400 font-bold`}>{release.version}</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white">{release.title}</h2>
                        <p className="text-gray-400 text-sm">{release.date}</p>
                      </div>
                    </div>
                    {release.isLatest && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  
                  {/* Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {release.sections.map((section, index) => (
                      <div key={index}>
                        <h3 className="text-white font-medium mb-3 flex items-center">
                          <span className="mr-2">{section.icon}</span>
                          {section.title}
                        </h3>
                        <ul className="space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start text-gray-300 text-sm">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 mt-1.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Version Info */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-4">Update Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/40 rounded-lg p-4">
                <span className="text-2xl mb-2 block">🔒</span>
                <div className="text-white font-medium">Security Updates</div>
                <div className="text-gray-400 text-sm">Immediate deployment</div>
              </div>
              <div className="bg-black/40 rounded-lg p-4">
                <span className="text-2xl mb-2 block">🔄</span>
                <div className="text-white font-medium">Auto-Updates</div>
                <div className="text-gray-400 text-sm">Zero downtime</div>
              </div>
              <div className="bg-black/40 rounded-lg p-4">
                <span className="text-2xl mb-2 block">📊</span>
                <div className="text-white font-medium">Uptime</div>
                <div className="text-gray-400 text-sm">99.9% SLA</div>
              </div>
            </div>
          </div>

          {/* Subscribe to Updates */}
          <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Get notified about new releases and important updates.
            </p>
            <a
              href="mailto:updates@mnnr.app?subject=Subscribe to MNNR Updates"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-lg transition-colors"
            >
              <span>📧</span> Subscribe to Updates
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
