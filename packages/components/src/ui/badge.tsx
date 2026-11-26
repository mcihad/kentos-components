import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import { Slot } from "radix-ui";
import { cn } from "../lib/utils";

/*
 * Small labels: statuses, counts, tags. Tones use the status tokens (soft
 * fill, *-fg text, 4.5:1 contrast) and follow the accent and dark mode;
 * solid variants (default, destructive) are for counts that must stand out.
 * A badge can lead with a dot (pulsing for live states) or an icon, and can
 * be removable (filter chips, tags).
 */

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap border font-medium tabular leading-none transition-[color,background-color,box-shadow] duration-(--duration-fast) focus-visible:shadow-(--focus-shadow) focus-visible:outline-none [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solid
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-(--brand-bg-hover)",
        destructive: "border-transparent bg-(--danger-bg) text-(--danger-fg) [a&]:hover:bg-(--danger-bg-hover)",
        // Soft tones
        secondary: "border-transparent bg-(--surface-muted) text-foreground [a&]:hover:bg-(--surface-active)",
        neutral:
          "border-(--status-neutral-border) bg-(--status-neutral-bg) text-(--status-neutral-fg) [a&]:hover:bg-(--surface-active)",
        brand: "border-(--border-brand)/25 bg-brand-subtle text-brand-ink",
        info: "border-(--status-info-border) bg-(--status-info-bg) text-(--status-info-fg)",
        success: "border-(--status-success-border) bg-(--status-success-bg) text-(--status-success-fg)",
        warning: "border-(--status-warning-border) bg-(--status-warning-bg) text-(--status-warning-fg)",
        danger: "border-(--status-danger-border) bg-(--status-danger-bg) text-(--status-danger-fg)",
        // Quiet
        outline: "border-(--border-default) text-foreground [a&]:hover:bg-(--surface-hover)",
        ghost: "border-transparent text-muted-foreground [a&]:hover:bg-(--surface-hover)",
        link: "border-transparent text-link underline-offset-4 [a&]:hover:underline",
      },
      size: {
        sm: "h-5 px-1.5 text-2xs [&>svg]:size-3",
        md: "h-6 px-2 text-xs [&>svg]:size-3.5",
        lg: "h-7 px-2.5 text-sm [&>svg]:size-4",
      },
      shape: {
        pill: "rounded-full",
        square: "rounded-sm",
      },
    },
    defaultVariants: { variant: "default", size: "md", shape: "pill" },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

function Badge({
  className,
  variant = "default",
  size = "md",
  shape = "pill",
  dot = false,
  pulse = false,
  icon: Icon,
  onRemove,
  removeLabel,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** A leading dot in the current colour; pulse for live states ("Canlı"). */
    dot?: boolean;
    pulse?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    /** Shows a remove button (filter chips, tags). */
    onRemove?: () => void;
    removeLabel?: string;
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "span";
  const name = typeof children === "string" ? `${children} kaldır` : "Kaldır";
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size, shape }), onRemove && "pr-0.5", className)}
      {...props}
    >
      {dot ? (
        <span aria-hidden className="relative flex size-1.5 shrink-0">
          {pulse ? (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
          ) : null}
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {Icon ? <Icon /> : null}
      <Slot.Slottable>{children}</Slot.Slottable>
      {onRemove ? (
        <button
          type="button"
          aria-label={removeLabel ?? name}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 grid size-[1.25em] shrink-0 place-items-center rounded-full opacity-70 outline-none transition-opacity hover:bg-current/15 hover:opacity-100 focus-visible:shadow-(--focus-shadow)"
        >
          <XIcon className="size-[0.85em]" />
        </button>
      ) : null}
    </Comp>
  );
}

/** Formats a count for a badge: 120 → "99+" with the default max. */
function formatCount(count: number, max = 99) {
  return count > max ? `${max}+` : String(count);
}

/**
 * Puts a count or dot on the top-right corner of its child (an icon button,
 * an avatar). Hidden at zero unless showZero.
 */
function BadgeAnchor({
  count,
  max = 99,
  dot = false,
  showZero = false,
  variant = "destructive",
  label,
  className,
  children,
}: {
  count?: number;
  max?: number;
  /** A plain dot instead of a number. */
  dot?: boolean;
  showZero?: boolean;
  variant?: "default" | "destructive" | "brand" | "warning" | "success" | "info";
  /** Screen-reader text, e.g. "3 okunmamış bildirim". */
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const visible = dot || (count !== undefined && (count > 0 || showZero));
  return (
    <span data-slot="badge-anchor" className={cn("relative inline-flex", className)}>
      {children}
      {visible ? (
        <span
          data-slot="badge-anchor-count"
          className={cn(
            badgeVariants({ variant, size: "sm" }),
            "pointer-events-none absolute -top-1 -right-1 min-w-5 animate-in shadow-[0_0_0_2px_var(--surface-card)] duration-200 zoom-in-50",
            dot && "size-2.5 min-w-0 p-0",
          )}
        >
          {dot ? null : formatCount(count ?? 0, max)}
          {label ? <span className="sr-only">{label}</span> : null}
        </span>
      ) : null}
    </span>
  );
}

export { Badge, BadgeAnchor, badgeVariants, formatCount };
