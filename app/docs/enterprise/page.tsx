import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Enterprise Features - MNNR',
  description: 'Enterprise-grade features including monitoring, logging, and advanced security configurations.',
};

const enterpriseFeatures = [
  {
    title: 'Advanced Monitoring',
    icon: '📊',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    items: [
      'Real-time performance metrics',
      'Custom dashboards and alerts',
      'Distributed tracing',
      'Anomaly detection',
      'SLA monitoring',
    ],
  },
  {
    title: 'Comprehensive Logging',
    icon: '📋',
    gradient: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    items: [
      'Structured logging with context',
      'Log aggregation and analysis',
      'Audit trails for compliance',
      'Log retention policies',
      'Search and filtering capabilities',
    ],
  },
  {
    title: 'Enhanced Security',
    icon: '🔐',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    items: [
      'Advanced rate limiting',
      'IP whitelisting/blacklisting',
      'Multi-region deployment',
      'Zero-trust architecture',
      'Security incident response',
    ],
  },
  {
    title: 'Admin Controls',
    icon: '⚙️',
    gradient: 'from-orange-500/20 to-amber-500/20',
    borderColor: 'border-orange-500/30',
    items: [
      'User management dashboard',
      'Role-based access control',
      'API key management',
      'Usage analytics',
      'Configuration management',
    ],
  },
  {
    title: 'Priority Support',
    icon: '💎',
    gradient: 'from-red-500/20 to-rose-500/20',
    borderColor: 'border-red-500/30',
    items: [
      '24/7 technical support',
      'Dedicated account manager',
      'Custom integration assistance',
      'Quarterly business reviews',
      'Emergency response SLA',
    ],
  },
  {
    title: 'Performance Optimization',
    icon: '⚡',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    borderColor: 'border-cyan-500/30',
    items: [
      'Auto-scaling infrastructure',
      'Database optimization',
      'CDN integration',
      'Caching strategies',
      'Performance monitoring',
    ],
  },
];

const enterpriseMetrics = [
  { label: 'Uptime SLA', value: '99.99%', icon: '⏱️', description: 'Guaranteed availability' },
  { label: 'Response Time', value: '<50ms', icon: '⚡', description: 'Global API latency' },
  { label: 'Support', value: '24/7', icon: '🛟', description: 'Enterprise support' },
  { label: 'Agents', value: 'Unlimited', icon: '🤖', description: 'No agent limits' },
];

export default function EnterprisePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              ← Back to Documentation
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-orange-400 text-sm font-medium">🏢 Enterprise</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Scale Your{' '}
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                Agent Fleet
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Mission-critical infrastructure for enterprises deploying thousands of autonomous agents 
              with advanced monitoring, security, and dedicated support.
            </p>
          </div>

          {/* Enterprise Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {enterpriseMetrics.map((metric) => (
              <div
                key={metric.label}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center hover:border-orange-500/30 transition-colors"
              >
                <div className="text-2xl mb-2">{metric.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-sm text-gray-400">{metric.label}</div>
                <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
              </div>
            ))}
          </div>

          {/* Enterprise Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {enterpriseFeatures.map((feature) => (
              <div
                key={feature.title}
                className={`relative bg-gradient-to-br ${feature.gradient} border ${feature.borderColor} rounded-2xl p-6 overflow-hidden hover:scale-[1.02] transition-transform`}
              >
                <div className="absolute inset-0 bg-black/60 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{feature.icon}</span>
                    <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {feature.items.map((item, index) => (
                      <li key={index} className="flex items-center text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Agent Fleet Management */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🤖</span>
              Agent Fleet Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-orange-400">Fleet Operations</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    Centralized agent deployment and orchestration
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    Hierarchical budget allocation across agent groups
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    Real-time fleet health monitoring dashboard
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    Automated agent scaling based on demand
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-orange-400">Financial Controls</h4>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    Multi-level spending approvals and limits
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    Department-level budget tracking
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    Custom billing cycles and invoicing
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-400 mr-2">→</span>
                    Detailed cost attribution per agent/task
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why Enterprise Banner */}
          <div className="relative bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-8 text-center overflow-hidden mb-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15),transparent_70%)]" />
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Scale Your Agent Operations?
              </h3>
              <p className="text-gray-400 max-w-xl mx-auto mb-6">
                Get custom pricing, dedicated infrastructure, and white-glove onboarding 
                for your enterprise agent deployment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:enterprise@mnnr.app"
                  className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Contact Sales
                </a>
                <a
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">Enterprise Compliance</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                SOC 2 Type II
              </span>
              <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                GDPR
              </span>
              <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                HIPAA Ready
              </span>
              <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                ISO 27001
              </span>
              <span className="inline-flex items-center gap-2 bg-black/40 border border-gray-700 rounded-full px-4 py-2 text-sm text-gray-300">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                PCI DSS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
