import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BudgetProgressBarProps {
  spent: number;
  committed: number;
  total: number;
}

const BudgetProgressBar = ({
  spent,
  committed,
  total,
}: BudgetProgressBarProps) => {
  const spentPct = (spent / total) * 100;
  const committedPct = (committed / total) * 100;
  const remainingPct = 100 - spentPct - committedPct;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full">
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
            <div
              className="budget-bar-spent transition-all"
              style={{ width: `${spentPct}%` }}
            />
            <div
              className="budget-bar-committed transition-all"
              style={{ width: `${committedPct}%` }}
            />
            <div
              className="budget-bar-remaining transition-all"
              style={{ width: `${remainingPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground tabular-nums">
            <span>${spent.toLocaleString()}</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="glass-card text-xs z-50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Spent: ${spent.toLocaleString()} ({spentPct.toFixed(1)}%)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            Committed: ${committed.toLocaleString()} ({committedPct.toFixed(1)}%)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-muted" />
            Remaining: ${(total - spent - committed).toLocaleString()} (
            {remainingPct.toFixed(1)}%)
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default BudgetProgressBar;
