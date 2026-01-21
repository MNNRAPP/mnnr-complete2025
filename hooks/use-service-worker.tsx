'use client';

import { useEffect } from 'react';

export function useServiceWorker() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Every hour

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // New content available, show update notification
                  console.log('[PWA] New content available, refresh to update');
                  
                  // Optionally dispatch custom event
                  window.dispatchEvent(new CustomEvent('sw-update-available'));
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service worker registration failed:', error);
        });

      // Handle controller change (new service worker took over)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);
}

// Component to use in layout
export function ServiceWorkerRegistration() {
  useServiceWorker();
  return null;
}
