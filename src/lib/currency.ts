/**
 * Currency Formatting Utilities
 * Centralized currency formatting for consistent display across the application
 */

/**
 * Format number as Indonesian Rupiah currency
 * @param amount - Amount in IDR
 * @param options - Intl.NumberFormat options
 * @returns Formatted currency string (e.g., "Rp 1.000.000")
 */
export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Legacy alias for formatCurrency
 * @deprecated Use formatCurrency instead
 */
export const formatRupiah = formatCurrency;

/**
 * Parse currency string to number
 * Removes currency symbols and separators
 * @param value - Currency string (e.g., "Rp 1.000.000" or "1,000,000")
 * @returns Numeric value
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9,-]/g, '');
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalized) || 0;
}

/**
 * Format number as compact currency (e.g., "1,5 jt", "2,3 M")
 * @param amount - Amount in IDR
 * @returns Compact currency string
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(1)} rb`;
  }
  return formatCurrency(amount);
}

/**
 * Round amount to nearest increment
 * @param amount - Amount to round
 * @param increment - Rounding increment (default: 100)
 * @returns Rounded amount
 */
export function roundCurrency(amount: number, increment = 100): number {
  return Math.round(amount / increment) * increment;
}
