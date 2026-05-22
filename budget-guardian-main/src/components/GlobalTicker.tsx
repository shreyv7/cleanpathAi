import { DollarSign, TrendingUp, PiggyBank } from "lucide-react";
import InfoPopover from "./InfoPopover";
import type { Campaign } from "@/types/campaign";

interface GlobalTickerProps {
  campaigns: Campaign[];
}

const GlobalTicker = ({ campaigns }: GlobalTickerProps) => {
  const active = campaigns.filter((c) => c.status);
  const totalBudget = active.reduce((s, c) => s + c.total_budget, 0);
  const totalVelocity = active.reduce((s, c) => s + c.velocity, 0);
  const totalSavings = active.reduce(
    (s, c) => s + (c.total_budget - c.spend - c.committed),
    0
  );

  const stats = [
    {
      icon: DollarSign,
      label: "Total Budget Active",
      value: `$${totalBudget.toLocaleString()}`,
      sub: `${active.length} campaigns`,
      color: "text-foreground",
    },
    {
      icon: TrendingUp,
      label: "Real-time Velocity",
      value: `$${totalVelocity.toFixed(2)}/sec`,
      sub: "across all active",
      color: "text-primary",
      pulse: true,
      info: {
        term: "Spend Velocity",
        explanation:
          "The aggregated rate at which budget is being consumed across all active campaigns, measured in dollars per second.",
      },
    },
    {
      icon: PiggyBank,
      label: "Global Savings",
      value: `$${totalSavings.toLocaleString()}`,
      sub: "remaining unallocated",
      color: "text-primary",
    },
  ];

  return (
    <div className="ticker-gradient sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <stat.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                {stat.info && (
                  <InfoPopover
                    term={stat.info.term}
                    explanation={stat.info.explanation}
                  />
                )}
              </div>
              <span
                className={`text-lg font-semibold tabular-nums ${stat.color} ${stat.pulse ? "velocity-pulse" : ""}`}
              >
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalTicker;
