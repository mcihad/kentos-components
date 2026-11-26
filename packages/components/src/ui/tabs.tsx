import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { Slot, Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "../lib/utils";
import { Skeleton } from "./skeleton";

/*
 * Tabs in three looks (default: segmented track, line: underline with a
 * sliding indicator, pill: rounded chips). Tabs carry an icon, a badge,
 * a close button and can be disabled. A row that does not fit scrolls with
 * the wheel, touch or the edge buttons, fades at the edges and keeps the
 * active tab in view. Content can mount lazily (on first visit, then kept)
 * and suspends with a skeleton.
 *
 * TabsNav / TabsNavItem draw the same row for router links (sections bound
 * to the URL).
 */

export type TabsVariant = "default" | "line" | "pill";
type Icon = React.ComponentType<{ className?: string }>;

type TabsState = { value?: string; visited: Set<string>; orientation: "horizontal" | "vertical" };
const TabsContext = React.createContext<TabsState>({ visited: new Set(), orientation: "horizontal" });

function Tabs({
  className,
  orientation = "horizontal",
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp ?? inner;
  const visited = React.useRef(new Set<string>());
  if (value !== undefined) visited.current.add(value);
  const change = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setInner(next);
      onValueChange?.(next);
    },
    [valueProp, onValueChange],
  );
  return (
    <TabsContext.Provider value={{ value, visited: visited.current, orientation }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        orientation={orientation}
        value={value}
        onValueChange={change}
        className={cn(
          "group/tabs flex min-w-0 gap-3 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:gap-5",
          className,
        )}
        {...props}
      />
    </TabsContext.Provider>
  );
}

/** The list classes per variant (kept for compatibility). */
const tabsListVariants = cva("group/tabs-list relative flex w-max items-center data-[full=true]:w-full", {
  variants: {
    variant: {
      default:
        "h-[max(var(--control-h-md),2.5rem)] gap-0.5 rounded-lg bg-(--surface-muted) p-[3px] md:h-(--control-h-md)",
      line: "gap-1",
      pill: "gap-1.5 py-0.5",
    },
  },
  defaultVariants: { variant: "default" },
});

const triggerClass = cn(
  "relative inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-medium text-muted-foreground text-sm outline-none transition-[color,background-color,box-shadow] duration-(--duration-fast)",
  "focus-visible:shadow-(--focus-shadow) disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  // Segmented track
  "group-data-[variant=default]/tabs-list:h-full group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-3 group-data-[variant=default]/tabs-list:hover:text-foreground",
  "group-data-[variant=default]/tabs-list:data-[state=active]:bg-(--surface-card) group-data-[variant=default]/tabs-list:data-[state=active]:text-strong group-data-[variant=default]/tabs-list:data-[state=active]:shadow-(--shadow-xs)",
  // Underline
  "group-data-[variant=line]/tabs-list:min-h-[max(var(--control-h-lg),2.75rem)] group-data-[variant=line]/tabs-list:rounded-t-md group-data-[variant=line]/tabs-list:px-3.5 md:group-data-[variant=line]/tabs-list:min-h-(--control-h-lg)",
  "group-data-[variant=line]/tabs-list:hover:bg-(--surface-hover) group-data-[variant=line]/tabs-list:hover:text-foreground group-data-[variant=line]/tabs-list:data-[state=active]:text-(--tabs-fg-active)",
  // Pills
  "group-data-[variant=pill]/tabs-list:h-[max(var(--control-h-sm),2.25rem)] group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:px-3.5 md:group-data-[variant=pill]/tabs-list:h-(--control-h-sm)",
  "group-data-[variant=pill]/tabs-list:hover:bg-(--surface-hover) group-data-[variant=pill]/tabs-list:hover:text-foreground group-data-[variant=pill]/tabs-list:data-[state=active]:bg-brand-subtle group-data-[variant=pill]/tabs-list:data-[state=active]:text-brand-ink",
  // Vertical: full-width rows; the line variant marks the active one on the left edge
  "group-data-[orientation=vertical]/tabs:h-auto group-data-[orientation=vertical]/tabs:min-h-(--control-h-md) group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start group-data-[orientation=vertical]/tabs:rounded-md",
  "group-data-[orientation=vertical]/tabs:group-data-[variant=line]/tabs-list:data-[state=active]:bg-(--surface-selected) group-data-[orientation=vertical]/tabs:group-data-[variant=line]/tabs-list:data-[state=active]:shadow-[inset_2px_0_0_var(--tabs-indicator)]",
  // Equal widths
  "group-data-[full=true]/tabs-list:flex-1",
);

// Scroll state, wheel-to-horizontal, the sliding underline and keeping the
// active tab in view. Positions are written to the DOM directly, so moving
// the indicator never re-renders React.
function useTabsRow(variant: TabsVariant, horizontal: boolean) {
  const viewport = React.useRef<HTMLDivElement>(null);
  const list = React.useRef<HTMLElement>(null);
  const indicator = React.useRef<HTMLSpanElement>(null);
  const [edges, setEdges] = React.useState({ start: false, end: false });

  React.useLayoutEffect(() => {
    const v = viewport.current;
    const l = list.current;
    if (!v || !l || !horizontal) return;
    let lastActive: Element | null = null;

    const updateEdges = () => {
      const max = v.scrollWidth - v.clientWidth;
      const start = v.scrollLeft > 1;
      const end = v.scrollLeft < max - 1;
      setEdges((p) => (p.start === start && p.end === end ? p : { start, end }));
    };

    // reveal: scroll the active tab into view even if it did not change
    // (first layout, resize).
    const place = (animate: boolean, reveal = false) => {
      const active = l.querySelector<HTMLElement>('[data-state="active"]');
      const bar = indicator.current;
      if (bar) {
        if (!active) {
          bar.style.opacity = "0";
        } else {
          const lr = l.getBoundingClientRect();
          const ar = active.getBoundingClientRect();
          bar.style.transition = animate ? "" : "none";
          bar.style.width = `${ar.width}px`;
          bar.style.transform = `translate3d(${ar.left - lr.left}px, 0, 0)`;
          bar.style.opacity = "1";
        }
      }
      if (active && (reveal || active !== lastActive)) {
        const vr = v.getBoundingClientRect();
        const ar = active.getBoundingClientRect();
        const pad = 40;
        const behavior: ScrollBehavior = animate ? "smooth" : "auto";
        if (ar.left < vr.left + pad) v.scrollBy({ left: ar.left - vr.left - pad, behavior });
        else if (ar.right > vr.right - pad) v.scrollBy({ left: ar.right - vr.right + pad, behavior });
      }
      lastActive = active;
    };

    updateEdges();
    place(false);

    // A vertical wheel scrolls the row sideways until it reaches an end;
    // then the page scrolls as usual.
    const onWheel = (e: WheelEvent) => {
      if (v.scrollWidth <= v.clientWidth || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const max = v.scrollWidth - v.clientWidth;
      if ((e.deltaY < 0 && v.scrollLeft <= 0) || (e.deltaY > 0 && v.scrollLeft >= max - 1)) return;
      e.preventDefault();
      v.scrollLeft += e.deltaY;
    };
    const resize = new ResizeObserver(() => {
      updateEdges();
      place(false, true);
    });
    resize.observe(v);
    resize.observe(l);
    const mutate = new MutationObserver(() => {
      updateEdges();
      place(true);
    });
    mutate.observe(l, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-state"] });
    v.addEventListener("scroll", updateEdges, { passive: true });
    v.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      resize.disconnect();
      mutate.disconnect();
      v.removeEventListener("scroll", updateEdges);
      v.removeEventListener("wheel", onWheel);
    };
  }, [horizontal, variant]);

  const scroll = (direction: 1 | -1) => {
    const v = viewport.current;
    if (v) v.scrollBy({ left: direction * v.clientWidth * 0.7, behavior: "smooth" });
  };
  return { viewport, list, indicator, edges, scroll };
}

// Edge buttons for mice and trackpads; touch screens swipe instead.
function ScrollButton({ side, onClick }: { side: "start" | "end"; onClick: () => void }) {
  const Chevron = side === "start" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden
      onClick={onClick}
      className="z-10 hidden size-7 shrink-0 place-items-center self-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) hover:text-foreground pointer-fine:grid"
    >
      <Chevron className="size-4" />
    </button>
  );
}

function fadeMask(start: boolean, end: boolean): React.CSSProperties | undefined {
  if (!start && !end) return undefined;
  const mask = `linear-gradient(to right, ${start ? "transparent, black 2rem" : "black"}, ${
    end ? "black calc(100% - 2rem), transparent" : "black"
  })`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

type ListRenderProps = {
  ref: React.RefObject<HTMLElement | null>;
  className: string;
  "data-variant": TabsVariant;
  "data-full": boolean;
  children: React.ReactNode;
};

// The scroller, the list and the sliding underline shared by Tabs and TabsNav.
function TabsRow({
  variant,
  horizontal,
  fullWidth,
  action,
  className,
  listClassName,
  renderList,
  children,
}: {
  variant: TabsVariant;
  horizontal: boolean;
  fullWidth: boolean;
  action?: React.ReactNode;
  className?: string;
  listClassName?: string;
  renderList: (props: ListRenderProps) => React.ReactNode;
  children: React.ReactNode;
}) {
  const { viewport, list, indicator, edges, scroll } = useTabsRow(variant, horizontal);
  const listNode = renderList({
    ref: list,
    className: cn(
      tabsListVariants({ variant }),
      !horizontal && "h-auto w-full min-w-0 flex-col items-stretch gap-0.5",
      !horizontal && variant === "line" && "border-l pl-1",
      listClassName,
    ),
    "data-variant": variant,
    "data-full": fullWidth,
    children: (
      <>
        {children}
        {horizontal && variant === "line" ? (
          <span
            ref={indicator}
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-t-[1px] bg-(--tabs-indicator) opacity-0 transition-[transform,width] duration-(--duration-panel) ease-(--ease-out) will-change-transform"
          />
        ) : null}
      </>
    ),
  });

  if (!horizontal) return <div className={cn("min-w-0 shrink-0", className)}>{listNode}</div>;
  return (
    <div
      data-slot="tabs-row"
      data-variant={variant}
      className={cn("relative flex min-w-0 items-center gap-1", variant === "line" && "border-b", className)}
    >
      {edges.start ? <ScrollButton side="start" onClick={() => scroll(-1)} /> : null}
      <div
        ref={viewport}
        data-slot="tabs-viewport"
        className="scrollbar-none min-w-0 flex-1 touch-pan-x overflow-x-auto overflow-y-hidden overscroll-x-contain"
        style={fadeMask(edges.start, edges.end)}
      >
        {listNode}
      </div>
      {edges.end ? <ScrollButton side="end" onClick={() => scroll(1)} /> : null}
      {action ? <div className="flex shrink-0 items-center gap-1">{action}</div> : null}
    </div>
  );
}

function TabsList({
  className,
  rowClassName,
  variant = "default",
  fullWidth = false,
  action,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant;
  /** Tabs share the width equally (two or three tabs, phones). */
  fullWidth?: boolean;
  /** Controls after the tabs, outside the scrolling area (e.g. an add button). */
  action?: React.ReactNode;
  /** Classes of the outer row (border, padding). */
  rowClassName?: string;
}) {
  const { orientation } = React.useContext(TabsContext);
  return (
    <TabsRow
      variant={variant}
      horizontal={orientation !== "vertical"}
      fullWidth={fullWidth}
      action={action}
      className={rowClassName}
      listClassName={className}
      renderList={({ ref, ...rest }) => (
        <TabsPrimitive.List
          ref={ref as React.RefObject<HTMLDivElement>}
          data-slot="tabs-list"
          {...props}
          {...rest}
        />
      )}
    >
      {children}
    </TabsRow>
  );
}

const badgeClass = cva(
  "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 font-semibold text-2xs tabular leading-none",
  {
    variants: {
      variant: {
        default: "bg-(--surface-active) text-muted-foreground group-data-[state=active]/trigger:text-foreground",
        primary: "bg-primary text-primary-foreground",
        danger: "bg-(--status-danger-bg) text-(--status-danger-fg)",
        warning: "bg-(--status-warning-bg) text-(--status-warning-fg)",
        success: "bg-(--status-success-bg) text-(--status-success-fg)",
        dot: "h-2 w-2 min-w-0 animate-pulse bg-primary p-0",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type TabsBadgeVariant = "default" | "primary" | "danger" | "warning" | "success" | "dot";

/** A count or status on a tab; "dot" is a small pulsing marker (work running). */
function TabsBadge({
  variant = "default",
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { variant?: TabsBadgeVariant }) {
  return (
    <span data-slot="tabs-badge" className={cn(badgeClass({ variant }), className)} {...props}>
      {variant === "dot" ? null : children}
    </span>
  );
}

type TabExtras = {
  icon?: Icon;
  /** A count (above 99 shows 99+) or any short node. */
  badge?: React.ReactNode;
  badgeVariant?: TabsBadgeVariant;
};

function badgeOf(badge: React.ReactNode, variant: TabsBadgeVariant) {
  if (variant === "dot") return <TabsBadge variant="dot" aria-hidden />;
  if (badge === undefined || badge === null || badge === false) return null;
  const text = typeof badge === "number" && badge > 99 ? "99+" : badge;
  return <TabsBadge variant={variant}>{text}</TabsBadge>;
}

function TabsTrigger({
  className,
  icon: TabIcon,
  badge,
  badgeVariant = "default",
  onClose,
  closeLabel,
  disabled,
  children,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  TabExtras & {
    /** Shows a close button; Delete or Backspace on the focused tab closes it too. */
    onClose?: () => void;
    closeLabel?: string;
  }) {
  const trigger = (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      disabled={disabled}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (onClose && !disabled && (e.key === "Delete" || e.key === "Backspace")) {
          e.preventDefault();
          onClose();
        }
      }}
      className={cn(
        "group/trigger",
        triggerClass,
        // Room for the close button, per variant so it wins over their padding.
        onClose &&
          "group-data-[variant=default]/tabs-list:pr-8 group-data-[variant=line]/tabs-list:pr-9 group-data-[variant=pill]/tabs-list:pr-8",
        className,
      )}
      {...props}
    >
      {TabIcon ? <TabIcon /> : null}
      <span className="truncate">{children}</span>
      {badgeOf(badge, badgeVariant)}
    </TabsPrimitive.Trigger>
  );
  if (!onClose) return trigger;
  const name = typeof children === "string" ? `${children} sekmesini kapat` : "Sekmeyi kapat";
  return (
    <div
      data-slot="tabs-tab"
      className="relative flex shrink-0 items-stretch group-data-[full=true]/tabs-list:flex-1 group-data-[variant=default]/tabs-list:h-full [&>[data-slot=tabs-trigger]]:flex-1"
    >
      {trigger}
      <button
        type="button"
        tabIndex={-1}
        aria-label={closeLabel ?? name}
        disabled={disabled}
        onClick={onClose}
        className="absolute top-1/2 right-1.5 grid size-6 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-active) hover:text-foreground disabled:hidden"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="grid gap-2.5 py-2" role="status" aria-label="Yükleniyor">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function TabsContent({
  className,
  mount = "active",
  fallback,
  value,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  /**
   * active: only while selected (state is lost on leaving); lazy: from the
   * first visit on, then kept hidden so state and scroll survive; eager:
   * always mounted.
   */
  mount?: "active" | "lazy" | "eager";
  /** Shown while lazily loaded children suspend; a skeleton by default. */
  fallback?: React.ReactNode;
}) {
  const { value: current, visited } = React.useContext(TabsContext);
  if (mount === "lazy" && !visited.has(value) && current !== value) return null;
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      value={value}
      forceMount={mount === "active" ? undefined : true}
      className={cn(
        "min-w-0 flex-1 outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200 data-[state=inactive]:hidden",
        className,
      )}
      {...props}
    >
      <React.Suspense fallback={fallback ?? <TabsSkeleton />}>{children}</React.Suspense>
    </TabsPrimitive.Content>
  );
}

/**
 * The same tab row for links (sections in the URL). Mark the current item
 * with active; the nav needs a label for screen readers.
 */
function TabsNav({
  label,
  variant = "line",
  fullWidth = false,
  action,
  className,
  listClassName,
  children,
}: {
  label: string;
  variant?: TabsVariant;
  fullWidth?: boolean;
  action?: React.ReactNode;
  /** Classes of the outer row (border, padding). */
  className?: string;
  listClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={label} data-slot="tabs-nav" className="min-w-0">
      <TabsRow
        variant={variant}
        horizontal
        fullWidth={fullWidth}
        action={action}
        className={className}
        listClassName={listClassName}
        renderList={({ ref, ...rest }) => (
          <div ref={ref as React.RefObject<HTMLDivElement>} data-slot="tabs-nav-list" {...rest} />
        )}
      >
        {children}
      </TabsRow>
    </nav>
  );
}

function TabsNavItem({
  active = false,
  disabled = false,
  asChild = false,
  icon: ItemIcon,
  badge,
  badgeVariant = "default",
  label,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"a">, "children"> &
  TabExtras & {
    active?: boolean;
    disabled?: boolean;
    /** Render the child element (a router link); the text then comes from label. */
    asChild?: boolean;
    label?: React.ReactNode;
    children?: React.ReactNode;
  }) {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="tabs-nav-item"
      data-state={active ? "active" : "inactive"}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn("group/trigger", triggerClass, className)}
      {...props}
    >
      {ItemIcon ? <ItemIcon /> : null}
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : null}
      <span className="truncate">{asChild ? label : children}</span>
      {badgeOf(badge, badgeVariant)}
    </Comp>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsBadge, TabsNav, TabsNavItem, tabsListVariants };
