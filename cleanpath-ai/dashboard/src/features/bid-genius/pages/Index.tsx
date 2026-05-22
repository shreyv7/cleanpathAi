import { useState, useMemo } from "react";
import { Shield } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { WinRateRing } from "@/components/WinRateRing";
import { SavingsChart } from "@/components/SavingsChart";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import { HowItWorks } from "@/components/HowItWorks";
import { data1H, data24H, data7D, getStats } from "@/data/mockBidData";

const dataMap: Record<string, typeof data1H> = {
  "1H": data1H,
  "24H": data24H,
  "7D": data7D,
};

const Index = () => {
  const [range, setRange] = useState("24H");
  const data = dataMap[range];
  const stats = useMemo(() => getStats(data), [data]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-savings" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Bid Efficiency & AI Savings</h1>
              <p className="text-xs text-muted-foreground">Real-time bid shading performance</p>
            </div>
          </div>
          <TimeRangeSelector selected={range} onSelect={setRange} />
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KPICard
            label="Total Savings"
            value={stats.totalSavings}
            prefix="$"
            decimals={2}
            highlight
          />
          <WinRateRing rate={stats.winRate} />
          <KPICard
            label="Avg. Discount"
            value={stats.avgDiscount}
            suffix="%"
            decimals={1}
          />
        </div>

        {/* Chart */}
        <SavingsChart data={data} />

        {/* How it works */}
        <HowItWorks />
      </div>
    </div>
  );
};

export default Index;
