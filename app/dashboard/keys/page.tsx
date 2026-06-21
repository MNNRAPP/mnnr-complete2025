// app/dashboard/keys/page.tsx — API key management.
//
// Wraps the existing ApiKeysManager client component (which already handles
// list / create / revoke against /api/keys). The Suspense fallback below is
// a no-op for this build because ApiKeysManager owns its own loading state,
// but is wired up so we can later switch to a server-fetched initial list
// without restructuring.

import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getOrCreateUser } from '@/lib/user';
import ApiKeysManager from '@/components/dashboard/ApiKeysManager';
import { Skeleton } from '@/components/ui/Skeleton';

export const metadata: Metadata = {
  title: 'API Keys | MNNR Dashboard',
  description: 'Create, list, and revoke MNNR API keys.',
};

export const dynamic = 'force-dynamic';

export default async function KeysPage() {
  const user = await getOrCreateUser();
  // Defensive — layout already redirects, but a stray render path shouldn't
  // crash with a null user.
  if (!user) return null;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="mt-1 text-sm text-gray-400">
          Generate keys, rotate them, and revoke any that leak. Keys are
          shown in plaintext once — at creation time — and never again.
        </p>
      </header>

      <Suspense
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        }
      >
        <ApiKeysManager userId={user.id} />
      </Suspense>
    </div>
  );
}
