import { useEffect, useRef } from 'react';
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
  const vantaEffectRef = useRef<VantaEffect | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let mounted = true;

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
      threeScript.async = false; // Load synchronously for correct order

      // Load Vanta Dots
      const vantaScript = document.createElement('script');
      vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js';
      vantaScript.async = false;

      // Wait for both to load
      threeScript.onload = () => {
        console.log('Three.js loaded');
        vantaScript.onload = () => {
          console.log('Vanta loaded');
          if (mounted) {
            setTimeout(initVanta, 100); // Small delay to ensure DOM is ready
          }
        };
        document.head.appendChild(vantaScript);
      };

      document.head.appendChild(threeScript);
    };

    const initVanta = () => {
      if (!vantaRef.current || vantaEffectRef.current) return;

      console.log('Initializing Vanta with theme:', theme);

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
          // Ekalliptus Theme Colors
          color: theme === 'light' ? 0x4f6f46 : 0x7e9367, // Primary/Secondary green
          color2: theme === 'light' ? 0x7e9367 : 0xb7b09e, // Secondary/Accent
          backgroundColor: theme === 'light' ? 0xf9f6f0 : 0x14201a, // Light/Dark background
          size: 4.0,
          spacing: 20.0,
          showLines: true,
        });

        vantaEffectRef.current = effect;
        console.log('Vanta effect initialized successfully');
      } catch (error) {
        console.error('Vanta initialization error:', error);
      }
    };

    loadScripts();

    return () => {
      mounted = false;
      if (vantaEffectRef.current) {
        vantaEffectRef.current.destroy();
        vantaEffectRef.current = null;
      }
    };
  }, []);

  // Update colors when theme changes
  useEffect(() => {
    if (vantaEffectRef.current) {
      console.log('Updating Vanta colors for theme:', theme);
      vantaEffectRef.current.setOptions({
        color: theme === 'light' ? 0x4f6f46 : 0x7e9367,
        color2: theme === 'light' ? 0x7e9367 : 0xb7b09e,
        backgroundColor: theme === 'light' ? 0xf9f6f0 : 0x14201a,
      });
    }
  }, [theme]);

  return (
    <div
      ref={vantaRef}
      className="fixed inset-0"
      style={{
        width: '100vw',
        height: '100vh',
        zIndex: -20,
        pointerEvents: 'none',
      }}
    />
  );
};
