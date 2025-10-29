import { generateOrderId } from "@/lib/midtrans";
import type {
  CheckoutAttachmentMeta,
  CheckoutCustomerInfo,
  CheckoutPaymentInfo,
  CheckoutServiceInfo,
  CheckoutSubmissionSummary,
} from "@/context/CheckoutContext";
import type { MidtransCallbackResult } from "@/config/midtrans";

const DEFAULT_CURRENCY = import.meta.env.VITE_DEFAULT_CURRENCY || "IDR";
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const isLoggingEnabled = import.meta.env.VITE_ENABLE_PAYMENT_LOGGING === "true";

export interface CreateCheckoutSessionPayload {
  customer: CheckoutCustomerInfo;
  service: CheckoutServiceInfo;
  submissionSummary: CheckoutSubmissionSummary;
  attachmentMeta?: CheckoutAttachmentMeta | null;
}

export interface CreateCheckoutSessionResponse extends CheckoutPaymentInfo {
  rawResponse?: Record<string, unknown>;
}

export interface FinalizeCheckoutPayload {
  orderId: string;
  paymentStatus: string;
  paymentResult: MidtransCallbackResult;
  customer: CheckoutCustomerInfo;
  service: CheckoutServiceInfo;
  submissionSummary: CheckoutSubmissionSummary;
  attachmentMeta?: CheckoutAttachmentMeta | null;
  attachmentFile?: File | null;
}

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class OrderApi {
  private readonly baseUrl = BASE_URL;

  private logDebug(message: string, payload?: unknown) {
    if (isLoggingEnabled) {
      console.info(`[OrderApi] ${message}`, payload ?? "");
    }
  }

  private logError(message: string, error: unknown) {
    console.error(`[OrderApi] ${message}`, error);
  }

  private async request<T>(path: string, init: RequestInit): Promise<ApiResult<T>> {
    if (!this.baseUrl) {
      return {
        success: false,
        error: "API base URL is not configured. Set VITE_API_BASE_URL in your environment variables.",
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
        const errorBody = await response.text();
        return {
          success: false,
          error: errorBody || response.statusText,
        };
      }

      if (response.status === 204) {
        return { success: true } as ApiResult<T>;
      }

      const data = (await response.json()) as T;
      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logError("Request failed", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private buildMockPaymentInfo(): CheckoutPaymentInfo {
    const orderId = generateOrderId();
    const subtotal = 1500000;
    const fees = 0;
    return {
      orderId,
      currency: DEFAULT_CURRENCY,
      subtotal,
      fees,
      total: subtotal + fees,
      itemName: "Ekalliptus Service Checkout",
      itemPrice: subtotal,
      itemQty: 1,
      metadata: { mock: true },
    };
  }

  async createCheckoutSession(
    payload: CreateCheckoutSessionPayload,
  ): Promise<ApiResult<CreateCheckoutSessionResponse>> {
    this.logDebug("Creating checkout session", payload);

    if (!this.baseUrl) {
      const mockData = this.buildMockPaymentInfo();
      return {
        success: true,
        data: {
          ...mockData,
          rawResponse: { mock: true, reason: "API base URL not configured" },
        },
        message:
          "API base URL not configured. Returning mock checkout session. Update VITE_API_BASE_URL to use real backend.",
      };
    }

    const result = await this.request<CreateCheckoutSessionResponse>("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.success && result.data) {
      this.logDebug("Checkout session created", result.data);
    }

    return result;
  }

  async finalizeCheckout(payload: FinalizeCheckoutPayload): Promise<ApiResult<{ orderId: string }>> {
    this.logDebug("Finalizing checkout", payload);

    if (!this.baseUrl) {
      this.logDebug("Finalize checkout skipped (no API base URL). Returning mock success.");
      return {
        success: true,
        data: { orderId: payload.orderId },
        message: "Finalize checkout skipped because API base URL is not configured.",
      };
    }

    const formData = new FormData();
    formData.append("orderId", payload.orderId);
    formData.append("paymentStatus", payload.paymentStatus);
    formData.append("paymentResult", JSON.stringify(payload.paymentResult));
    formData.append(
      "customer",
      JSON.stringify({
        ...payload.customer,
      }),
    );
    formData.append(
      "service",
      JSON.stringify({
        ...payload.service,
      }),
    );
    formData.append("submissionSummary", JSON.stringify(payload.submissionSummary));

    if (payload.attachmentMeta) {
      formData.append("attachmentMeta", JSON.stringify(payload.attachmentMeta));
    }

    if (payload.attachmentFile) {
      formData.append("attachment", payload.attachmentFile);
    }

    const result = await this.request<{ orderId: string }>("/orders/checkout/finalize", {
      method: "POST",
      body: formData,
      headers: {},
    });

    if (!result.success) {
      this.logError("Finalize checkout failed", result.error);
    }

    return result;
  }
}

export const orderApi = new OrderApi();
