import React, { useEffect, useState, useCallback } from 'react';
import { promptInstall, isStandalone } from '../lib/pwa';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const InstallPrompt: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const checkDismissal = useCallback((): boolean => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (!dismissed) return false;
    const timestamp = parseInt(dismissed, 10);
    if (Date.now() - timestamp > DISMISS_DURATION_MS) {
      localStorage.removeItem(DISMISS_KEY);
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    if (isStandalone()) return;

    const onPromptAvailable = (): void => {
      if (!checkDismissal()) setVisible(true);
    };

    window.addEventListener('pwa:install-prompt-available', onPromptAvailable);
    return () => {
      window.removeEventListener('pwa:install-prompt-available', onPromptAvailable);
    };
  }, [checkDismissal]);

  const handleInstall = async (): Promise<void> => {
    const accepted = await promptInstall();
    if (accepted) setVisible(false);
  };

  const handleDismiss = (): void => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50 bg-card border border-border rounded-xl shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground">Install Save A Stray</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Get quick access, offline browsing, and notifications for new pets near you.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
