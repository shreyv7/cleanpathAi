import { useState } from "react";
import GlobalTicker from "@/components/GlobalTicker";
import CampaignTable from "@/components/CampaignTable";
import EmptyState from "@/components/EmptyState";
import { mockCampaigns, type Campaign } from "@/data/mockCampaigns";
import { Zap } from "lucide-react";

const Index = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [showEmpty, setShowEmpty] = useState(false);

  const handleUpdate = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const displayCampaigns = showEmpty ? [] : campaigns;

  return (
    <div className="min-h-screen bg-background">
      <GlobalTicker campaigns={campaigns} />

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
