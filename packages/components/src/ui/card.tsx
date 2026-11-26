import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "../lib/utils";

/*
 * The basic surface: a card on the page background (the `card` utility:
 * --card-bg, border, --card-radius, --card-shadow) with padding from
 * --card-p, which follows the density setting.
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Son 24 saat</CardTitle>
 *       <CardDescription>Projedeki yeni hatalar</CardDescription>
 *       <CardAction><Button variant="ghost" size="sm">Tümü</Button></CardAction>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter>…</CardFooter>
 *   </Card>
 *
 * A card that is one link: <Card asChild interactive><a href="…">…</a></Card>.
 */
function Card({
  className,
  asChild = false,
  interactive = false,
  tone = "default",
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean;
  /** Hover and focus feedback for a card that is a link or button. */
  interactive?: boolean;
  /** muted: a quieter surface for secondary panels; brand: tinted with the accent. */
  tone?: "default" | "muted" | "brand";
}) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      data-tone={tone}
      className={cn(
        "card flex min-w-0 flex-col text-foreground",
        tone === "muted" && "bg-(--surface-muted) shadow-none",
        tone === "brand" && "border-(--border-brand)/40 bg-(--surface-brand-subtle) shadow-none",
        interactive &&
          "cursor-pointer outline-none transition-[border-color,box-shadow,background-color] duration-(--duration-fast) hover:border-(--border-strong) hover:shadow-(--shadow-sm) focus-visible:shadow-(--focus-shadow) active:bg-(--surface-hover)",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Title, description and an optional CardAction on the right. `divider`
 * draws a rule under it (for cards whose content is a list or table).
 */
function CardHeader({ className, divider = false, ...props }: React.ComponentProps<"div"> & { divider?: boolean }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-cols-[1fr_auto] items-start gap-x-3 gap-y-0.5 px-(--card-p) pt-(--card-p) [&:last-child]:pb-(--card-p)",
        divider && "border-b pb-(--card-p)",
        className,
      )}
      {...props}
    />
  );
}

/** The card's heading; an h3 unless asChild wraps another level. */
function CardTitle({ className, asChild = false, ...props }: React.ComponentProps<"h3"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "h3";
  return (
    <Comp
      data-slot="card-title"
      className={cn("col-start-1 font-semibold text-md text-strong leading-snug", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("col-start-1 text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

/** Buttons or a menu at the header's top right. */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 flex items-center gap-1 self-start", className)}
      {...props}
    />
  );
}

/**
 * The body. `flush` drops the side padding for edge-to-edge content
 * (tables, lists with their own rows).
 */
function CardContent({ className, flush = false, ...props }: React.ComponentProps<"div"> & { flush?: boolean }) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "flex-1 py-(--card-p) [[data-slot=card-header]:not(.border-b)+&]:pt-3",
        !flush && "px-(--card-p)",
        className,
      )}
      {...props}
    />
  );
}

/** Actions or a summary under the content; `divider` draws a rule above it. */
function CardFooter({ className, divider = false, ...props }: React.ComponentProps<"div"> & { divider?: boolean }) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex flex-wrap items-center gap-2 px-(--card-p) pb-(--card-p) [[data-slot=card-content]+&]:pt-0",
        divider && "border-t pt-3 [[data-slot=card-content]+&]:pt-3",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
