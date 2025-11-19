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
          mouseEase: true, // Smooth mouse following
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          // Ekalliptus Theme Colors - subtle in light mode, vibrant in dark mode
          color: theme === 'light' ? 0xc8d5c4 : 0x7e9367, // Light sage green for light mode, vibrant green for dark
          color2: theme === 'light' ? 0xd9e4d3 : 0xb7b09e, // Very light mint for light mode, accent for dark
          backgroundColor: theme === 'light' ? 0xFAF8F5 : 0x000000, // Warm cream for light mode, black for dark mode
          size: theme === 'light' ? 3.5 : 5.0, // Slightly larger dots in light mode for visibility
          spacing: theme === 'light' ? 22.0 : 18.0, // Moderate spacing in light mode
          showLines: theme === 'light' ? false : true, // No lines in light mode to reduce visual complexity
          opacity: theme === 'light' ? 0.5 : 0.8, // Balanced opacity in light mode
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
  }, []); // Only run once on mount

  // Update all settings when theme changes
  useEffect(() => {
    if (vantaEffectRef.current) {
      console.log('Updating Vanta settings for theme:', theme);
      vantaEffectRef.current.setOptions({
        color: theme === 'light' ? 0xc8d5c4 : 0x7e9367,
        color2: theme === 'light' ? 0xd9e4d3 : 0xb7b09e,
        backgroundColor: theme === 'light' ? 0xFAF8F5 : 0x000000,
        size: theme === 'light' ? 3.5 : 5.0,
        spacing: theme === 'light' ? 22.0 : 18.0,
        showLines: theme === 'light' ? false : true,
        opacity: theme === 'light' ? 0.5 : 0.8,
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
        zIndex: -10,
      }}
    />
  );
};
