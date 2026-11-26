import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cn } from "../lib/utils"

// A progress bar. With a value the indicator slides with transform (GPU);
// without one (null) it runs an indeterminate sweep.
function Progress({
  className,
  indicatorClassName,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { indicatorClassName?: string }) {
  const indeterminate = value === null || value === undefined
  const percent = indeterminate ? 0 : Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      max={max}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-(--surface-muted)", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 rounded-full bg-primary will-change-transform",
          indeterminate
            ? "kentos-indeterminate w-2/5"
            : "transition-transform duration-(--duration-panel) ease-(--ease-out)",
          indicatorClassName
        )}
        style={indeterminate ? undefined : { transform: `translate3d(-${100 - percent}%, 0, 0)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
