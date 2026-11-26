import { formatNumber } from "../lib/format";
import { cn } from "../lib/utils";
import type { Point } from "./stacked-bars";

/**
 * Tiny bar chart of a series. Empty buckets stay visible as faint ticks, so
 * the time axis reads as a dotted trail even when nothing happened.
 */
export function Sparkline({
  points,
  label,
  className,
  height = 24,
}: {
  points: Point[];
  /** Accessible description; defaults to the total. */
  label?: string;
  className?: string;
  height?: number;
}) {
  if (points.length === 0) return <div className={cn("h-6 w-24", className)} />;
  const max = Math.max(1, ...points.map((p) => p.v));
  const total = points.reduce((sum, p) => sum + p.v, 0);
  const step = 4;
  return (
    <svg
      role="img"
      aria-label={label ?? `Toplam ${formatNumber(total)}`}
      viewBox={`0 0 ${points.length * step} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-6 w-24 text-muted-foreground", className)}
    >
      {points.map((p, i) => {
        const h = p.v > 0 ? Math.max(2, (p.v / max) * height) : 1;
        return (
          <rect
            key={p.t.getTime()}
            x={i * step}
            y={height - h}
            width={step - 1}
            height={h}
            className="fill-current"
            opacity={p.v > 0 ? 0.75 : 0.22}
          />
        );
      })}
    </svg>
  );
}
