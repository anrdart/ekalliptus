import { useEffect, useState } from "react";

type Phase = "typing" | "pausing" | "deleting";

export function useTypewriter(words: string[], options?: { typingSpeed?: number; deletingSpeed?: number; pauseTime?: number }) {
  const { typingSpeed = 90, deletingSpeed = 45, pauseTime = 1400 } = options ?? {};
  const [phase, setPhase] = useState<Phase>("typing");
  const [wordIndex, setWordIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);

  useEffect(() => {
    if (!words.length) return;

    const currentWord = words[wordIndex] ?? "";

    if (phase === "typing") {
      if (subIndex === currentWord.length) {
        setPhase("pausing");
        return;
      }
      const timeout = window.setTimeout(() => setSubIndex(subIndex + 1), typingSpeed);
      return () => window.clearTimeout(timeout);
    }

    if (phase === "deleting") {
      if (subIndex === 0) {
        setWordIndex((wordIndex + 1) % words.length);
        setPhase("typing");
        return;
      }
      const timeout = window.setTimeout(() => setSubIndex(subIndex - 1), deletingSpeed);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => setPhase("deleting"), pauseTime);
    return () => window.clearTimeout(timeout);
  }, [words, wordIndex, subIndex, phase, typingSpeed, deletingSpeed, pauseTime]);

  return words[wordIndex]?.slice(0, subIndex) ?? "";
}
