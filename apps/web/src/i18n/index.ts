import id from './locales/id.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import tr from './locales/tr.json'

const locales: Record<string, any> = { id, en, ja, ko, ru, ar, tr }

export const defaultLocale = 'id'

/** @deprecated Locale comes from the public URL via Astro.locals.locale. */
export function getLocaleFromRequest(_request: Request): string {
  return defaultLocale
}

export function t(key: string, locale: string = defaultLocale): string {
  const normalized = key.replace(/\[(\d+)\]/g, '.$1')
  const keys = normalized.split('.')
  let value: any = locales[locale] || locales[defaultLocale]

  for (const k of keys) {
    if (value === null || value === undefined) return key
    if (Array.isArray(value)) {
      const idx = Number(k)
      if (!Number.isInteger(idx) || idx < 0 || idx >= value.length) return key
      value = value[idx]
    } else if (typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key
    }
  }

  return typeof value === 'string' ? value : key
}

export function getDir(locale: string): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
