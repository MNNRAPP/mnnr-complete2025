'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/providers/PostHogProvider';

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    
    analytics.page(fullPath, {
      path: pathname,
      search: searchParams.toString(),
      title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    });
  }, [pathname, searchParams]);
}

export default usePageTracking;