import { useEffect, useRef, useState } from "react";

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: coarse)");
    setShouldRender(!media.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setShouldRender(!event.matches);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const className = "custom-cursor-enabled";
    if (shouldRender) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    return () => {
      document.body.classList.remove(className);
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
        cursor.style.left = `${clientX}px`;
        cursor.style.top = `${clientY}px`;
        follower.style.left = `${clientX}px`;
        follower.style.top = `${clientY}px`;
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
      if (target?.closest("a, button, [role='button'], .cursor-interactive")) {
        addHoverState();
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("a, button, [role='button'], .cursor-interactive")) {
        removeHoverState();
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
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerout", handlePointerOut, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("pointerenter", handlePointerEnter);
      window.removeEventListener("pointerleave", handlePointerLeaveDocument);
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
