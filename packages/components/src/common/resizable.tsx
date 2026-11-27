import { GripHorizontalIcon, GripVerticalIcon } from "lucide-react";
import {
  Children,
  type ComponentProps,
  createContext,
  isValidElement,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useIsMobile } from "../lib/use-mobile";
import { cn } from "../lib/utils";

/*
 * Panels side by side (or stacked) with handles between them: a list and
 * its detail, a navigator and an editor. Sizes are percentages of the group;
 * each panel can have a minimum, a maximum and a collapsed size. A handle is
 * dragged with the pointer, or focused and moved with the arrow keys
 * (Shift for bigger steps); Home and End go to the limits, Enter collapses
 * or restores a collapsible neighbour, a double click restores the
 * defaults. With `storageKey` the sizes are remembered per browser. On
 * phones the panels stack and the handles disappear (`stackOnMobile`).
 *
 * Panels and handles must be direct children of the group, alternating.
 *
 *   <ResizablePanelGroup direction="horizontal" storageKey="issues-split" className="h-[32rem]">
 *     <ResizablePanel defaultSize={35} minSize={20}>…list…</ResizablePanel>
 *     <ResizableHandle />
 *     <ResizablePanel minSize={30}>…detail…</ResizablePanel>
 *   </ResizablePanelGroup>
 */

type Direction = "horizontal" | "vertical";

type PanelProps = Omit<ComponentProps<"div">, "children"> & {
  /** Starting size in percent; panels without one share what is left. */
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  /** Lets a drag past half the minimum (or Enter on a handle) collapse it. */
  collapsible?: boolean;
  /** Size when collapsed (default 0). */
  collapsedSize?: number;
  children?: ReactNode;
};

type GroupContext = {
  direction: Direction;
  stacked: boolean;
  sizes: number[];
  startDrag: (handle: number, e: PointerEvent<HTMLElement>) => void;
  nudge: (handle: number, delta: number) => void;
  toLimit: (handle: number, end: "min" | "max") => void;
  toggleCollapse: (handle: number) => void;
  reset: () => void;
  limits: { min: number; max: number }[];
};

const Group = createContext<GroupContext | null>(null);

function readSizes(key: string | undefined, count: number): number[] | null {
  if (!key) return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      Array.isArray(parsed) &&
      parsed.length === count &&
      parsed.every((n) => typeof n === "number" && n >= 0)
    )
      return parsed;
  } catch {
    // Unreadable: fall back to the defaults.
  }
  return null;
}

function writeSizes(key: string | undefined, sizes: number[]) {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(sizes.map((s) => Math.round(s * 100) / 100)));
  } catch {
    // Not remembered; still applied.
  }
}

function isPanel(node: ReactNode): node is ReactElement<PanelProps> {
  return isValidElement(node) && node.type === ResizablePanel;
}

export function ResizablePanelGroup({
  direction = "horizontal",
  storageKey,
  stackOnMobile = true,
  onSizesChange,
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  direction?: Direction;
  /** localStorage key remembering the sizes. */
  storageKey?: string;
  /** Stacks the panels without handles below md (default true). */
  stackOnMobile?: boolean;
  onSizesChange?: (sizes: number[]) => void;
}) {
  const items = Children.toArray(children);
  const panels = items.filter(isPanel);
  const count = panels.length;
  const mobile = useIsMobile();
  const stacked = stackOnMobile && mobile;
  const ref = useRef<HTMLDivElement>(null);

  // Cheap to derive on every render.
  const limits = panels.map((p) => ({
    min: p.props.collapsible ? (p.props.collapsedSize ?? 0) : (p.props.minSize ?? 0),
    max: p.props.maxSize ?? 100,
  }));
  const given = panels.map((p) => p.props.defaultSize);
  const used = given.reduce<number>((a, s) => a + (s ?? 0), 0);
  const open = given.filter((s) => s === undefined).length;
  const share = open ? Math.max(0, 100 - used) / open : 0;
  const defaults = given.map((s) => s ?? share);

  const [sizes, setSizes] = useState<number[]>(() => readSizes(storageKey, count) ?? defaults);
  // Sizes before a panel collapsed, to restore it.
  const beforeCollapse = useRef<Map<number, number[]>>(new Map());

  // A panel added or removed: start over from storage or the defaults.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the panel count changes.
  useEffect(() => {
    if (sizes.length !== count) setSizes(readSizes(storageKey, count) ?? defaults);
  }, [count]);

  const commit = useCallback(
    (next: number[], persist = true) => {
      setSizes(next);
      onSizesChange?.(next);
      if (persist) writeSizes(storageKey, next);
    },
    [onSizesChange, storageKey],
  );

  /** Moves the boundary after panel `i` by `delta` percent, within both panels' limits. */
  const resize = useCallback(
    (base: number[], i: number, delta: number): number[] => {
      const a = panels[i]?.props;
      const b = panels[i + 1]?.props;
      if (!a || !b) return base;
      const total = base[i] + base[i + 1];
      const aMin = a.minSize ?? 0;
      const bMin = b.minSize ?? 0;
      let first = base[i] + delta;
      // A collapsible panel dragged well below its minimum snaps shut.
      if (a.collapsible && first < aMin / 2) first = a.collapsedSize ?? 0;
      else first = Math.max(aMin, first);
      let second = total - first;
      if (b.collapsible && second < bMin / 2) second = b.collapsedSize ?? 0;
      else second = Math.max(bMin, second);
      first = Math.min(a.maxSize ?? 100, total - second);
      second = Math.min(b.maxSize ?? 100, total - first);
      first = total - second;
      const next = [...base];
      next[i] = first;
      next[i + 1] = second;
      return next;
    },
    [panels],
  );

  const startDrag = useCallback(
    (i: number, e: PointerEvent<HTMLElement>) => {
      const el = ref.current;
      if (!el || e.button !== 0) return;
      e.preventDefault();
      const handle = e.currentTarget;
      handle.setPointerCapture(e.pointerId);
      const rect = el.getBoundingClientRect();
      const span = direction === "horizontal" ? rect.width : rect.height;
      const start = direction === "horizontal" ? e.clientX : e.clientY;
      const base = sizes;
      let last = base;
      const move = (ev: globalThis.PointerEvent) => {
        const pos = direction === "horizontal" ? ev.clientX : ev.clientY;
        last = resize(base, i, ((pos - start) / span) * 100);
        commit(last, false);
      };
      const up = () => {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", up);
        document.body.style.removeProperty("cursor");
        document.body.style.removeProperty("user-select");
        writeSizes(storageKey, last);
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
      // Keep the resize cursor and stop text selection while dragging.
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    },
    [commit, direction, resize, sizes, storageKey],
  );

  const nudge = useCallback(
    (i: number, delta: number) => commit(resize(sizes, i, delta)),
    [commit, resize, sizes],
  );

  const toLimit = useCallback(
    (i: number, end: "min" | "max") => commit(resize(sizes, i, end === "min" ? -100 : 100)),
    [commit, resize, sizes],
  );

  const toggleCollapse = useCallback(
    (i: number) => {
      // The collapsible neighbour: the panel before the handle, else the one after.
      const target = panels[i]?.props.collapsible ? i : panels[i + 1]?.props.collapsible ? i + 1 : -1;
      if (target < 0) return;
      const p = panels[target].props;
      const collapsed = sizes[target] <= (p.collapsedSize ?? 0) + 0.01;
      if (collapsed) {
        const saved = beforeCollapse.current.get(target);
        commit(saved ?? defaults);
        beforeCollapse.current.delete(target);
      } else {
        beforeCollapse.current.set(target, sizes);
        const delta = (p.collapsedSize ?? 0) - sizes[target];
        commit(resize(sizes, i, target === i ? delta : -delta));
      }
    },
    [commit, defaults, panels, resize, sizes],
  );

  const reset = useCallback(() => commit(defaults), [commit, defaults]);

  // Give each panel and handle its index.
  let panelIndex = -1;
  const laidOut = items.map((child) => {
    if (isPanel(child)) {
      panelIndex += 1;
      return { child, panel: panelIndex };
    }
    return { child, handle: panelIndex };
  });

  return (
    <Group.Provider
      value={{ direction, stacked, sizes, startDrag, nudge, toLimit, toggleCollapse, reset, limits }}
    >
      <div
        ref={ref}
        data-slot="resizable-group"
        data-direction={stacked ? "vertical" : direction}
        className={cn(
          "flex min-h-0 min-w-0",
          stacked ? "flex-col" : direction === "horizontal" ? "flex-row" : "flex-col",
          className,
        )}
        {...props}
      >
        {laidOut.map(({ child, panel, handle }) =>
          panel !== undefined ? (
            <PanelSlot key={`p${panel}`} index={panel}>
              {child}
            </PanelSlot>
          ) : handle !== undefined && isValidElement(child) ? (
            <HandleSlot key={`h${handle}`} index={handle}>
              {child}
            </HandleSlot>
          ) : (
            child
          ),
        )}
      </div>
    </Group.Provider>
  );
}

const PanelIndex = createContext(-1);
const HandleIndex = createContext(-1);

function PanelSlot({ index, children }: { index: number; children: ReactNode }) {
  return <PanelIndex.Provider value={index}>{children}</PanelIndex.Provider>;
}

function HandleSlot({ index, children }: { index: number; children: ReactNode }) {
  return <HandleIndex.Provider value={index}>{children}</HandleIndex.Provider>;
}

export function ResizablePanel({
  defaultSize: _defaultSize,
  minSize: _minSize,
  maxSize: _maxSize,
  collapsible: _collapsible,
  collapsedSize = 0,
  className,
  style,
  children,
  ...props
}: PanelProps) {
  const group = useContext(Group);
  const index = useContext(PanelIndex);
  if (!group) throw new Error("ResizablePanel must be inside ResizablePanelGroup");
  const size = group.sizes[index] ?? 0;
  const collapsed = !group.stacked && size <= collapsedSize + 0.01;
  return (
    <div
      data-slot="resizable-panel"
      data-collapsed={collapsed || undefined}
      // Grow in proportion to the size from a zero basis: handles keep their
      // own width and the panels share the rest.
      style={group.stacked ? style : { flex: `${size} 1 0px`, ...style }}
      className={cn("min-h-0 min-w-0 overflow-auto", collapsed && "invisible overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ResizableHandle({
  withGrip = false,
  label = "Paneli boyutlandır",
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  /** Shows a small grip in the middle of the line. */
  withGrip?: boolean;
  label?: string;
}) {
  const group = useContext(Group);
  const index = useContext(HandleIndex);
  if (!group) throw new Error("ResizableHandle must be inside ResizablePanelGroup");
  if (group.stacked) return null;
  const horizontal = group.direction === "horizontal";
  const value = Math.round(group.sizes[index] ?? 0);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const back = horizontal ? "ArrowLeft" : "ArrowUp";
    const forward = horizontal ? "ArrowRight" : "ArrowDown";
    if (e.key === back) group.nudge(index, -step);
    else if (e.key === forward) group.nudge(index, step);
    else if (e.key === "Home") group.toLimit(index, "min");
    else if (e.key === "End") group.toLimit(index, "max");
    else if (e.key === "Enter") group.toggleCollapse(index);
    else return;
    e.preventDefault();
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: an <hr> cannot be focused or dragged.
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-label={label}
      aria-valuemin={Math.round(group.limits[index]?.min ?? 0)}
      aria-valuemax={Math.round(group.limits[index]?.max ?? 100)}
      aria-valuenow={value}
      data-slot="resizable-handle"
      onPointerDown={(e) => group.startDrag(index, e)}
      onDoubleClick={group.reset}
      onKeyDown={onKeyDown}
      className={cn(
        "group/handle relative flex shrink-0 touch-none select-none items-center justify-center bg-border outline-none",
        "transition-colors duration-(--duration-fast) hover:bg-(--border-brand) focus-visible:bg-(--border-brand) active:bg-(--border-brand)",
        horizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
        // A wider invisible hit area around the 1px line.
        horizontal
          ? "after:absolute after:inset-y-0 after:-right-1.5 after:-left-1.5"
          : "after:absolute after:inset-x-0 after:-top-1.5 after:-bottom-1.5",
        className,
      )}
      {...props}
    >
      {withGrip ? (
        <span
          aria-hidden
          className={cn(
            "z-10 grid place-items-center rounded-sm border border-(--border-strong) bg-(--surface-card) text-muted-foreground shadow-(--shadow-xs) transition-colors",
            "group-hover/handle:border-(--border-brand) group-hover/handle:text-(--text-brand) group-focus-visible/handle:border-(--border-brand) group-focus-visible/handle:text-(--text-brand)",
            horizontal ? "h-6 w-3.5" : "h-3.5 w-6",
          )}
        >
          {horizontal ? <GripVerticalIcon className="size-3" /> : <GripHorizontalIcon className="size-3" />}
        </span>
      ) : null}
    </div>
  );
}
