import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window { __bip?: BeforeInstallPromptEvent | null }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(window.__bip ?? null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios && !isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__bip = e as BeforeInstallPromptEvent;
      setDeferredPrompt(window.__bip);
    };

    const handleBipCaptured = () => {
      setDeferredPrompt(window.__bip ?? null);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      window.__bip = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('bip-captured', handleBipCaptured);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('bip-captured', handleBipCaptured);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'ios' | 'unavailable'> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        window.__bip = null;
        setDeferredPrompt(null);
      }
      return outcome;
    } else if (isIOS) {
      setShowIOSGuide(true);
      return 'ios';
    }
    return 'unavailable';
  }, [deferredPrompt, isIOS]);

  const closeIOSGuide = useCallback(() => {
    setShowIOSGuide(false);
  }, []);

  return {
    canInstall: !isInstalled && (Boolean(deferredPrompt) || isIOS),
    hasNativePrompt: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    showIOSGuide,
    setShowIOSGuide,
    closeIOSGuide,
    promptInstall,
  };
}
