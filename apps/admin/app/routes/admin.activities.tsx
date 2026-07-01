import React from "react";
import { Activity } from "lucide-react";

export default function ActivitiesStub() {
  return (
    <div className="glass-panel rounded-2xl p-8 max-w-lg mx-auto mt-8 text-center flex flex-col items-center justify-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <Activity className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Aktivitas Sistem</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Aktivitas sistem dapat dipantau melalui halaman dashboard utama (Live Activity Log) atau menu Audit Logs untuk riwayat lengkap transaksi.
      </p>
    </div>
  );
}
