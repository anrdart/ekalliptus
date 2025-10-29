import { MIDTRANS_CONFIG, MidtransSnapParams, MidtransSnapResponse, MidtransCallbackResult } from '@/config/midtrans';
import { paymentApi } from '@/services/paymentApi';

// Extend window type untuk Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: MidtransCallbackResult) => void;
          onPending?: (result: MidtransCallbackResult) => void;
          onError?: (result: MidtransCallbackResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

/**
 * Load Midtrans Snap script
 */
export const loadSnapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if script already loaded
    if (window.snap) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src*="snap.js"]`);
    if (existingScript) {
      // If script exists but snap is not available, wait for it to load
      const checkInterval = setInterval(() => {
        if (window.snap) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for Midtrans Snap to initialize'));
      }, 10000);
      
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = MIDTRANS_CONFIG.snapUrl;
    script.setAttribute('data-client-key', MIDTRANS_CONFIG.clientKey);
    script.async = true;
    script.defer = true;

    const timeout = setTimeout(() => {
      reject(new Error('Timeout loading Midtrans Snap script'));
    }, 15000); // 15 seconds timeout

    script.onload = () => {
      clearTimeout(timeout);
      
      // Wait a bit for the script to initialize
      setTimeout(() => {
        if (window.snap) {
          resolve();
        } else {
          reject(new Error('Snap script loaded but snap object not available'));
        }
      }, 500);
    };

    script.onerror = (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load Midtrans Snap script: ${error}`));
    };

    document.head.appendChild(script);
  });
};

/**
 * Generate unique order ID
 */
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORDER-${timestamp}-${random}`;
};

/**
 * Create Snap Token
 * Note: Dalam production, ini harus dilakukan di backend untuk keamanan
 * Ini hanya contoh untuk development
 */
export const createSnapToken = async (params: MidtransSnapParams): Promise<string> => {
  try {
    // Validate input parameters
    if (!params.transaction_details?.order_id) {
      throw new Error('Order ID is required');
    }
    
    if (!params.transaction_details?.gross_amount || params.transaction_details.gross_amount <= 0) {
      throw new Error('Valid gross amount is required');
    }

    // Gunakan payment API service
    const response = await paymentApi.createTransaction(params);

    if (!response.success || !response.data) {
      const errorMessage = response.error || 'Failed to create transaction';
      console.error('API Error creating snap token:', errorMessage);
      throw new Error(errorMessage);
    }

    if (!response.data.token) {
      throw new Error('No token received from payment gateway');
    }

    return response.data.token;
  } catch (error) {
    console.error('Error creating snap token:', error);
    
    // Re-throw with more descriptive error
    if (error instanceof Error) {
      throw new Error(`Payment gateway error: ${error.message}`);
    }
    
    throw new Error('Unknown error occurred while creating payment token');
  }
};

/**
 * Open Midtrans Snap payment popup
 */
export const openSnapPayment = async (
  snapToken: string,
  callbacks?: {
    onSuccess?: (result: MidtransCallbackResult) => void;
    onPending?: (result: MidtransCallbackResult) => void;
    onError?: (result: MidtransCallbackResult) => void;
    onClose?: () => void;
  }
): Promise<void> => {
  try {
    // Ensure Snap script is loaded
    await loadSnapScript();

    if (!window.snap) {
      throw new Error('Midtrans Snap is not available');
    }

    // Add timeout for payment popup
    const paymentTimeout = setTimeout(() => {
      callbacks?.onClose?.();
    }, 300000); // 5 minutes timeout

    // Open payment popup
    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        clearTimeout(paymentTimeout);
        console.log('Payment success:', result);
        callbacks?.onSuccess?.(result);
      },
      onPending: (result) => {
        clearTimeout(paymentTimeout);
        console.log('Payment pending:', result);
        callbacks?.onPending?.(result);
      },
      onError: (result) => {
        clearTimeout(paymentTimeout);
        console.error('Payment error:', result);
        callbacks?.onError?.(result);
      },
      onClose: () => {
        clearTimeout(paymentTimeout);
        console.log('Payment popup closed');
        callbacks?.onClose?.();
      },
    });
  } catch (error) {
    console.error('Error opening snap payment:', error);
    throw error;
  }
};

/**
 * Process payment
 * Fungsi lengkap untuk memproses pembayaran dari awal hingga akhir
 */
export const processPayment = async (
  params: MidtransSnapParams,
  callbacks?: {
    onSuccess?: (result: MidtransCallbackResult) => void;
    onPending?: (result: MidtransCallbackResult) => void;
    onError?: (result: MidtransCallbackResult) => void;
    onClose?: () => void;
  }
): Promise<void> => {
  try {
    // Validate params before processing
    if (!params.transaction_details?.order_id || !params.transaction_details?.gross_amount) {
      throw new Error('Invalid transaction details: order_id and gross_amount are required');
    }

    // Step 1: Create snap token with retry
    let snapToken: string;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        snapToken = await createSnapToken(params);
        break;
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw error;
        }
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Step 2: Open payment popup
    await openSnapPayment(snapToken!, callbacks);
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

/**
 * Verify payment notification (untuk backend)
 * Fungsi ini seharusnya dipanggil di backend untuk verifikasi notifikasi dari Midtrans
 */
export const verifyPaymentNotification = async (notificationData: any): Promise<boolean> => {
  try {
    // IMPORTANT: Verifikasi signature harus dilakukan di backend
    const response = await fetch('/api/payment/verify-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error('Failed to verify notification');
    }

    const result = await response.json();
    return result.verified === true;
  } catch (error) {
    console.error('Error verifying payment notification:', error);
    return false;
  }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (orderId: string): Promise<any> => {
  try {
    // Gunakan payment API service
    const response = await paymentApi.getTransactionStatus(orderId);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get payment status');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};
