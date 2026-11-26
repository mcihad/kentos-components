import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { cn } from "../lib/utils"

// Inline messages on the page. Status variants tint the whole box with the
// status tokens; their text uses the *-fg colour so it keeps 4.5:1 contrast.
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 has-[[data-slot=alert-dismiss]]:pr-11 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground [&>svg]:text-muted-foreground",
        info: "border-(--status-info-border) bg-(--status-info-bg) text-(--status-info-fg) *:data-[slot=alert-description]:text-(--status-info-fg)",
        success:
          "border-(--status-success-border) bg-(--status-success-bg) text-(--status-success-fg) *:data-[slot=alert-description]:text-(--status-success-fg)",
        warning:
          "border-(--status-warning-border) bg-(--status-warning-bg) text-(--status-warning-fg) *:data-[slot=alert-description]:text-(--status-warning-fg)",
        destructive:
          "border-(--status-danger-border) bg-(--status-danger-bg) text-(--status-danger-fg) *:data-[slot=alert-description]:text-(--status-danger-fg)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      data-variant={variant ?? "default"}
      role={variant === "destructive" || variant === "warning" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 min-h-4 font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

/** Buttons under the description, e.g. "Yeniden dene". */
function AlertActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-actions"
      className={cn("col-start-2 mt-2 flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

/** A close button in the top-right corner. */
function AlertDismiss({
  className,
  label = "Kapat",
  ...props
}: React.ComponentProps<"button"> & { label?: string }) {
  return (
    <button
      type="button"
      data-slot="alert-dismiss"
      aria-label={label}
      className={cn(
        "absolute top-2 right-2 grid size-8 place-items-center rounded-md text-current opacity-70 outline-none transition-opacity duration-(--duration-fast) hover:opacity-100 focus-visible:shadow-(--focus-shadow)",
        className
      )}
      {...props}
    >
      <XIcon className="size-4" />
    </button>
  )
}

export { Alert, AlertTitle, AlertDescription, AlertActions, AlertDismiss, alertVariants }
