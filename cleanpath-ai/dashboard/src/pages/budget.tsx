import { useState, useEffect } from "react";
import GlobalTicker from "@/components/GlobalTicker";
import CampaignTable from "@/components/CampaignTable";
import EmptyState from "@/components/EmptyState";
import type { Campaign } from "@/data/mockCampaigns";
import { Zap, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const Index = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/budgets`);
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        const data = await response.json();

        // Transform API response to Campaign shape
        const campaigns: Campaign[] = (Array.isArray(data) ? data : [data]).map((b: any) => ({
          id: b.campaign_id,
          name: b.campaign_id, // Campaign names would come from a campaign service
          status: b.remaining_budget > 0,
          total_budget: parseFloat(b.total_budget),
          spend: parseFloat(b.total_budget) - parseFloat(b.remaining_budget),
          committed: 0,
          daily_cap: parseFloat(b.daily_cap || 0),
          pacing_health: determinePacingHealth(b),
          pacing_mode: b.pacing_mode || 'ASAP',
          flight_start: b.start_date,
          flight_end: b.end_date,
          velocity: 0,
          spend_history: [],
        }));

        setCampaigns(campaigns);
      } catch (err) {
        console.error('Failed to load campaigns:', err);
        setError('Unable to load campaigns from API');
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
    const interval = setInterval(loadCampaigns, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const campaignsToCreate = [
        {
          campaign_id: 'Q2_Retargeting_DSP',
          total_budget: 150000.0,
          remaining_budget: 120000.0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          daily_cap: 5000.0,
          pacing_mode: 'ASAP'
        },
        {
          campaign_id: 'APAC_Brand_Awareness',
          total_budget: 85000.0,
          remaining_budget: 81000.0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          daily_cap: 3000.0,
          pacing_mode: 'EVEN'
        }
      ];

      for (const camp of campaignsToCreate) {
        await fetch(`${API_BASE_URL}/budgets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'dev-api-key-change-in-production'
          },
          body: JSON.stringify(camp)
        });
      }

      // Refresh campaigns state
      const response = await fetch(`${API_BASE_URL}/budgets`);
      if (response.ok) {
        const data = await response.json();
        const campaignsList = (Array.isArray(data) ? data : [data]).map((b: any) => ({
          id: b.campaign_id,
          name: b.campaign_id,
          status: b.remaining_budget > 0,
          total_budget: parseFloat(b.total_budget),
          spend: parseFloat(b.total_budget) - parseFloat(b.remaining_budget),
          committed: 0,
          daily_cap: parseFloat(b.daily_cap || 0),
          pacing_health: determinePacingHealth(b),
          pacing_mode: b.pacing_mode || 'ASAP',
          flight_start: b.start_date,
          flight_end: b.end_date,
          velocity: 0,
          spend_history: [],
        }));
        setCampaigns(campaignsList);
      }
    } catch (err) {
      console.error('Failed to auto-setup budgets:', err);
      setError('Failed to auto-create default budgets in database.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id: string, updates: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {campaigns.length > 0 && <GlobalTicker campaigns={campaigns} />}

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
          {error && (
            <span className="text-xs text-red-400 bg-red-400/10 px-3 py-1.5 rounded-md">
              {error}
            </span>
          )}
        </div>

        {/* Content */}
        {campaigns.length === 0 ? (
          <EmptyState onSetup={handleSetup} />
        ) : (
          <CampaignTable campaigns={campaigns} onUpdate={handleUpdate} />
        )}
      </div>
    </div>
  );
};

function determinePacingHealth(budget: any): "healthy" | "accelerated" | "stalled" {
  const total = parseFloat(budget.total_budget);
  const remaining = parseFloat(budget.remaining_budget);
  if (total === 0) return "stalled";
  const spendRatio = (total - remaining) / total;
  if (spendRatio > 0.8) return "accelerated";
  if (spendRatio < 0.1) return "stalled";
  return "healthy";
}

export default Index;
