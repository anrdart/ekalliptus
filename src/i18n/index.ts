import id from './locales/id.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import tr from './locales/tr.json'

const locales: Record<string, any> = { id, en, ja, ko, ru, ar, tr }

export const defaultLocale = 'id'

export function getLocaleFromRequest(request: Request): string {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/i18n_redirected=([^;]+)/)
  if (match && locales[match[1]]) {
    return match[1]
  }
  
  const acceptLang = request.headers.get('accept-language') || ''
  if (acceptLang.includes('id')) return 'id'
  if (acceptLang.includes('en')) return 'en'
  if (acceptLang.includes('ja')) return 'ja'
  if (acceptLang.includes('ko')) return 'ko'
  if (acceptLang.includes('ru')) return 'ru'
  if (acceptLang.includes('ar')) return 'ar'
  if (acceptLang.includes('tr')) return 'tr'
  
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
