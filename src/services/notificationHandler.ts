import { MIDTRANS_CONFIG, MidtransCallbackResult } from '@/config/midtrans';

// Type untuk notification data dari Midtrans
export interface MidtransNotificationData extends MidtransCallbackResult {
  signature_key: string;
  payment_code?: string;
  approval_code?: string;
  bank?: string;
  va_number?: string;
  bill_key?: string;
  biller_code?: string;
  retailer_name?: string;
  permata_va_number?: string;
  bca_va_number?: string;
  bni_va_number?: string;
  bri_va_number?: string;
  cimb_va_number?: string;
  other_va_number?: string;
  echannel_bill_key?: string;
  echannel_biller_code?: string;
  shopeepay_reference?: string;
  qr_string?: string;
  acquirer?: string;
  issuer?: string;
  card_type?: string;
  masked_card?: string;
  three_ds_secure?: string;
  eci?: string;
  saved_token_id?: string;
  saved_token_id_expired_at?: string;
  point_redeem_amount?: string;
  point_redeem_quantity?: string;
  points?: string;
  installment_term?: string;
  bin?: string;
  last_4digit?: string;
  expiry_date?: string;
  card_number?: string;
  cardholder_name?: string;
  card_token?: string;
  card_token_expired_at?: string;
}

// Type untuk log transaksi
export interface TransactionLog {
  id: string;
  order_id: string;
  transaction_id: string;
  gross_amount: number;
  payment_type: string;
  transaction_status: string;
  transaction_time: string;
  fraud_status?: string;
  notification_data: MidtransNotificationData;
  created_at: string;
  updated_at: string;
  retry_count: number;
  last_retry_at?: string;
  processed: boolean;
}

// Type untuk retry configuration
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // in milliseconds
  backoffMultiplier: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 5000, // 5 seconds
  backoffMultiplier: 2,
};

/**
 * Verifikasi signature notifikasi dari Midtrans
 */
export const verifyNotificationSignature = (notificationData: MidtransNotificationData): Promise<boolean> => {
  return new Promise(async (resolve) => {
    try {
      // IMPORTANT: Security enhancement - signature verification should be done server-side
      const { order_id, status_code, gross_amount, signature_key } = notificationData;
      
      // For now, basic validation (enhanced verification will be done in backend)
      if (!order_id || !status_code || !gross_amount || !signature_key) {
        resolve(false);
        return;
      }

      // Validate signature format (basic check)
      const isValidFormat = signature_key.match(/^[a-fA-F0-9]+$/);
      resolve(isValidFormat ? true : false);
    } catch (error) {
      console.error('Error verifying notification signature:', error);
      resolve(false);
    }
  });
};

/**
 * Simpan log transaksi ke local storage (untuk demo)
 * Dalam production, ini akan disimpan ke database
 */
export const saveTransactionLog = async (notificationData: MidtransNotificationData): Promise<TransactionLog> => {
  const log: TransactionLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    order_id: notificationData.order_id,
    transaction_id: notificationData.transaction_id,
    gross_amount: parseInt(notificationData.gross_amount),
    payment_type: notificationData.payment_type,
    transaction_status: notificationData.transaction_status,
    transaction_time: notificationData.transaction_time,
    fraud_status: notificationData.fraud_status,
    notification_data: notificationData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    retry_count: 0,
    processed: false,
  };

  // Simpan ke local storage (untuk demo)
  const existingLogs = JSON.parse(localStorage.getItem('transaction_logs') || '[]');
  existingLogs.push(log);
  localStorage.setItem('transaction_logs', JSON.stringify(existingLogs));

  return log;
};

/**
 * Update status transaksi
 */
export const updateTransactionStatus = async (orderId: string, status: string): Promise<void> => {
  try {
    // Dalam production, ini akan memanggil backend API
    // Untuk demo, kita simpan ke local storage
    const logs = JSON.parse(localStorage.getItem('transaction_logs') || '[]');
    const logIndex = logs.findIndex((log: TransactionLog) => log.order_id === orderId);
    
    if (logIndex !== -1) {
      logs[logIndex].transaction_status = status;
      logs[logIndex].updated_at = new Date().toISOString();
      logs[logIndex].processed = true;
      localStorage.setItem('transaction_logs', JSON.stringify(logs));
    }

    // Trigger event untuk update UI (jika diperlukan)
    window.dispatchEvent(new CustomEvent('paymentStatusUpdated', {
      detail: { orderId, status }
    }));
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

/**
 * Proses notifikasi pembayaran
 */
export const processPaymentNotification = async (
  notificationData: MidtransNotificationData,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{ success: boolean; message: string }> => {
  try {
    // Step 1: Verifikasi signature
    if (!verifyNotificationSignature(notificationData)) {
      throw new Error('Invalid notification signature');
    }

    // Step 2: Simpan log transaksi
    const log = await saveTransactionLog(notificationData);

    // Step 3: Proses berdasarkan status
    const { transaction_status, order_id } = notificationData;
    
    switch (transaction_status) {
      case 'capture':
      case 'settlement':
        await updateTransactionStatus(order_id, 'success');
        break;
      case 'pending':
        await updateTransactionStatus(order_id, 'pending');
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
        await updateTransactionStatus(order_id, 'failed');
        break;
      case 'refund':
        await updateTransactionStatus(order_id, 'refunded');
        break;
      case 'partial_refund':
        await updateTransactionStatus(order_id, 'partially_refunded');
        break;
      default:
        console.warn(`Unknown transaction status: ${transaction_status}`);
    }

    return {
      success: true,
      message: `Notification processed successfully for order ${order_id}`,
    };
  } catch (error) {
    console.error('Error processing payment notification:', error);
    
    // Implement retry logic
    return await handleNotificationRetry(notificationData, retryConfig);
  }
};

/**
 * Handle retry untuk notifikasi gagal
 */
const handleNotificationRetry = async (
  notificationData: MidtransNotificationData,
  retryConfig: RetryConfig,
  currentAttempt: number = 1
): Promise<{ success: boolean; message: string }> => {
  const { order_id } = notificationData;

  if (currentAttempt > retryConfig.maxRetries) {
    console.error(`Max retry attempts reached for order ${order_id}`);
    return {
      success: false,
      message: `Max retry attempts reached for order ${order_id}`,
    };
  }

  // Update retry count
  const logs = JSON.parse(localStorage.getItem('transaction_logs') || '[]');
  const logIndex = logs.findIndex((log: TransactionLog) => log.order_id === order_id);
  
  if (logIndex !== -1) {
    logs[logIndex].retry_count = currentAttempt;
    logs[logIndex].last_retry_at = new Date().toISOString();
    localStorage.setItem('transaction_logs', JSON.stringify(logs));
  }

  // Calculate delay with exponential backoff
  const delay = retryConfig.retryDelay * Math.pow(retryConfig.backoffMultiplier, currentAttempt - 1);

  console.log(`Retrying notification for order ${order_id} in ${delay}ms (attempt ${currentAttempt})`);

  // Wait before retry
  await new Promise(resolve => setTimeout(resolve, delay));

  try {
    // Retry processing
    const result = await processPaymentNotification(notificationData, {
      ...retryConfig,
      maxRetries: 0, // Prevent infinite recursion
    });

    if (result.success) {
      console.log(`Retry successful for order ${order_id} on attempt ${currentAttempt}`);
      return {
        success: true,
        message: `Retry successful for order ${order_id} on attempt ${currentAttempt}`,
      };
    }
  } catch (error) {
    console.error(`Retry attempt ${currentAttempt} failed for order ${order_id}:`, error);
  }

  // Recursive retry
  return handleNotificationRetry(notificationData, retryConfig, currentAttempt + 1);
};

/**
 * Get transaction logs untuk audit
 */
export const getTransactionLogs = async (filters?: {
  orderId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<TransactionLog[]> => {
  try {
    let logs = JSON.parse(localStorage.getItem('transaction_logs') || '[]');

    // Apply filters
    if (filters) {
      if (filters.orderId) {
        logs = logs.filter((log: TransactionLog) => log.order_id === filters.orderId);
      }
      if (filters.status) {
        logs = logs.filter((log: TransactionLog) => log.transaction_status === filters.status);
      }
      if (filters.startDate) {
        logs = logs.filter((log: TransactionLog) => 
          new Date(log.created_at) >= new Date(filters.startDate!)
        );
      }
      if (filters.endDate) {
        logs = logs.filter((log: TransactionLog) => 
          new Date(log.created_at) <= new Date(filters.endDate!)
        );
      }
    }

    return logs.sort((a: TransactionLog, b: TransactionLog) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error getting transaction logs:', error);
    return [];
  }
};

/**
 * Export transaction logs untuk audit
 */
export const exportTransactionLogs = async (filters?: {
  orderId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<string> => {
  try {
    const logs = await getTransactionLogs(filters);
    
    // Convert to CSV format
    const headers = [
      'ID',
      'Order ID',
      'Transaction ID',
      'Gross Amount',
      'Payment Type',
      'Transaction Status',
      'Transaction Time',
      'Created At',
      'Retry Count',
      'Processed'
    ];

    const csvContent = [
      headers.join(','),
      ...logs.map((log: TransactionLog) => [
        log.id,
        log.order_id,
        log.transaction_id,
        log.gross_amount,
        log.payment_type,
        log.transaction_status,
        log.transaction_time,
        log.created_at,
        log.retry_count,
        log.processed
      ].join(','))
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('Error exporting transaction logs:', error);
    throw error;
  }
};