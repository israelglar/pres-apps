import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook to handle PWA installation
 *
 * Returns:
 * - canInstall: Whether the app can be installed
 * - promptInstall: Function to trigger the install prompt
 * - isInstalled: Whether the app was just installed
 * - isRunningInPWA: Whether the app is currently running in standalone mode
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isRunningInPWA, setIsRunningInPWA] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsRunningInPWA(isStandalone);

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Save the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt for next time
    setDeferredPrompt(null);
    setCanInstall(false);
  }, [deferredPrompt]);

  // Function to open the PWA app from browser
  const openPWAApp = useCallback(() => {
    // Get the current origin (e.g., https://yourdomain.com)
    const appUrl = window.location.origin;

    // Try to open the PWA app
    // This will work if the app is installed and registered
    window.location.href = appUrl;
  }, []);

  return {
    canInstall,
    promptInstall,
    isInstalled,
    isRunningInPWA,
    openPWAApp,
  };
}
