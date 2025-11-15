import { Customer, OrderItem, Delivery, Voucher } from './types';
import { isPreorderValid } from './calc';
import { VOUCHERS } from './data';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export function validateCustomer(customer: Customer): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!customer.name || customer.name.trim().length === 0) {
    errors.push({ field: 'customer.name', message: 'Nama wajib diisi' });
  }

  if (!customer.whatsapp || customer.whatsapp.trim().length === 0) {
    errors.push({ field: 'customer.whatsapp', message: 'Nomor WhatsApp wajib diisi' });
  } else {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(customer.whatsapp.replace(/\D/g, ''))) {
      errors.push({ field: 'customer.whatsapp', message: 'Format nomor WhatsApp tidak valid' });
    }
  }

  return errors;
}

export function validateItems(items: OrderItem[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!items || items.length === 0) {
    errors.push({ field: 'items', message: 'Minimal harus ada 1 item dalam pesanan' });
    return errors;
  }

  items.forEach((item, index) => {
    if (!item.productId) {
      errors.push({ field: `items[${index}].productId`, message: 'Produk wajib dipilih' });
    }

    if (item.qty < 1) {
      errors.push({ field: `items[${index}].qty`, message: 'Jumlah minimal 1' });
    }
  });

  return errors;
}

export function validateDelivery(delivery: Delivery): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!delivery.method) {
    errors.push({ field: 'delivery.method', message: 'Metode pengambilan wajib dipilih' });
  }

  if (!delivery.date) {
    errors.push({ field: 'delivery.date', message: 'Tanggal pengambilan wajib diisi' });
  }

  if (!delivery.time) {
    errors.push({ field: 'delivery.time', message: 'Waktu pengambilan wajib diisi' });
  }

  if (delivery.date && delivery.time && !isPreorderValid(delivery.date, delivery.time)) {
    errors.push({
      field: 'delivery.date',
      message: `Pengambilan minimal ${2} jam dari waktu sekarang`
    });
  }

  if (delivery.method === 'ship') {
    if (!delivery.shippingCost || delivery.shippingCost <= 0) {
      errors.push({ field: 'delivery.shippingCost', message: 'Ongkir wajib diisi untuk metode kirim' });
    }
  }

  return errors;
}

export function validateVoucher(voucherCode: string | undefined, subtotal: number): ValidationError[] {
  if (!voucherCode) return [];

  const voucher = VOUCHERS.find(v => v.code.toLowerCase() === voucherCode.toLowerCase());

  if (!voucher) {
    return [{ field: 'voucher', message: 'Kode voucher tidak valid' }];
  }

  if (subtotal < voucher.minSpend) {
    return [{ field: 'voucher', message: `Minimum pembelian Rp ${voucher.minSpend.toLocaleString('id-ID')}` }];
  }

  if (voucher.validUntil) {
    const validUntil = new Date(voucher.validUntil);
    if (validUntil < new Date()) {
      return [{ field: 'voucher', message: 'Voucher sudah expired' }];
    }
  }

  return [];
}

export function validateOrder(
  customer: Customer,
  items: OrderItem[],
  delivery: Delivery,
  voucherCode?: string
): ValidationResult {
  const errors: ValidationError[] = [
    ...validateCustomer(customer),
    ...validateItems(items),
    ...validateDelivery(delivery),
    ...validateVoucher(voucherCode, items.reduce((sum, item) => sum + 0, 0))
  ];

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getFirstErrorField(errors: ValidationError[]): string | null {
  return errors.length > 0 ? errors[0].field : null;
}
