/**
 * SEO Configuration
 * Centralized SEO settings to prevent canonical URL mismatches
 */

export const SEO_CONFIG = {
  // Primary domain - MUST be consistent across all pages
  SITE_URL: 'https://ekalliptus.id',
  
  // Alternative/Development URLs (for reference only)
  ALT_URLS: ['https://ekalliptus.my.id'],
  
  // Site Information
  SITE_NAME: 'ekalliptus',
  SITE_TITLE: 'ekalliptus - Solusi Digital Terdepan',
  SITE_DESCRIPTION: 'Ekalliptus - Solusi digital terdepan untuk website development, WordPress, mobile app, dan editing foto/video profesional di Indonesia',
  
  // Business Information
  BUSINESS: {
    name: 'ekalliptus',
    alternateName: 'Ekalliptus Digital Agency',
    email: 'ekalliptus@gmail.com',
    phone: '+62-819-9990-0306',
    whatsapp: '6281999900306',
    foundingYear: '2024',
    country: 'Indonesia',
    region: 'Jakarta',
    latitude: -6.2088,
    longitude: 106.8456,
  },
  
  // Social Media
  SOCIAL: {
    twitter: '@ekalliptus',
    facebook: 'https://facebook.com/ekalliptus',
    instagram: 'https://instagram.com/ekalliptus',
    linkedin: 'https://linkedin.com/company/ekalliptus',
  },
  
  // Images
  IMAGES: {
    logo: '/logo.png',
    ogImage: 'https://lovable.dev/opengraph-image-p98pqg.png',
    heroImage: '/assets/hero-bg.jpg',
  },
  
  // Default Meta Tags
  DEFAULT_KEYWORDS: 'website development Indonesia, WordPress custom, mobile app development, photo editing service, video editing profesional, digital agency Jakarta, jasa pembuatan website, aplikasi mobile Android iOS, editing foto video berkualitas',
  
  // Language & Locale
  LANGUAGE: 'id',
  LOCALE: 'id_ID',
  
  // Theme
  THEME_COLOR: '#0ea5e9',
  BACKGROUND_COLOR: '#0f172a',
} as const;

/**
 * Generate canonical URL
 */
export const getCanonicalUrl = (path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_CONFIG.SITE_URL}${cleanPath}`;
};

/**
 * Generate Open Graph URL
 */
export const getOgUrl = (path: string = ''): string => {
  return getCanonicalUrl(path);
};

/**
 * Page-specific SEO configurations
 */
export const PAGE_SEO = {
  home: {
    title: 'ekalliptus - Solusi Digital Terdepan | Website, WordPress, Mobile App',
    description: 'Ekalliptus adalah digital agency terdepan di Indonesia yang menyediakan layanan website development, WordPress custom, aplikasi mobile Android iOS, service HP laptop, dan editing foto video berkualitas tinggi. Transformasi digital bisnis Anda dengan solusi teknologi modern.',
    keywords: 'jasa pembuatan website Indonesia, WordPress custom Jakarta, mobile app development, service HP laptop, editing foto video profesional, digital agency, UI UX design, ekalliptus',
    path: '/',
  },
  order: {
    title: 'Order Layanan - ekalliptus | Website Development, WordPress, Mobile App',
    description: 'Form order layanan ekalliptus untuk website development Indonesia, WordPress custom Jakarta, mobile app development, service HP laptop, dan editing foto video profesional. Dapatkan proposal dalam 24 jam.',
    keywords: 'order website development, form WordPress custom, pesan mobile app, service HP laptop online, editing foto video, konsultasi digital agency, jasa website Indonesia',
    path: '/order',
  },
} as const;