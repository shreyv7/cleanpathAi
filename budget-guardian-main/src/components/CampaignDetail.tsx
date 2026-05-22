import { useState } from "react";
import type { Campaign } from "@/types/campaign";
import PacingGauge from "./PacingGauge";
import SpendChart from "./SpendChart";
import InfoPopover from "./InfoPopover";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface CampaignDetailProps {
  campaign: Campaign;
  onUpdate: (id: string, updates: Partial<Campaign>) => void;
}

const CampaignDetail = ({ campaign, onUpdate }: CampaignDetailProps) => {
  const [dailyCap, setDailyCap] = useState(campaign.daily_cap);
  const burnRate = Math.round((campaign.spend / campaign.total_budget) * 100);
  const daysElapsed = Math.max(
    1,
    Math.floor(
      (Date.now() - new Date(campaign.flight_start).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  const totalDays = Math.max(
    1,
    Math.floor(
      (new Date(campaign.flight_end).getTime() -
        new Date(campaign.flight_start).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
  const targetBurn = Math.round((daysElapsed / totalDays) * 100);

  const handleCapChange = (val: number) => {
    setDailyCap(val);
    onUpdate(campaign.id, { daily_cap: val });
  };

  return (
    <div className="animate-expand">
      <div className="px-6 py-6 bg-secondary/30 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pacing Gauge */}
          <div className="glass-card p-5 flex flex-col items-center justify-center">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Pacing Gauge
              <InfoPopover
                term="Pacing Gauge"
                explanation="Shows current burn rate vs. the ideal pace based on flight dates. The marker indicates where you should be."
              />
            </h4>
            <PacingGauge current={burnRate} target={targetBurn} />
            <p className="text-xs text-muted-foreground mt-2">
              Target: {targetBurn}% by today
            </p>
          </div>

          {/* Spend Chart */}
          <div className="glass-card p-5 md:col-span-2">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Spend vs Target (24h)
            </h4>
            <SpendChart data={campaign.spend_history} />
          </div>
        </div>

        {/* Controls row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Daily Cap Control */}
          <div className="glass-card p-5">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Daily Cap
              <InfoPopover
                term="Daily Cap"
                explanation="Maximum amount the campaign can spend in a single day. Adjusting this instantly affects pacing."
              />
            </h4>
            <div className="flex items-center gap-4">
              <Slider
                value={[dailyCap]}
                onValueChange={([v]) => handleCapChange(v)}
                max={campaign.total_budget * 0.2}
                min={100}
                step={50}
                className="flex-1"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  type="number"
                  value={dailyCap}
                  onChange={(e) => handleCapChange(Number(e.target.value))}
                  className="w-28 pl-7 bg-secondary border-border tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Pacing Mode */}
          <div className="glass-card p-5">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Pacing Mode
              <InfoPopover
                term="Token Bucket"
                explanation="Smooth pacing uses a Token Bucket algorithm (similar to PID controllers) to distribute spend evenly across the day, avoiding spikes."
              />
            </h4>
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button
                onClick={() =>
                  onUpdate(campaign.id, { pacing_mode: "ASAP" })
                }
                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all ${
                  campaign.pacing_mode === "ASAP"
                    ? "bg-warning/15 text-warning"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                ⚡ ASAP (Fast)
              </button>
              <button
                onClick={() =>
                  onUpdate(campaign.id, { pacing_mode: "SMOOTH" })
                }
                className={`flex-1 py-2.5 px-4 text-sm font-medium transition-all border-l border-border ${
                  campaign.pacing_mode === "SMOOTH"
                    ? "bg-primary/15 text-primary"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                🎯 Smooth (PID)
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {campaign.pacing_mode === "SMOOTH"
                ? "Smooth uses AI to distribute spend evenly 24/7."
                : "ASAP delivers as fast as possible until the cap is hit."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
