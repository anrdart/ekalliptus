/**
 * Performance Configuration for ekalliptus.com
 * Contains bundle size targets, Core Web Vitals thresholds, and optimization settings
 */

import type {
  PerformanceTargets,
  CacheConfig,
  LazyLoadConfig
} from '~/types/performance.types'

/**
 * Performance targets for bundle sizes and Core Web Vitals
 * Requirements: 1.1, 5.3, 8.1
 */
export const performanceTargets: PerformanceTargets = {
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

/**
 * Cache configuration for different asset types
 * Requirements: 6.1, 8.4
 */
export const cacheConfig: CacheConfig = {
  immutable: {
    maxAge: 31536000, // 1 year in seconds
    immutable: true
  },
  html: {
    maxAge: 0,
    mustRevalidate: true
  },
  static: {
    maxAge: 86400, // 1 day in seconds
    staleWhileRevalidate: 604800 // 1 week in seconds
  }
}

/**
 * Lazy loading configuration for components and scripts
 * Requirements: 4.1, 4.2
 */
export const lazyLoadConfig: LazyLoadConfig = {
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

/**
 * PreLoader timing configuration
 * Requirements: 4.3
 */
export const preloaderConfig = {
  maxDisplayTime: 1500 // 1.5 seconds maximum
}

/**
 * External domains for resource hints
 * Requirements: 6.4, 6.5
 */
export const externalDomains = {
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ],
  dnsPrefetch: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
    'https://static.cloudflareinsights.com',
    'https://api.emailjs.com',
    'https://sheetdb.io',
    'https://wa.me',
    'https://me.ekalliptus.com'
  ],
  preload: [
    '/ekalliptus_rounded.webp'
  ]
}

export const getSupabaseDomain = (supabaseUrl: string) => {
  try {
    const url = new URL(supabaseUrl)
    return url.origin
  } catch {
    return null
  }
}

export default performanceTargets
