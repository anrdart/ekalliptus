import { useEffect, useRef, useState } from 'react';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerDistance?: number;
}

export const useLazyLoad = (options: LazyLoadOptions = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const { threshold = 0.1, rootMargin = '50px', triggerDistance = 100 } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            // Start loading after a small delay to prevent immediate loading
            setTimeout(() => setIsLoaded(true), triggerDistance);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerDistance]);

  return { ref, isIntersecting, isLoaded };
};

// Lazy image component hook
export const useLazyImage = (src: string, options: LazyLoadOptions = {}) => {
  const { ref, isLoaded } = useLazyLoad(options);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setImageLoaded(true);
  }, [isLoaded, src]);

  return { ref, isLoaded: imageLoaded, shouldLoad: isLoaded };
};

// Lazy iframe component hook
export const useLazyIframe = (src: string, options: LazyLoadOptions = {}) => {
  const { ref, isLoaded } = useLazyLoad(options);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.onload = () => setIframeLoaded(true);
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    return () => {
      document.body.removeChild(iframe);
    };
  }, [isLoaded, src]);

  return { ref, isLoaded: iframeLoaded, shouldLoad: isLoaded };
};