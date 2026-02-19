import React, { useState, useRef, useEffect, useCallback } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  draggable?: boolean;
  rootMargin?: number;
  priority?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = React.memo(
  ({
    src,
    alt,
    className = "",
    draggable = true,
    rootMargin = 100,
    priority = false,
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (priority) return;
      const el = containerRef.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { rootMargin: `${rootMargin}px` },
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [rootMargin, priority]);

    const handleLoad = useCallback(() => setIsLoaded(true), []);
    const handleError = useCallback(() => {
      setHasError(true);
      setIsLoaded(true);
    }, []);

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-full overflow-hidden ${className}`}>
        <div
          className={`absolute inset-0 bg-bg-secondary overflow-hidden z-1 transition-opacity duration-300 ${
            isLoaded ? "opacity-0 pointer-events-none" : ""
          }`}>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.04)_40%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.04)_60%,transparent_100%)] animate-[shimmer_1.8s_infinite_ease-in-out]" />
        </div>

        {isInView && !hasError && (
          <img
            src={src}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover z-2 transition-opacity duration-350 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "low"}
            decoding="async"
            draggable={draggable}
          />
        )}

        {hasError && (
          <div className="absolute inset-0 bg-bg-tertiary flex items-center justify-center z-2">
            <div className="size-8 rounded bg-white/6" />
          </div>
        )}
      </div>
    );
  },
);

LazyImage.displayName = "LazyImage";

export default LazyImage;
