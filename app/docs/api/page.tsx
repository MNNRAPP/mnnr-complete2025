import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Reference - MNNR',
  description: 'Complete API documentation for webhooks, authentication, and subscription management.',
};

export default function ApiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📡 API Reference
          </h1>
          <p className="text-xl text-gray-600">
            Complete API documentation for MNNR platform integration
          </p>
        </div>

        {/* API Endpoints */}
        <div className="space-y-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Health Check</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p><code className="bg-gray-100 px-2 py-1 rounded">GET /api/health</code></p>
              <p>Check system health and connectivity status.</p>
              <h4>Response:</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}`}
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Authentication</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h4>WebAuthn Passkey Registration:</h4>
              <p><code className="bg-gray-100 px-2 py-1 rounded">POST /api/auth/passkey/register/options</code></p>
              <p>Get registration options for passkey setup.</p>

              <h4>WebAuthn Passkey Authentication:</h4>
              <p><code className="bg-gray-100 px-2 py-1 rounded">POST /api/auth/passkey/authenticate/options</code></p>
              <p>Get authentication options for passkey login.</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">Payments & Subscriptions</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h4>Stripe Webhooks:</h4>
              <p><code className="bg-gray-100 px-2 py-1 rounded">POST /api/webhooks/stripe</code></p>
              <p>Handle Stripe webhook events for subscription management.</p>

              <h4>Supported Events:</h4>
              <ul>
                <li>customer.subscription.created</li>
                <li>customer.subscription.updated</li>
                <li>customer.subscription.deleted</li>
                <li>invoice.payment_succeeded</li>
                <li>invoice.payment_failed</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 ml-3">SDK Integration</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h4>Python SDK:</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import mnnr

client = mnnr.Client(api_key="your-api-key")
payment = client.create_payment(amount=100, currency="USD")`}
              </pre>

              <h4>JavaScript SDK:</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { MNNR } from '@mnnr/sdk';

const client = new MNNR({ apiKey: 'your-api-key' });
const payment = await client.payments.create({
  amount: 100,
  currency: 'USD'
});`}
              </pre>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">API Status: Operational</h3>
          <p className="text-green-700 mb-4">
            All API endpoints are functioning normally with 99.9% uptime SLA.
          </p>
          <p className="text-sm text-green-600">
            For API support or integration questions, please contact our developer team.
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