'use client';

import { useState, useEffect } from 'react';
import { maskApiKey } from '@/utils/api-keys';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export default function ApiKeysManager({ userId }: { userId: string }) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      setKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, mode: 'live' })
      });

      const data = await response.json();
      
      if (data.apiKey) {
        setNewlyCreatedKey(data.apiKey.key);
        setKeys([data.apiKey, ...keys]);
        setNewKeyName('');
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating key:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await fetch(`/api/keys?id=${keyId}`, { method: 'DELETE' });
      setKeys(keys.filter(k => k.id !== keyId));
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">API Keys</h2>
          <p className="text-gray-400 text-sm">
            Generate and manage API keys for your applications
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Create Key
        </button>
      </div>

      {/* New Key Alert */}
      {newlyCreatedKey && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-emerald-400 text-2xl">🔑</div>
            <div className="flex-1">
              <h3 className="text-emerald-400 font-semibold mb-2">
                API Key Created Successfully!
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Make sure to copy your API key now. You won't be able to see it again!
              </p>
              <div className="bg-black rounded p-3 font-mono text-sm break-all flex items-center justify-between gap-3">
                <code className="text-emerald-400">{newlyCreatedKey}</code>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  📋 Copy
                </button>
              </div>
              <button
                onClick={() => setNewlyCreatedKey(null)}
                className="mt-3 text-sm text-gray-400 hover:text-white"
              >
                I've saved my key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="font-semibold mb-3">Create New API Key</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., Production API)"
              className="flex-1 bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              onKeyPress={(e) => e.key === 'Enter' && createKey()}
            />
            <button
              onClick={createKey}
              disabled={creating || !newKeyName.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewKeyName('');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keys List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading keys...</div>
      ) : keys.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔑</div>
          <p className="text-gray-400 mb-4">No API keys yet</p>
          <p className="text-gray-500 text-sm">
            Create your first API key to start using the MNNR API
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{key.name}</h3>
                    {key.is_active ? (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <code className="bg-black px-3 py-1 rounded font-mono">
                      {maskApiKey(key.key_prefix)}
                    </code>
                    <span>
                      Created {new Date(key.created_at).toLocaleDateString()}
                    </span>
                    {key.last_used_at && (
                      <span>
                        Last used {new Date(key.last_used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="text-red-400 hover:text-red-300 px-4 py-2 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="font-semibold mb-2 text-sm text-gray-300">Usage Example</h3>
        <pre className="text-xs text-gray-400 overflow-x-auto">
          <code>{`curl https://api.mnnr.app/v1/usage \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"tokens": 1500, "model": "gpt-4"}'`}</code>
        </pre>
      </div>
    </div>
  );
}
