/**
 * Order Service
 * Handles all order-related business logic
 */

import { generateOrderId } from '@/lib/order/calc';

export interface OrderFormData {
  nama: string;
  email: string;
  whatsapp: string;
  layanan: string;
  preferensiKontak: string;
  layananDetails: Record<string, any>;
}

export interface OrderSubmissionData {
  order_id: string;
  customer_id: null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: null;
  service_name: string;
  service_price: number;
  quantity: number;
  subtotal: number;
  fees: number;
  total: number;
  currency: string;
  payment_status: string;
  payment_transaction_id: null;
  attachment_meta: any;
  submission_summary: any;
  custom_field1: null;
  custom_field2: null;
  custom_field3: null;
  metadata: any;
}

export interface CustomerData {
  email: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  billing_address: null;
  shipping_address: null;
  metadata: any;
}

export interface TransactionData {
  order_id: string;
  gross_amount: number;
  payment_type: string;
  transaction_status: string;
  transaction_time: string;
  customer_email: string;
  customer_phone: string;
  metadata: any;
}

/**
 * Normalize phone number to Indonesian format
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Split full name into first and last name
 */
export function splitName(fullName: string): { firstName: string; lastName: string | null } {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || fullName;
  const lastName = nameParts.slice(1).join(' ') || null;
  return { firstName, lastName };
}

/**
 * Check if service requires payment
 */
export function isServiceOnly(serviceKey: string): boolean {
  return serviceKey === 'serviceHpLaptop';
}

/**
 * Get default amount for service
 */
export function getDefaultServiceAmount(serviceKey: string): number {
  return isServiceOnly(serviceKey) ? 0 : 500000; // 500k IDR for paid services
}

/**
 * Prepare order data for Supabase submission
 */
export function prepareOrderData(
  formData: OrderFormData,
  serviceKey: string,
  uploadedFiles: any[]
): OrderSubmissionData {
  const orderId = generateOrderId();
  const isNonPaidService = isServiceOnly(serviceKey);
  const defaultAmount = getDefaultServiceAmount(serviceKey);

  return {
    order_id: orderId,
    customer_id: null,
    customer_name: formData.nama,
    customer_email: formData.email,
    customer_phone: normalizePhoneNumber(formData.whatsapp),
    service_id: null,
    service_name: formData.layanan,
    service_price: defaultAmount,
    quantity: 1,
    subtotal: defaultAmount,
    fees: 0,
    total: defaultAmount,
    currency: 'IDR',
    payment_status: isNonPaidService ? 'pending_contact' : 'unpaid',
    payment_transaction_id: null,
    attachment_meta: uploadedFiles.length > 0 ? { files: uploadedFiles } : null,
    submission_summary: {
      service_details: formData.layananDetails[serviceKey],
      contact_preference: formData.preferensiKontak,
      service_key: serviceKey,
    },
    custom_field1: null,
    custom_field2: null,
    custom_field3: null,
    metadata: {
      service_type: formData.layanan,
      created_from: 'order_form',
      ip_address: null,
    },
  };
}

/**
 * Prepare customer data for Supabase submission
 */
export function prepareCustomerData(formData: OrderFormData): CustomerData {
  const { firstName, lastName } = splitName(formData.nama);

  return {
    email: formData.email,
    first_name: firstName,
    last_name: lastName,
    phone: normalizePhoneNumber(formData.whatsapp),
    billing_address: null,
    shipping_address: null,
    metadata: {
      contact_preference: formData.preferensiKontak,
    },
  };
}

/**
 * Prepare transaction data for Supabase submission
 */
export function prepareTransactionData(
  orderId: string,
  formData: OrderFormData,
  amount: number
): TransactionData {
  return {
    order_id: orderId,
    gross_amount: amount,
    payment_type: 'bank_transfer',
    transaction_status: 'pending',
    transaction_time: new Date().toISOString(),
    customer_email: formData.email,
    customer_phone: normalizePhoneNumber(formData.whatsapp),
    metadata: {
      service_type: formData.layanan,
      customer_name: formData.nama,
    },
  };
}

/**
 * Service key mapping utilities
 */
const serviceKeyMap: Record<string, string> = {
  'Website Development': 'websiteDevelopment',
  'WordPress Development': 'wordpressDevelopment',
  'Berdu Platform': 'berduPlatform',
  'Mobile App Development': 'mobileAppDevelopment',
  'Service HP & Laptop': 'serviceHpLaptop',
  'Photo & Video Editing': 'photoVideoEditing',
};

/**
 * Convert service name to service key
 */
export function toServiceKey(serviceName: string): string | null {
  return serviceKeyMap[serviceName] || null;
}

/**
 * Validate order form data before submission
 */
export function validateOrderData(formData: OrderFormData): { valid: boolean; error?: string } {
  if (!formData.nama || formData.nama.trim().length === 0) {
    return { valid: false, error: 'Nama harus diisi' };
  }

  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    return { valid: false, error: 'Email tidak valid' };
  }

  if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, '').length < 10) {
    return { valid: false, error: 'Nomor WhatsApp tidak valid' };
  }

  if (!formData.layanan) {
    return { valid: false, error: 'Layanan harus dipilih' };
  }

  return { valid: true };
}
