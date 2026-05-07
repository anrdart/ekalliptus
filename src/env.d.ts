/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    adminSession?: import('./lib/admin/auth').AdminSession
    runtime?: {
      env?: Record<string, string | undefined>
    }
  }
}
