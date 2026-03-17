import type { AstroUserConfig } from 'astro'

const locales = ['id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr'] as const
const defaultLocale = 'id' as const

export const i18nConfig = {
  defaultLocale,
  locales: [...locales],
  strategy: 'no_prefix' as const,
}

export const languages = [
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', nativeName: 'Indonesia' },
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', nativeName: '한국어' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية', dir: 'rtl' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', nativeName: 'Türkçe' }
] as const

export type LocaleCode = typeof locales[number]

export function getI18nConfig(): AstroUserConfig['i18n'] {
  return {
    defaultLocale,
    locales: [...locales],
    routing: {
      prefixDefaultLocale: false
    }
  }
}
