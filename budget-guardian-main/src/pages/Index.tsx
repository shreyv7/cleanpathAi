import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import GlobalTicker from "@/components/GlobalTicker";
import CampaignTable from "@/components/CampaignTable";
import EmptyState from "@/components/EmptyState";
import { Zap } from "lucide-react";

export interface Campaign {
  id: string;
  name: string;
  status: boolean;
  total_budget: number;
  spend: number;
  committed: number;
  daily_cap: number;
  pacing_health: "healthy" | "accelerated" | "stalled";
  pacing_mode: "ASAP" | "SMOOTH";
  flight_start: string;
  flight_end: string;
  velocity: number; // $/sec
  spend_history: { hour: number; spend: number; target: number }[];
}

const fetchCampaigns = async (): Promise<Campaign[]> => {
  const apiKey = import.meta.env.VITE_API_KEY || "dashboard-key-001";
  const res = await fetch("http://localhost:3000/api/dashboard/budget-guardian", {
    headers: {
      "X-API-Key": apiKey
    }
  });
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
}

const Index = () => {
  const { data: remoteCampaigns, isLoading } = useQuery({ queryKey: ["campaigns"], queryFn: fetchCampaigns, refetchInterval: 10000 });
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>([]);
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    if (remoteCampaigns) setLocalCampaigns(remoteCampaigns);
  }, [remoteCampaigns]);

  const handleUpdate = (id: string, updates: Partial<Campaign>) => {
    setLocalCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const displayCampaigns = showEmpty ? [] : localCampaigns;

  if (isLoading && !remoteCampaigns) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading Data...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalTicker campaigns={localCampaigns} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Budget Control Center
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">
              Monitor spend, adjust pacing, and optimize delivery across all
              campaigns.
            </p>
          </div>
          <button
            onClick={() => setShowEmpty(!showEmpty)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md border border-border"
          >
            {showEmpty ? "Show Campaigns" : "View Empty State"}
          </button>
        </div>

        {/* Content */}
        {displayCampaigns.length === 0 ? (
          <EmptyState onSetup={() => setShowEmpty(false)} />
        ) : (
          <CampaignTable campaigns={displayCampaigns} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
};

export default Index;
