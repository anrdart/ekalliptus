// Konfigurasi Midtrans - Enhanced Security Version
export const MIDTRANS_CONFIG = {
  // NOTE: Server key is now handled exclusively by backend
  // Client Key untuk frontend (safe to expose)
  clientKey: import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '',

  // Mode production atau sandbox
  isProduction: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true',

  // Snap URL
  snapUrl: import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/snap.js'
    : 'https://app.sandbox.midtrans.com/snap/snap.js',

  // Environment-configurable URL Endpoints
  endpoints: {
    // Backend API base URL (for environment-specific endpoints)
    apiBase: import.meta.env.VITE_API_BASE_URL || 'https://ekalliptus.id/api',
    
    // Payment Notification URL (configurable per environment)
    paymentNotification: import.meta.env.VITE_PAYMENT_NOTIFICATION_URL || 'https://ekalliptus.id/notification/handling',

    // Recurring Notification URL
    recurringNotification: import.meta.env.VITE_RECURRING_NOTIFICATION_URL || 'https://ekalliptus.id/notification/recurring',

    // Pay Account Notification URL
    payAccountNotification: import.meta.env.VITE_PAY_ACCOUNT_NOTIFICATION_URL || 'https://ekalliptus.id/notification/pay-account',

    // Finish Redirect URL - ketika pembayaran sukses
    finishRedirect: import.meta.env.VITE_FINISH_REDIRECT_URL || 'https://ekalliptus.id/payment/finish',

    // Unfinish Redirect URL - ketika user klik back
    unfinishRedirect: import.meta.env.VITE_UNFINISH_REDIRECT_URL || 'https://ekalliptus.id/payment/unfinish',

    // Error Redirect URL - ketika terjadi error
    errorRedirect: import.meta.env.VITE_ERROR_REDIRECT_URL || 'https://ekalliptus.id/error',

    // Health check endpoint
    healthCheck: import.meta.env.VITE_API_BASE_URL ?
      `${import.meta.env.VITE_API_BASE_URL}/health` :
      'https://ekalliptus.id/api/health',
  },
};

// Type untuk transaction details
export interface MidtransTransactionDetails {
  order_id: string;
  gross_amount: number;
}

// Type untuk item details
export interface MidtransItemDetails {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

// Type untuk customer details
export interface MidtransCustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
}

// Type untuk parameter Snap
export interface MidtransSnapParams {
  transaction_details: MidtransTransactionDetails;
  item_details?: MidtransItemDetails[];
  customer_details?: MidtransCustomerDetails;
}

// Type untuk response Snap
export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

// Type untuk callback result
export interface MidtransCallbackResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
}
