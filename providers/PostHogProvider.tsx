'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PostHogProviderCore } from 'posthog-js/react';
import { logger } from '@/utils/logger';

let posthogClient: typeof posthog | undefined;

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!posthogKey || posthogKey === 'phc_demo_key_replace_with_real_key') {
    logger.warn('PostHog key not configured - analytics disabled');
  } else {
    posthog.init(posthogKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      // We manually capture pageviews in the usePageTracking hook
      capture_pageview: false,
      loaded: () => logger.debug('PostHog loaded successfully'),
      autocapture: {
        dom_event_allowlist: ['click', 'change', 'submit'],
        url_allowlist: [window.location.origin],
        element_allowlist: ['button', 'a', 'form', 'input', 'select', 'textarea'],
      },
      capture_pageleave: true,
      enable_recording_console_log: true,
    });

    const sampleStr = process.env.NEXT_PUBLIC_POSTHOG_RECORDING_SAMPLE;
    const sample = sampleStr ? Number(sampleStr) : 0;
    const withinRange = !Number.isNaN(sample) && sample > 0 && sample <= 1;
    if (withinRange && Math.random() < sample) {
      posthog.startSessionRecording?.();
    }

    posthogClient = posthog;
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!posthogClient) {
    return <>{children}</>;
  }
  return <PostHogProviderCore client={posthogClient}>{children}</PostHogProviderCore>;
}

declare global {
  interface Window {
    posthog?: typeof posthog;
  }
}

if (typeof window !== 'undefined') {
  window.posthog = posthogClient;
}