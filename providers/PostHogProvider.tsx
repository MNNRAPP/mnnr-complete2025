'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { PostHog } from 'posthog-js';
import posthog from 'posthog-js';
import { logger } from '@/utils/logger';
import { PostHogProvider as PostHogProviderCore } from 'posthog-js/react';

// Initialize PostHog
const initPostHog = (): PostHog | null => {
  if (typeof window !== 'undefined') {
    // Skip initialization if no key provided
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY === 'phc_demo_key_replace_with_real_key') {
      logger.warn('PostHog key not configured - analytics disabled');
      return null;
    }

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      loaded: (posthog: PostHog) => {
        logger.debug('PostHog loaded successfully');
      },
      autocapture: {
        dom_event_allowlist: ['click', 'change', 'submit'],
        url_allowlist: [window.location.origin],
        element_allowlist: ['button', 'a', 'form', 'input', 'select', 'textarea']
      },
      capture_pageview: true,
      capture_pageleave: true,
      enable_recording_console_log: true,
      bootstrap: {
        distinctID: undefined,
      },
    });

    // Optional session recording sampling (env: NEXT_PUBLIC_POSTHOG_RECORDING_SAMPLE = 0..1)
    const sampleStr = process.env.NEXT_PUBLIC_POSTHOG_RECORDING_SAMPLE;
    const sample = sampleStr ? Number(sampleStr) : 0;
    const withinRange = !Number.isNaN(sample) && sample > 0 && sample <= 1;
    const enableRecording = withinRange ? Math.random() < sample : false;
    if (enableRecording) {
      // Methods are optional on older SDKs; use optional chaining
      posthog.startSessionRecording?.();
    } else {
      posthog.stopSessionRecording?.();
    }

    return posthog;
  }
  return null;
};

const PostHogContext = createContext<PostHog | null>(null);

export const usePostHog = () => {
  const context = useContext(PostHogContext);
  return context;
};

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const [posthog, setPosthog] = useState<PostHog | null>(null);

  useEffect(() => {
    const ph = initPostHog();
    setPosthog(ph);

    return () => {
      if (ph) {
        ph.reset();
      }
    };
  }, []);

  if (!posthog) {
    return <>{children}</>;
  }

  return (
    <PostHogContext.Provider value={posthog}>
      <PostHogProviderCore client={posthog}>
        {children}
      </PostHogProviderCore>
    </PostHogContext.Provider>
  );
}

// Analytics tracking functions
export const analytics = {
  track: (event: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(event, properties);
    }
  },
  
  identify: (userId: string, traits?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.identify(userId, traits);
    }
  },
  
  page: (pageName?: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('$pageview', {
        page: pageName || window.location.pathname,
        ...properties,
      });
    }
  },
  
  alias: (alias: string) => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.alias(alias);
    }
  },
  
  reset: () => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.reset();
    }
  },
  
  group: (groupType: string, groupKey: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.group(groupType, groupKey, properties);
    }
  },
  
  // Custom MNNR business events
  business: {
    paymentInitiated: (amount: number, currency: string = 'USD', planType?: string) => {
      analytics.track('Payment Initiated', {
        amount,
        currency,
        plan_type: planType,
        timestamp: new Date().toISOString(),
      });
    },
    
    applicationSubmitted: (formData?: Record<string, unknown>) => {
      analytics.track('Application Submitted', {
        form_data: formData,
        timestamp: new Date().toISOString(),
      });
    },
    
    pilotContactRequested: (source: string = 'unknown') => {
      analytics.track('Pilot Contact Requested', {
        source,
        timestamp: new Date().toISOString(),
      });
    },
    
    featureUsed: (feature: string, details?: Record<string, unknown>) => {
      analytics.track('Feature Used', {
        feature,
        details,
        timestamp: new Date().toISOString(),
      });
    },
    
    errorEncountered: (error: string, context?: Record<string, unknown>) => {
      analytics.track('Error Encountered', {
        error,
        context,
        timestamp: new Date().toISOString(),
      });
    },
  },
};

// Add PostHog to window for console debugging
declare global {
  interface Window {
    posthog?: PostHog;
  }
}