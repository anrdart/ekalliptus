export type PaymentType = 'gateway' | 'cash' | 'deposit';

export interface ServicePaymentConfig {
  paymentRequired: boolean;
  paymentType: PaymentType;
  depositPercentage?: number;
  reason?: string;
}

export type ServiceKey = 'websiteDevelopment' | 'wordpressDevelopment' | 'berduPlatform' | 'mobileAppDevelopment' | 'serviceHpLaptop' | 'photoVideoEditing';

export const servicePaymentConfigs: Record<ServiceKey, ServicePaymentConfig> = {
  // Online payment required services (development projects)
  websiteDevelopment: {
    paymentRequired: true,
    paymentType: 'deposit',
    depositPercentage: 50,
    reason: 'Deposit 50% dibutuhkan untuk memulai development website',
  },
  wordpressDevelopment: {
    paymentRequired: true,
    paymentType: 'deposit',
    depositPercentage: 50,
    reason: 'Deposit 50% dibutuhkan untuk setup dan customization WordPress',
  },
  berduPlatform: {
    paymentRequired: true,
    paymentType: 'gateway',
    reason: 'Full payment online untuk setup platform dan hosting',
  },
  mobileAppDevelopment: {
    paymentRequired: true,
    paymentType: 'deposit',
    depositPercentage: 50,
    reason: 'Deposit 50% dibutuhkan untuk mulai development aplikasi mobile',
  },

  // Services that can be paid in cash/on-site
  serviceHpLaptop: {
    paymentRequired: false,
    paymentType: 'cash',
    reason: 'Pembayaran dilakukan setelah servis selesai',
  },

  // Digital services - full online payment
  photoVideoEditing: {
    paymentRequired: true,
    paymentType: 'gateway',
    reason: 'Full payment online untuk editing dan delivery hasil digital',
  },
};

/**
 * Check if a service requires payment gateway processing
 */
export const shouldUsePaymentGateway = (serviceKey: ServiceKey): boolean => {
  const config = servicePaymentConfigs[serviceKey];
  return config.paymentRequired && config.paymentType !== 'cash';
};

/**
 * Get payment configuration for a specific service
 */
export const getServicePaymentConfig = (serviceKey: ServiceKey): ServicePaymentConfig => {
  return servicePaymentConfigs[serviceKey];
};

/**
 * Check if service requires deposit payment
 */
export const requiresDeposit = (serviceKey: ServiceKey): boolean => {
  const config = servicePaymentConfigs[serviceKey];
  return config.paymentType === 'deposit';
};

/**
 * Get deposit percentage for services that require deposit
 */
export const getDepositPercentage = (serviceKey: ServiceKey): number => {
  const config = servicePaymentConfigs[serviceKey];
  return config.depositPercentage || 0;
};
