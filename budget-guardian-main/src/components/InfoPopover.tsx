import { HelpCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InfoPopoverProps {
  term: string;
  explanation: string;
}

const InfoPopover = ({ term, explanation }: InfoPopoverProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        className="inline-flex items-center ml-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Learn about ${term}`}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      className="glass-card w-72 text-sm p-4 z-50"
      side="top"
    >
      <p className="font-semibold text-foreground mb-1">{term}</p>
      <p className="text-muted-foreground leading-relaxed">{explanation}</p>
    </PopoverContent>
  </Popover>
);

export default InfoPopover;
