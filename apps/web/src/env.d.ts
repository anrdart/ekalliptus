/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    adminSession?: import('@ekalliptus/core').AdminSession
    runtime?: {
      env?: Record<string, string | undefined>
    }
  }
}
