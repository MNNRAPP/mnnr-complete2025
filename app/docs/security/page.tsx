import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security Guide - MNNR',
  description: 'Comprehensive security documentation covering MNNR platform security implementation and best practices.',
};

const securityFeatures = [
  {
    title: 'Authentication',
    icon: '🔐',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    items: [
      'WebAuthn passkey authentication',
      'Multi-factor authentication support',
      'Secure session management',
      'Rate limiting on auth endpoints',
    ],
  },
  {
    title: 'Data Protection',
    icon: '🛡️',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    items: [
      'AES-256 encryption at rest',
      'TLS 1.3 encryption in transit',
      'Database field-level encryption',
      'Secure key management',
    ],
  },
  {
    title: 'Infrastructure',
    icon: '⚡',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    items: [
      'Redis-based rate limiting',
      'Sentry error monitoring',
      'Comprehensive logging',
      'Automated security updates',
    ],
  },
  {
    title: 'Compliance',
    icon: '📋',
    gradient: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'border-orange-500/30',
    items: [
      'SOC 2 Type II ready',
      'GDPR compliant',
      'PCI DSS considerations',
      'Regular security audits',
    ],
  },
];

const securityMetrics = [
  { label: 'Uptime SLA', value: '99.9%', icon: '⏱️' },
  { label: 'Encryption', value: 'AES-256', icon: '🔒' },
  { label: 'TLS Version', value: '1.3', icon: '🌐' },
  { label: 'Audit Score', value: '10/10', icon: '✅' },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,197,94,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              ← Back to Documentation
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-green-400 text-sm font-medium">🔒 Security Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Enterprise-Grade{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Security
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Protecting the machine economy with bank-level security, comprehensive compliance, 
              and zero-trust architecture.
            </p>
          </div>

          {/* Security Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {securityMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">{metric.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-gray-400">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {securityFeatures.map((feature) => (
              <div
                key={feature.title}
                className={`relative bg-gradient-to-br ${feature.gradient} border ${feature.borderColor} rounded-2xl p-6 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/60 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{feature.icon}</div>
                    <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
                  </div>
                  <ul className="space-y-3">
                    {feature.items.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-300">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Security Score Banner */}
          <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 text-center overflow-hidden mb-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15),transparent_70%)]" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                <span className="text-4xl">🛡️</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Security Score: <span className="text-green-400">10/10</span>
              </h3>
              <p className="text-gray-400 max-w-xl mx-auto mb-6">
                Our comprehensive security implementation ensures your data and transactions 
                are protected at all times with industry-leading practices.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  SOC 2 Ready
                </span>
                <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  GDPR Compliant
                </span>
                <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-800 rounded-full px-4 py-2 text-sm text-gray-300">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  PCI DSS Ready
                </span>
              </div>
            </div>
          </div>

          {/* Agent Security Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🤖</span>
              Agent-Specific Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-emerald-400">Identity & Access</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">→</span>
                    Cryptographic agent identity verification
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">→</span>
                    Spending limits and budget controls
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">→</span>
                    Reputation-based trust scoring
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">→</span>
                    Hierarchical permission inheritance
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-emerald-400">Transaction Security</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">→</span>
                    Programmable escrow with conditions
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">→</span>
                    Real-time fraud detection
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">→</span>
                    Automatic dispute resolution
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">→</span>
                    Complete audit trail for all transactions
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Security Team */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Security Questions?</h3>
            <p className="text-gray-400 mb-4">
              For security-related questions, vulnerability reports, or compliance inquiries.
            </p>
            <a
              href="mailto:security@mnnr.app"
              className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-lg transition-colors"
            >
              <span>📧</span> Contact Security Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
