import { Slot, Toolbar as ToolbarPrimitive } from "radix-ui";
import type { ComponentProps, ComponentType, ReactElement } from "react";
import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

/*
 * A joined row of compact controls: view switches, refresh, filters. Arrow
 * keys move between the controls (one tab stop for the whole toolbar).
 *
 *   <Toolbar aria-label="Liste">
 *     <ToolbarToggleGroup type="single" value={view} onValueChange={setView}>
 *       <ToolbarToggleItem value="list" icon={ListIcon} label="Liste" />
 *       <ToolbarToggleItem value="grid" icon={LayoutGridIcon} label="Izgara" />
 *     </ToolbarToggleGroup>
 *     <ToolbarSeparator />
 *     <ToolbarButton icon={RefreshCwIcon} label="Yenile" onClick={refetch} />
 *   </Toolbar>
 */

type Icon = ComponentType<{ className?: string }>;

/** The toolbar frame; give it an aria-label. */
export function Toolbar({ className, ...props }: ComponentProps<typeof ToolbarPrimitive.Root>) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={cn(
        "inline-flex h-[max(var(--control-h-sm),2.25rem)] shrink-0 items-center gap-0.5 rounded-md border border-(--border-default) bg-(--neutral-bg) p-0.5 shadow-(--shadow-xs) md:h-(--control-h-sm)",
        className,
      )}
      {...props}
    />
  );
}

const controlClass =
  "inline-flex h-full min-w-[calc(var(--control-h-sm)-6px)] items-center justify-center gap-1.5 rounded-[max(calc(var(--radius-md)-2px),0px)] px-2 font-semibold text-muted-foreground text-xs outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-(--surface-selected) data-[state=on]:text-strong [&_svg]:size-4 [&_svg]:shrink-0";

function withTooltip(element: ReactElement, label: string, show: boolean) {
  if (!show) return element;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * A toolbar button. With an icon it shows only the icon (label in a tooltip)
 * unless showLabel; with asChild it renders the given link.
 */
export function ToolbarButton({
  icon: ButtonIcon,
  label,
  showLabel = false,
  asChild = false,
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof ToolbarPrimitive.Button>, "title"> & {
  icon?: Icon;
  label: string;
  showLabel?: boolean;
}) {
  const iconOnly = !!ButtonIcon && !showLabel;
  const Inner = asChild ? Slot.Root : "span";
  const element = (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      aria-label={iconOnly ? label : undefined}
      className={cn(controlClass, className)}
      asChild={asChild}
      {...props}
    >
      {asChild ? (
        <Inner>
          {ButtonIcon ? <ButtonIcon /> : null}
          <Slot.Slottable>{children}</Slot.Slottable>
          {iconOnly ? null : label}
        </Inner>
      ) : (
        <>
          {ButtonIcon ? <ButtonIcon /> : null}
          {iconOnly ? null : label}
        </>
      )}
    </ToolbarPrimitive.Button>
  );
  return withTooltip(element, label, iconOnly);
}

/** Exclusive (type="single") or independent (type="multiple") toggles. */
export function ToolbarToggleGroup({
  className,
  ...props
}: ComponentProps<typeof ToolbarPrimitive.ToggleGroup>) {
  return (
    <ToolbarPrimitive.ToggleGroup
      data-slot="toolbar-toggle-group"
      className={cn("flex h-full items-center gap-0.5", className)}
      {...props}
    />
  );
}

/** One toggle; icon only with a tooltip unless showLabel. */
export function ToolbarToggleItem({
  icon: ItemIcon,
  label,
  showLabel = false,
  className,
  ...props
}: Omit<ComponentProps<typeof ToolbarPrimitive.ToggleItem>, "title" | "children"> & {
  icon?: Icon;
  label: string;
  showLabel?: boolean;
}) {
  const iconOnly = !!ItemIcon && !showLabel;
  return withTooltip(
    <ToolbarPrimitive.ToggleItem
      data-slot="toolbar-toggle-item"
      aria-label={iconOnly ? label : undefined}
      className={cn(controlClass, className)}
      {...props}
    >
      {ItemIcon ? <ItemIcon /> : null}
      {iconOnly ? null : label}
    </ToolbarPrimitive.ToggleItem>,
    label,
    iconOnly,
  );
}

/** A thin divider between control groups. */
export function ToolbarSeparator({ className, ...props }: ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn("mx-0.5 h-4 w-px shrink-0 bg-border", className)}
      {...props}
    />
  );
}
