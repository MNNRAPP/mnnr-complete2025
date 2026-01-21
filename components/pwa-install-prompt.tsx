'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => {
        if (!localStorage.getItem('pwa-prompt-dismissed')) setShowPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 z-50">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-2xl">📱</span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold">Install MNNR App</h3>
          <p className="text-gray-400 text-sm mt-1">
            {isIOS ? 'Tap share then "Add to Home Screen"' : 'Add to home screen for quick access'}
          </p>
        </div>
        <button onClick={handleDismiss} className="text-gray-500 hover:text-gray-300 p-1">✕</button>
      </div>
      {!isIOS && deferredPrompt && (
        <div className="mt-4 flex gap-2">
          <button onClick={handleDismiss} className="flex-1 px-4 py-2 text-gray-400 hover:text-white">Later</button>
          <button onClick={handleInstall} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Install</button>
        </div>
      )}
    </div>
  );
}
