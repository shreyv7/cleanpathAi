interface TimeRangeSelectorProps {
  selected: string;
  onSelect: (range: string) => void;
}

const ranges = ["1H", "24H", "7D"];

export function TimeRangeSelector({ selected, onSelect }: TimeRangeSelectorProps) {
  return (
    <div className="inline-flex rounded-lg bg-secondary p-1 gap-0.5">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onSelect(r)}
          className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all duration-200
            ${selected === r
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
