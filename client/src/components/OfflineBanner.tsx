import React, { useEffect, useState } from 'react';
import { isOnline, onOnlineStatusChange, onSyncComplete } from '../lib/pwa';

const OfflineBanner: React.FC = () => {
  const [online, setOnline] = useState(isOnline());
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = onOnlineStatusChange(setOnline);
    return cleanup;
  }, []);

  useEffect(() => {
    onSyncComplete((replayed, remaining) => {
      if (replayed > 0) {
        setSyncMessage(`Synced ${replayed} queued action${replayed > 1 ? 's' : ''}`);
        setTimeout(() => setSyncMessage(null), 4000);
      }
      if (remaining > 0) {
        setSyncMessage(`${remaining} action${remaining > 1 ? 's' : ''} still pending`);
      }
    });
  }, []);

  if (online && !syncMessage) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[60] text-center text-xs font-medium py-1.5 transition-colors ${
      online ? 'bg-green-500 text-white' : 'bg-amber-500 text-amber-950'
    }`}>
      {!online && 'You are offline. Changes will sync when reconnected.'}
      {online && syncMessage}
    </div>
  );
};

export default OfflineBanner;
