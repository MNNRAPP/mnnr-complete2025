// app/onboarding/OnboardingStepTwo.tsx — Create the first API key.
//
// Client component: it needs to POST /api/keys, render the plaintext key
// (returned once), and stash the key in localStorage so step 3 can pre-fill
// the curl. localStorage is a deliberate choice — server-side state would
// require either a session field on User (overkill for a UI hint) or a
// re-fetch of /api/keys, which would NOT include the plaintext key
// (post-creation it's never returned again).
//
// CSRF: we read the csrf cookie + send it in x-csrf-token because
// /api/keys POST uses the double-submit pattern (lib/csrf.ts).

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toasts/use-toast';

// Shared storage key — Step 3 reads from here. Namespaced so we never
// collide with unrelated app state.
const STORAGE_KEY = 'mnnr.onboarding.firstKey';

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function OnboardingStepTwo() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('My first MNNR key');
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const csrf = readCsrfCookie();
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'x-csrf-token': csrf } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify({ name: name.trim(), mode: 'live' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed (${res.status})`);
      }
      const data = await res.json();
      const plaintext: string | undefined = data?.apiKey?.key;
      if (!plaintext) throw new Error('Server did not return the plaintext key');
      setCreatedKey(plaintext);
      try {
        sessionStorage.setItem(STORAGE_KEY, plaintext);
      } catch {
        // sessionStorage can throw in private-browsing on iOS — non-fatal.
      }
      toast({
        title: 'API key created',
        description: 'Copy it now — you will not see it again.',
      });
    } catch (err: any) {
      toast({
        title: 'Could not create key',
        description: err?.message ?? 'Unknown error',
        variant: 'destructive' as any,
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy() {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked by permissions — user can still select+copy.
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Create your first API key</h2>
      <p className="mt-2 text-sm text-gray-400">
        Name it something you&apos;ll recognize later (e.g.{' '}
        <span className="text-gray-300">My first MNNR key</span>). You can
        revoke it any time from the dashboard.
      </p>

      {!createdKey ? (
        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="key-name"
              className="block text-sm font-medium text-gray-300"
            >
              Key name
            </label>
            <input
              id="key-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              autoFocus
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? 'Creating…' : 'Create API key'}
          </button>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-4 text-sm text-yellow-200">
            <strong className="block text-yellow-100">
              Save this key now — you will not see it again.
            </strong>
            <span>
              The plaintext key is shown only at creation time. We store a
              one-way hash, so a lost key must be revoked and recreated.
            </span>
          </div>

          <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-2">
              <code className="break-all font-mono text-sm text-emerald-300">
                {createdKey}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800"
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setCreatedKey(null);
                setName('My first MNNR key');
              }}
              className="text-sm text-gray-400 hover:text-gray-200"
            >
              ← Create another
            </button>
            <button
              type="button"
              onClick={() => router.push('/onboarding?step=3')}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
            >
              Got it, next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
