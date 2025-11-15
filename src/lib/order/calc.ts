import { OrderItem, Product, Voucher, Amounts, Delivery } from './types';
import { PRODUCTS, VOUCHERS } from './data';
import { formatCurrency as formatRupiahUtil, roundCurrency } from '@/lib/currency';

export const CONFIG = {
  BRAND_NAME: 'Toko Online',
  COLORS: {
    primary: 'rgb(59, 130, 246)',
    accent: 'rgb(16, 185, 129)',
    text: 'rgb(17, 24, 39)',
    muted: 'rgb(107, 114, 128)',
    surface: 'rgb(255, 255, 255)',
    surfaceAlt: 'rgb(249, 250, 251)',
    ring: 'rgb(59, 130, 246)',
    danger: 'rgb(239, 68, 68)',
    success: 'rgb(34, 197, 94)'
  },
  RADIUS: '12px',
  FONT_FAMILY: 'system-ui, -apple-system, sans-serif',
  CURRENCY: 'IDR',
  PPN_RATE: 0.11,
  SERVICE_FEE: 0,
  DEPOSIT_MODE: 'percent' as const,
  DEPOSIT_VALUE: 0.3,
  MIN_DEPOSIT: 50000,
  DEFAULT_ONGKIR: 15000,
  PREORDER_CUTOFF_HOURS: 2,
  DEFAULT_GATEWAY: 'mock' as const
};

// Re-export from centralized currency utility
export const formatRupiah = formatRupiahUtil;
export const roundToNearest = roundCurrency;

export function findProduct(productId: string): Product | undefined {
  return PRODUCTS.find(p => p.id === productId);
}

export function getItemUnitPrice(item: OrderItem): number {
  if (!item.productId) return 0;

  const product = findProduct(item.productId);
  if (!product) return 0;

  let price = product.basePrice;

  if (item.variantName) {
    const variant = product.variants?.find(v => v.name === item.variantName);
    if (variant) price += variant.priceDelta;
  }

  if (item.addonNames && item.addonNames.length > 0) {
    item.addonNames.forEach(addonName => {
      const addon = product.addons?.find(a => a.name === addonName);
      if (addon) price += addon.price;
    });
  }

  return price;
}

export function getItemSubtotal(item: OrderItem): number {
  return getItemUnitPrice(item) * item.qty;
}

export function applyVoucher(subtotal: number, voucherCode: string | undefined): { discount: number; voucher?: Voucher } {
  if (!voucherCode) return { discount: 0 };

  const voucher = VOUCHERS.find(v => v.code.toLowerCase() === voucherCode.toLowerCase());

  if (!voucher) return { discount: 0 };

  if (subtotal < voucher.minSpend) {
    return { discount: 0, voucher };
  }

  if (voucher.validUntil) {
    const validUntil = new Date(voucher.validUntil);
    if (validUntil < new Date()) {
      return { discount: 0, voucher };
    }
  }

  let discount = 0;

  if (voucher.type === 'percent') {
    discount = (subtotal * voucher.value) / 100;
  } else {
    discount = voucher.value;
  }

  discount = Math.min(discount, subtotal);
  discount = Math.max(discount, 0);

  return { discount, voucher };
}

export function calculateAmounts(
  items: OrderItem[],
  voucherCode: string | undefined,
  delivery: Delivery
): Amounts {
  const itemSubtotal = items.reduce((sum, item) => sum + getItemSubtotal(item), 0);

  const { discount } = applyVoucher(itemSubtotal, voucherCode);

  const subtotal = itemSubtotal;

  const dpp = Math.max(subtotal - discount, 0);

  const ppn = Math.round(dpp * CONFIG.PPN_RATE);

  const biaya = delivery.shippingCost + CONFIG.SERVICE_FEE;

  const grand = Math.max(dpp + ppn + biaya, 0);

  let dp = 0;
  if (CONFIG.DEPOSIT_MODE === 'percent') {
    dp = roundToNearest(grand * CONFIG.DEPOSIT_VALUE, 100);
    dp = Math.max(dp, CONFIG.MIN_DEPOSIT);
  } else {
    dp = Math.max(CONFIG.DEPOSIT_VALUE, CONFIG.MIN_DEPOSIT);
  }

  dp = Math.min(dp, grand);

  const sisa = grand - dp;

  return {
    subtotal,
    discount,
    dpp,
    ppn,
    biaya,
    grand,
    dp,
    sisa
  };
}

export function normalizeWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.substring(1);
  }
  if (cleaned.startsWith('62')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('8')) {
    return '+62' + cleaned;
  }
  return phone;
}

export function isPreorderValid(date: string, time: string): boolean {
  if (!date || !time) return false;

  const deliveryDateTime = new Date(`${date}T${time}`);
  const now = new Date();
  const cutoff = new Date(now.getTime() + CONFIG.PREORDER_CUTOFF_HOURS * 60 * 60 * 1000);

  return deliveryDateTime >= cutoff;
}

export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
}
