import React from "react";
import { BarChart3 } from "lucide-react";

export default function ReportsStub() {
  return (
    <div className="glass-panel rounded-2xl p-8 max-w-lg mx-auto mt-8 text-center flex flex-col items-center justify-center">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <BarChart3 className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-semibold mb-2">Laporan Bisnis</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Fitur laporan komprehensif sedang dalam pengembangan. Laporan grafik mingguan saat ini dapat diakses melalui chart di dashboard utama.
      </p>
    </div>
  );
}
