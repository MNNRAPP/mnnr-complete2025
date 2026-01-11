'use client';

import { useState } from 'react';

interface DemoData {
  user: { id: string; email: string; name: string | null } | null;
  keys: Array<{
    id: string;
    name: string;
    prefix: string;
    created_at: Date | string;
    last_used_at: Date | string | null;
  }>;
  usage: {
    total_requests: number;
    total_tokens: number;
    models_used: number;
    keys_used: number;
  };
}

export default function DemoDashboard({ initialData }: { initialData: DemoData }) {
  const [data, setData] = useState(initialData);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createKey = async () => {
    if (!newKeyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create key');
      }

      // Show the new key (only shown once)
      setNewKey(result.api_key.key);
      setNewKeyName('');

      // Refresh keys list
      const keysRes = await fetch('/api/v1/keys');
      const keysData = await keysRes.json();
      if (keysData.success) {
        setData(prev => ({ ...prev, keys: keysData.keys }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create key');
    } finally {
      setLoading(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/keys?id=${keyId}`, { method: 'DELETE' });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to revoke key');
      }

      // Refresh keys list
      const keysRes = await fetch('/api/v1/keys');
      const keysData = await keysRes.json();
      if (keysData.success) {
        setData(prev => ({ ...prev, keys: keysData.keys }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to revoke key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={data.usage.total_requests.toLocaleString()} />
        <StatCard label="Total Tokens" value={data.usage.total_tokens.toLocaleString()} />
        <StatCard label="Models Used" value={data.usage.models_used.toString()} />
        <StatCard label="Active Keys" value={data.keys.length.toString()} />
      </div>

      {/* New Key Created Alert */}
      {newKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-emerald-400 font-semibold mb-2">API Key Created!</h3>
              <p className="text-white/60 text-sm mb-4">
                Copy this key now. It will not be shown again.
              </p>
              <code className="block bg-black/50 px-4 py-3 rounded-lg text-emerald-300 font-mono text-sm break-all">
                {newKey}
              </code>
            </div>
            <button
              onClick={() => {
                copyToClipboard(newKey);
                setNewKey(null);
              }}
              className="px-4 py-2 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition"
            >
              Copy & Close
            </button>
          </div>
        </div>
      )}

      {/* Create New Key */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Create API Key</h2>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g., Production, Testing)"
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
            disabled={loading}
          />
          <button
            onClick={createKey}
            disabled={loading || !newKeyName.trim()}
            className="px-6 py-3 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Key'}
          </button>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Your API Keys</h2>
        
        {data.keys.length === 0 ? (
          <p className="text-white/40 text-center py-8">
            No API keys yet. Create one above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {data.keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between bg-black/30 rounded-lg px-4 py-3"
              >
                <div>
                  <div className="text-white font-medium">{key.name}</div>
                  <div className="text-white/40 text-sm font-mono">{key.prefix}...</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white/60 text-sm">
                      Created {new Date(key.created_at).toLocaleDateString()}
                    </div>
                    {key.last_used_at && (
                      <div className="text-white/40 text-xs">
                        Last used {new Date(key.last_used_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded transition"
                    disabled={loading}
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Usage Example */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Start</h2>
        <p className="text-white/60 mb-4">
          Track usage by calling our API with your key:
        </p>
        <pre className="bg-black/50 rounded-lg p-4 overflow-x-auto">
          <code className="text-sm font-mono">
            <span className="text-cyan-400">curl</span>
            <span className="text-white"> -X POST https://mnnr.app/api/v1/track \</span>
            {'\n'}
            <span className="text-white/50">  -H </span>
            <span className="text-emerald-400">&quot;Authorization: Bearer YOUR_API_KEY&quot;</span>
            <span className="text-white"> \</span>
            {'\n'}
            <span className="text-white/50">  -H </span>
            <span className="text-emerald-400">&quot;Content-Type: application/json&quot;</span>
            <span className="text-white"> \</span>
            {'\n'}
            <span className="text-white/50">  -d </span>
            <span className="text-purple-400">{'\'{\"model\": \"gpt-4\", \"tokens\": 1500}\''}</span>
          </code>
        </pre>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="text-3xl font-bold text-emerald-400 mb-1">{value}</div>
      <div className="text-white/50 text-sm">{label}</div>
    </div>
  );
}
