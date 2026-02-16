import React, { useEffect, useState } from 'react';
import { getQueueSize } from '../lib/offline-sync';
import { isOnline } from '../lib/pwa';

type SyncStatus = 'synced' | 'pending' | 'offline';

const SyncStatusIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const check = async (): Promise<void> => {
      if (!isOnline()) {
        setStatus('offline');
        return;
      }

      const count = await getQueueSize();
      setPendingCount(count);
      setStatus(count > 0 ? 'pending' : 'synced');
    };

    check();
    const interval = setInterval(check, 10000);

    const onOnline = (): void => { check(); };
    const onOffline = (): void => { setStatus('offline'); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const config = {
    synced: { dot: 'bg-green-400', label: 'All changes saved' },
    pending: { dot: 'bg-amber-400 animate-pulse', label: `${pendingCount} pending` },
    offline: { dot: 'bg-red-400', label: 'Offline' },
  };

  const { dot, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

export default SyncStatusIndicator;
