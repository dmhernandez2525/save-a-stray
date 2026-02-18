import React, { useState, useRef, useCallback } from 'react';
import { detectSwipeDirection } from '../lib/touch-gestures';
import { prefersReducedMotion } from '../lib/adaptive-loading';

interface SwipeableGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  onImageChange?: (index: number) => void;
}

const SwipeableGallery: React.FC<SwipeableGalleryProps> = ({
  images,
  alt = 'Gallery image',
  className = '',
  onImageChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const reducedMotion = prefersReducedMotion();

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(images.length - 1, index));
    setCurrentIndex(clamped);
    onImageChange?.(clamped);
  }, [images.length, onImageChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const direction = detectSwipeDirection(
      touchStartRef.current.x,
      touchStartRef.current.y,
      endX,
      endY
    );

    if (direction === 'left') goTo(currentIndex + 1);
    if (direction === 'right') goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  if (images.length === 0) {
    return (
      <div className={`bg-muted flex items-center justify-center h-64 rounded-lg ${className}`}>
        <span className="text-muted-foreground text-sm">No images</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <div
        className={`flex ${reducedMotion ? '' : 'transition-transform duration-300 ease-out'}`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${alt} ${i + 1}`}
            className="w-full h-64 object-cover flex-shrink-0"
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  i === currentIndex ? '' : ''
                }`}
                aria-label={`Go to image ${i + 1}`}
              >
                <span className={`block w-2 h-2 rounded-full ${
                  i === currentIndex ? 'bg-white shadow-sm' : 'bg-white/50'
                }`} />
              </button>
            ))}
          </div>
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default SwipeableGallery;
