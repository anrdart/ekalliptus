import type { ServiceType, Urgency } from '~/types/database.types'

// Service type mapping from form ID to database service_type
export const SERVICE_TYPE_MAP: Record<string, ServiceType> = {
  'web': 'website',
  'wordpress': 'wordpress',
  'mobile': 'mobile',
  'video': 'editing',
  'uiux': 'editing', // UI/UX falls under editing category
  'maintenance': 'service_device'
}

// Starting prices for each service (in IDR)
export const SERVICE_PRICES: Record<string, number> = {
  'web': 2500000,
  'wordpress': 1500000,
  'mobile': 5000000,
  'video': 500000,
  'uiux': 1000000,
  'maintenance': 100000
}

// Dynamic pricing based on service details
export interface ServiceDetails {
  // Website
  websiteType?: string
  pageCount?: string
  features?: string[]
  needDomain?: string
  needHosting?: string
  // Mobile
  platform?: string
  appType?: string
  appFeatures?: string[]
  apiIntegration?: string
  adminPanel?: string
  // WordPress
  wpType?: string
  wpEcommerce?: string
  wpPlugins?: string[]
  // Video/Photo
  mediaType?: string
  videoDuration?: string
  quantity?: string | number
  outputFormats?: string[]
  // UI/UX
  uiPlatform?: string
  screenCount?: string
  deliverables?: string[]
  // Maintenance
  deviceType?: string
  problemTypes?: string[]
}

// Price modifiers for website
const WEB_TYPE_PRICES: Record<string, number> = {
  'Company Profile': 2500000,
  'Profil Perusahaan': 2500000,
  'E-commerce/Online Store': 5000000,
  'E-commerce/Toko Online': 5000000,
  'Landing Page': 1500000,
  'Portfolio': 2000000,
  'Portofolio': 2000000,
  'Blog': 1500000,
  'Custom/Other': 3500000,
  'Custom/Lainnya': 3500000
}

const WEB_PAGE_PRICES: Record<string, number> = {
  '1-5 pages': 0,
  '1-5 halaman': 0,
  '6-10 pages': 500000,
  '6-10 halaman': 500000,
  '11-20 pages': 1000000,
  '11-20 halaman': 1000000,
  '20+ pages': 2000000,
  '20+ halaman': 2000000
}

const WEB_FEATURE_PRICES: Record<string, number> = {
  'Contact Form': 100000,
  'Form Kontak': 100000,
  'Gallery': 200000,
  'Galeri': 200000,
  'Multi-language': 500000,
  'Multi-bahasa': 500000,
  'CMS/Admin Panel': 750000,
  'E-commerce/Toko Online': 1500000,
  'E-commerce/Online Store': 1500000,
  'Blog': 300000
}

// Price modifiers for mobile
const MOBILE_PLATFORM_PRICES: Record<string, number> = {
  'Android only': 5000000,
  'Android saja': 5000000,
  'iOS only': 5000000,
  'iOS saja': 5000000,
  'Android & iOS': 8000000
}

const MOBILE_FEATURE_PRICES: Record<string, number> = {
  'Login/Register': 500000,
  'Push Notification': 300000,
  'Payment Gateway': 1000000,
  'Maps/Location': 400000,
  'Maps/Lokasi': 400000,
  'Social Login': 300000,
  'Chat/Messaging': 800000,
  'Chat/Pesan': 800000
}

// Price modifiers for WordPress
const WP_TYPE_PRICES: Record<string, number> = {
  'New Website': 1500000,
  'Website Baru': 1500000,
  'Theme Customization': 1000000,
  'Kustomisasi Tema': 1000000,
  'Plugin Development': 2000000,
  'Pengembangan Plugin': 2000000,
  'Maintenance/Repair': 500000,
  'Maintenance/Perbaikan': 500000
}

const WP_PLUGIN_PRICES: Record<string, number> = {
  'SEO (Yoast/Rank Math)': 200000,
  'Backup': 150000,
  'Security': 200000,
  'Keamanan': 200000,
  'Contact Form': 100000,
  'Form Kontak': 100000,
  'Gallery': 150000,
  'Galeri': 150000,
  'Multilingual (WPML)': 500000,
  'Multi-bahasa (WPML)': 500000
}

// Price modifiers for video/photo
const MEDIA_TYPE_PRICES: Record<string, number> = {
  'Video Editing': 500000,
  'Edit Video': 500000,
  'Photo Editing': 50000,
  'Edit Foto': 50000,
  'Motion Graphics': 1000000,
  'All': 1500000,
  'Semua': 1500000
}

const VIDEO_DURATION_PRICES: Record<string, number> = {
  '< 1 minute': 0,
  '< 1 menit': 0,
  '1-3 minutes': 200000,
  '1-3 menit': 200000,
  '3-5 minutes': 400000,
  '3-5 menit': 400000,
  '5-10 minutes': 700000,
  '5-10 menit': 700000,
  '> 10 minutes': 1000000,
  '> 10 menit': 1000000
}

// Price modifiers for UI/UX
const UIUX_SCREEN_PRICES: Record<string, number> = {
  '1-5 screens': 1000000,
  '1-5 layar': 1000000,
  '6-10 screens': 1800000,
  '6-10 layar': 1800000,
  '11-20 screens': 3000000,
  '11-20 layar': 3000000,
  '20+ screens': 5000000,
  '20+ layar': 5000000
}

const UIUX_DELIVERABLE_PRICES: Record<string, number> = {
  'Wireframe': 300000,
  'Mockup/Visual Design': 500000,
  'Mockup/Desain Visual': 500000,
  'Interactive Prototype': 700000,
  'Prototipe Interaktif': 700000,
  'Design System': 1000000,
  'Sistem Desain': 1000000
}

// Price modifiers for maintenance
const DEVICE_TYPE_PRICES: Record<string, number> = {
  'Smartphone': 100000,
  'Laptop': 150000,
  'Tablet': 120000,
  'PC Desktop': 150000
}

const PROBLEM_TYPE_PRICES: Record<string, number> = {
  'Screen/LCD': 300000,
  'Layar/LCD': 300000,
  'Battery': 150000,
  'Baterai': 150000,
  'Charging': 100000,
  'Software/OS': 100000,
  'Slow Performance': 100000,
  'Performa Lambat': 100000,
  'Other Hardware': 200000,
  'Hardware Lainnya': 200000
}

/**
 * Calculate dynamic price based on service details
 */
export function calculateDynamicPrice(serviceId: string, details: ServiceDetails): number {
  let price = SERVICE_PRICES[serviceId] || 0

  switch (serviceId) {
    case 'web':
      // Website type
      if (details.websiteType) {
        price = WEB_TYPE_PRICES[details.websiteType] || price
      }
      // Page count
      if (details.pageCount) {
        price += WEB_PAGE_PRICES[details.pageCount] || 0
      }
      // Features
      if (details.features?.length) {
        details.features.forEach(f => {
          price += WEB_FEATURE_PRICES[f] || 0
        })
      }
      // Domain & Hosting
      if (details.needDomain === 'Ya' || details.needDomain === 'Yes') {
        price += 150000
      }
      if (details.needHosting === 'Ya' || details.needHosting === 'Yes') {
        price += 500000
      }
      break

    case 'mobile':
      // Platform
      if (details.platform) {
        price = MOBILE_PLATFORM_PRICES[details.platform] || price
      }
      // Features
      if (details.appFeatures?.length) {
        details.appFeatures.forEach(f => {
          price += MOBILE_FEATURE_PRICES[f] || 0
        })
      }
      // API Integration
      if (details.apiIntegration === 'Ya' || details.apiIntegration === 'Yes') {
        price += 1000000
      }
      // Admin Panel
      if (details.adminPanel === 'Ya' || details.adminPanel === 'Yes') {
        price += 1500000
      }
      break

    case 'wordpress':
      // WP Type
      if (details.wpType) {
        price = WP_TYPE_PRICES[details.wpType] || price
      }
      // E-commerce
      if (details.wpEcommerce === 'Ya' || details.wpEcommerce === 'Yes') {
        price += 1500000
      }
      // Plugins
      if (details.wpPlugins?.length) {
        details.wpPlugins.forEach(p => {
          price += WP_PLUGIN_PRICES[p] || 0
        })
      }
      break

    case 'video':
      // Media type
      if (details.mediaType) {
        price = MEDIA_TYPE_PRICES[details.mediaType] || price
      }
      // Duration
      if (details.videoDuration) {
        price += VIDEO_DURATION_PRICES[details.videoDuration] || 0
      }
      // Quantity multiplier
      const qty = typeof details.quantity === 'string' ? parseInt(details.quantity) : details.quantity
      if (qty && qty > 1) {
        price = price * qty
      }
      break

    case 'uiux':
      // Screen count
      if (details.screenCount) {
        price = UIUX_SCREEN_PRICES[details.screenCount] || price
      }
      // Deliverables
      if (details.deliverables?.length) {
        details.deliverables.forEach(d => {
          price += UIUX_DELIVERABLE_PRICES[d] || 0
        })
      }
      break

    case 'maintenance':
      // Device type
      if (details.deviceType) {
        price = DEVICE_TYPE_PRICES[details.deviceType] || price
      }
      // Problem types
      if (details.problemTypes?.length) {
        details.problemTypes.forEach(p => {
          price += PROBLEM_TYPE_PRICES[p] || 0
        })
      }
      break
  }

  return price
}

// Deposit percentages by service type
export const DEPOSIT_PERCENTAGES: Record<ServiceType, number> = {
  'website': 50,
  'wordpress': 50,
  'mobile': 50,
  'editing': 50,
  'service_device': 0 // Onsite payment
}

// Urgency multipliers
export const URGENCY_MULTIPLIERS: Record<Urgency, number> = {
  'normal': 1.0,
  'express': 1.25,
  'priority': 1.5
}

// PPN rate (11%)
export const PPN_RATE = 0.11

export interface OrderCalculation {
  subtotal: number
  discount: number
  dpp: number // Dasar Pengenaan Pajak (tax base)
  ppn: number
  fee: number
  grandTotal: number
  deposit: number
  remaining: number
  depositPercentage: number
}

export interface CalculateOrderParams {
  serviceId: string
  basePrice?: number
  voucherDiscount?: number
  urgency?: Urgency
  shippingCost?: number
  additionalFee?: number
}

/**
 * Calculate order amounts based on service and options
 */
export function calculateOrder(params: CalculateOrderParams): OrderCalculation {
  const {
    serviceId,
    basePrice,
    voucherDiscount = 0,
    urgency = 'normal',
    shippingCost = 0,
    additionalFee = 0
  } = params

  // Get service type for deposit calculation
  const serviceType = SERVICE_TYPE_MAP[serviceId] || 'website'
  
  // Get base price (use provided or default)
  const price = basePrice || SERVICE_PRICES[serviceId] || 0
  
  // Apply urgency multiplier
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency]
  const subtotal = Math.round(price * urgencyMultiplier)
  
  // Apply discount
  const discount = Math.min(voucherDiscount, subtotal) // Can't discount more than subtotal
  
  // Calculate DPP (tax base) = subtotal - discount
  const dpp = subtotal - discount
  
  // Calculate PPN (11% of DPP)
  const ppn = Math.round(dpp * PPN_RATE)
  
  // Additional fees
  const fee = additionalFee + shippingCost
  
  // Grand total
  const grandTotal = dpp + ppn + fee
  
  // Deposit calculation
  const depositPercentage = DEPOSIT_PERCENTAGES[serviceType]
  const deposit = Math.round(grandTotal * (depositPercentage / 100))
  const remaining = grandTotal - deposit
  
  return {
    subtotal,
    discount,
    dpp,
    ppn,
    fee,
    grandTotal,
    deposit,
    remaining,
    depositPercentage
  }
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Get default schedule date (tomorrow)
 */
export function getDefaultScheduleDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

/**
 * Get default schedule time
 */
export function getDefaultScheduleTime(): string {
  return '10:00'
}

export const useOrderCalculation = () => {
  return {
    calculateOrder,
    calculateDynamicPrice,
    formatCurrency,
    getDefaultScheduleDate,
    getDefaultScheduleTime,
    SERVICE_TYPE_MAP,
    SERVICE_PRICES,
    DEPOSIT_PERCENTAGES,
    URGENCY_MULTIPLIERS,
    PPN_RATE
  }
}
