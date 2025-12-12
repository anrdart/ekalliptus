/**
 * Performance Types for ekalliptus.id
 * Defines TypeScript interfaces for performance configuration and metrics
 */

/**
 * Bundle size targets in bytes
 */
export interface BundleSizeTargets {
  /** Main JavaScript bundle size limit (gzipped) */
  mainJs: number
  /** Main CSS bundle size limit (gzipped) */
  mainCss: number
  /** Vendor JavaScript bundle size limit (gzipped) */
  vendorJs: number
  /** Total initial load size limit (gzipped) */
  totalInitial: number
}

/**
 * Core Web Vitals and performance metrics targets
 */
export interface PerformanceMetrics {
  /** Largest Contentful Paint target in milliseconds */
  lcp: number
  /** First Input Delay target in milliseconds */
  fid: number
  /** Cumulative Layout Shift target (unitless) */
  cls: number
  /** Time to First Byte target in milliseconds */
  ttfb: number
  /** First Contentful Paint target in milliseconds */
  fcp: number
}

/**
 * Image size limits in bytes
 */
export interface ImageSizeTargets {
  /** Maximum favicon file size */
  maxFaviconSize: number
  /** Maximum logo file size */
  maxLogoSize: number
}

/**
 * Complete performance targets configuration
 */
export interface PerformanceTargets {
  bundles: BundleSizeTargets
  metrics: PerformanceMetrics
  images: ImageSizeTargets
}

/**
 * Image optimization configuration
 */
export interface ImageOptimizationConfig {
  formats: ('webp' | 'avif' | 'png' | 'jpg')[]
  quality: number
  sizes: string
  loading: 'lazy' | 'eager'
  fetchpriority?: 'high' | 'low' | 'auto'
}

/**
 * Critical image configuration for above-the-fold images
 */
export interface CriticalImageConfig {
  src: string
  width: number
  height: number
  alt: string
  fetchpriority: 'high'
  loading: 'eager'
}

/**
 * Cache configuration for different asset types
 */
export interface CacheConfig {
  /** Hashed assets (JS, CSS chunks) - long-term caching */
  immutable: {
    maxAge: number
    immutable: true
  }
  /** HTML pages - no caching */
  html: {
    maxAge: number
    mustRevalidate: true
  }
  /** Static assets (images, fonts) - medium-term caching */
  static: {
    maxAge: number
    staleWhileRevalidate: number
  }
}

/**
 * Lazy loading configuration for components
 */
export interface LazyComponentConfig {
  delay: number
  rootMargin: string
}

/**
 * Script loading configuration
 */
export interface ScriptLoadConfig {
  defer: boolean
  fetchpriority: 'high' | 'low' | 'auto'
}

/**
 * Complete lazy loading configuration
 */
export interface LazyLoadConfig {
  components: Record<string, LazyComponentConfig>
  scripts: Record<string, ScriptLoadConfig>
}
