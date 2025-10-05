'use client';

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error reporting service
    logger.error('Application error boundary triggered', error, {
      digest: error.digest
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-900">
          Something went wrong!
        </h2>
        <p className="mb-6 text-red-700">
          We encountered an unexpected error. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try again
        </button>
        <div className="mt-4">
          <a
            href="/"
            className="text-sm text-red-600 underline hover:text-red-800"
          >
            Return to home
          </a>
        </div>
      </div>
    </div>
  );
}
