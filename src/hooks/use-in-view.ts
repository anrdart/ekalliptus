import { useEffect, useRef, useState } from "react";

export type UseInViewOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
};

export function useInView<T extends HTMLElement = HTMLElement>(options: UseInViewOptions = {}) {
  const { root = null, rootMargin = "0px", threshold = 0.2, once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // Fallback for unsupported environments: reveal immediately
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { root, rootMargin, threshold },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [root, rootMargin, threshold, once]);

  return { ref, inView } as const;
}