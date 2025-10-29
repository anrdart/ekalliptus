import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MidtransSnapParams } from "@/config/midtrans";

const STORAGE_KEY = "ekalliptus.checkout.session.v1";
const isLoggingEnabled = import.meta.env.VITE_ENABLE_PAYMENT_LOGGING === "true";

type ContactPreference = "whatsapp" | "email" | "meeting";

export interface CheckoutCustomerInfo {
  name: string;
  email: string;
  whatsapp: string;
  contactPreference: ContactPreference;
}

export interface CheckoutServiceInfo {
  serviceId: string;
  serviceKey: string;
  summary: string;
  details: Record<string, string>;
}

export interface CheckoutAttachmentMeta {
  name: string;
  size: number;
  type?: string;
}

export interface CheckoutSubmissionSummary {
  perusahaan?: string;
  jabatan?: string;
  website?: string;
  scope?: string;
  anggaran?: string;
  timeline?: string;
  deadline?: string;
  zonaWaktu?: string;
  tujuan?: string;
  referensi?: string;
  deskripsi?: string;
}

export interface CheckoutPaymentInfo {
  orderId: string;
  currency: string;
  subtotal: number;
  fees: number;
  total: number;
  itemName: string;
  itemPrice: number;
  itemQty: number;
  metadata?: Record<string, unknown>;
}

export interface CheckoutSession {
  orderId: string;
  customer: CheckoutCustomerInfo;
  service: CheckoutServiceInfo;
  submissionSummary: CheckoutSubmissionSummary;
  payment: CheckoutPaymentInfo | null; // Allow null for cash payments
  createdAt: string;
  snapParams?: MidtransSnapParams;
  status?: "draft" | "pending" | "paid" | "failed" | "cancelled" | "confirmed";
  attachmentMeta?: CheckoutAttachmentMeta | null;
}

interface SerializableCheckoutSession extends Omit<CheckoutSession, "snapParams"> {
  snapParams?: MidtransSnapParams;
}

interface CheckoutContextValue {
  session: CheckoutSession | null;
  attachmentFile: File | null;
  setCheckoutSession: (session: CheckoutSession, attachmentFile?: File | null) => void;
  updateCheckoutSession: (updates: Partial<CheckoutSession>) => void;
  clearCheckoutSession: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

const deserializeSession = (raw: string | null): CheckoutSession | null => {
  if (!raw) return null;
  try {
    const parsed: SerializableCheckoutSession = JSON.parse(raw);
    return {
      ...parsed,
    };
  } catch (error) {
    if (isLoggingEnabled) {
      console.warn("[CheckoutContext] Failed to parse stored session", error);
    }
    return null;
  }
};

const serializeSession = (session: CheckoutSession | null): string | null => {
  if (!session) return null;
  try {
    const serializable: SerializableCheckoutSession = { ...session };
    return JSON.stringify(serializable);
  } catch (error) {
    if (isLoggingEnabled) {
      console.warn("[CheckoutContext] Failed to serialize session", error);
    }
    return null;
  }
};

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<CheckoutSession | null>(() => deserializeSession(sessionStorage.getItem(STORAGE_KEY)));
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    if (!isHydratedRef.current) {
      isHydratedRef.current = true;
      return;
    }

    const serialized = serializeSession(session);
    if (serialized) {
      sessionStorage.setItem(STORAGE_KEY, serialized);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const setCheckoutSession = useCallback((nextSession: CheckoutSession, file: File | null = null) => {
    if (isLoggingEnabled) {
      console.info("[CheckoutContext] Creating checkout session", nextSession);
    }
    setSession(nextSession);
    setAttachmentFile(file);
  }, []);

  const updateCheckoutSession = useCallback((updates: Partial<CheckoutSession>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...updates };
      if (isLoggingEnabled) {
        console.info("[CheckoutContext] Updating checkout session", updates);
      }
      return merged;
    });
  }, []);

  const clearCheckoutSession = useCallback(() => {
    if (isLoggingEnabled) {
      console.info("[CheckoutContext] Clearing checkout session");
    }
    setSession(null);
    setAttachmentFile(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<CheckoutContextValue>(
    () => ({
      session,
      attachmentFile,
      setCheckoutSession,
      updateCheckoutSession,
      clearCheckoutSession,
    }),
    [session, attachmentFile, setCheckoutSession, updateCheckoutSession, clearCheckoutSession],
  );

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
};

export const useCheckout = (): CheckoutContextValue => {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};
