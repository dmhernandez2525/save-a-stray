import React from 'react';
import { checkFreshness } from '../lib/offline-sync';

interface FreshnessIndicatorProps {
  cachedAt: number;
  className?: string;
}

const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({ cachedAt, className = '' }) => {
  const { isStale, label } = checkFreshness(cachedAt);

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isStale ? 'bg-amber-400' : 'bg-green-400'}`} />
      <span className="text-muted-foreground">
        {isStale ? `Cached ${label}` : `Updated ${label}`}
      </span>
    </span>
  );
};

export default FreshnessIndicator;
