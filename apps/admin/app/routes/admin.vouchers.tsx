import React from "react";
import { Ticket } from "lucide-react";

export default function VouchersStub() {
  return (
    <div className="glass-panel rounded-2xl p-8 max-w-lg mx-auto mt-8 text-center flex flex-col items-center justify-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <Ticket className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Voucher & Diskon</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Fitur pembuatan voucher saat ini dinonaktifkan. Seluruh penawaran harga dan promo dikonfigurasi melalui pipeline konsultasi.
      </p>
    </div>
  );
}
