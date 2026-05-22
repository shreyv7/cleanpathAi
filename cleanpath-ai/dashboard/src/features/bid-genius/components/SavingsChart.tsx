import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  time: string;
  market: number;
  bid: number;
}

interface SavingsChartProps {
  data: DataPoint[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const market = payload.find((p: any) => p.dataKey === "market")?.value ?? 0;
  const bid = payload.find((p: any) => p.dataKey === "bid")?.value ?? 0;
  const saved = market - bid;
  const pct = market > 0 ? ((saved / market) * 100).toFixed(0) : "0";

  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-card font-mono text-xs">
      <p className="text-muted-foreground mb-2 font-display text-[11px] uppercase tracking-wider">At {label}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-market inline-block" />
        <span className="text-muted-foreground">Market Value</span>
        <span className="ml-auto text-foreground font-semibold">${market.toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-savings inline-block" />
        <span className="text-muted-foreground">You Paid</span>
        <span className="ml-auto text-foreground font-semibold">${bid.toFixed(2)}</span>
      </div>
      <div className="border-t border-border mt-2 pt-2 flex items-center gap-2">
        <span className="text-savings font-semibold">You saved ${saved.toFixed(2)} ({pct}%)</span>
      </div>
    </div>
  );
}

export function SavingsChart({ data }: SavingsChartProps) {
  return (
    <div className="bg-kpi rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Bid Savings Analysis</h3>
          <p className="text-xs text-muted-foreground mt-0.5">The green zone represents your AI-optimized savings</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-market inline-block rounded" style={{ borderTop: "2px dashed hsl(var(--market))" }} />
            Market Valuation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-savings inline-block rounded" />
            Your Bid
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="hsl(152, 60%, 48%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
          <XAxis
            dataKey="time"
            tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Market line - dashed red, on top */}
          <Area
            type="monotone"
            dataKey="market"
            stroke="hsl(0, 72%, 58%)"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="none"
          />
          {/* Bid line - solid green with fill */}
          <Area
            type="monotone"
            dataKey="bid"
            stroke="hsl(152, 60%, 48%)"
            strokeWidth={2}
            fill="url(#savingsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-savings bg-savings/10 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-savings animate-pulse" />
          Savings Zone — AI Optimized
        </span>
      </div>
    </div>
  );
}
