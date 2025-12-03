/**
 * Property-Based Tests for Voucher Service
 * 
 * **Feature: supabase-sync, Property 3: Voucher Validation Rules**
 * **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
 * 
 * **Feature: supabase-sync, Property 4: Discount Application**
 * **Validates: Requirements 3.5, 4.2**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateVoucher,
  calculateDiscount,
  applyVoucher,
  createMockVoucher,
  type VoucherError,
} from '../voucherService';
import type { Voucher } from '@/lib/database.types';

// Arbitraries for generating test data
const positiveIntArb = fc.integer({ min: 0, max: 100_000_000 });
const percentValueArb = fc.integer({ min: 1, max: 100 });
const nominalValueArb = fc.integer({ min: 1000, max: 10_000_000 });

const voucherTypeArb = fc.constantFrom<'percent' | 'nominal'>('percent', 'nominal');

const validVoucherArb = fc.record({
  code: fc.string({ minLength: 1, maxLength: 20 }),
  type: voucherTypeArb,
  value: fc.integer({ min: 1, max: 100 }),
  min_spend: fc.option(positiveIntArb, { nil: null }),
  max_uses: fc.option(fc.integer({ min: 1, max: 1000 }), { nil: null }),
  used_count: fc.integer({ min: 0, max: 100 }),
  valid_until: fc.option(fc.date().map(d => d.toISOString()), { nil: null }),
  is_active: fc.boolean(),
  created_at: fc.date().map(d => d.toISOString()),
});

describe('Voucher Service - Property Tests', () => {
  /**
   * **Feature: supabase-sync, Property 3: Voucher Validation Rules**
   * **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
   * 
   * For any voucher and order subtotal:
   * - IF voucher.is_active = false THEN validation fails with 'inactive'
   * - IF voucher.valid_until < now() THEN validation fails with 'expired'
   * - IF voucher.used_count >= voucher.max_uses THEN validation fails with 'max_uses_reached'
   * - IF subtotal < voucher.min_spend THEN validation fails with 'min_spend_not_met'
   */
  describe('Property 3: Voucher Validation Rules', () => {
    it('should return not_found when voucher is null', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          (subtotal) => {
            const result = validateVoucher(null, subtotal);
            
            expect(result.valid).toBe(false);
            expect(result.error).toBe('not_found');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return not_found when voucher is undefined', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          (subtotal) => {
            const result = validateVoucher(undefined, subtotal);
            
            expect(result.valid).toBe(false);
            expect(result.error).toBe('not_found');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return inactive when voucher is_active is false', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          (subtotal) => {
            const voucher = createMockVoucher({ is_active: false });
            const result = validateVoucher(voucher, subtotal);
            
            expect(result.valid).toBe(false);
            expect(result.error).toBe('inactive');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return expired when valid_until is in the past', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          fc.integer({ min: 0, max: 1000 }), // Days before 2024-01-01
          (subtotal, daysBeforeNow) => {
            // Generate a date in the past relative to our test date
            const currentDate = new Date('2024-01-01');
            const pastDate = new Date(currentDate);
            pastDate.setDate(pastDate.getDate() - daysBeforeNow - 1); // At least 1 day before
            
            const voucher = createMockVoucher({
              valid_until: pastDate.toISOString(),
            });
            const result = validateVoucher(voucher, subtotal, currentDate);
            
            expect(result.valid).toBe(false);
            expect(result.error).toBe('expired');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return max_uses_reached when used_count >= max_uses', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          (subtotal, maxUses, extraUses) => {
            const usedCount = maxUses + extraUses; // Ensure used_count >= max_uses
            const voucher = createMockVoucher({
              max_uses: maxUses,
              used_count: usedCount,
            });
            const result = validateVoucher(voucher, subtotal);
            
            expect(result.valid).toBe(false);
            expect(result.error).toBe('max_uses_reached');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return min_spend_not_met when subtotal < min_spend', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100000, max: 10000000 }), // min_spend
          fc.integer({ min: 0, max: 99999 }), // subtotal less than min_spend
          (minSpend, subtotalOffset) => {
            const subtotal = Math.min(subtotalOffset, minSpend - 1);
            const voucher = createMockVoucher({ min_spend: minSpend });
            const result = validateVoucher(voucher, subtotal);
            
            expect(result.valid).toBe(false);
            expect(result.error).toBe('min_spend_not_met');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return valid when all conditions pass', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100000, max: 10000000 }),
          (subtotal) => {
            const voucher = createMockVoucher({
              is_active: true,
              valid_until: null, // No expiry
              max_uses: null, // No limit
              min_spend: 0, // No minimum
            });
            const result = validateVoucher(voucher, subtotal);
            
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
            expect(result.voucher).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate in correct order (inactive before expired)', () => {
      const pastDate = new Date('2020-01-01');
      const voucher = createMockVoucher({
        is_active: false,
        valid_until: pastDate.toISOString(),
      });
      const result = validateVoucher(voucher, 100000, new Date('2024-01-01'));
      
      // Should fail with 'inactive' first, not 'expired'
      expect(result.error).toBe('inactive');
    });
  });

  /**
   * **Feature: supabase-sync, Property 4: Discount Application**
   * **Validates: Requirements 3.5, 4.2**
   * 
   * For any valid voucher applied to an order:
   * - IF voucher.type = 'percent' THEN discount = round(subtotal * voucher.value / 100)
   * - IF voucher.type = 'nominal' THEN discount = voucher.value
   * - discount <= subtotal (discount cannot exceed subtotal)
   */
  describe('Property 4: Discount Application', () => {
    it('percent voucher should calculate discount as percentage of subtotal', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          percentValueArb,
          (subtotal, percentValue) => {
            const voucher = createMockVoucher({
              type: 'percent',
              value: percentValue,
            });
            const discount = calculateDiscount(voucher, subtotal);
            const expected = Math.round(subtotal * (percentValue / 100));
            
            expect(discount).toBe(Math.min(expected, subtotal));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('nominal voucher should use fixed discount value', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          nominalValueArb,
          (subtotal, nominalValue) => {
            const voucher = createMockVoucher({
              type: 'nominal',
              value: nominalValue,
            });
            const discount = calculateDiscount(voucher, subtotal);
            
            expect(discount).toBe(Math.min(nominalValue, subtotal));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('discount should never exceed subtotal', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          voucherTypeArb,
          fc.integer({ min: 1, max: 1000000 }),
          (subtotal, type, value) => {
            const voucher = createMockVoucher({ type, value });
            const discount = calculateDiscount(voucher, subtotal);
            
            expect(discount).toBeLessThanOrEqual(subtotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('discount should never be negative', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          voucherTypeArb,
          fc.integer({ min: 1, max: 1000000 }),
          (subtotal, type, value) => {
            const voucher = createMockVoucher({ type, value });
            const discount = calculateDiscount(voucher, subtotal);
            
            expect(discount).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('applyVoucher should return discount when voucher is valid', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100000, max: 10000000 }),
          percentValueArb,
          (subtotal, percentValue) => {
            const voucher = createMockVoucher({
              type: 'percent',
              value: percentValue,
              is_active: true,
              valid_until: null,
              max_uses: null,
              min_spend: 0,
            });
            const result = applyVoucher(voucher, subtotal);
            
            expect(result.valid).toBe(true);
            expect(result.discount).toBeDefined();
            expect(result.discount).toBeLessThanOrEqual(subtotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('applyVoucher should not return discount when voucher is invalid', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          (subtotal) => {
            const voucher = createMockVoucher({ is_active: false });
            const result = applyVoucher(voucher, subtotal);
            
            expect(result.valid).toBe(false);
            expect(result.discount).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
