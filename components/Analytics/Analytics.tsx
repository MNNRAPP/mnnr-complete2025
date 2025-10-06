'use client';

import { usePageTracking } from '@/hooks/usePageTracking';
import { usePostHog } from '@/providers/PostHogProvider';
import { useEffect } from 'react';

interface AnalyticsProps {
  eventName?: string;
  properties?: Record<string, unknown>;
}

export function Analytics({ eventName, properties }: AnalyticsProps) {
  const posthog = usePostHog();
  
  // Track page views automatically
  usePageTracking();

  useEffect(() => {
    // Track custom event if provided
    if (eventName && posthog) {
      posthog.capture(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
      });
    }
  }, [eventName, properties, posthog]);

  return null; // This component doesn't render anything
}

export default Analytics;