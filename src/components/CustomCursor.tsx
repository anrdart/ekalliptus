import { useEffect, useRef, useState } from "react";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for macOS specifically
    const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const media = window.matchMedia("(pointer: coarse)");
    const shouldRenderCursor = !media.matches;

    setShouldRender(shouldRenderCursor);

    // Additional macOS-specific handling
    if (isMacOS && shouldRenderCursor) {
      // Force hide macOS cursor behaviors
      document.documentElement.style.setProperty('-webkit-user-select', 'none', 'important');
      document.documentElement.style.setProperty('-webkit-touch-callout', 'none', 'important');
      document.documentElement.style.setProperty('-webkit-tap-highlight-color', 'transparent', 'important');
    }

    const handleChange = (event: MediaQueryListEvent) => {
      setShouldRender(!event.matches);
    };

    media.addEventListener("change", handleChange);
    return () => {
      media.removeEventListener("change", handleChange);
      // Cleanup macOS specific styles
      if (isMacOS) {
        document.documentElement.style.removeProperty('-webkit-user-select');
        document.documentElement.style.removeProperty('-webkit-touch-callout');
        document.documentElement.style.removeProperty('-webkit-tap-highlight-color');
      }
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const className = "custom-cursor-enabled";
    if (shouldRender) {
      document.body.classList.add(className);

      // Force hide all cursors immediately and comprehensively
      const forceHideCursors = () => {
        if (document.body.classList.contains(className)) {
          // Hide cursor on root elements
          document.body.style.cursor = 'none';
          document.documentElement.style.cursor = 'none';

          // Hide cursors on all child elements except inputs
          const allElements = document.querySelectorAll('*');
          allElements.forEach(el => {
            if (!el.matches('input, textarea, select, [contenteditable]')) {
              (el as HTMLElement).style.cursor = 'none';
            }
          });

          // Specifically handle input elements
          const inputs = document.querySelectorAll('input, textarea, select, [contenteditable]');
          inputs.forEach(el => {
            (el as HTMLElement).style.cursor = 'text';
          });

          // Force hide on any elements that might override
          const style = document.createElement('style');
          style.id = 'custom-cursor-force-hide';
          style.textContent = `
            .custom-cursor-enabled *,
            .custom-cursor-enabled::before,
            .custom-cursor-enabled::after {
              cursor: none !important;
              -webkit-cursor: none !important;
            }
            .custom-cursor-enabled input,
            .custom-cursor-enabled textarea,
            .custom-cursor-enabled select,
            .custom-cursor-enabled [contenteditable] {
              cursor: text !important;
              -webkit-cursor: text !important;
            }
            /* macOS specific aggressive hiding */
            @media screen and (-webkit-min-device-pixel-ratio: 0) {
              .custom-cursor-enabled *,
              .custom-cursor-enabled::before,
              .custom-cursor-enabled::after {
                cursor: none !important;
                -webkit-cursor: none !important;
                -webkit-user-select: none !important;
                -webkit-touch-callout: none !important;
              }
            }
          `;
          document.head.appendChild(style);
        }
      };

      // Apply immediately
      forceHideCursors();

      // Use MutationObserver to watch for any cursor changes
      const observer = new MutationObserver((mutations) => {
        let needsUpdate = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' &&
              (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
            needsUpdate = true;
          }
        });
        if (needsUpdate) {
          // Small delay to ensure DOM updates are complete
          setTimeout(forceHideCursors, 0);
        }
      });

      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'style'],
        subtree: true,
        childList: true
      });

      // Also observe document element
      const docObserver = new MutationObserver(() => {
        if (document.documentElement.style.cursor !== 'none') {
          document.documentElement.style.cursor = 'none';
        }
      });

      docObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style']
      });

      return () => {
        observer.disconnect();
        docObserver.disconnect();
        // Remove injected style
        const injectedStyle = document.getElementById('custom-cursor-force-hide');
        if (injectedStyle) {
          injectedStyle.remove();
        }
        document.body.classList.remove(className);
        document.body.style.cursor = '';
        document.documentElement.style.cursor = '';
      };
    } else {
      document.body.classList.remove(className);
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
    }
    return () => {
      document.body.classList.remove(className);
      document.body.style.cursor = '';
      document.documentElement.style.cursor = '';
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let rafId: number | null = null;

    const setOpacity = (visible: boolean) => {
      const opacity = visible ? "1" : "0";
      cursor.style.opacity = opacity;
      follower.style.opacity = visible ? "0.45" : "0";
    };

    const moveCursor = (event: PointerEvent) => {
      const { clientX, clientY } = event;

      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      rafId = window.requestAnimationFrame(() => {
        // Ensure absolute positioning with high specificity
        cursor.style.position = 'fixed';
        cursor.style.left = `${clientX}px`;
        cursor.style.top = `${clientY}px`;
        cursor.style.zIndex = '9999';

        follower.style.position = 'fixed';
        follower.style.left = `${clientX}px`;
        follower.style.top = `${clientY}px`;
        follower.style.zIndex = '9998';

        setOpacity(true);
      });
    };

    const addHoverState = () => {
      cursor.classList.add("cursor-hover");
      follower.classList.add("cursor-follower-hover");
    };

    const removeHoverState = () => {
      cursor.classList.remove("cursor-hover");
      follower.classList.remove("cursor-follower-hover");
    };

    const handlePointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, [role='button'], .cursor-interactive, .language-button")) {
        addHoverState();
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, [role='button'], .cursor-interactive, .language-button")) {
        removeHoverState();
      }
    };

    const handlePointerDown = () => {
      // Ensure cursor stays hidden during click - macOS aggressive approach
      if (document.body.classList.contains("custom-cursor-enabled")) {
        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';

        // macOS specific: force hide on all elements during interaction
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          if (!el.matches('input, textarea, select, [contenteditable]')) {
            (el as HTMLElement).style.setProperty('cursor', 'none', 'important');
            (el as HTMLElement).style.setProperty('-webkit-cursor', 'none', 'important');
          }
        });
      }
    };

    const handlePointerUp = () => {
      // Re-ensure cursor stays hidden after click - macOS aggressive approach
      if (document.body.classList.contains("custom-cursor-enabled")) {
        document.body.style.cursor = 'none';
        document.documentElement.style.cursor = 'none';

        // macOS specific: reapply hiding after interaction
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          if (!el.matches('input, textarea, select, [contenteditable]')) {
            (el as HTMLElement).style.setProperty('cursor', 'none', 'important');
            (el as HTMLElement).style.setProperty('-webkit-cursor', 'none', 'important');
          }
        });
      }
    };

    const handlePointerLeaveDocument = () => {
      setOpacity(false);
      removeHoverState();
    };

    const handlePointerEnter = () => setOpacity(true);

    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("pointerenter", handlePointerEnter, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeaveDocument, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerout", handlePointerOut, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerenter", handlePointerEnter);
      window.removeEventListener("pointerleave", handlePointerLeaveDocument);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <>
      <div ref={cursorRef} className="custom-cursor hidden md:block opacity-0" />
      <div ref={followerRef} className="cursor-follower hidden md:block opacity-0" />
    </>
  );
};
