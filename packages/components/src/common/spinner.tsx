import { Loader2Icon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

/**
 * A spinning indicator for work in progress (rotates with transform, so it
 * stays smooth while the main thread is busy). Give it a label when it is
 * the only sign of the work.
 */
export function Spinner({
  label = "Yükleniyor",
  className,
  ...props
}: ComponentProps<"svg"> & { label?: string }) {
  return (
    <Loader2Icon
      role="status"
      aria-label={label}
      data-slot="spinner"
      className={cn("size-4 shrink-0 animate-spin will-change-transform", className)}
      {...props}
    />
  );
}
