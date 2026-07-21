/// <reference types="astro/client" />

export {}

declare global {
  namespace App {
    interface Locals {
      adminSession?: import('@ekalliptus/core').AdminSession
      locale?: import('./lib/locale-routing').Locale
      publicPathname?: string
      indexable?: boolean
      localeRewrite?: boolean
      runtime?: {
        env?: Record<string, string | undefined>
      }
    }
  }
}
