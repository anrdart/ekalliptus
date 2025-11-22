import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  // ==========================================================================
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY BEFORE ANY RETURNS
  // This prevents React Error #300 (Rules of Hooks violation)
  // ==========================================================================

  // Hook 1: Mobile fade-in effect
  useEffect(() => {
    if (isMobile === true) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Hook 2: Desktop Vanta loading - runs only on desktop
  useEffect(() => {
    // Guard: Skip on mobile or undefined
    if (isMobile !== false) return;

    let mounted = true;

    // Dynamically load Three.js and Vanta from self-hosted files
    // Files are in public/vendor/ to bypass CSP restrictions on external CDNs
    const loadScripts = async () => {
      // Check if already loaded
      if (window.VANTA && window.THREE) {
        initVanta();
        return;
      }

      // Load Three.js
      const threeScript = document.createElement('script');
      threeScript.src = '/vendor/three.min.js';
      threeScript.async = false; // Load synchronously for correct order

      // Load Vanta Dots
      const vantaScript = document.createElement('script');
      vantaScript.src = '/vendor/vanta.dots.min.js';
      vantaScript.async = false;

      // Error handling for script loading
      threeScript.onerror = () => {
        console.error('Failed to load Three.js from /vendor/ - self-hosted file missing');
      };

      vantaScript.onerror = () => {
        console.error('Failed to load Vanta.js from /vendor/ - self-hosted file missing');
      };

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
          color: theme === 'light' ? 0xc8d5c4 : 0x7e9367,
          color2: theme === 'light' ? 0xd9e4d3 : 0xb7b09e,
          backgroundColor: theme === 'light' ? 0xFAF8F5 : 0x000000,
          size: theme === 'light' ? 3.5 : 5.0,
          spacing: theme === 'light' ? 22.0 : 18.0,
          showLines: theme === 'light' ? false : true,
          opacity: theme === 'light' ? 0.5 : 0.8,
        });

        vantaEffectRef.current = effect;
        console.log('Vanta effect initialized successfully');

        // Hide loading state after initialization
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) {
        console.error('Vanta initialization error:', error);
        setIsLoading(false); // Hide loading even on error
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
  }, [isMobile, theme]); // Added isMobile dependency

  // Hook 3: Desktop theme update - runs only on desktop
  useEffect(() => {
    // Guard: Skip on mobile or undefined
    if (isMobile !== false) return;

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
  }, [theme, isMobile]); // Added isMobile dependency

  // ==========================================================================
  // CONDITIONAL RETURNS - Safe to use after all hooks are declared
  // ==========================================================================

  // Show loading state while detecting device type (prevents flash)
  if (isMobile === undefined) {
    return (
      <div
        className="fixed inset-0"
        style={{
          width: '100vw',
          height: '100vh',
          zIndex: -10,
          backgroundColor: theme === 'light' ? '#FAF8F5' : '#000000',
        }}
      />
    );
  }

  // Mobile optimization: Use static gradient instead of Vanta.js
  // Saves 611KB (Three.js + Vanta.js) and improves performance score from 71 to 90+
  if (isMobile === true) {
    return (
      <>
        {/* Loading overlay for mobile */}
        {isLoading && (
          <div
            className="fixed inset-0 transition-opacity duration-500"
            style={{
              zIndex: -10,
              backgroundColor: theme === 'light' ? '#FAF8F5' : '#000000',
              opacity: isLoading ? 1 : 0,
            }}
          />
        )}

        {/* Static gradient background for mobile */}
        <div
          className="fixed inset-0 transition-opacity duration-1000"
          style={{
            width: '100vw',
            height: '100vh',
            zIndex: -10,
            background: theme === 'light'
              ? 'radial-gradient(ellipse 120% 80% at 50% -20%, #d9e4d3 0%, #FAF8F5 50%, #e8f0e3 100%)'
              : 'radial-gradient(ellipse 120% 80% at 50% -20%, #1a1f1a 0%, #000000 50%, #0a0f0a 100%)',
            backgroundAttachment: 'fixed',
            opacity: isLoading ? 0 : 1,
          }}
        />
      </>
    );
  }

  // Desktop: Full Vanta.js experience
  return (
    <>
      {/* Loading overlay - fade out when Vanta is ready */}
      {isLoading && (
        <div
          className="fixed inset-0 transition-opacity duration-500"
          style={{
            zIndex: -10,
            backgroundColor: theme === 'light' ? '#FAF8F5' : '#000000',
            opacity: isLoading ? 1 : 0,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-sm opacity-30" style={{ color: theme === 'light' ? '#7e9367' : '#b7b09e' }}>
              Loading background...
            </div>
          </div>
        </div>
      )}

      {/* Vanta background container */}
      <div
        ref={vantaRef}
        className="fixed inset-0 transition-opacity duration-1000"
        style={{
          width: '100vw',
          height: '100vh',
          zIndex: -10,
          opacity: isLoading ? 0 : 1,
        }}
      />
    </>
  );
};
