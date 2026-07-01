import React from "react";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  iconColorClass?: string;
  value: string;
  label: string;
  change?: string;
  trend?: "up" | "down" | null;
  valueId?: string;
}

export default function StatCard({
  icon: Icon,
  iconColorClass = "text-primary",
  value,
  label,
  change,
  trend,
  valueId
}: StatCardProps) {
  return (
    <div className="glass-card group relative overflow-hidden rounded-2xl p-6">
      {/* gradient top accent */}
      <div className="bg-primary pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-70"></div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-105">
          <Icon className={`h-6 w-6 ${iconColorClass}`} />
        </div>
        {change && trend && (
          <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            trend === "up" 
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
              : "bg-destructive/10 text-destructive"
          }`}>
            {trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <h3 className="mb-1 text-2xl font-bold tracking-tight" id={valueId}>{value}</h3>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
