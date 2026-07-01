import React from "react";

interface RevenueChartProps {
  series: Array<{ day: string; value: number }>;
  height?: number;
}

export default function RevenueChart({ series, height = 240 }: RevenueChartProps) {
  const padTop = 16;
  const padBottom = 32;
  const barGap = 8;
  const labelLocale = "id-ID";

  const max = Math.max(...series.map((s) => s.value), 1);

  // Round to a "friendly" boundary
  const friendlyMax = (() => {
    if (max === 0) return 1;
    const exp = Math.pow(10, Math.floor(Math.log10(max)));
    return Math.ceil(max / exp) * exp;
  })();

  const fmtCurrency = (n: number) =>
    new Intl.NumberFormat(labelLocale, { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
    
  const fmtShort = (n: number) => {
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
    if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
    return `Rp ${n}`;
  };

  const dayLabels = series.map((s) => new Date(s.day).toLocaleDateString(labelLocale, { weekday: "short" }));

  return (
    <div className="revenue-chart relative w-full" style={{ height: `${height}px` }}>
      <svg
        role="img"
        aria-label="Revenue chart"
        viewBox={`0 0 ${(series.length || 1) * 60} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="revBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent-2))" />
            <stop offset="55%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        
        {/* horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p) => {
          const y = padTop + (height - padTop - padBottom) * (1 - p);
          return (
            <line
              key={p}
              x1="0"
              x2={(series.length || 1) * 60}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              strokeDasharray={p === 0 ? "0" : "3 3"}
              opacity="0.5"
            />
          );
        })}

        {/* bars */}
        {series.map((point, i) => {
          const colWidth = 60;
          const innerW = colWidth - barGap * 2;
          const x = i * colWidth + barGap;
          const usableH = height - padTop - padBottom;
          const h = friendlyMax > 0 ? (point.value / friendlyMax) * usableH : 0;
          const y = padTop + usableH - h;
          
          return (
            <g key={point.day} className="bar-group group cursor-pointer">
              <title>{`${new Date(point.day).toLocaleDateString(labelLocale, { weekday: "long", day: "numeric", month: "short" })}: ${fmtCurrency(point.value)}`}</title>
              <rect
                x={x}
                y={y}
                width={innerW}
                height={Math.max(h, 2)}
                rx="6"
                ry="6"
                className="bar fill-[url(#revBar)] opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                style={{ transformOrigin: "bottom" }}
              />
              <text
                x={x + innerW / 2}
                y={height - padBottom + 18}
                textAnchor="middle"
                className="day-label fill-[hsl(var(--muted-foreground))] text-[11px]"
              >
                {dayLabels[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <div 
        className="chart-yaxis-hint absolute left-0 right-0 flex flex-col justify-between pointer-events-none text-[10px] text-[hsl(var(--muted-foreground))] pl-0.5"
        style={{ top: "16px", bottom: "32px" }}
      >
        <span>{fmtShort(friendlyMax)}</span>
        <span>{fmtShort(0)}</span>
      </div>
    </div>
  );
}
