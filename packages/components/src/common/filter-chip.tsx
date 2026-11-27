import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { cn } from "../lib/utils";

/*
 * Filter chips: rounded toggles above a list ("Açık", "Bana atanan",
 * "Son 24 saat"). A selected chip is tinted with the accent and leads with a
 * check; a count can follow the label.
 *
 * FilterChipGroup is a Radix ToggleGroup (one tab stop, arrow keys between
 * chips): type="multiple" for independent filters, type="single" for one of
 * several. A lone FilterChip is a toggle button (aria-pressed); with
 * `menu` it shows a caret and is meant as the trigger of a dropdown.
 *
 *   <FilterChipGroup type="multiple" value={filters} onValueChange={setFilters} aria-label="Süzgeçler">
 *     <FilterChipItem value="open" count={42}>Açık</FilterChipItem>
 *     <FilterChipItem value="mine">Bana atanan</FilterChipItem>
 *   </FilterChipGroup>
 */

type Icon = ComponentType<{ className?: string }>;

const chipClass = cn(
  "group/chip inline-flex h-8 shrink-0 select-none items-center gap-1.5 whitespace-nowrap rounded-full border px-3 font-medium text-sm outline-none",
  "border-(--border-default) bg-(--surface-card) text-foreground transition-[color,background-color,border-color,box-shadow] duration-(--duration-fast)",
  "hover:border-(--border-strong) hover:bg-(--surface-hover) focus-visible:shadow-(--focus-shadow) active:bg-(--surface-active)",
  "disabled:pointer-events-none disabled:opacity-50",
  "data-[state=on]:border-(--border-brand) data-[state=on]:bg-(--surface-brand-subtle) data-[state=on]:text-(--text-brand)",
  "aria-pressed:border-(--border-brand) aria-pressed:bg-(--surface-brand-subtle) aria-pressed:text-(--text-brand)",
  "[&_svg]:size-3.5 [&_svg]:shrink-0",
);

function ChipBody({
  icon: ChipIcon,
  count,
  menu,
  children,
}: {
  icon?: Icon;
  count?: ReactNode;
  menu?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      {/* The check replaces the icon while selected, so the width barely moves. */}
      <CheckIcon
        aria-hidden
        className="hidden group-data-[state=on]/chip:block group-aria-pressed/chip:block"
      />
      {ChipIcon ? (
        <ChipIcon
          aria-hidden
          className="text-muted-foreground group-data-[state=on]/chip:hidden group-aria-pressed/chip:hidden"
        />
      ) : null}
      <span>{children}</span>
      {count !== undefined && count !== null ? (
        <span className="tabular rounded-full bg-(--surface-muted) px-1.5 text-muted-foreground text-xs leading-5 group-data-[state=on]/chip:bg-(--brand-bg) group-data-[state=on]/chip:text-(--brand-fg) group-aria-pressed/chip:bg-(--brand-bg) group-aria-pressed/chip:text-(--brand-fg)">
          {count}
        </span>
      ) : null}
      {menu ? <ChevronDownIcon aria-hidden className="-mr-1 text-muted-foreground" /> : null}
    </>
  );
}

/** A standalone toggle chip, or a dropdown trigger with `menu`. */
export function FilterChip({
  selected = false,
  icon,
  count,
  menu = false,
  className,
  children,
  ...props
}: ComponentProps<"button"> & {
  selected?: boolean;
  icon?: Icon;
  count?: ReactNode;
  /** Shows a caret: the chip opens a menu of options. */
  menu?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot="filter-chip"
      aria-pressed={menu ? undefined : selected}
      data-state={menu && selected ? "on" : undefined}
      className={cn(chipClass, className)}
      {...props}
    >
      <ChipBody icon={icon} count={count} menu={menu}>
        {children}
      </ChipBody>
    </button>
  );
}

/** A row of chips that wraps; arrow keys move between them. */
export function FilterChipGroup({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="filter-chip-group"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  );
}

/** One chip in a FilterChipGroup. */
export function FilterChipItem({
  icon,
  count,
  className,
  children,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item> & { icon?: Icon; count?: ReactNode }) {
  return (
    <ToggleGroupPrimitive.Item data-slot="filter-chip" className={cn(chipClass, className)} {...props}>
      <ChipBody icon={icon} count={count}>
        {children}
      </ChipBody>
    </ToggleGroupPrimitive.Item>
  );
}
