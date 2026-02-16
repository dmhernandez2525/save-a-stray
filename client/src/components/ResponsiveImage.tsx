import React, { useState, useRef, useEffect } from 'react';
import { shouldLoadImages, getLoadingTier } from '../lib/adaptive-loading';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  placeholder?: string;
}

const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  sizes = DEFAULT_SIZES,
  loading = 'lazy',
  placeholder,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  if (!shouldLoadImages() && !placeholder) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-xs text-muted-foreground">Image hidden (slow connection)</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-xs text-muted-foreground">Failed to load</span>
      </div>
    );
  }

  const tier = getLoadingTier();
  const qualityParam = tier === 'full' ? '' : tier === 'reduced' ? '?q=60' : '?q=30';
  const optimizedSrc = src + qualityParam;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default ResponsiveImage;
