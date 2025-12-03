/**
 * Voucher Service
 * Handles voucher validation and discount calculation
 * 
 * **Feature: supabase-sync**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 */

import type { Voucher, VoucherType } from '@/lib/database.types';

/**
 * Voucher validation error types
 */
export type VoucherError =
  | 'not_found'
  | 'inactive'
  | 'expired'
  | 'max_uses_reached'
  | 'min_spend_not_met';

/**
 * Result of voucher validation
 */
export interface VoucherValidationResult {
  valid: boolean;
  error?: VoucherError;
  voucher?: Voucher;
}

/**
 * Result of discount calculation
 */
export interface DiscountResult {
  discount: number;
  voucher: Voucher;
}

/**
 * Validate a voucher against all business rules
 * 
 * Validation rules (in order):
 * 1. Voucher must exist
 * 2. Voucher must be active (is_active = true)
 * 3. Voucher must not be expired (valid_until >= now or null)
 * 4. Voucher must not have reached max uses (used_count < max_uses or max_uses is null)
 * 5. Order subtotal must meet minimum spend requirement (subtotal >= min_spend or min_spend is null)
 * 
 * @param voucher - Voucher to validate (or null if not found)
 * @param subtotal - Order subtotal in IDR
 * @param currentDate - Current date for expiry check (defaults to now)
 * @returns Validation result
 */
export function validateVoucher(
  voucher: Voucher | null | undefined,
  subtotal: number,
  currentDate: Date = new Date()
): VoucherValidationResult {
  // Rule 1: Voucher must exist
  if (!voucher) {
    return { valid: false, error: 'not_found' };
  }

  // Rule 2: Voucher must be active
  if (!voucher.is_active) {
    return { valid: false, error: 'inactive', voucher };
  }

  // Rule 3: Voucher must not be expired
  if (voucher.valid_until) {
    const expiryDate = new Date(voucher.valid_until);
    if (expiryDate < currentDate) {
      return { valid: false, error: 'expired', voucher };
    }
  }

  // Rule 4: Voucher must not have reached max uses
  if (voucher.max_uses !== null && voucher.used_count >= voucher.max_uses) {
    return { valid: false, error: 'max_uses_reached', voucher };
  }

  // Rule 5: Order subtotal must meet minimum spend
  if (voucher.min_spend !== null && subtotal < voucher.min_spend) {
    return { valid: false, error: 'min_spend_not_met', voucher };
  }

  // All validations passed
  return { valid: true, voucher };
}

/**
 * Calculate discount amount based on voucher type
 * 
 * - percent: discount = subtotal * (value / 100)
 * - nominal: discount = value
 * 
 * Discount is capped at subtotal (cannot exceed order value)
 * 
 * @param voucher - Valid voucher
 * @param subtotal - Order subtotal in IDR
 * @returns Discount amount in IDR
 */
export function calculateDiscount(voucher: Voucher, subtotal: number): number {
  let discount: number;

  if (voucher.type === 'percent') {
    discount = Math.round(subtotal * (voucher.value / 100));
  } else {
    // nominal
    discount = voucher.value;
  }

  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal);
  
  // Discount cannot be negative
  discount = Math.max(discount, 0);

  return discount;
}

/**
 * Apply voucher to an order
 * Validates the voucher and calculates the discount
 * 
 * @param voucher - Voucher to apply (or null if not found)
 * @param subtotal - Order subtotal in IDR
 * @param currentDate - Current date for expiry check
 * @returns Discount result or validation error
 */
export function applyVoucher(
  voucher: Voucher | null | undefined,
  subtotal: number,
  currentDate: Date = new Date()
): VoucherValidationResult & { discount?: number } {
  const validation = validateVoucher(voucher, subtotal, currentDate);

  if (!validation.valid || !validation.voucher) {
    return validation;
  }

  const discount = calculateDiscount(validation.voucher, subtotal);

  return {
    valid: true,
    voucher: validation.voucher,
    discount,
  };
}

/**
 * Get human-readable error message for voucher validation error
 * 
 * @param error - Voucher error type
 * @returns Error message in Indonesian
 */
export function getVoucherErrorMessage(error: VoucherError): string {
  const messages: Record<VoucherError, string> = {
    not_found: 'Kode voucher tidak ditemukan',
    inactive: 'Voucher tidak aktif',
    expired: 'Voucher sudah kadaluarsa',
    max_uses_reached: 'Voucher sudah mencapai batas penggunaan',
    min_spend_not_met: 'Minimum pembelian belum tercapai',
  };

  return messages[error];
}

/**
 * Create a mock voucher for testing
 * 
 * @param overrides - Properties to override
 * @returns Mock voucher
 */
export function createMockVoucher(overrides: Partial<Voucher> = {}): Voucher {
  return {
    code: 'TEST10',
    type: 'percent',
    value: 10,
    min_spend: null,
    max_uses: null,
    used_count: 0,
    valid_until: null,
    is_active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}
