import type { Config } from 'tailwindcss'
import tailwindAnimate from 'tailwindcss-animate'

export default {
    darkMode: 'class',
    content: [
        './components/**/*.{js,vue,ts}',
        './layouts/**/*.vue',
        './pages/**/*.vue',
        './plugins/**/*.{js,ts}',
        './composables/**/*.{js,ts}',
        './config/**/*.ts',
        './utils/**/*.{js,vue,ts}',
        './app.vue',
        './error.vue'
    ],
    theme: {
        extend: {
            colors: {
                // Primary - Ekalliptus Green
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                // Secondary - Warm Beige
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                // Accent
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                // Background & Foreground
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                // Card
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                // Popover
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                // Muted
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                // Destructive
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                // Border, Input, Ring
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif']
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'fade-out': {
                    from: { opacity: '1', transform: 'translateY(0)' },
                    to: { opacity: '0', transform: 'translateY(10px)' }
                },
                'slide-in-right': {
                    from: { transform: 'translateX(100%)' },
                    to: { transform: 'translateX(0)' }
                },
                'slide-out-right': {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(100%)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'fade-out': 'fade-out 0.5s ease-out',
                'slide-in-right': 'slide-in-right 0.3s ease-out',
                'slide-out-right': 'slide-out-right 0.3s ease-out',
                float: 'float 3s ease-in-out infinite',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            },
            backdropBlur: {
                xs: '2px'
            },
            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }
        }
    },
    plugins: [tailwindAnimate]
} satisfies Config
