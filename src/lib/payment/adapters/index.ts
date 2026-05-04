import { MidtransAdapter } from './midtrans.adapter'
import { PakasirAdapter } from './pakasir.adapter'
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

// Convert DB config to GatewayConfig
function getEnvVar(key: string): string {
  // Use import.meta.env which Astro exposes
  return (import.meta.env as any)[key] || ''
}

export function dbConfigToGatewayConfig(dbConfig: DbGatewayConfig): GatewayConfig {
  const envPrefix = dbConfig.name.toUpperCase()
  
  const apiKey = dbConfig.config.apiKey || getEnvVar(`${envPrefix}_API_KEY`) || getEnvVar(`VITE_${envPrefix}_API_KEY`)
  const merchantCode = dbConfig.config.merchantCode || getEnvVar(`${envPrefix}_MERCHANT_CODE`) || getEnvVar(`VITE_${envPrefix}_MERCHANT_CODE`)
  const clientId = dbConfig.config.clientId || getEnvVar(`${envPrefix}_CLIENT_ID`) || getEnvVar(`VITE_${envPrefix}_CLIENT_ID`)
  const clientKey = dbConfig.config.clientKey || getEnvVar(`${envPrefix}_CLIENT_KEY`) || getEnvVar(`VITE_${envPrefix}_CLIENT_KEY`)
  const serverKey = dbConfig.config.serverKey || getEnvVar(`${envPrefix}_SERVER_KEY`) || getEnvVar(`VITE_${envPrefix}_SERVER_KEY`)
  const webhookSecret = dbConfig.config.webhookSecret || getEnvVar(`${envPrefix}_WEBHOOK_SECRET`) || getEnvVar(`VITE_${envPrefix}_WEBHOOK_SECRET`)
  
  const envIsProd = getEnvVar(`${envPrefix}_IS_PRODUCTION`) === 'true'
  const isProduction = dbConfig.config.isProduction !== undefined ? dbConfig.config.isProduction : envIsProd

  return {
    apiKey,
    merchantCode,
    clientId,
    clientKey,
    serverKey,
    webhookSecret,
    isProduction
  }
}

// Export adapters and types
export { MidtransAdapter, PakasirAdapter }
export type { PaymentAdapter, GatewayConfig, DbGatewayConfig } from '../types'
