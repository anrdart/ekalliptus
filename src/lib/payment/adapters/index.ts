import { MidtransAdapter } from './midtrans.adapter'
import { PakasirAdapter } from './pakasir.adapter'
import type { PaymentAdapter, GatewayConfig, DbGatewayConfig } from '../types'
import type { PaymentGateway } from '../../types/database'

// Adapter factory
export class AdapterFactory {
  private static adapters: Map<PaymentGateway, new (config: GatewayConfig) => PaymentAdapter> = new Map([
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
export function dbConfigToGatewayConfig(dbConfig: DbGatewayConfig): GatewayConfig {
  return {
    apiKey: dbConfig.config.apiKey || '',
    merchantCode: dbConfig.config.merchantCode,
    clientId: dbConfig.config.clientId,
    clientKey: dbConfig.config.clientKey,
    serverKey: dbConfig.config.serverKey,
    webhookSecret: dbConfig.config.webhookSecret,
    isProduction: dbConfig.config.isProduction || false
  }
}

// Export adapters and types
export { MidtransAdapter, PakasirAdapter }
export type { PaymentAdapter, GatewayConfig, DbGatewayConfig } from '../types'
