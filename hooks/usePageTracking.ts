'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePostHog } from 'posthog-js/react';

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog) {
      const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

      posthog.capture('$pageview', {
        $current_url: fullPath,
        $pathname: pathname,
        $search: searchParams.toString(),
        title: document.title,
        referrer: document.referrer,
      });
    }
  }, [pathname, searchParams, posthog]);
}

export default usePageTracking;