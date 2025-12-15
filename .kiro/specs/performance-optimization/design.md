# Design Document: Performance Optimization

## Overview

Dokumen ini menjelaskan arsitektur dan implementasi untuk optimasi performa website ekalliptus.com menggunakan Nuxt 3. Implementasi akan memanfaatkan fitur bawaan Nuxt untuk code splitting, lazy loading, dan SSR optimization. Fokus utama adalah meningkatkan Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1) tanpa mengubah UI/UX design yang sudah ada.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Optimization                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Build Time Optimizations                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │ Code Split  │  │ Tree Shake  │  │ CSS Purge   │         │ │
│  │  │ (Rollup)    │  │ (Rollup)    │  │ (Tailwind)  │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │ Minify JS   │  │ Minify CSS  │  │ Compress    │         │ │
│  │  │ (Terser)    │  │ (cssnano)   │  │ (gzip/br)   │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Runtime Optimizations                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │ Lazy Load   │  │ Async Load  │  │ Prefetch    │         │ │
│  │  │ Components  │  │ Scripts     │  │ Routes      │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │ Passive     │  │ Debounce/   │  │ rAF/rIC     │         │ │
│  │  │ Listeners   │  │ Throttle    │  │ Scheduling  │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Asset Optimizations                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │ Image Opt   │  │ Font Opt    │  │ Preload     │         │ │
│  │  │ (WebP)      │  │ (swap)      │  │ Hints       │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   Caching Strategy                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │ │
│  │  │ HTTP Cache  │  │ Edge Cache  │  │ Browser     │         │ │
│  │  │ Headers     │  │ (CF Pages)  │  │ Cache       │         │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Performance Utilities

```typescript
// composables/usePerformance.ts
interface PerformanceUtils {
  // Debounce function for expensive operations
  debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void

  // Throttle function for rate limiting
  throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void

  // Schedule non-critical work
  scheduleIdleTask(callback: () => void): void

  // Measure component render time
  measureRender(componentName: string): void
}
```

### 2. Lazy Component Loader

```typescript
// utils/lazyComponents.ts
interface LazyComponentConfig {
  loader: () => Promise<Component>
  loadingComponent?: Component
  errorComponent?: Component
  delay?: number
  timeout?: number
}

// Usage: const LazyFAQ = defineLazyComponent(config)
```

### 3. Image Optimization Config

```typescript
// types/performance.types.ts
interface ImageOptimizationConfig {
  formats: ('webp' | 'avif' | 'png' | 'jpg')[]
  quality: number
  sizes: string
  loading: 'lazy' | 'eager'
  fetchpriority?: 'high' | 'low' | 'auto'
}

interface CriticalImageConfig {
  src: string
  width: number
  height: number
  alt: string
  fetchpriority: 'high'
  loading: 'eager'
}
```

### 4. Cache Headers Config

```typescript
// types/performance.types.ts
interface CacheConfig {
  // Hashed assets (JS, CSS chunks)
  immutable: {
    maxAge: number // 31536000 (1 year)
    immutable: true
  }
  // HTML pages
  html: {
    maxAge: number // 0
    mustRevalidate: true
  }
  // Static assets (images, fonts)
  static: {
    maxAge: number // 86400 (1 day)
    staleWhileRevalidate: number
  }
}
```

## Data Models

### Bundle Size Targets

```typescript
// config/performance.config.ts
export const performanceTargets = {
  bundles: {
    mainJs: 200 * 1024,      // 200KB gzipped
    mainCss: 50 * 1024,      // 50KB gzipped
    vendorJs: 150 * 1024,    // 150KB gzipped
    totalInitial: 400 * 1024 // 400KB total initial load
  },
  metrics: {
    lcp: 2500,    // 2.5 seconds
    fid: 100,     // 100ms
    cls: 0.1,     // 0.1 score
    ttfb: 800,    // 800ms
    fcp: 1800     // 1.8 seconds
  },
  images: {
    maxFaviconSize: 10 * 1024, // 10KB
    maxLogoSize: 50 * 1024     // 50KB
  }
}
```

### Lazy Loading Configuration

```typescript
// config/lazyLoad.config.ts
export const lazyLoadConfig = {
  // Components to lazy load
  components: {
    FAQ: {
      delay: 200,
      rootMargin: '100px'
    },
    Services: {
      delay: 100,
      rootMargin: '200px'
    },
    ContactCTA: {
      delay: 200,
      rootMargin: '100px'
    }
  },
  // Scripts to defer
  scripts: {
    vanta: {
      defer: true,
      fetchpriority: 'low'
    },
    three: {
      defer: true,
      fetchpriority: 'low'
    }
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified:

### Property 1: JavaScript Bundle Size Limit
*For any* production build output, the main JavaScript bundle SHALL be smaller than 200KB when gzipped
**Validates: Requirements 1.1**

### Property 2: Icon Import Specificity
*For any* component file that imports icons, the import statement SHALL use named imports for specific icons rather than importing the entire library
**Validates: Requirements 1.5**

### Property 3: Image WebP Format
*For any* image asset in the public directory (excluding favicons and SVGs), the image SHALL be in WebP format or have a WebP variant available
**Validates: Requirements 2.1**

### Property 4: Image Attributes Completeness
*For any* img element in Vue components, the element SHALL include width, height, and alt attributes, and non-critical images SHALL include loading="lazy"
**Validates: Requirements 2.2, 2.4**

### Property 5: Favicon Size Limit
*For any* favicon PNG file in the public directory, the file size SHALL be under 10KB
**Validates: Requirements 2.5**

### Property 6: Font Display Swap
*For any* @font-face declaration in CSS files, the declaration SHALL include font-display: swap
**Validates: Requirements 3.1**

### Property 7: Lazy Component Pattern
*For any* below-the-fold component (FAQ, Services, ContactCTA), the component SHALL be loaded using defineAsyncComponent or Nuxt's lazy loading pattern
**Validates: Requirements 4.1**

### Property 8: Modal Conditional Rendering
*For any* modal component in Vue files, the modal content SHALL use v-if directive for conditional rendering rather than v-show
**Validates: Requirements 4.4**

### Property 9: NuxtLink Usage
*For any* internal navigation link in Vue components, the link SHALL use NuxtLink component for automatic prefetching
**Validates: Requirements 4.5**

### Property 10: CSS Bundle Size Limit
*For any* production build output, the main CSS bundle SHALL be smaller than 50KB when gzipped
**Validates: Requirements 5.3**

### Property 11: GPU-Accelerated Animations
*For any* CSS animation or transition, the animation SHALL use transform and/or opacity properties for GPU acceleration
**Validates: Requirements 5.4**

### Property 12: Backdrop Filter Fallback
*For any* CSS rule using backdrop-filter, the rule SHALL include a fallback background color for unsupported browsers
**Validates: Requirements 5.5**

### Property 13: Resource Hints Completeness
*For any* external domain used by the application, there SHALL be a dns-prefetch or preconnect link tag in the document head
**Validates: Requirements 6.4, 6.5**

### Property 14: Passive Event Listeners
*For any* scroll, touchstart, or touchmove event listener in Vue components, the listener SHALL use the passive option
**Validates: Requirements 7.1**

### Property 15: Observer Cleanup
*For any* IntersectionObserver or ResizeObserver created in a Vue component, the observer SHALL be disconnected in onUnmounted lifecycle hook
**Validates: Requirements 7.2**

### Property 16: Debounce/Throttle Usage
*For any* resize, scroll, or input event handler that performs expensive operations, the handler SHALL use debounce or throttle
**Validates: Requirements 7.4**

## Error Handling

### Build Errors
- If bundle size exceeds target, log warning with size breakdown
- If tree shaking fails, fall back to full import with warning
- If CSS purge removes needed classes, add to safelist

### Runtime Errors
- If lazy component fails to load, show error boundary with retry option
- If Vanta.js fails to initialize, show static gradient fallback
- If font fails to load, use system font stack fallback

### Performance Degradation
- If LCP exceeds 4 seconds, log performance warning
- If CLS exceeds 0.25, identify and log shifting elements
- If main thread blocked > 50ms, log long task warning

## Testing Strategy

### Unit Testing (Vitest)
- Test debounce/throttle utility functions
- Test lazy component loader configuration
- Test performance measurement utilities

### Property-Based Testing (fast-check)
- Test bundle size constraints across different build configurations
- Test image attribute completeness across all components
- Test event listener patterns across all Vue files
- Test CSS animation properties for GPU acceleration

### Build Verification
- Verify bundle sizes after each build
- Verify no unused CSS in production bundle
- Verify source maps excluded from production

### Performance Testing (Lighthouse)
- Run Lighthouse CI on each deployment
- Verify Core Web Vitals meet targets
- Track performance score over time

### Manual Validation
- Test on slow 3G network throttling
- Test on low-end mobile devices
- Verify no layout shift during page load
- Verify fonts render without FOIT

