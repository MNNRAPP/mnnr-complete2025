import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Security Guide - MNNR',
  description: 'Comprehensive security documentation covering MNNR platform security implementation and best practices.',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔒 Security Guide
          </h1>
          <p className="text-xl text-gray-600">
            Enterprise-grade security implementation with 10/10 security score
          </p>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Authentication</h2>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>• WebAuthn passkey authentication</li>
              <li>• Multi-factor authentication support</li>
              <li>• Secure session management</li>
              <li>• Rate limiting on auth endpoints</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Data Protection</h2>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>• AES-256 encryption at rest</li>
              <li>• TLS 1.3 encryption in transit</li>
              <li>• Database field-level encryption</li>
              <li>• Secure key management</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Infrastructure</h2>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>• Redis-based rate limiting</li>
              <li>• Sentry error monitoring</li>
              <li>• Comprehensive logging</li>
              <li>• Automated security updates</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Compliance</h2>
            </div>
            <ul className="text-gray-600 space-y-2">
              <li>• SOC 2 Type II ready</li>
              <li>• GDPR compliant</li>
              <li>• PCI DSS considerations</li>
              <li>• Regular security audits</li>
            </ul>
          </div>
        </div>

        {/* Security Score */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-green-800 mb-2">Security Score: 10/10</h3>
          <p className="text-green-700 mb-4">
            Our comprehensive security implementation ensures your data and transactions are protected at all times.
          </p>
          <p className="text-sm text-green-600">
            For security-related questions or concerns, please contact our security team.
          </p>
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