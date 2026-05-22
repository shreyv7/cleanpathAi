interface PacingGaugeProps {
  current: number; // 0-100 percentage
  target: number;  // 0-100 percentage
}

const PacingGauge = ({ current, target }: PacingGaugeProps) => {
  const clamp = (v: number) => Math.min(100, Math.max(0, v));
  const currentAngle = (clamp(current) / 100) * 180;
  const targetAngle = (clamp(target) / 100) * 180;

  const polarToCart = (angle: number, r: number) => {
    const rad = ((180 - angle) * Math.PI) / 180;
    return { x: 100 + r * Math.cos(rad), y: 100 - r * Math.sin(rad) };
  };

  const arcPath = (angle: number, r: number) => {
    const start = polarToCart(0, r);
    const end = polarToCart(angle, r);
    const large = angle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
  };

  const needleEnd = polarToCart(currentAngle, 72);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 115" className="w-48 h-auto">
        {/* Background arc */}
        <path
          d={arcPath(180, 80)}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Target marker */}
        {(() => {
          const t = polarToCart(targetAngle, 80);
          return (
            <circle
              cx={t.x}
              cy={t.y}
              r="4"
              fill="hsl(var(--muted-foreground))"
              opacity="0.6"
            />
          );
        })()}
        {/* Current arc */}
        <path
          d={arcPath(currentAngle, 80)}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="12"
          strokeLinecap="round"
          className="glow-green"
        />
        {/* Needle */}
        <line
          x1="100"
          y1="100"
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="hsl(var(--foreground))"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill="hsl(var(--foreground))" />
        {/* Labels */}
        <text x="15" y="110" className="fill-muted-foreground text-[10px]">
          0%
        </text>
        <text x="170" y="110" className="fill-muted-foreground text-[10px]">
          100%
        </text>
      </svg>
      <div className="text-center -mt-2">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {current}%
        </span>
        <span className="text-xs text-muted-foreground ml-1">burn rate</span>
      </div>
    </div>
  );
};

export default PacingGauge;
