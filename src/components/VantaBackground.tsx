import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Vanta types
interface VantaEffect {
  destroy: () => void;
  setOptions: (options: any) => void;
}

declare global {
  interface Window {
    VANTA: {
      DOTS: (options: any) => VantaEffect;
    };
    THREE: any;
  }
}

export const VantaBackground = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<VantaEffect | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Dynamically load Three.js and Vanta
    const loadScripts = async () => {
      // Check if already loaded
      if (window.VANTA && window.THREE) {
        initVanta();
        return;
      }

      // Load Three.js
      const threeScript = document.createElement('script');
      threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
      threeScript.async = true;

      // Load Vanta Dots
      const vantaScript = document.createElement('script');
      vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js';
      vantaScript.async = true;

      // Wait for both to load
      threeScript.onload = () => {
        vantaScript.onload = () => {
          initVanta();
        };
        document.body.appendChild(vantaScript);
      };

      document.body.appendChild(threeScript);
    };

    const initVanta = () => {
      if (!vantaRef.current || vantaEffect) return;

      try {
        const effect = window.VANTA.DOTS({
          el: vantaRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          // Ekalliptus Theme Colors - Dark Mode
          color: theme === 'light' ? 0x4f6f46 : 0x7e9367, // Primary/Secondary green
          color2: theme === 'light' ? 0x7e9367 : 0xb7b09e, // Secondary/Accent
          backgroundColor: theme === 'light' ? 0xf9f6f0 : 0x14201a, // Light/Dark background
          size: 3.5,
          spacing: 25.0,
          showLines: true,
        });

        setVantaEffect(effect);
      } catch (error) {
        console.error('Vanta initialization error:', error);
      }
    };

    loadScripts();

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, []);

  // Update colors when theme changes
  useEffect(() => {
    if (vantaEffect) {
      vantaEffect.setOptions({
        color: theme === 'light' ? 0x4f6f46 : 0x7e9367,
        color2: theme === 'light' ? 0x7e9367 : 0xb7b09e,
        backgroundColor: theme === 'light' ? 0xf9f6f0 : 0x14201a,
      });
    }
  }, [theme, vantaEffect]);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0 -z-10"
      style={{
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};
