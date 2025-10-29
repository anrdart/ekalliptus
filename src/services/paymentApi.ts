import { MIDTRANS_CONFIG, MidtransSnapParams, MidtransSnapResponse } from "@/config/midtrans";
import { MidtransNotificationData, TransactionLog } from "./notificationHandler";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const isLoggingEnabled = import.meta.env.VITE_ENABLE_PAYMENT_LOGGING === "true";

// Type untuk API response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Type untuk transaction request
export interface CreateTransactionRequest {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  item_details?: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  customer_details?: {
    first_name: string;
    last_name?: string;
    email: string;
    phone: string;
  };
  credit_card?: {
    secure?: boolean;
    bank?: string;
    installment?: {
      required?: boolean;
      terms?: Record<string, number>;
    };
    whitelist_bins?: string[];
  };
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string;
}

// Type untuk transaction status response
export interface TransactionStatus {
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_status: string;
  transaction_time: string;
  fraud_status?: string;
  status_message?: string;
  approval_code?: string;
  bank?: string;
  va_number?: string;
  bill_key?: string;
  biller_code?: string;
  payment_code?: string;
  store?: string;
  settlement_time?: string;
  expiry_time?: string;
  cancel_time?: string;
  refund_time?: string;
  refund_amount?: string;
}

/**
 * Mock API service untuk payment processing
 * Dalam production, ini akan diganti dengan actual backend API calls
 */
class PaymentApiService {
  private readonly baseUrl: string = BASE_URL;
  private readonly isMockMode: boolean = !BASE_URL;

  constructor() {
    if (isLoggingEnabled) {
      console.info(
        `[PaymentApi] Initialized in ${this.isMockMode ? "mock" : "remote"} mode`,
        this.isMockMode ? "using local storage" : `base URL: ${this.baseUrl}`,
      );
    }
  }

  private logDebug(message: string, payload?: unknown) {
    if (isLoggingEnabled) {
      console.info(`[PaymentApi] ${message}`, payload ?? "");
    }
  }

  private logError(message: string, error: unknown) {
    console.error(`[PaymentApi] ${message}`, error);
  }

  private get transactionsKey() {
    return "transactions";
  }

  private loadTransactions(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.transactionsKey) || "[]");
    } catch (error) {
      this.logError("Failed to parse transactions from local storage", error);
      return [];
    }
  }

  private saveTransactions(transactions: any[]): void {
    localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
  }

  private persistTransaction(params: CreateTransactionRequest, token: string): void {
    const transactions = this.loadTransactions();
    transactions.push({
      ...params,
      token,
      created_at: new Date().toISOString(),
      status: "created",
    });
    this.saveTransactions(transactions);
  }

  private async request<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
    if (this.isMockMode) {
      return {
        success: false,
        error: "API base URL is not configured. Set VITE_API_BASE_URL to enable remote payment API calls.",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
          ...init.headers,
        },
        ...init,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || response.statusText,
        };
      }

      if (response.status === 204) {
        return { success: true };
      }

      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (error) {
      this.logError("Network request failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create transaction dengan Midtrans
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async createTransaction(params: CreateTransactionRequest): Promise<ApiResponse<MidtransSnapResponse>> {
    this.logDebug("Creating transaction request", params);

    if (!this.isMockMode) {
      const result = await this.request<MidtransSnapResponse | { data: MidtransSnapResponse }>("/payments/transactions", {
        method: "POST",
        body: JSON.stringify({
          ...params,
          notification_url: MIDTRANS_CONFIG.endpoints.paymentNotification,
          finish_redirect_url: MIDTRANS_CONFIG.endpoints.finishRedirect,
          unfinish_redirect_url: MIDTRANS_CONFIG.endpoints.unfinishRedirect,
          error_redirect_url: MIDTRANS_CONFIG.endpoints.errorRedirect,
        }),
      });

      if (result.success && result.data) {
        const payload = "data" in result.data ? result.data.data : result.data;
        if (payload?.token) {
          this.persistTransaction(params, payload.token);
          return {
            success: true,
            data: payload,
            message: result.message,
          };
        }
        return {
          success: false,
          error: "Invalid response from payment API",
        };
      }

      this.logError("Remote transaction creation failed, falling back to mock mode", result.error);
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock response - Dalam production, backend akan memanggil Midtrans API
      const mockResponse: MidtransSnapResponse = {
        token: `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        redirect_url: `https://app.sandbox.midtrans.com/snap/v3/vtweb/${Date.now()}`,
      };

      // Simpan transaction data ke local storage untuk demo
      this.persistTransaction(params, mockResponse.token);

      return {
        success: true,
        data: mockResponse,
        message: "Transaction created successfully",
      };
    } catch (error) {
      this.logError("Error creating transaction", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create transaction",
      };
    }
  }

  /**
   * Get transaction status
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async getTransactionStatus(orderId: string): Promise<ApiResponse<TransactionStatus>> {
    this.logDebug(`Fetching transaction status for ${orderId}`);

    if (!this.isMockMode) {
      const result = await this.request<TransactionStatus>(`/payments/transactions/${orderId}`, {
        method: "GET",
      });

      if (result.success && result.data) {
        return result;
      }

      this.logError("Remote get transaction status failed, falling back to mock mode", result.error);
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock response - Dalam production, backend akan memanggil Midtrans API
      const transactions = this.loadTransactions();
      const transaction = transactions.find((t: any) => t.transaction_details.order_id === orderId);

      if (!transaction) {
        return {
          success: false,
          error: "Transaction not found",
        };
      }

      // Mock status response
      const mockStatus: TransactionStatus = {
        transaction_id: `trans-${Date.now()}`,
        order_id: orderId,
        gross_amount: transaction.transaction_details.gross_amount.toString(),
        payment_type: "bank_transfer",
        transaction_status: "pending", // pending, settlement, capture, deny, cancel, expire, refund
        transaction_time: transaction.created_at,
        fraud_status: "accept",
        status_message: "Transaction is pending",
      };

      return {
        success: true,
        data: mockStatus,
      };
    } catch (error) {
      this.logError("Error getting transaction status", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get transaction status",
      };
    }
  }

  /**
   * Cancel transaction
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async cancelTransaction(orderId: string): Promise<ApiResponse<any>> {
    this.logDebug(`Cancelling transaction ${orderId}`);

    if (!this.isMockMode) {
      const result = await this.request<{ message?: string }>(`/payments/transactions/${orderId}/cancel`, {
        method: "POST",
      });

      if (result.success) {
        return {
          success: true,
          message: result.data?.message || "Transaction cancelled successfully",
        };
      }

      this.logError("Remote cancel transaction failed, falling back to mock mode", result.error);
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update transaction status di local storage
      const transactions = this.loadTransactions();
      const transactionIndex = transactions.findIndex((t: any) => t.transaction_details.order_id === orderId);

      if (transactionIndex === -1) {
        return {
          success: false,
          error: "Transaction not found",
        };
      }

      transactions[transactionIndex].status = "cancelled";
      transactions[transactionIndex].updated_at = new Date().toISOString();
      this.saveTransactions(transactions);

      return {
        success: true,
        message: "Transaction cancelled successfully",
      };
    } catch (error) {
      this.logError("Error cancelling transaction", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel transaction",
      };
    }
  }

  /**
   * Expire transaction
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async expireTransaction(orderId: string): Promise<ApiResponse<any>> {
    this.logDebug(`Expiring transaction ${orderId}`);

    if (!this.isMockMode) {
      const result = await this.request<{ message?: string }>(`/payments/transactions/${orderId}/expire`, {
        method: "POST",
      });

      if (result.success) {
        return {
          success: true,
          message: result.data?.message || "Transaction expired successfully",
        };
      }

      this.logError("Remote expire transaction failed, falling back to mock mode", result.error);
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update transaction status di local storage
      const transactions = this.loadTransactions();
      const transactionIndex = transactions.findIndex((t: any) => t.transaction_details.order_id === orderId);

      if (transactionIndex === -1) {
        return {
          success: false,
          error: "Transaction not found",
        };
      }

      transactions[transactionIndex].status = "expired";
      transactions[transactionIndex].updated_at = new Date().toISOString();
      this.saveTransactions(transactions);

      return {
        success: true,
        message: "Transaction expired successfully",
      };
    } catch (error) {
      this.logError("Error expiring transaction", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to expire transaction",
      };
    }
  }

  /**
   * Refund transaction
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async refundTransaction(orderId: string, amount?: number): Promise<ApiResponse<any>> {
    this.logDebug(`Refunding transaction ${orderId}`, { amount });

    if (!this.isMockMode) {
      const result = await this.request<{ message?: string }>(`/payments/transactions/${orderId}/refund`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      });

      if (result.success) {
        return {
          success: true,
          message: result.data?.message || "Transaction refunded successfully",
        };
      }

      this.logError("Remote refund transaction failed, falling back to mock mode", result.error);
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update transaction status di local storage
      const transactions = this.loadTransactions();
      const transactionIndex = transactions.findIndex((t: any) => t.transaction_details.order_id === orderId);

      if (transactionIndex === -1) {
        return {
          success: false,
          error: "Transaction not found",
        };
      }

      transactions[transactionIndex].status = "refunded";
      transactions[transactionIndex].refund_amount = amount || transactions[transactionIndex].transaction_details.gross_amount;
      transactions[transactionIndex].updated_at = new Date().toISOString();
      this.saveTransactions(transactions);

      return {
        success: true,
        message: "Transaction refunded successfully",
      };
    } catch (error) {
      this.logError("Error refunding transaction", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to refund transaction",
      };
    }
  }

  /**
   * Handle payment notification webhook
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async handleNotification(notificationData: MidtransNotificationData): Promise<ApiResponse<any>> {
    this.logDebug("Handling payment notification", notificationData);

    if (!this.isMockMode) {
      const result = await this.request<{ message?: string }>("/payments/notifications", {
        method: "POST",
        body: JSON.stringify(notificationData),
      });

      if (result.success) {
        return {
          success: true,
          message: result.data?.message || "Notification processed successfully",
        };
      }

      this.logError("Remote notification handling failed, falling back to mock mode", result.error);
    }

    try {
      // Import notification handler
      const { processPaymentNotification } = await import("./notificationHandler");

      // Process notification
      const result = await processPaymentNotification(notificationData);

      return {
        success: result.success,
        message: result.message,
      };
    } catch (error) {
      this.logError("Error handling notification", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to handle notification",
      };
    }
  }

  /**
   * Get transaction history
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async getTransactionHistory(filters?: {
    limit?: number;
    offset?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<TransactionLog[]>> {
    if (!this.isMockMode) {
      const query = new URLSearchParams();
      if (filters?.limit) query.append("limit", String(filters.limit));
      if (filters?.offset) query.append("offset", String(filters.offset));
      if (filters?.status) query.append("status", filters.status);
      if (filters?.startDate) query.append("startDate", filters.startDate);
      if (filters?.endDate) query.append("endDate", filters.endDate);

      const result = await this.request<TransactionLog[]>(`/payments/transactions/history?${query.toString()}`, {
        method: "GET",
      });

      if (result.success) {
        return result;
      }

      this.logError("Remote get transaction history failed, falling back to mock mode", result.error);
    }

    try {
      // Import notification handler
      const { getTransactionLogs } = await import("./notificationHandler");

      // Get logs
      const logs = await getTransactionLogs(filters);

      return {
        success: true,
        data: logs,
      };
    } catch (error) {
      this.logError("Error getting transaction history", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get transaction history",
      };
    }
  }

  /**
   * Export transaction logs
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async exportTransactionLogs(filters?: {
    orderId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'json';
  }): Promise<ApiResponse<string>> {
    if (!this.isMockMode) {
      const query = new URLSearchParams();
      if (filters?.orderId) query.append("orderId", filters.orderId);
      if (filters?.status) query.append("status", filters.status);
      if (filters?.startDate) query.append("startDate", filters.startDate);
      if (filters?.endDate) query.append("endDate", filters.endDate);
      if (filters?.format) query.append("format", filters.format);

      const result = await this.request<string>(`/payments/transactions/export?${query.toString()}`, {
        method: "GET",
        headers: {
          Accept: "text/csv,application/json",
        },
      });

      if (result.success) {
        return result;
      }

      this.logError("Remote export transaction logs failed, falling back to mock mode", result.error);
    }

    try {
      // Import notification handler
      const { exportTransactionLogs } = await import("./notificationHandler");

      // Export logs
      const csvContent = await exportTransactionLogs(filters);

      return {
        success: true,
        data: csvContent,
        message: 'Transaction logs exported successfully',
      };
    } catch (error) {
      this.logError("Error exporting transaction logs", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to export transaction logs",
      };
    }
  }

  /**
   * Get payment statistics
   * Dalam production, endpoint ini akan dipanggil di backend
   */
  async getPaymentStatistics(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    pendingTransactions: number;
    totalAmount: number;
    successRate: number;
  }>> {
    if (!this.isMockMode) {
      const query = new URLSearchParams();
      if (filters?.startDate) query.append("startDate", filters.startDate);
      if (filters?.endDate) query.append("endDate", filters.endDate);

      const result = await this.request<{
        totalTransactions: number;
        successfulTransactions: number;
        failedTransactions: number;
        pendingTransactions: number;
        totalAmount: number;
        successRate: number;
      }>(`/payments/transactions/statistics?${query.toString()}`, {
        method: "GET",
      });

      if (result.success) {
        return result;
      }

      this.logError("Remote get payment statistics failed, falling back to mock mode", result.error);
    }

    try {
      // Import notification handler
      const { getTransactionLogs } = await import("./notificationHandler");

      // Get logs
      const logs = await getTransactionLogs(filters);

      // Calculate statistics
      const totalTransactions = logs.length;
      const successfulTransactions = logs.filter((log) => log.transaction_status === "settlement" || log.transaction_status === "capture").length;
      const failedTransactions = logs.filter((log) => log.transaction_status === "deny" || log.transaction_status === "cancel" || log.transaction_status === "expire").length;
      const pendingTransactions = logs.filter((log) => log.transaction_status === "pending").length;
      const totalAmount = logs.reduce((sum, log) => sum + log.gross_amount, 0);
      const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;

      return {
        success: true,
        data: {
          totalTransactions,
          successfulTransactions,
          failedTransactions,
          pendingTransactions,
          totalAmount,
          successRate,
        },
      };
    } catch (error) {
      this.logError("Error getting payment statistics", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get payment statistics",
      };
    }
  }
}

// Export singleton instance
export const paymentApi = new PaymentApiService();
export default paymentApi;
