import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface KPICardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  highlight?: boolean;
}

export function KPICard({ label, value, prefix = "", suffix = "", decimals = 0, highlight = false }: KPICardProps) {
  const animated = useAnimatedCounter(value, 1400, decimals);

  return (
    <div className={`bg-kpi rounded-xl p-5 shadow-card ${highlight ? "animate-pulse-glow glow-savings" : ""}`}>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className={`font-mono text-3xl font-bold tracking-tight ${highlight ? "gradient-savings-text" : "text-foreground"}`}>
        {prefix}{decimals > 0 ? animated.toFixed(decimals) : animated.toLocaleString()}{suffix}
      </p>
    </div>
  );
}
