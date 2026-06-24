// app/error.tsx — page-scoped error boundary.
//
// Next 14 mounts this when a server / client component below the root
// throws. Sentry is wired via instrumentation (see PR #31) so reporting
// happens automatically; we additionally log via our own logger for
// dev/log-aggregator parity.
//
// Branded dark theme to match the rest of the app. The "Try again"
// button is just `reset()` — Next re-renders the failed subtree, which
// is enough for transient hiccups (race conditions, network blips).

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { logger } from '@/utils/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error boundary triggered', error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-lg border border-red-500/30 bg-red-500/5 p-6 text-center">
        <h2 className="mb-2 text-2xl font-bold text-white">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-gray-300">
          We hit an unexpected error. Our team has been notified
          automatically.
        </p>
        {error.digest && (
          <p className="mb-6 font-mono text-xs text-gray-500">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Try again
          </button>
          <Link
            href="/"
            className="text-sm text-gray-400 underline hover:text-gray-200"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
