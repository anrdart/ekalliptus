/**
 * Order Amount Calculator
 * Pure calculation functions for order amounts
 * 
 * All amounts are in IDR (Indonesian Rupiah) as integers
 * Matches Supabase schema: subtotal, discount, dpp, ppn, fee, grand_total, deposit, remaining
 */

import { ServiceType, OrderStatus } from '@/lib/database.types';

/**
 * Configuration constants for calculations
 */
export const CALC_CONFIG = {
  /** PPN (VAT) rate - 11% */
  PPN_RATE: 0.11,
  /** Deposit percentage for online services - 50% */
  DEPOSIT_RATE: 0.5,
  /** Minimum deposit amount in IDR */
  MIN_DEPOSIT: 50000,
} as const;

/**
 * Input for amount calculations
 */
export interface CalculationInput {
  subtotal: number;
  discount: number;
  fee: number;
  shippingCost: number;
  serviceType: ServiceType;
}

/**
 * Result of amount calculations
 * Matches Supabase orders table columns
 */
export interface CalculatedAmounts {
  subtotal: number;
  discount: number;
  dpp: number;
  ppn: number;
  fee: number;
  shipping_cost: number;
  grand_total: number;
  deposit: number;
  remaining: number;
  status: OrderStatus;
}

/**
 * Calculate DPP (Dasar Pengenaan Pajak / Tax Base)
 * DPP = subtotal - discount
 * 
 * @param subtotal - Order subtotal in IDR
 * @param discount - Discount amount in IDR
 * @returns DPP amount (minimum 0)
 */
export function calculateDPP(subtotal: number, discount: number): number {
  return Math.max(subtotal - discount, 0);
}

/**
 * Calculate PPN (Pajak Pertambahan Nilai / VAT)
 * PPN = DPP * 11%
 * 
 * @param dpp - Tax base amount in IDR
 * @returns PPN amount (rounded to nearest integer)
 */
export function calculatePPN(dpp: number): number {
  return Math.round(dpp * CALC_CONFIG.PPN_RATE);
}

/**
 * Calculate Grand Total
 * Grand Total = DPP + PPN + Fee + Shipping Cost
 * 
 * @param dpp - Tax base amount in IDR
 * @param ppn - VAT amount in IDR
 * @param fee - Service fee in IDR
 * @param shippingCost - Shipping cost in IDR
 * @returns Grand total (minimum 0)
 */
export function calculateGrandTotal(
  dpp: number,
  ppn: number,
  fee: number,
  shippingCost: number
): number {
  return Math.max(dpp + ppn + fee + shippingCost, 0);
}

/**
 * Calculate Deposit based on service type
 * - service_device: 0% deposit (pay on completion)
 * - other services: 50% deposit
 * 
 * @param grandTotal - Grand total in IDR
 * @param serviceType - Type of service
 * @returns Deposit amount
 */
export function calculateDeposit(grandTotal: number, serviceType: ServiceType): number {
  // Service device (onsite repair) has no deposit
  if (serviceType === 'service_device') {
    return 0;
  }
  
  // Online services require 50% deposit
  const deposit = Math.round(grandTotal * CALC_CONFIG.DEPOSIT_RATE);
  
  // Ensure deposit doesn't exceed grand total
  return Math.min(deposit, grandTotal);
}

/**
 * Calculate Remaining amount
 * Remaining = Grand Total - Deposit
 * 
 * @param grandTotal - Grand total in IDR
 * @param deposit - Deposit amount in IDR
 * @returns Remaining amount
 */
export function calculateRemaining(grandTotal: number, deposit: number): number {
  return Math.max(grandTotal - deposit, 0);
}

/**
 * Determine initial order status based on service type
 * - service_device: waiting_onsite_payment
 * - other services: waiting_dp
 * 
 * @param serviceType - Type of service
 * @returns Initial order status
 */
export function getInitialStatus(serviceType: ServiceType): OrderStatus {
  if (serviceType === 'service_device') {
    return 'waiting_onsite_payment';
  }
  return 'waiting_dp';
}

/**
 * Calculate all order amounts
 * This is the main calculation function that computes all amounts
 * 
 * @param input - Calculation input
 * @returns All calculated amounts matching Supabase schema
 */
export function calculateAllAmounts(input: CalculationInput): CalculatedAmounts {
  const { subtotal, discount, fee, shippingCost, serviceType } = input;
  
  // Calculate tax base
  const dpp = calculateDPP(subtotal, discount);
  
  // Calculate VAT
  const ppn = calculatePPN(dpp);
  
  // Calculate grand total
  const grand_total = calculateGrandTotal(dpp, ppn, fee, shippingCost);
  
  // Calculate deposit based on service type
  const deposit = calculateDeposit(grand_total, serviceType);
  
  // Calculate remaining
  const remaining = calculateRemaining(grand_total, deposit);
  
  // Determine initial status
  const status = getInitialStatus(serviceType);
  
  return {
    subtotal,
    discount,
    dpp,
    ppn,
    fee,
    shipping_cost: shippingCost,
    grand_total,
    deposit,
    remaining,
    status,
  };
}

/**
 * Validate calculation input
 * Ensures all amounts are non-negative
 * 
 * @param input - Calculation input to validate
 * @returns true if valid, throws error if invalid
 */
export function validateCalculationInput(input: CalculationInput): boolean {
  if (input.subtotal < 0) {
    throw new Error('Subtotal cannot be negative');
  }
  if (input.discount < 0) {
    throw new Error('Discount cannot be negative');
  }
  if (input.discount > input.subtotal) {
    throw new Error('Discount cannot exceed subtotal');
  }
  if (input.fee < 0) {
    throw new Error('Fee cannot be negative');
  }
  if (input.shippingCost < 0) {
    throw new Error('Shipping cost cannot be negative');
  }
  return true;
}
