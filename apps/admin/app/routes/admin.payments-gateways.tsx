import React from "react";
import { ShieldCheck } from "lucide-react";

export default function PaymentsGatewaysStub() {
  return (
    <div className="glass-panel rounded-2xl p-8 max-w-lg mx-auto mt-8 text-center flex flex-col items-center justify-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <ShieldCheck className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Payment Gateways</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Layanan Midtrans & Pakasir terkonfigurasi pada environment production. Akses ini dikunci untuk administrator utama.
      </p>
    </div>
  );
}
