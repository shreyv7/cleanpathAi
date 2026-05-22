import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { WinRateRing } from "@/components/WinRateRing";
import { SavingsChart } from "@/components/SavingsChart";
import { TimeRangeSelector } from "@/components/TimeRangeSelector";
import { HowItWorks } from "@/components/HowItWorks";

export interface BidDataPoint {
  time: string;
  market: number;
  bid: number;
}

const fetchBidData = async () => {
  const apiKey = import.meta.env.VITE_API_KEY || "dashboard-key-001";
  const res = await fetch("http://localhost:3000/api/dashboard/bid-genius", {
    headers: {
      "X-API-Key": apiKey
    }
  });
  if (!res.ok) throw new Error("Failed to fetch bid data");
  return res.json();
}

const Index = () => {
  const { data: apiData, isLoading } = useQuery({ queryKey: ["bid-data"], queryFn: fetchBidData, refetchInterval: 10000 });
  const [range, setRange] = useState("24H");
  
  const data = useMemo(() => {
    if (!apiData) return [];
    if (range === "1H") return apiData.data1H || [];
    if (range === "24H") return apiData.data24H || [];
    if (range === "7D") return apiData.data7D || [];
    return [];
  }, [apiData, range]);

  const stats = apiData?.stats || { totalSavings: 0, avgDiscount: 0, winRate: 0 };

  if (isLoading && !apiData) return <div className="min-h-screen bg-background flex items-center justify-center">Loading Data...</div>;

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
