import { MidtransNotificationData } from './notificationHandler';
import { paymentApi } from './paymentApi';
import { paymentLogger, PaymentEventType, logWebhookEvent, logApiEvent } from './paymentLogger';

/**
 * Webhook handler untuk Midtrans notifications
 * Dalam production, ini akan menjadi endpoint backend yang menerima POST requests dari Midtrans
 */

// Type untuk webhook response
export interface WebhookResponse {
  status: number;
  message: string;
  data?: any;
}

/**
 * Mock webhook handler function
 * Dalam production, ini akan menjadi endpoint seperti: POST /api/notification/handling
 */
export const handleMidtransWebhook = async (
  notificationData: MidtransNotificationData
): Promise<WebhookResponse> => {
  const startTime = Date.now();
  
  try {
    logWebhookEvent(PaymentEventType.WEBHOOK_RECEIVED, {
      orderId: notificationData.order_id,
      transactionStatus: notificationData.transaction_status,
      paymentType: notificationData.payment_type,
      grossAmount: notificationData.gross_amount,
    }, notificationData.order_id);

    // Step 1: Verify notification signature via backend
    const { MIDTRANS_CONFIG } = await import('@/config/midtrans');
    
    try {
      const response = await fetch(`${MIDTRANS_CONFIG.endpoints.apiBase}/payments/verify-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error(`Signature verification failed: ${response.statusText}`);
      }

      const verificationResult = await response.json();
      
      if (!verificationResult.verified) {
        logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
          orderId: notificationData.order_id,
          reason: 'Invalid signature (verified by backend)',
          providedSignature: notificationData.signature_key,
        }, notificationData.order_id);
        
        return {
          status: 401,
          message: 'Invalid signature',
        };
      }

      logWebhookEvent(PaymentEventType.WEBHOOK_PROCESSED, {
        orderId: notificationData.order_id,
        step: 'signature_verified',
      }, notificationData.order_id);
      
    } catch (error) {
      logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
        orderId: notificationData.order_id,
        reason: 'Signature verification error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }, notificationData.order_id);
      
      return {
        status: 500,
        message: 'Signature verification failed',
      };
    }

    // Step 2: Process notification
    const result = await paymentApi.handleNotification(notificationData);
    const processingTime = Date.now() - startTime;

    if (result.success) {
      logWebhookEvent(PaymentEventType.WEBHOOK_PROCESSED, {
        orderId: notificationData.order_id,
        step: 'notification_processed',
        processingTime,
        result: result.data,
      }, notificationData.order_id);

      // Trigger custom event for real-time UI updates
      window.dispatchEvent(new CustomEvent('paymentStatusUpdated', {
        detail: {
          orderId: notificationData.order_id,
          status: notificationData.transaction_status,
          paymentType: notificationData.payment_type,
          grossAmount: notificationData.gross_amount,
          transactionTime: notificationData.transaction_time,
        }
      }));

      // Step 3: Send response to Midtrans (HTTP 200)
      return {
        status: 200,
        message: 'Notification processed successfully',
        data: {
          order_id: notificationData.order_id,
          transaction_status: notificationData.transaction_status,
          processing_time_ms: processingTime,
        },
      };
    } else {
      logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
        orderId: notificationData.order_id,
        step: 'notification_processing_failed',
        error: result.error,
        processingTime,
      }, notificationData.order_id);
      
      return {
        status: 500,
        message: result.error || 'Failed to process notification',
      };
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
      orderId: notificationData.order_id,
      step: 'webhook_handler_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime,
    }, notificationData.order_id);
    
    return {
      status: 500,
      message: error instanceof Error ? error.message : 'Internal server error',
    };
  }
};

/**
 * Mock webhook handler untuk recurring notifications
 */
export const handleRecurringNotification = async (
  notificationData: MidtransNotificationData
): Promise<WebhookResponse> => {
  const startTime = Date.now();
  
  try {
    logWebhookEvent(PaymentEventType.WEBHOOK_RECEIVED, {
      orderId: notificationData.order_id,
      transactionStatus: notificationData.transaction_status,
      type: 'recurring',
    }, notificationData.order_id);

    // Process recurring notification
    const result = await paymentApi.handleNotification(notificationData);
    const processingTime = Date.now() - startTime;

    if (result.success) {
      logWebhookEvent(PaymentEventType.WEBHOOK_PROCESSED, {
        orderId: notificationData.order_id,
        type: 'recurring',
        processingTime,
      }, notificationData.order_id);

      return {
        status: 200,
        message: 'Recurring notification processed successfully',
        data: {
          order_id: notificationData.order_id,
          transaction_status: notificationData.transaction_status,
          processing_time_ms: processingTime,
        },
      };
    } else {
      logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
        orderId: notificationData.order_id,
        type: 'recurring',
        error: result.error,
        processingTime,
      }, notificationData.order_id);
      
      return {
        status: 500,
        message: result.error || 'Failed to process recurring notification',
      };
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
      orderId: notificationData.order_id,
      type: 'recurring',
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
    }, notificationData.order_id);
    
    return {
      status: 500,
      message: error instanceof Error ? error.message : 'Internal server error',
    };
  }
};

/**
 * Mock webhook handler untuk pay account notifications
 */
export const handlePayAccountNotification = async (
  notificationData: MidtransNotificationData
): Promise<WebhookResponse> => {
  const startTime = Date.now();
  
  try {
    logWebhookEvent(PaymentEventType.WEBHOOK_RECEIVED, {
      orderId: notificationData.order_id,
      transactionStatus: notificationData.transaction_status,
      type: 'pay_account',
    }, notificationData.order_id);

    // Process pay account notification
    const result = await paymentApi.handleNotification(notificationData);
    const processingTime = Date.now() - startTime;

    if (result.success) {
      logWebhookEvent(PaymentEventType.WEBHOOK_PROCESSED, {
        orderId: notificationData.order_id,
        type: 'pay_account',
        processingTime,
      }, notificationData.order_id);

      return {
        status: 200,
        message: 'Pay account notification processed successfully',
        data: {
          order_id: notificationData.order_id,
          transaction_status: notificationData.transaction_status,
          processing_time_ms: processingTime,
        },
      };
    } else {
      logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
        orderId: notificationData.order_id,
        type: 'pay_account',
        error: result.error,
        processingTime,
      }, notificationData.order_id);
      
      return {
        status: 500,
        message: result.error || 'Failed to process pay account notification',
      };
    }
  } catch (error) {
    const processingTime = Date.now() - startTime;
    logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
      orderId: notificationData.order_id,
      type: 'pay_account',
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
    }, notificationData.order_id);
    
    return {
      status: 500,
      message: error instanceof Error ? error.message : 'Internal server error',
    };
  }
};

/**
 * Simulate webhook endpoint untuk testing
 * Dalam development, kita bisa menggunakan function ini untuk simulate webhook calls
 */
export const simulateWebhookCall = async (
  orderId: string,
  status: string = 'settlement'
): Promise<void> => {
  try {
    logWebhookEvent(PaymentEventType.WEBHOOK_RECEIVED, {
      orderId,
      transactionStatus: status,
      type: 'simulation',
    }, orderId);

    // Buat mock notification data
    const mockNotification: MidtransNotificationData = {
      order_id: orderId,
      transaction_id: `trans-${Date.now()}`,
      gross_amount: '100000',
      payment_type: 'bank_transfer',
      transaction_time: new Date().toISOString(),
      transaction_status: status,
      status_code: '200',
      status_message: 'Transaction is successful',
      fraud_status: 'accept',
      signature_key: 'mock-signature-key',
    };

    // Simulate webhook call
    const response = await handleMidtransWebhook(mockNotification);
    
    logWebhookEvent(PaymentEventType.WEBHOOK_PROCESSED, {
      orderId,
      type: 'simulation',
      response,
    }, orderId);
    
    // Trigger event untuk update UI
    window.dispatchEvent(new CustomEvent('paymentStatusUpdated', {
      detail: {
        orderId,
        status,
        paymentType: mockNotification.payment_type,
        grossAmount: mockNotification.gross_amount,
        transactionTime: mockNotification.transaction_time,
      }
    }));
  } catch (error) {
    logWebhookEvent(PaymentEventType.WEBHOOK_FAILED, {
      orderId,
      type: 'simulation',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, orderId);
  }
};

/**
 * Setup webhook listeners untuk development
 * Dalam production, ini tidak diperlukan karena webhook akan dipanggil oleh Midtrans
 */
export const setupWebhookListeners = (): void => {
  // Listen untuk custom events yang mensimulasikan webhook calls
  window.addEventListener('simulateWebhook', async (event: CustomEvent) => {
    const { orderId, status } = event.detail;
    await simulateWebhookCall(orderId, status);
  });

  // Listen untuk payment status updates dan log
  window.addEventListener('paymentStatusUpdated', (event: CustomEvent) => {
    const { orderId, status, paymentType, grossAmount } = event.detail;
    logWebhookEvent(PaymentEventType.WEBHOOK_PROCESSED, {
      orderId,
      status,
      paymentType,
      grossAmount,
      source: 'ui_event',
    }, orderId);
  });

  paymentLogger.info('Webhook listeners setup complete', {}, 'webhook');
};

/**
 * Test webhook handler dengan berbagai scenarios
 */
export const testWebhookHandler = async (): Promise<void> => {
  const testCases = [
    { orderId: 'TEST-ORDER-1', status: 'settlement', description: 'Successful payment' },
    { orderId: 'TEST-ORDER-2', status: 'pending', description: 'Pending payment' },
    { orderId: 'TEST-ORDER-3', status: 'deny', description: 'Denied payment' },
    { orderId: 'TEST-ORDER-4', status: 'cancel', description: 'Cancelled payment' },
    { orderId: 'TEST-ORDER-5', status: 'expire', description: 'Expired payment' },
  ];

  paymentLogger.info('Starting webhook handler tests', { testCases }, 'webhook');

  for (const testCase of testCases) {
    paymentLogger.info(`Testing webhook: ${testCase.description}`, testCase, 'webhook');
    await simulateWebhookCall(testCase.orderId, testCase.status);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  paymentLogger.info('Webhook handler testing complete', {}, 'webhook');
};

// Export webhook handler functions
export default {
  handleMidtransWebhook,
  handleRecurringNotification,
  handlePayAccountNotification,
  simulateWebhookCall,
  setupWebhookListeners,
  testWebhookHandler,
};