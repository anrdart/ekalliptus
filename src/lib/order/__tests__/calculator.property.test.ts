/**
 * Property-Based Tests for Order Amount Calculator
 * 
 * **Feature: supabase-sync, Property 1: Amount Calculation Consistency**
 * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
 * 
 * **Feature: supabase-sync, Property 2: Service Type Determines Deposit Behavior**
 * **Validates: Requirements 3.3, 3.4, 6.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateDPP,
  calculatePPN,
  calculateGrandTotal,
  calculateDeposit,
  calculateRemaining,
  calculateAllAmounts,
  getInitialStatus,
  CALC_CONFIG,
  type CalculationInput,
} from '../calculator';
import type { ServiceType } from '@/lib/database.types';

// Arbitraries for generating test data
const serviceTypeArb = fc.constantFrom<ServiceType>(
  'website',
  'wordpress',
  'mobile',
  'editing',
  'service_device'
);

const onlineServiceTypeArb = fc.constantFrom<ServiceType>(
  'website',
  'wordpress',
  'mobile',
  'editing'
);

const positiveIntArb = fc.integer({ min: 0, max: 100_000_000 }); // Up to 100 million IDR

const validCalculationInputArb = fc.record({
  subtotal: positiveIntArb,
  discount: positiveIntArb,
  fee: positiveIntArb,
  shippingCost: positiveIntArb,
  serviceType: serviceTypeArb,
}).filter(input => input.discount <= input.subtotal); // Discount cannot exceed subtotal

describe('Order Amount Calculator - Property Tests', () => {
  /**
   * **Feature: supabase-sync, Property 1: Amount Calculation Consistency**
   * **Validates: Requirements 6.1, 6.2, 6.3, 6.5**
   * 
   * For any valid order input, the calculated amounts SHALL satisfy:
   * - dpp = subtotal - discount
   * - ppn = round(dpp * 0.11)
   * - grandTotal = dpp + ppn + fee + shippingCost
   * - remaining = grandTotal - deposit
   * - All amounts >= 0
   */
  describe('Property 1: Amount Calculation Consistency', () => {
    it('DPP should equal subtotal minus discount', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          positiveIntArb,
          (subtotal, discountRaw) => {
            const discount = Math.min(discountRaw, subtotal); // Ensure valid discount
            const dpp = calculateDPP(subtotal, discount);
            
            expect(dpp).toBe(subtotal - discount);
            expect(dpp).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('PPN should equal DPP times 11% (rounded)', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          (dpp) => {
            const ppn = calculatePPN(dpp);
            const expected = Math.round(dpp * CALC_CONFIG.PPN_RATE);
            
            expect(ppn).toBe(expected);
            expect(ppn).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Grand total should equal DPP + PPN + fee + shipping cost', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          positiveIntArb,
          positiveIntArb,
          positiveIntArb,
          (dpp, ppn, fee, shippingCost) => {
            const grandTotal = calculateGrandTotal(dpp, ppn, fee, shippingCost);
            
            expect(grandTotal).toBe(dpp + ppn + fee + shippingCost);
            expect(grandTotal).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Remaining should equal grand total minus deposit', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          positiveIntArb,
          (grandTotal, depositRaw) => {
            const deposit = Math.min(depositRaw, grandTotal); // Ensure valid deposit
            const remaining = calculateRemaining(grandTotal, deposit);
            
            expect(remaining).toBe(grandTotal - deposit);
            expect(remaining).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('All calculated amounts should be non-negative', () => {
      fc.assert(
        fc.property(
          validCalculationInputArb,
          (input) => {
            const result = calculateAllAmounts(input);
            
            expect(result.subtotal).toBeGreaterThanOrEqual(0);
            expect(result.discount).toBeGreaterThanOrEqual(0);
            expect(result.dpp).toBeGreaterThanOrEqual(0);
            expect(result.ppn).toBeGreaterThanOrEqual(0);
            expect(result.fee).toBeGreaterThanOrEqual(0);
            expect(result.shipping_cost).toBeGreaterThanOrEqual(0);
            expect(result.grand_total).toBeGreaterThanOrEqual(0);
            expect(result.deposit).toBeGreaterThanOrEqual(0);
            expect(result.remaining).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Calculation pipeline should be consistent end-to-end', () => {
      fc.assert(
        fc.property(
          validCalculationInputArb,
          (input) => {
            const result = calculateAllAmounts(input);
            
            // Verify DPP calculation
            expect(result.dpp).toBe(input.subtotal - input.discount);
            
            // Verify PPN calculation
            expect(result.ppn).toBe(Math.round(result.dpp * CALC_CONFIG.PPN_RATE));
            
            // Verify grand total calculation
            expect(result.grand_total).toBe(
              result.dpp + result.ppn + input.fee + input.shippingCost
            );
            
            // Verify remaining calculation
            expect(result.remaining).toBe(result.grand_total - result.deposit);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: supabase-sync, Property 2: Service Type Determines Deposit Behavior**
   * **Validates: Requirements 3.3, 3.4, 6.4**
   * 
   * For any order with a valid service_type:
   * - IF service_type = 'service_device' THEN deposit = 0 AND status = 'waiting_onsite_payment'
   * - IF service_type IN ('website', 'wordpress', 'mobile', 'editing') THEN deposit = 50% AND status = 'waiting_dp'
   */
  describe('Property 2: Service Type Determines Deposit Behavior', () => {
    it('service_device should have zero deposit', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          (grandTotal) => {
            const deposit = calculateDeposit(grandTotal, 'service_device');
            
            expect(deposit).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('service_device should have waiting_onsite_payment status', () => {
      const status = getInitialStatus('service_device');
      expect(status).toBe('waiting_onsite_payment');
    });

    it('online services should have 50% deposit', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          onlineServiceTypeArb,
          (grandTotal, serviceType) => {
            const deposit = calculateDeposit(grandTotal, serviceType);
            const expected = Math.round(grandTotal * CALC_CONFIG.DEPOSIT_RATE);
            
            expect(deposit).toBe(Math.min(expected, grandTotal));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('online services should have waiting_dp status', () => {
      fc.assert(
        fc.property(
          onlineServiceTypeArb,
          (serviceType) => {
            const status = getInitialStatus(serviceType);
            expect(status).toBe('waiting_dp');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('deposit should never exceed grand total', () => {
      fc.assert(
        fc.property(
          positiveIntArb,
          serviceTypeArb,
          (grandTotal, serviceType) => {
            const deposit = calculateDeposit(grandTotal, serviceType);
            
            expect(deposit).toBeLessThanOrEqual(grandTotal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('calculateAllAmounts should set correct deposit and status based on service type', () => {
      fc.assert(
        fc.property(
          validCalculationInputArb,
          (input) => {
            const result = calculateAllAmounts(input);
            
            if (input.serviceType === 'service_device') {
              expect(result.deposit).toBe(0);
              expect(result.status).toBe('waiting_onsite_payment');
              expect(result.remaining).toBe(result.grand_total);
            } else {
              const expectedDeposit = Math.min(
                Math.round(result.grand_total * CALC_CONFIG.DEPOSIT_RATE),
                result.grand_total
              );
              expect(result.deposit).toBe(expectedDeposit);
              expect(result.status).toBe('waiting_dp');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
