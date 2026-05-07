import { MidtransAdapter } from './midtrans.adapter'
import { PakasirAdapter } from './pakasir.adapter'
import { readEnv } from '../../runtime-env'
import type { PaymentAdapter, GatewayConfig, DbGatewayConfig } from '../types'
import type { PaymentGateway } from '../../../types/database'

type AdapterConstructor = new (config: GatewayConfig) => PaymentAdapter

// Adapter factory
export class AdapterFactory {
  private static adapters = new Map<PaymentGateway, AdapterConstructor>([
    ['midtrans', MidtransAdapter],
    ['pakasir', PakasirAdapter]
  ])

  static create(gateway: PaymentGateway, config: GatewayConfig): PaymentAdapter | null {
    const AdapterClass = this.adapters.get(gateway)
    if (!AdapterClass) return null
    return new AdapterClass(config)
  }

  static getSupportedGateways(): PaymentGateway[] {
    return Array.from(this.adapters.keys())
  }
}

// Read env var via runtime helper (Cloudflare Workers secrets) with build-time fallback
function getEnvVar(key: string): string {
  return readEnv(key) || ''
}

export function dbConfigToGatewayConfig(dbConfig: DbGatewayConfig): GatewayConfig {
  const envPrefix = dbConfig.name.toUpperCase()

  const resolve = (dbValue: string | undefined, ...envKeys: string[]): { value: string; source: string } => {
    if (dbValue && dbValue.trim()) return { value: dbValue, source: 'db' }
    for (const k of envKeys) {
      const v = getEnvVar(k)
      if (v) return { value: v, source: `env:${k}` }
    }
    return { value: '', source: 'missing' }
  }

  const apiKeyRes = resolve(dbConfig.config.apiKey, `${envPrefix}_API_KEY`, `VITE_${envPrefix}_API_KEY`)
  const merchantRes = resolve(dbConfig.config.merchantCode, `${envPrefix}_MERCHANT_CODE`, `VITE_${envPrefix}_MERCHANT_CODE`)
  const clientIdRes = resolve(dbConfig.config.clientId, `${envPrefix}_CLIENT_ID`, `VITE_${envPrefix}_CLIENT_ID`)
  const clientKeyRes = resolve(dbConfig.config.clientKey, `${envPrefix}_CLIENT_KEY`, `VITE_${envPrefix}_CLIENT_KEY`)
  const serverKeyRes = resolve(dbConfig.config.serverKey, `${envPrefix}_SERVER_KEY`, `VITE_${envPrefix}_SERVER_KEY`)
  const webhookRes = resolve(dbConfig.config.webhookSecret, `${envPrefix}_WEBHOOK_SECRET`, `VITE_${envPrefix}_WEBHOOK_SECRET`)

  const envIsProd = getEnvVar(`${envPrefix}_IS_PRODUCTION`) === 'true'
  const isProduction = dbConfig.config.isProduction !== undefined ? dbConfig.config.isProduction : envIsProd

  console.log(`[Gateway:${dbConfig.name}] credential sources:`, {
    apiKey: apiKeyRes.source,
    merchantCode: merchantRes.source,
    clientId: clientIdRes.source,
    clientKey: clientKeyRes.source,
    serverKey: serverKeyRes.source,
    webhookSecret: webhookRes.source,
    isProduction
  })

  return {
    apiKey: apiKeyRes.value,
    merchantCode: merchantRes.value,
    clientId: clientIdRes.value,
    clientKey: clientKeyRes.value,
    serverKey: serverKeyRes.value,
    webhookSecret: webhookRes.value,
    isProduction
  }
}

// Export adapters and types
export { MidtransAdapter, PakasirAdapter }
export type { PaymentAdapter, GatewayConfig, DbGatewayConfig } from '../types'
