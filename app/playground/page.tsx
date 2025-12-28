'use client';

import { useState } from 'react';
import Link from 'next/link';

const endpoints = [
  {
    id: 'track-usage',
    name: 'Track Usage',
    method: 'POST',
    path: '/v1/usage',
    description: 'Record usage for any metric type',
    body: {
      metric: 'tokens',
      value: 1500,
      model: 'gpt-4',
      userId: 'user_123',
    },
    response: {
      success: true,
      usage_id: 'usg_7x9k2m3n4o5p',
      balance: 8500,
      timestamp: '2025-01-01T00:00:00Z',
    },
  },
  {
    id: 'create-key',
    name: 'Create API Key',
    method: 'POST',
    path: '/v1/keys',
    description: 'Generate a new API key with custom permissions',
    body: {
      name: 'Production Key',
      permissions: ['usage:write', 'usage:read'],
      rateLimit: 1000,
      expiresAt: '2025-12-31T23:59:59Z',
    },
    response: {
      success: true,
      key: 'sk_live_xxxxxxxxxxxx',
      keyId: 'key_abc123',
      permissions: ['usage:write', 'usage:read'],
    },
  },
  {
    id: 'get-balance',
    name: 'Get Balance',
    method: 'GET',
    path: '/v1/balance',
    description: 'Retrieve current usage balance and limits',
    body: null,
    response: {
      balance: 8500,
      limit: 10000,
      used: 1500,
      resetAt: '2025-02-01T00:00:00Z',
      plan: 'pro',
    },
  },
  {
    id: 'list-usage',
    name: 'List Usage',
    method: 'GET',
    path: '/v1/usage?period=7d',
    description: 'Get usage history with filtering',
    body: null,
    response: {
      data: [
        { date: '2025-01-01', tokens: 5000, cost: 0.15 },
        { date: '2025-01-02', tokens: 3500, cost: 0.105 },
        { date: '2025-01-03', tokens: 4200, cost: 0.126 },
      ],
      total: { tokens: 12700, cost: 0.381 },
    },
  },
];

export default function PlaygroundPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const simulateRequest = () => {
    setIsLoading(true);
    setResponse(null);
    
    setTimeout(() => {
      setResponse(JSON.stringify(selectedEndpoint.response, null, 2));
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.1),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto px-6 py-12 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <span className="text-purple-400 text-sm font-medium">🎮 API Playground</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Try the API{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                instantly
              </span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Explore MNNR's API endpoints in this interactive playground. No signup required.
            </p>
          </div>

          {/* Playground */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Endpoint Selector */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Endpoints
                </h3>
                <div className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <button
                      key={endpoint.id}
                      onClick={() => {
                        setSelectedEndpoint(endpoint);
                        setResponse(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedEndpoint.id === endpoint.id
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : 'bg-gray-800/50 border border-transparent hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-mono px-2 py-0.5 rounded ${
                            endpoint.method === 'GET'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {endpoint.method}
                        </span>
                        <span className="text-white font-medium">{endpoint.name}</span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1 ml-12">
                        {endpoint.path}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Request/Response */}
            <div className="lg:col-span-2 space-y-6">
              {/* Request */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        selectedEndpoint.method === 'GET'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <code className="text-gray-300 text-sm">
                      https://api.mnnr.app{selectedEndpoint.path}
                    </code>
                  </div>
                  <button
                    onClick={simulateRequest}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-4 py-1.5 rounded-lg text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-400 text-sm mb-4">{selectedEndpoint.description}</p>
                  
                  {selectedEndpoint.body && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Request Body
                      </h4>
                      <pre className="bg-black/50 rounded-lg p-4 text-sm overflow-x-auto">
                        <code className="text-gray-300">
                          {JSON.stringify(selectedEndpoint.body, null, 2)}
                        </code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Response */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                  <span className="text-gray-400 text-sm font-medium">Response</span>
                  {response && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      200 OK
                    </span>
                  )}
                </div>
                <div className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : response ? (
                    <pre className="bg-black/50 rounded-lg p-4 text-sm overflow-x-auto">
                      <code className="text-emerald-400">{response}</code>
                    </pre>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Click "Send Request" to see the response
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/docs/api"
                  className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  📚 Full API Reference
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  🚀 Get Your API Key
                </Link>
              </div>
            </div>
          </div>

          {/* SDK Examples */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white text-center mb-8">
              Available in your favorite language
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'JavaScript', icon: '🟨', code: 'npm install @mnnr/sdk' },
                { name: 'Python', icon: '🐍', code: 'pip install mnnr' },
                { name: 'Go', icon: '🔵', code: 'go get github.com/mnnr/go-sdk' },
                { name: 'Rust', icon: '🦀', code: 'cargo add mnnr' },
              ].map((sdk) => (
                <div
                  key={sdk.name}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center hover:border-gray-700 transition-colors"
                >
                  <span className="text-3xl mb-2 block">{sdk.icon}</span>
                  <h3 className="text-white font-medium mb-2">{sdk.name}</h3>
                  <code className="text-xs text-gray-500 bg-black/50 px-2 py-1 rounded">
                    {sdk.code}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
