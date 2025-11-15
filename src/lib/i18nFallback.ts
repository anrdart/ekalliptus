import i18n from '@/i18n';

/**
 * Translation function with fallback to English for privacy and terms pages
 * @param key - Translation key
 * @param options - Translation options
 * @returns Translated string with fallback
 */
export function tWithFallback(key: string, options?: any): string {
  // First try to get translation in current language
  const currentLangTranslation = i18n.t(key, options);

  // If translation exists and doesn't match the key (i18n returns key if not found),
  // return it
  if (currentLangTranslation !== key && currentLangTranslation !== undefined) {
    return currentLangTranslation;
  }

  // If translation not found or is the key itself, fallback to English
  const fallbackTranslation = i18n.t(key, { ...options, lng: 'en' });

  return fallbackTranslation;
}
