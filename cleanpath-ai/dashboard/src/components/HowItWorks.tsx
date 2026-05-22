import { useState } from "react";
import { ChevronDown, Zap } from "lucide-react";

export function HowItWorks() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-kpi rounded-xl shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Zap className="w-4 h-4 text-savings" />
          How this works
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          Our AI analyzes bid history to predict the lowest price needed to win,
          shaving off inefficiency automatically. It continuously learns from
          market patterns, competitor behavior, and win/loss signals to optimize
          every bid in real time — so you never overpay.
        </div>
      </div>
    </div>
  );
}
