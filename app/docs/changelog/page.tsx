import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Changelog - MNNR',
  description: 'Track all updates, security improvements, and new features in our detailed changelog.',
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📝 Changelog
          </h1>
          <p className="text-xl text-gray-600">
            Latest updates, security improvements, and new features
          </p>
        </div>

        {/* Version History */}
        <div className="space-y-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-green-600">v1.0.0</span>
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-900">Initial Release</h2>
                <p className="text-sm text-gray-500">August 16, 2025</p>
              </div>
            </div>
            <div className="prose prose-gray max-w-none">
              <h4>✨ New Features</h4>
              <ul>
                <li>Multi-rail payment processing (USDC + Stripe fallback)</li>
                <li>WebAuthn passkey authentication</li>
                <li>Real-time payment verification</li>
                <li>SDK support for Python and JavaScript</li>
                <li>Enterprise monitoring and logging</li>
              </ul>

              <h4>🔒 Security</h4>
              <ul>
                <li>AES-256 encryption for sensitive data</li>
                <li>Redis-based rate limiting</li>
                <li>Comprehensive input validation</li>
                <li>Sentry error monitoring integration</li>
                <li>Security headers and CORS configuration</li>
              </ul>

              <h4>🚀 Performance</h4>
              <ul>
                <li>Sub-100ms API response times</li>
                <li>Optimized database queries</li>
                <li>Efficient caching strategies</li>
                <li>Horizontal scaling support</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">v1.0.1</span>
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-900">Security & Performance Updates</h2>
                <p className="text-sm text-gray-500">August 17, 2025</p>
              </div>
            </div>
            <div className="prose prose-gray max-w-none">
              <h4>🔒 Security Improvements</h4>
              <ul>
                <li>Enhanced WebAuthn implementation with better error handling</li>
                <li>Improved rate limiting with more granular controls</li>
                <li>Updated dependencies for security patches</li>
                <li>Strengthened password policies</li>
              </ul>

              <h4>🐛 Bug Fixes</h4>
              <ul>
                <li>Fixed webhook signature verification edge cases</li>
                <li>Resolved memory leak in payment processing</li>
                <li>Improved error messages for better debugging</li>
                <li>Fixed timezone handling in logs</li>
              </ul>

              <h4>📈 Performance</h4>
              <ul>
                <li>Optimized database connection pooling</li>
                <li>Reduced API response latency by 15%</li>
                <li>Improved caching hit rates</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-purple-600">v1.1.0</span>
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-900">Enterprise Features</h2>
                <p className="text-sm text-gray-500">August 20, 2025</p>
              </div>
            </div>
            <div className="prose prose-gray max-w-none">
              <h4>🏢 Enterprise Features</h4>
              <ul>
                <li>Advanced monitoring dashboard</li>
                <li>Role-based access control (RBAC)</li>
                <li>Audit logging for compliance</li>
                <li>Custom integration APIs</li>
                <li>Priority support channels</li>
              </ul>

              <h4>🔧 API Improvements</h4>
              <ul>
                <li>New webhook event types</li>
                <li>Enhanced API documentation</li>
                <li>Better error responses</li>
                <li>Request/response logging</li>
              </ul>

              <h4>📱 UI/UX Enhancements</h4>
              <ul>
                <li>Improved admin dashboard</li>
                <li>Better mobile responsiveness</li>
                <li>Enhanced accessibility features</li>
                <li>Dark mode support</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-orange-600">v1.2.0</span>
              </div>
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-900">AI Integration & Automation</h2>
                <p className="text-sm text-gray-500">August 25, 2025</p>
              </div>
            </div>
            <div className="prose prose-gray max-w-none">
              <h4>🤖 AI Features</h4>
              <ul>
                <li>AI-powered payment risk assessment</li>
                <li>Automated fraud detection</li>
                <li>Smart routing for payment rails</li>
                <li>Predictive analytics dashboard</li>
              </ul>

              <h4>⚡ Automation</h4>
              <ul>
                <li>Automated payment reconciliation</li>
                <li>Smart retry logic for failed payments</li>
                <li>Automated scaling based on load</li>
                <li>Self-healing infrastructure</li>
              </ul>

              <h4>🔗 Integrations</h4>
              <ul>
                <li>Slack notifications for payment events</li>
                <li>Zapier integration</li>
                <li>Webhook delivery guarantees</li>
                <li>Third-party monitoring tools</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Current Version: v1.2.0</h3>
          <p className="text-gray-700 mb-4">
            All versions include security patches and bug fixes. Enterprise customers receive priority updates.
          </p>
          <div className="flex justify-center space-x-4 text-sm text-gray-600">
            <span>📧 Security updates: security@mnnr.app</span>
            <span>🔄 Auto-updates: Enabled</span>
            <span>📊 Uptime: 99.9%</span>
          </div>
        </div>

        {/* Back to Docs */}
        <div className="text-center mt-12">
          <Link
            href="/docs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}