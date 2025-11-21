import { useEffect, useState } from 'react';

export const PreLoader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Always show for minimum 1200ms on mobile for better UX
    // This gives PreLoader + VantaBackground time to coordinate
    const minDisplayTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    return () => clearTimeout(minDisplayTimer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500"
      style={{
        background: 'linear-gradient(135deg, #0a0f0a, #1a1f1a)',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {/* Logo or brand name */}
      <div className="text-center">
        {/* Spinning loader */}
        <div className="relative mx-auto mb-6 h-16 w-16">
          <div
            className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: 'rgba(126, 147, 103, 0.3)',
              borderTopColor: 'transparent',
            }}
          />
          <div
            className="absolute inset-2 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: 'rgba(183, 176, 158, 0.3)',
              borderTopColor: 'transparent',
              animationDirection: 'reverse',
              animationDuration: '1.5s',
            }}
          />
        </div>

        {/* Brand text */}
        <h2
          className="text-2xl font-bold tracking-wider animate-pulse"
          style={{ color: '#7e9367' }}
        >
          Ekalliptus
        </h2>
        <p
          className="mt-2 text-sm tracking-wide opacity-60"
          style={{ color: '#b7b09e' }}
        >
          Digital Agency
        </p>
      </div>

      {/* Inline animation styles */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
