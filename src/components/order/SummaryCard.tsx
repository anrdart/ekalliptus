'use client';

import { Customer, OrderItem, Delivery, Amounts, ValidationError } from '@/lib/order/types';
import { formatRupiah, applyVoucher } from '@/lib/order/calc';
import { VOUCHERS } from '@/lib/order/data';
import { generateWhatsAppMessage, copyToClipboard, openWhatsApp } from '@/lib/order/whatsapp';

interface SummaryCardProps {
  customer: Customer;
  items: OrderItem[];
  delivery: Delivery;
  voucher: string;
  amounts: Amounts;
  errors: ValidationError[];
  orderId?: string;
  paymentUrl?: string;
  paymentRef?: string;
  isProcessingPayment?: boolean;
  onCreateDeposit: () => void;
  onMarkPaid: () => void;
  onReset: () => void;
}

export default function SummaryCard({
  customer,
  items,
  delivery,
  voucher,
  amounts,
  errors,
  orderId,
  paymentUrl,
  paymentRef,
  isProcessingPayment = false,
  onCreateDeposit,
  onMarkPaid,
  onReset
}: SummaryCardProps) {
  const hasErrors = errors.length > 0;
  const isValid = !hasErrors && items.length > 0 && customer.name && customer.whatsapp && delivery.method && delivery.date && delivery.time;

  const appliedVoucher = voucher ? VOUCHERS.find(v => v.code.toLowerCase() === voucher.toLowerCase()) : undefined;

  const handleCopySummary = async () => {
    const message = generateWhatsAppMessage(
      orderId || 'PENDING',
      customer,
      items,
      delivery,
      amounts,
      voucher
    );
    await copyToClipboard(message);
    alert('Ringkasan disalin ke clipboard!');
  };

  const handleWhatsApp = () => {
    const message = generateWhatsAppMessage(
      orderId || 'PENDING',
      customer,
      items,
      delivery,
      amounts,
      voucher
    );
    openWhatsApp(customer.whatsapp.replace(/\D/g, ''), message);
  };

  const now = new Date();
  const deadline = new Date(now.getTime() + 12 * 60 * 60 * 1000);

  return (
    <div className="glass-panel neon-border rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-foreground mb-6">Ringkasan Pesanan</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">{formatRupiah(amounts.subtotal)}</span>
        </div>

        {amounts.discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Diskon {appliedVoucher && `(${appliedVoucher.code})`}</span>
            <span className="font-medium">-{formatRupiah(amounts.discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">DPP</span>
          <span className="font-medium text-foreground">{formatRupiah(amounts.dpp)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">PPN (11%)</span>
          <span className="font-medium text-foreground">{formatRupiah(amounts.ppn)}</span>
        </div>

        {amounts.biaya > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkir</span>
            <span className="font-medium text-foreground">{formatRupiah(amounts.biaya)}</span>
          </div>
        )}

        <hr className="border-border" />

        <div className="flex justify-between text-xl font-semibold">
          <span className="text-foreground">Total</span>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {formatRupiah(amounts.grand)}
          </span>
        </div>

        {amounts.dp > 0 && (
          <>
            <hr className="border-border" />
            <div className="glass-panel bg-primary/10 rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-foreground">Deposit (DP)</span>
                <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {formatRupiah(amounts.dp)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sisa Bayar</span>
                <span className="font-medium text-foreground">{formatRupiah(amounts.sisa)}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Batas Pembayaran DP:</span>
                  <br />
                  {deadline.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {hasErrors && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
          <p className="text-sm font-medium text-destructive mb-2">Harap perbaiki error berikut:</p>
          <ul className="text-sm text-destructive/80 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {!orderId ? (
          <button
            onClick={onCreateDeposit}
            disabled={!isValid || isProcessingPayment}
            className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-primary hover:to-secondary disabled:from-muted disabled:to-muted disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
          >
            {isProcessingPayment ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Membuat Invoice...
              </>
            ) : (
              'Bayar DP Sekarang'
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="glass-panel bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
              <p className="text-sm font-medium text-emerald-400 mb-1">✓ Invoice Dibuat</p>
              <p className="text-xs text-emerald-400/80 mb-1">Order ID: {orderId}</p>
              <p className="text-xs text-emerald-400/80">Ref: {paymentRef}</p>
            </div>

            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:from-primary hover:to-secondary text-center transition-all shadow-lg hover:shadow-xl"
            >
              Lanjut ke Halaman Pembayaran
            </a>

            <button
              onClick={onMarkPaid}
              className="w-full py-3 border border-emerald-500 text-emerald-400 rounded-xl hover:bg-emerald-500/10 font-medium transition-all"
            >
              Tandai DP Sudah Dibayar (Demo)
            </button>

            <button
              onClick={handleWhatsApp}
              className="w-full py-3 border border-border text-foreground rounded-xl hover:bg-card/50 font-medium transition-all"
            >
              Konfirmasi via WhatsApp
            </button>

            <button
              onClick={handleCopySummary}
              className="w-full py-3 border border-border text-foreground rounded-xl hover:bg-card/50 font-medium transition-all"
            >
              Salin Ringkasan
            </button>

            <button
              onClick={onReset}
              className="w-full py-3 text-destructive hover:bg-destructive/10 rounded-xl font-medium transition-all"
            >
              Buat Order Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
