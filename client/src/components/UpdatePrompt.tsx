import React, { useEffect, useState } from 'react';
import { applyServiceWorkerUpdate } from '../lib/pwa';

const UpdatePrompt: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onUpdate = (): void => setVisible(true);
    window.addEventListener('pwa:sw-update-available', onUpdate);
    return () => window.removeEventListener('pwa:sw-update-available', onUpdate);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-80 z-50 bg-card border border-border rounded-xl shadow-lg p-4">
      <h3 className="font-semibold text-sm text-foreground">Update Available</h3>
      <p className="text-xs text-muted-foreground mt-1">
        A new version of Save A Stray is ready. Refresh to get the latest features.
      </p>
      <div className="flex gap-2 mt-3">
        <button
          onClick={applyServiceWorkerUpdate}
          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Refresh
        </button>
        <button
          onClick={() => setVisible(false)}
          className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;
