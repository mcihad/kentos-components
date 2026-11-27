import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { focusSheetOnTouch, followVisualViewport } from "../lib/sheet-viewport";
import { useIsMobile } from "../lib/use-mobile";
import { cn } from "../lib/utils";

/*
 * A panel that slides in from an edge: details beside a list, a filter
 * panel, a form, a log. Built on Radix Dialog (focus trap, Escape, screen
 * reader semantics). On phones a side drawer becomes a bottom sheet that can
 * be dragged down to close. Optionally resizable: an edge handle on desktop
 * (pointer and keyboard, size remembered), the grab handle on bottom sheets
 * (pull up to grow). Motion uses transform and opacity only.
 *
 *   <Drawer>
 *     <DrawerTrigger asChild><Button>Ayrıntılar</Button></DrawerTrigger>
 *     <DrawerContent side="right" size="lg" resizable sizeStorageKey="issue-drawer">
 *       <DrawerHeader><DrawerTitle>KALEM-1B</DrawerTitle></DrawerHeader>
 *       <DrawerBody>…</DrawerBody>
 *       <DrawerFooter><Button>Kaydet</Button></DrawerFooter>
 *     </DrawerContent>
 *   </Drawer>
 */

export type DrawerSide = "right" | "left" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full" | "auto" | (string & {});

const DrawerContext = createContext<{ modal: boolean }>({ modal: true });

/**
 * Root. modal (default) dims and locks the page; modal={false} leaves the
 * page usable beside the drawer (an inspector).
 */
export function Drawer({ modal = true, ...props }: ComponentProps<typeof DialogPrimitive.Root>) {
  return (
    <DrawerContext.Provider value={{ modal }}>
      <DialogPrimitive.Root modal={modal} {...props} />
    </DrawerContext.Provider>
  );
}

export function DrawerTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

export function DrawerClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="drawer-close" {...props} />;
}

const horizontalSizes: Record<string, string> = {
  sm: "360px",
  md: "480px",
  lg: "640px",
  xl: "800px",
  full: "100vw",
};
const verticalSizes: Record<string, string> = {
  sm: "30svh",
  md: "50svh",
  lg: "75svh",
  xl: "88svh",
  full: "100svh",
};

function cssSize(size: DrawerSize, horizontal: boolean) {
  const table = horizontal ? horizontalSizes : verticalSizes;
  return table[size] ?? size;
}

function readStored(key: string | undefined) {
  if (!key) return null;
  try {
    const v = Number(localStorage.getItem(key));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function store(key: string | undefined, px: number) {
  if (!key) return;
  try {
    localStorage.setItem(key, String(Math.round(px)));
  } catch {
    // Not remembered; still applied.
  }
}

// Bottom sheets: dragging further than this share of the height, or flicking
// faster than this many px/ms, closes them.
const dismissShare = 0.28;
const dismissVelocity = 0.55;

type Drag = {
  startY: number;
  lastY: number;
  lastT: number;
  velocity: number;
  startH: number;
  moved: boolean;
};

/**
 * The panel. side is where it slides in from on desktop; mobileSide what a
 * left or right drawer becomes on phones ("bottom" by default, "same" keeps
 * it). size is the width (left, right) or height (top, bottom).
 */
export function DrawerContent({
  side = "right",
  mobileSide = "bottom",
  size = "md",
  mobileSize = "auto",
  resizable = false,
  minSize,
  maxSize,
  sizeStorageKey,
  showClose = true,
  closeLabel = "Kapat",
  mobile,
  className,
  style,
  onOpenAutoFocus,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  side?: DrawerSide;
  mobileSide?: DrawerSide | "same";
  size?: DrawerSize;
  /** Height of the sheet a side drawer becomes on phones. */
  mobileSize?: DrawerSize;
  /** Lets the user resize the drawer. */
  resizable?: boolean;
  /** Smallest size in px while resizing (default 280 wide, 160 tall). */
  minSize?: number;
  /** Largest size in px while resizing (default 90% of the window). */
  maxSize?: number;
  /** localStorage key remembering the resized width or height. */
  sizeStorageKey?: string;
  showClose?: boolean;
  closeLabel?: string;
  /** Forces the phone (true) or desktop (false) layout. */
  mobile?: boolean;
}) {
  const { modal } = useContext(DrawerContext);
  const isMobile = useIsMobile(mobile);
  const effective: DrawerSide =
    isMobile && (side === "left" || side === "right") ? (mobileSide === "same" ? side : mobileSide) : side;
  const horizontal = effective === "left" || effective === "right";
  const converted = effective !== side;
  const baseSize = converted ? mobileSize : size;
  const initial = cssSize(baseSize, horizontal);
  const auto = baseSize === "auto";

  const panel = useRef<HTMLDivElement | null>(null);
  const backdrop = useRef<HTMLDivElement | null>(null);
  const closer = useRef<HTMLButtonElement | null>(null);
  const drag = useRef<Drag | null>(null);
  // The sheet's height before any resizing: dragging down shrinks back to it
  // before it starts to close.
  const baseHeight = useRef<number | null>(null);
  const stopFollowing = useRef<(() => void) | null>(null);
  const min = minSize ?? (horizontal ? 280 : 160);
  const max = () => maxSize ?? (horizontal ? window.innerWidth * 0.9 : window.innerHeight * 0.92);

  const setSize = useCallback((px: number) => {
    panel.current?.style.setProperty("--drawer-size", `${px}px`);
  }, []);

  // The panel mounts on every opening (DrawerContent itself stays mounted),
  // so the remembered size is read here rather than once at first render.
  const setPanel = useCallback(
    (el: HTMLDivElement | null) => {
      stopFollowing.current?.();
      stopFollowing.current = null;
      panel.current = el;
      if (!el) return;
      // A bottom sheet stays above the on-screen keyboard (lib/sheet-viewport).
      if (effective === "bottom") stopFollowing.current = followVisualViewport(el);
      if (converted) return;
      const remembered = readStored(sizeStorageKey);
      if (remembered === null) return;
      el.style.setProperty("--drawer-size", `${remembered}px`);
      el.setAttribute("data-sized", "");
    },
    [converted, effective, sizeStorageKey],
  );

  // Bottom sheets: drag the grab handle. Down closes (with velocity); with
  // resizable, up grows the sheet and down first shrinks it back.
  const onGrabDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !panel.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const h = panel.current.offsetHeight;
    baseHeight.current ??= h;
    drag.current = {
      startY: e.clientY,
      lastY: e.clientY,
      lastT: e.timeStamp,
      velocity: 0,
      startH: h,
      moved: false,
    };
  };
  const onGrabMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = panel.current;
    if (!d || !el) return;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dy) < 4) return;
    d.moved = true;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    let offset: number;
    if (resizable) {
      const target = d.startH - dy;
      const floor = Math.min(d.startH, baseHeight.current ?? d.startH);
      if (target >= floor) {
        const limit = max();
        // Beyond the maximum it resists like rubber.
        setSize(target > limit ? limit + Math.sqrt(target - limit) * 2 : target);
        offset = 0;
      } else {
        setSize(floor);
        offset = floor - target;
      }
    } else {
      offset = dy < 0 ? -Math.sqrt(-dy) * 2 : dy;
    }
    el.removeAttribute("data-settling");
    el.setAttribute("data-dragging", "");
    el.style.setProperty("--sheet-drag", `${offset}px`);
    const shade = backdrop.current;
    if (shade) {
      shade.setAttribute("data-dragging", "");
      shade.style.setProperty(
        "--sheet-backdrop",
        String(1 - Math.min(1, Math.max(0, offset / el.offsetHeight))),
      );
    }
  };
  const onGrabUp = () => {
    const d = drag.current;
    const el = panel.current;
    drag.current = null;
    if (!d?.moved || !el) return;
    const offset = Number.parseFloat(el.style.getPropertyValue("--sheet-drag")) || 0;
    if (offset > el.offsetHeight * dismissShare || (d.velocity > dismissVelocity && offset > 8)) {
      closer.current?.click();
      return;
    }
    if (resizable) {
      const limit = max();
      if (el.offsetHeight > limit) setSize(limit);
    }
    el.setAttribute("data-settling", "");
    el.removeAttribute("data-dragging");
    backdrop.current?.removeAttribute("data-dragging");
  };

  const animated = effective === "bottom";
  const vars = { "--drawer-size": initial, ...style } as CSSProperties;

  return (
    <DialogPrimitive.Portal>
      {modal ? (
        <DialogPrimitive.Overlay
          ref={backdrop}
          data-slot="drawer-overlay"
          className="kentos-backdrop fixed inset-0 z-50 bg-(--surface-overlay)"
        />
      ) : null}
      <DialogPrimitive.Content
        ref={setPanel}
        data-slot="drawer"
        data-side={effective}
        style={vars}
        onOpenAutoFocus={(e) => {
          onOpenAutoFocus?.(e);
          if (effective === "bottom") focusSheetOnTouch(e, panel.current);
        }}
        className={cn(
          "fixed z-50 flex flex-col bg-(--surface-card) text-foreground shadow-(--shadow-xl) outline-none",
          // Side drawers slide with tw-animate (transform); bottom sheets use
          // the kit's sheet motion so a drag hands over to the close animation.
          // transition-none: the duration classes would otherwise make every
          // size change (resizing) a slow transition.
          !animated &&
            "transition-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:duration-200 data-[state=open]:duration-(--duration-sheet) data-[state=open]:ease-(--ease-sheet)",
          animated && "kentos-sheet",
          effective === "right" &&
            "inset-y-0 right-0 w-[min(var(--drawer-size),100vw)] border-l pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          effective === "left" &&
            "inset-y-0 left-0 w-[min(var(--drawer-size),100vw)] border-r pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          effective === "top" &&
            "inset-x-0 top-0 max-h-[92svh] rounded-b-2xl border-b pt-[env(safe-area-inset-top)] data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          effective === "bottom" &&
            "inset-x-0 bottom-0 max-h-[92svh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)] data-[keyboard]:bottom-(--kb-inset) data-[keyboard]:pb-0",
          !horizontal &&
            (auto
              ? "h-auto data-[sized]:h-[min(var(--drawer-size),92svh)]"
              : "h-[min(var(--drawer-size),92svh)]"),
          !horizontal && resizable && "max-h-none",
          // While the keyboard is up, no taller than what stays visible.
          effective === "bottom" && "data-[keyboard]:max-h-[calc(var(--vv-h)_-_0.75rem)]",
          className,
        )}
        {...props}
      >
        {effective === "bottom" ? (
          <div
            data-slot="drawer-grab"
            onPointerDown={onGrabDown}
            onPointerMove={onGrabMove}
            onPointerUp={onGrabUp}
            onPointerCancel={onGrabUp}
            className="flex shrink-0 cursor-grab touch-none select-none justify-center pt-2.5 pb-1 active:cursor-grabbing"
          >
            <div aria-hidden className="h-1.5 w-10 rounded-full bg-(--border-strong)" />
          </div>
        ) : null}
        {resizable && effective !== "bottom" ? (
          <ResizeHandle
            side={effective}
            panel={panel}
            min={min}
            max={max}
            reset={() => {
              const probe = document.createElement("div");
              probe.style.position = "absolute";
              probe.style.visibility = "hidden";
              probe.style[horizontal ? "width" : "height"] = cssSize(size, horizontal);
              document.body.appendChild(probe);
              const px = horizontal ? probe.offsetWidth : probe.offsetHeight;
              probe.remove();
              setSize(px);
              store(sizeStorageKey, px);
            }}
            onDone={(px) => store(sizeStorageKey, px)}
          />
        ) : null}
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        {showClose ? (
          <DialogPrimitive.Close
            aria-label={closeLabel}
            className={cn(
              "absolute right-3 grid size-9 place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow)",
              effective === "bottom" ? "top-3" : "top-[calc(0.75rem+env(safe-area-inset-top))]",
            )}
          >
            <XIcon className="size-4" />
          </DialogPrimitive.Close>
        ) : null}
        <DialogPrimitive.Close ref={closer} tabIndex={-1} aria-hidden className="hidden" />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

// The resize grip on the inner edge: drag with a pointer, or focus it and
// use the arrow keys (Shift for bigger steps), Home and End; double-click
// restores the default size.
function ResizeHandle({
  side,
  panel,
  min,
  max,
  reset,
  onDone,
}: {
  side: DrawerSide;
  panel: RefObject<HTMLDivElement | null>;
  min: number;
  max: () => number;
  reset: () => void;
  onDone: (px: number) => void;
}) {
  const horizontal = side === "left" || side === "right";
  const start = useRef<{ pos: number; size: number } | null>(null);
  const applied = useRef<number | null>(null);
  const [value, setValue] = useState<number | null>(null);

  const current = () => (horizontal ? panel.current?.offsetWidth : panel.current?.offsetHeight) ?? 0;
  const apply = (px: number) => {
    const clamped = Math.round(Math.min(max(), Math.max(min, px)));
    panel.current?.style.setProperty("--drawer-size", `${clamped}px`);
    applied.current = clamped;
    setValue(clamped);
    return clamped;
  };
  // Growing direction: away from the edge the drawer is attached to.
  const sign = side === "right" || side === "bottom" ? -1 : 1;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { pos: horizontal ? e.clientX : e.clientY, size: current() };
    document.body.style.userSelect = "none";
    document.body.style.cursor = horizontal ? "col-resize" : "row-resize";
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s) return;
    const delta = (horizontal ? e.clientX : e.clientY) - s.pos;
    apply(s.size + sign * delta);
  };
  const onPointerUp = () => {
    if (!start.current) return;
    start.current = null;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    onDone(applied.current ?? current());
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 64 : 16;
    const grow = horizontal
      ? side === "right"
        ? "ArrowLeft"
        : "ArrowRight"
      : side === "top"
        ? "ArrowDown"
        : "ArrowUp";
    const shrink = horizontal
      ? side === "right"
        ? "ArrowRight"
        : "ArrowLeft"
      : side === "top"
        ? "ArrowUp"
        : "ArrowDown";
    let next: number | null = null;
    const now = applied.current ?? current();
    if (e.key === grow) next = now + step;
    else if (e.key === shrink) next = now - step;
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = max();
    if (next === null) return;
    e.preventDefault();
    onDone(apply(next));
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: an <hr> cannot be focused or dragged.
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      aria-label="Boyutu değiştir"
      aria-valuemin={min}
      aria-valuemax={Math.round(typeof window === "undefined" ? min : max())}
      aria-valuenow={value ?? undefined}
      data-slot="drawer-resize"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      onDoubleClick={reset}
      className={cn(
        "group/resize absolute z-10 touch-none outline-none",
        horizontal ? "inset-y-0 w-3 cursor-col-resize" : "inset-x-0 h-3 cursor-row-resize",
        side === "right" && "-left-1.5",
        side === "left" && "-right-1.5",
        side === "top" && "-bottom-1.5",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute rounded-full bg-(--border-strong) opacity-0 transition-opacity duration-(--duration-fast) group-hover/resize:opacity-100 group-focus-visible/resize:bg-(--focus-ring) group-focus-visible/resize:opacity-100 group-active/resize:bg-(--focus-ring) group-active/resize:opacity-100",
          horizontal
            ? "inset-y-0 left-1/2 w-0.5 -translate-x-1/2"
            : "inset-x-0 top-1/2 h-0.5 -translate-y-1/2",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute rounded-full border bg-(--surface-card) shadow-(--shadow-sm) transition-colors duration-(--duration-fast) group-hover/resize:border-(--border-strong)",
          horizontal
            ? "top-1/2 left-1/2 h-8 w-1.5 -translate-x-1/2 -translate-y-1/2"
            : "top-1/2 left-1/2 h-1.5 w-8 -translate-x-1/2 -translate-y-1/2",
        )}
      />
    </div>
  );
}

/** Title and description at the top; leaves room for the close button. */
export function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("grid shrink-0 gap-1 border-b px-5 pt-4 pb-3.5 pr-14", className)}
      {...props}
    />
  );
}

export function DrawerTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-semibold text-lg text-strong leading-snug", className)}
      {...props}
    />
  );
}

export function DrawerDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/** The scrolling middle. */
export function DrawerBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-body"
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4", className)}
      {...props}
    />
  );
}

/** Actions at the bottom; stays visible while the body scrolls. */
export function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "flex shrink-0 flex-col-reverse gap-2 border-t px-5 py-3 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
