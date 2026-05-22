import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface WinRateRingProps {
  rate: number; // 0-100
}

export function WinRateRing({ rate }: WinRateRingProps) {
  const animated = useAnimatedCounter(rate, 1400);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="bg-kpi rounded-xl p-5 shadow-card flex items-center gap-4">
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 90 90">
          <circle
            cx="45" cy="45" r="40"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="6"
          />
          <circle
            cx="45" cy="45" r="40"
            fill="none"
            stroke="hsl(var(--savings))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-ring-fill"
            style={{ filter: "drop-shadow(0 0 6px hsl(152 60% 48% / 0.5))" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-lg font-bold text-foreground">
          {animated}%
        </span>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Win Rate</p>
        <p className="text-sm text-muted-foreground mt-1">Auctions won</p>
      </div>
    </div>
  );
}
