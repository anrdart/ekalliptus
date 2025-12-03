/**
 * Order Service
 * Handles all order-related business logic
 */

import { generateOrderId } from '@/lib/order/calc';
import { calculateAllAmounts, type CalculationInput } from '@/lib/order/calculator';
import { validateVoucher, calculateDiscount } from './voucherService';
import type { ServiceType, OrderStatus, Voucher } from '@/lib/database.types';

export interface OrderFormData {
  nama: string;
  email: string;
  whatsapp: string;
  layanan: string;
  preferensiKontak: string;
  layananDetails: Record<string, unknown>;
}

export interface PreparedOrderData {
  customer_name: string;
  whatsapp: string;
  email: string | null;
  company: string | null;
  service_type: ServiceType;
  urgency: 'normal' | 'express' | 'priority';
  scope: Record<string, unknown>;
  delivery_method: 'pickup' | 'ship';
  schedule_date: string;
  schedule_time: string;
  shipping_cost: number;
  voucher_code: string | null;
  subtotal: number;
  discount: number;
  dpp: number;
  ppn: number;
  fee: number;
  grand_total: number;
  deposit: number;
  remaining: number;
  status: OrderStatus;
}

export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return '+62' + cleaned.substring(1);
  if (cleaned.startsWith('62')) return '+' + cleaned;
  if (cleaned.startsWith('8')) return '+62' + cleaned;
  return phone;
}

export function splitName(fullName: string): { firstName: string; lastName: string | null } {
  const parts = fullName.trim().split(' ');
  return { firstName: parts[0] || fullName, lastName: parts.slice(1).join(' ') || null };
}

const serviceKeyMap: Record<string, ServiceType> = {
  'Website Development': 'website',
  'WordPress Development': 'wordpress',
  'Mobile App Development': 'mobile',
  'Service HP & Laptop': 'service_device',
  'Photo & Video Editing': 'editing',
};

export function toServiceType(serviceName: string): ServiceType {
  return serviceKeyMap[serviceName] || 'website';
}

export function isOnsiteService(serviceType: ServiceType): boolean {
  return serviceType === 'service_device';
}

export function calculateOrderAmounts(
  subtotal: number,
  serviceType: ServiceType,
  voucher?: Voucher | null,
  fee = 0,
  shippingCost = 0
) {
  let discount = 0;
  if (voucher && validateVoucher(voucher, subtotal).valid) {
    discount = calculateDiscount(voucher, subtotal);
  }

  const input: CalculationInput = { subtotal, discount, fee, shippingCost, serviceType };
  return calculateAllAmounts(input);
}

export function prepareOrderData(
  formData: OrderFormData,
  subtotal: number,
  voucher?: Voucher | null,
  fee = 0,
  shippingCost = 0
): PreparedOrderData {
  const serviceType = toServiceType(formData.layanan);
  const amounts = calculateOrderAmounts(subtotal, serviceType, voucher, fee, shippingCost);

  return {
    customer_name: formData.nama,
    whatsapp: normalizePhoneNumber(formData.whatsapp),
    email: formData.email || null,
    company: null,
    service_type: serviceType,
    urgency: 'normal',
    scope: formData.layananDetails || {},
    delivery_method: 'pickup',
    schedule_date: new Date().toISOString().split('T')[0],
    schedule_time: '10:00',
    shipping_cost: amounts.shipping_cost,
    voucher_code: null,
    subtotal: amounts.subtotal,
    discount: amounts.discount,
    dpp: amounts.dpp,
    ppn: amounts.ppn,
    fee: amounts.fee,
    grand_total: amounts.grand_total,
    deposit: amounts.deposit,
    remaining: amounts.remaining,
    status: amounts.status,
  };
}

export function validateOrderData(formData: OrderFormData): { valid: boolean; error?: string } {
  if (!formData.nama?.trim()) return { valid: false, error: 'Nama harus diisi' };
  if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    return { valid: false, error: 'Email tidak valid' };
  }
  if (!formData.whatsapp || formData.whatsapp.replace(/\D/g, '').length < 10) {
    return { valid: false, error: 'Nomor WhatsApp tidak valid' };
  }
  if (!formData.layanan) return { valid: false, error: 'Layanan harus dipilih' };
  return { valid: true };
}

export { generateOrderId };
