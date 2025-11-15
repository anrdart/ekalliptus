import { Customer, OrderItem, Delivery, Amounts, OrderState } from './types';
import { formatRupiah, getItemUnitPrice, findProduct } from './calc';

export function generateOrderSummary(
  customer: Customer,
  items: OrderItem[],
  delivery: Delivery,
  amounts: Amounts,
  voucherCode?: string
): string {
  let summary = `*RINGKASAN PESANAN*\n\n`;
  summary += `*Pemesan:* ${customer.name}\n`;
  summary += `*WhatsApp:* ${customer.whatsapp}\n\n`;

  summary += `*DETAIL PESANAN:*\n`;
  items.forEach((item, index) => {
    const product = item.productId ? findProduct(item.productId) : null;
    if (!product) return;

    summary += `\n${index + 1}. ${product.name}`;
    if (item.variantName) {
      summary += ` (${item.variantName})`;
    }
    if (item.addonNames && item.addonNames.length > 0) {
      summary += ` + ${item.addonNames.join(', ')}`;
    }
    summary += `\n   Qty: ${item.qty} x ${formatRupiah(getItemUnitPrice(item))} = ${formatRupiah(getItemUnitPrice(item) * item.qty)}\n`;
  });

  summary += `\n*RINCIAN BIAYA:*\n`;
  summary += `Subtotal: ${formatRupiah(amounts.subtotal)}\n`;
  if (amounts.discount > 0 && voucherCode) {
    summary += `Diskon (${voucherCode}): -${formatRupiah(amounts.discount)}\n`;
  }
  summary += `DPP: ${formatRupiah(amounts.dpp)}\n`;
  summary += `PPN (11%): ${formatRupiah(amounts.ppn)}\n`;
  if (amounts.biaya > 0) {
    summary += `Ongkir: ${formatRupiah(amounts.biaya)}\n`;
  }
  summary += `*Total: ${formatRupiah(amounts.grand)}*\n\n`;

  if (amounts.dp > 0) {
    summary += `*Pembayaran DP:* ${formatRupiah(amounts.dp)}\n`;
    summary += `*Sisa Bayar:* ${formatRupiah(amounts.sisa)}\n\n`;
  }

  summary += `*JADWAL:*\n`;
  if (delivery.date) {
    summary += `Tanggal: ${new Date(delivery.date).toLocaleDateString('id-ID')}\n`;
  }
  if (delivery.time) {
    summary += `Waktu: ${delivery.time}\n`;
  }
  summary += `Metode: ${delivery.method === 'pickup' ? 'Ambil di Tempat' : 'Kirim'}\n`;
  if (delivery.method === 'ship' && delivery.courier) {
    summary += `Kurir: ${delivery.courier}\n`;
  }

  if (customer.address) {
    summary += `\n*ALAMAT:*\n${customer.address}\n`;
  }

  if (customer.note) {
    summary += `\n*CATATAN:*\n${customer.note}\n`;
  }

  return summary;
}

export function generateWhatsAppMessage(
  orderId: string,
  customer: Customer,
  items: OrderItem[],
  delivery: Delivery,
  amounts: Amounts,
  voucherCode?: string
): string {
  const summary = generateOrderSummary(customer, items, delivery, amounts, voucherCode);

  const message = `Hai, saya *${customer.name}*, order *#${orderId}* sudah bayar DP Rp ${amounts.dp.toLocaleString('id-ID')}. Jadwal: ${delivery.date ? new Date(delivery.date).toLocaleDateString('id-ID') : ''} ${delivery.time || ''}. Mohon konfirmasi ya. Terima kasih!\n\n---\n${summary}`;

  return message;
}

export function openWhatsApp(phone: string, message: string): void {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
