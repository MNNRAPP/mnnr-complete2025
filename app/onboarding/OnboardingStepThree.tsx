// app/onboarding/OnboardingStepThree.tsx — first authenticated API call.
//
// Pre-fills a curl snippet with the user's plaintext key (cached from
// step 2 in sessionStorage). If the user reloaded or jumped into step 3
// directly, we fall back to a `<YOUR-API-KEY>` placeholder.
//
// The target endpoint is GET /api/keys (no charge, no side effects, owns
// the user's data). That keeps the demo grounded in something the user can
// reason about — they create a key in step 2, and step 3 lists their keys
// with that key.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toasts/use-toast';

const STORAGE_KEY = 'mnnr.onboarding.firstKey';

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://mnnr.app');

export default function OnboardingStepThree() {
  const router = useRouter();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string>('<YOUR-API-KEY>');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (cached) setApiKey(cached);
    } catch {
      // sessionStorage can be blocked — non-fatal, fall back to placeholder.
    }
  }, []);

  const curlCommand = `curl -H "Authorization: Bearer ${apiKey}" \\
  ${APP_BASE_URL}/api/keys`;

  async function copyCurl() {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Copied to clipboard' });
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Select the text and copy manually.',
        variant: 'destructive' as any,
      });
    }
  }

  const sampleResponse = JSON.stringify(
    {
      keys: [
        {
          id: '01HXYZ-…-d3',
          name: 'My first MNNR key',
          key_prefix: 'mnnr_live_a8',
          is_active: true,
          created_at: '2026-06-19T22:14:09.812Z',
          last_used_at: null,
        },
      ],
    },
    null,
    2,
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Make your first API call</h2>
      <p className="mt-2 text-sm text-gray-400">
        Copy this curl command into a terminal and run it. It calls{' '}
        <code className="rounded bg-zinc-800 px-1 text-emerald-300">
          GET /api/keys
        </code>{' '}
        authenticated with your new key, and lists every key on your account.
      </p>

      <div className="mt-6">
        <div className="overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              terminal
            </span>
            <button
              type="button"
              onClick={copyCurl}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-700"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-emerald-300">
            <code>{curlCommand}</code>
          </pre>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-300">Expected response</p>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs text-gray-300">
          <code>{sampleResponse}</code>
        </pre>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-gray-300">
        <p className="font-medium text-white">What just happened?</p>
        <ul className="mt-2 space-y-1 text-xs text-gray-400">
          <li>
            • Your Authorization header was matched to a hashed key in our DB.
          </li>
          <li>
            • The handler bound your Clerk identity into a Postgres RLS session
            variable so only YOUR rows came back.
          </li>
          <li>
            • A <code>data.access</code> event landed in your audit trail.
          </li>
        </ul>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/onboarding?step=2')}
          className="text-sm text-gray-400 hover:text-gray-200"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => router.push('/onboarding?step=4')}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-400"
        >
          I&apos;ve run the curl →
        </button>
      </div>
    </div>
  );
}
