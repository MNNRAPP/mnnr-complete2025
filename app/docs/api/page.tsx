import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Reference - MNNR',
  description: 'Complete API documentation for Agent Economy APIs, webhooks, authentication, and subscription management.',
};

const apiCategories = [
  {
    title: 'Agent Economy APIs',
    icon: '🤖',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    borderColor: 'border-emerald-500/30',
    endpoints: [
      {
        method: 'POST',
        path: '/api/agents',
        description: 'Create agent economic identity with wallet, spending limits, and reputation',
      },
      {
        method: 'GET',
        path: '/api/agents/:id',
        description: 'Retrieve agent identity, balance, and transaction history',
      },
      {
        method: 'POST',
        path: '/api/streams',
        description: 'Create streaming payment channel for continuous micropayments',
      },
      {
        method: 'POST',
        path: '/api/escrow',
        description: 'Create programmable escrow with conditional release triggers',
      },
      {
        method: 'POST',
        path: '/api/x402',
        description: 'Process HTTP 402 Payment Required for sub-cent micropayments',
      },
      {
        method: 'GET',
        path: '/api/marketplace',
        description: 'Browse agent services with dynamic pricing and reputation scores',
      },
    ],
  },
  {
    title: 'Authentication',
    icon: '🔐',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/passkey/register/options',
        description: 'Get WebAuthn registration options for passkey setup',
      },
      {
        method: 'POST',
        path: '/api/auth/passkey/authenticate/options',
        description: 'Get authentication options for passkey login',
      },
      {
        method: 'POST',
        path: '/api/auth/api-keys',
        description: 'Generate API keys for programmatic access',
      },
    ],
  },
  {
    title: 'Payments & Billing',
    icon: '💳',
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30',
    endpoints: [
      {
        method: 'POST',
        path: '/api/webhooks/stripe',
        description: 'Handle Stripe webhook events for subscription management',
      },
      {
        method: 'GET',
        path: '/api/usage',
        description: 'Retrieve usage metrics and billing data',
      },
      {
        method: 'POST',
        path: '/api/checkout',
        description: 'Create checkout session for subscription upgrades',
      },
    ],
  },
  {
    title: 'System',
    icon: '⚙️',
    gradient: 'from-gray-500/20 to-slate-500/20',
    borderColor: 'border-gray-500/30',
    endpoints: [
      {
        method: 'GET',
        path: '/api/health',
        description: 'Check system health and service connectivity',
      },
      {
        method: 'GET',
        path: '/api/status',
        description: 'Get detailed platform status and metrics',
      },
    ],
  },
];

const codeExamples = {
  python: `import mnnr

# Initialize client
client = mnnr.Client(api_key="your-api-key")

# Create an agent identity
agent = client.agents.create(
    name="data-processor-agent",
    spending_limit=1000,
    currency="USD"
)

# Start a streaming payment
stream = client.streams.create(
    from_agent=agent.id,
    to_agent="service-provider-id",
    rate_per_second=0.001,
    max_duration=3600
)

# Create escrow with conditions
escrow = client.escrow.create(
    amount=50,
    conditions={
        "type": "task_completion",
        "verifier": "oracle-agent-id"
    }
)`,
  javascript: `import { MNNR } from '@mnnr/sdk';

// Initialize client
const client = new MNNR({ apiKey: 'your-api-key' });

// Create an agent identity
const agent = await client.agents.create({
  name: 'data-processor-agent',
  spendingLimit: 1000,
  currency: 'USD'
});

// Start a streaming payment
const stream = await client.streams.create({
  fromAgent: agent.id,
  toAgent: 'service-provider-id',
  ratePerSecond: 0.001,
  maxDuration: 3600
});

// Create escrow with conditions
const escrow = await client.escrow.create({
  amount: 50,
  conditions: {
    type: 'task_completion',
    verifier: 'oracle-agent-id'
  }
});`,
};

export default function ApiPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link href="/docs" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
              ← Back to Documentation
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-purple-400 text-sm font-medium">🔌 API Reference</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Agent Economy{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                APIs
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Complete API documentation for building autonomous agent systems with 
              payments, escrow, streaming, and marketplace functionality.
            </p>
          </div>

          {/* API Status Banner */}
          <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">API Status: Operational</span>
            </div>
            <span className="text-gray-400 text-sm">99.9% Uptime SLA</span>
          </div>

          {/* API Categories */}
          <div className="space-y-8 mb-16">
            {apiCategories.map((category) => (
              <div
                key={category.title}
                className={`relative bg-gradient-to-br ${category.gradient} border ${category.borderColor} rounded-2xl p-6 overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/60 rounded-2xl" />
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-3">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {category.endpoints.map((endpoint, index) => (
                      <div
                        key={index}
                        className="bg-black/40 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                            endpoint.method === 'GET' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {endpoint.method}
                          </span>
                          <div>
                            <code className="text-emerald-400 font-mono text-sm">{endpoint.path}</code>
                            <p className="text-gray-400 text-sm mt-1">{endpoint.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SDK Examples */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">💻</span>
              SDK Integration
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                  <span className="text-yellow-400">🐍</span>
                  <span className="text-white font-medium">Python SDK</span>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples.python}</code>
                </pre>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                  <span className="text-yellow-400">⚡</span>
                  <span className="text-white font-medium">JavaScript SDK</span>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                  <code>{codeExamples.javascript}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* x402 Protocol Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="text-3xl mr-3">⚡</span>
              x402 Protocol Integration
            </h3>
            <p className="text-gray-400 mb-6">
              Native support for HTTP 402 Payment Required responses, enabling sub-cent micropayments 
              for API calls, content access, and agent-to-agent transactions.
            </p>
            <div className="bg-black/40 border border-gray-700 rounded-lg p-4">
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`// x402 Payment Flow
HTTP/1.1 402 Payment Required
X-Payment-Required: true
X-Payment-Amount: 0.001
X-Payment-Currency: USD
X-Payment-Address: mnnr://agent/payment-endpoint

// Client responds with payment proof
POST /api/x402
Authorization: Bearer <payment-proof>
X-Payment-Hash: sha256:abc123...`}
              </pre>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-16">
            <h3 className="text-lg font-semibold text-white mb-4">Rate Limits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">1,000</div>
                <div className="text-sm text-gray-400">Requests/min (Free)</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">10,000</div>
                <div className="text-sm text-gray-400">Requests/min (Pro)</div>
              </div>
              <div className="text-center p-4 bg-black/40 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">Unlimited</div>
                <div className="text-sm text-gray-400">Enterprise</div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-gray-400 mb-4">
              For API support, integration questions, or to report issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:developers@mnnr.app"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-lg transition-colors"
              >
                <span>📧</span> Contact Developers
              </a>
              <a
                href="https://github.com/MNNRAPP/mnnr-complete2025"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <span>💬</span> GitHub Discussions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
