import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Campaign } from "@/types/campaign";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BudgetProgressBar from "./BudgetProgressBar";
import CampaignDetail from "./CampaignDetail";
import InfoPopover from "./InfoPopover";

interface CampaignTableProps {
  campaigns: Campaign[];
  onUpdate: (id: string, updates: Partial<Campaign>) => void;
}

const healthConfig = {
  healthy: {
    label: "On Track",
    class: "pill-healthy",
    reason: "Spend is within 5% of the ideal pacing curve for this flight window.",
  },
  accelerated: {
    label: "Accelerated",
    class: "pill-warning",
    reason:
      "Spend is ahead of target by >15%. Consider reducing daily cap or switching to Smooth pacing.",
  },
  stalled: {
    label: "Stalled",
    class: "pill-critical",
    reason:
      "Spend is significantly below target. Check audience size, bid floors, or creative approvals.",
  },
};

const CampaignTable = ({ campaigns, onUpdate }: CampaignTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[40px_44px_1.5fr_0.8fr_1.2fr_0.7fr_0.7fr] gap-3 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/30 items-center">
        <span />
        <span>Status</span>
        <span>Campaign</span>
        <span>Flight Dates</span>
        <span>Budget Progress</span>
        <span>
          Daily Cap
          <InfoPopover
            term="Daily Cap"
            explanation="The maximum dollar amount a campaign can spend per day."
          />
        </span>
        <span>
          Pacing
          <InfoPopover
            term="Pacing Health"
            explanation="Indicates whether spending is on track relative to the campaign's flight schedule and total budget."
          />
        </span>
      </div>

      {/* Rows */}
      {campaigns.map((c) => {
        const health = healthConfig[c.pacing_health];
        const isExpanded = expandedId === c.id;

        return (
          <div key={c.id}>
            <div
              className={`grid grid-cols-[40px_44px_1.5fr_0.8fr_1.2fr_0.7fr_0.7fr] gap-3 px-5 py-4 items-center cursor-pointer transition-colors hover:bg-accent/30 ${isExpanded ? "bg-accent/20" : ""}`}
              onClick={() => setExpandedId(isExpanded ? null : c.id)}
            >
              {/* Expand icon */}
              <span className="text-muted-foreground">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>

              {/* Status toggle */}
              <div onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={c.status}
                  onCheckedChange={(v) => onUpdate(c.id, { status: v })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Campaign info */}
              <div>
                <p className="font-medium text-foreground text-sm">
                  {c.name}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {c.id}
                </p>
              </div>

              {/* Flight dates */}
              <div className="text-sm text-muted-foreground tabular-nums">
                {formatDate(c.flight_start)} — {formatDate(c.flight_end)}
              </div>

              {/* Budget progress */}
              <BudgetProgressBar
                spent={c.spend}
                committed={c.committed}
                total={c.total_budget}
              />

              {/* Daily cap */}
              <div className="text-sm font-medium tabular-nums text-foreground">
                ${c.daily_cap.toLocaleString()}
              </div>

              {/* Pacing health */}
              <Tooltip>
                <TooltipTrigger>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${health.class}`}
                  >
                    {health.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent className="glass-card max-w-xs text-xs z-50">
                  {health.reason}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Expanded detail */}
            {isExpanded && (
              <CampaignDetail campaign={c} onUpdate={onUpdate} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CampaignTable;
