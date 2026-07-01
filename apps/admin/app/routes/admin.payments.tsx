import React from "react";
import { CreditCard } from "lucide-react";

export default function PaymentsStub() {
  return (
    <div className="glass-panel rounded-2xl p-8 max-w-lg mx-auto mt-8 text-center flex flex-col items-center justify-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <CreditCard className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Halaman Pembayaran Dinonaktifkan</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Fitur pembayaran online saat ini tidak aktif. Pembayaran dilakukan secara manual / langsung demi keamanan dan fleksibilitas transaksi.
      </p>
    </div>
  );
}
