import React from "react";
import { Link } from "react-router";
import { CreditCard, MessageSquare, ShieldCheck } from "lucide-react";

const cards = [
  { href: "/admin/payments/gateways", icon: CreditCard, title: "Payment Gateways", desc: "Konfigurasi Midtrans, Pakasir, biaya, dan dukungan QR." },
  { href: "/admin/consultations", icon: MessageSquare, title: "Consultations", desc: "Tinjau handoff pengunjung dan balasan admin." },
  { href: null, icon: ShieldCheck, title: "Session", desc: "Hook auth admin siap untuk lapisan identitas produksi Anda." },
];

export default function Settings() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((c, idx) => {
        const inner = (
          <>
            <div className="bg-primary pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-70" />
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <c.icon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mb-1 font-semibold">{c.title}</h2>
            <p className="text-sm text-muted-foreground">{c.desc}</p>
          </>
        );
        
        return c.href ? (
          <Link 
            key={idx}
            to={c.href} 
            className="glass-panel relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5 hover:bg-accent/40 cursor-interactive block"
          >
            {inner}
          </Link>
        ) : (
          <div key={idx} className="glass-panel relative overflow-hidden rounded-2xl p-5">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
