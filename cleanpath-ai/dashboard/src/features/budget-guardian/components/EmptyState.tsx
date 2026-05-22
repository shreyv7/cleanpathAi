import { Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onSetup: () => void;
}

const EmptyState = ({ onSetup }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
    <div className="relative mb-8">
      <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
        <Wallet className="h-12 w-12 text-primary" />
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
        <span className="text-warning text-lg">+</span>
      </div>
    </div>
    <h2 className="text-2xl font-bold text-foreground mb-2">
      No campaigns yet
    </h2>
    <p className="text-muted-foreground text-center max-w-md mb-8 leading-relaxed">
      Set up your first campaign budget to start tracking spend, pacing, and
      optimizing delivery across your ad portfolio.
    </p>
    <Button
      onClick={onSetup}
      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 text-base font-semibold rounded-lg gap-2"
    >
      Setup First Budget
      <ArrowRight className="h-4 w-4" />
    </Button>
  </div>
);

export default EmptyState;
