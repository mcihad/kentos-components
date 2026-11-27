import { CheckIcon } from "lucide-react";
import { Dialog as DialogPrimitive, Slot } from "radix-ui";
import {
  type ComponentProps,
  type ComponentType,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useRef,
} from "react";
import { focusSheetOnTouch, followVisualViewport } from "../lib/sheet-viewport";
import { cn } from "../lib/utils";

/*
 * A bottom sheet of actions: slides up from the bottom edge, can be dragged
 * down to dismiss (with velocity), and closes on Escape, a tap outside or a
 * chosen item. Built on Radix Dialog for focus trapping, scroll locking and
 * screen-reader semantics. Motion uses only transform and opacity (see
 * "Bottom sheet" in styles/tokens.css), so it stays on the GPU.
 *
 *   <ActionSheet>
 *     <ActionSheetTrigger asChild><Button>İşlemler</Button></ActionSheetTrigger>
 *     <ActionSheetContent title="Proje">
 *       <ActionSheetItem icon={PencilIcon} label="Yeniden adlandır" onClick={rename} />
 *       <ActionSheetItem icon={TrashIcon} label="Sil" variant="destructive" onClick={remove} />
 *     </ActionSheetContent>
 *   </ActionSheet>
 */

type Icon = ComponentType<{ className?: string }>;

/** Root; controlled with open/onOpenChange or left uncontrolled. */
export function ActionSheet(props: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props} />;
}

/** Opens the sheet; use asChild around a button. */
export function ActionSheetTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="action-sheet-trigger" {...props} />;
}

/** Closes the sheet; use asChild around a custom control. */
export function ActionSheetClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="action-sheet-close" {...props} />;
}

// Dragging further than this share of the height, or flicking faster than
// this many px/ms, dismisses the sheet.
const dismissShare = 0.28;
const dismissVelocity = 0.55;

type Drag = {
  startY: number;
  lastY: number;
  lastT: number;
  velocity: number;
  height: number;
  moved: boolean;
};

/**
 * The sheet: a drag handle, a title (and optional description), the items
 * and a cancel button. Wider than a phone it floats centered above the
 * bottom edge.
 */
export function ActionSheetContent({
  title,
  description,
  hideTitle = false,
  cancelLabel = "Vazgeç",
  showCancel = true,
  className,
  bodyClassName,
  onOpenAutoFocus,
  children,
  ...props
}: Omit<ComponentProps<typeof DialogPrimitive.Content>, "title"> & {
  /** Heading of the sheet; also its accessible name. */
  title: string;
  description?: ReactNode;
  /** Keeps the title for screen readers only. */
  hideTitle?: boolean;
  cancelLabel?: string;
  showCancel?: boolean;
  /** Classes for the scrolling area around the children. */
  bodyClassName?: string;
}) {
  const panel = useRef<HTMLDivElement | null>(null);
  const backdrop = useRef<HTMLDivElement | null>(null);
  const closer = useRef<HTMLButtonElement | null>(null);
  const drag = useRef<Drag | null>(null);
  const stopFollowing = useRef<(() => void) | null>(null);

  // Number the items once the panel mounts so they rise in one after another,
  // and keep the sheet above the on-screen keyboard while it is open.
  const setPanel = useCallback((el: HTMLDivElement | null) => {
    stopFollowing.current?.();
    stopFollowing.current = null;
    panel.current = el;
    if (!el) return;
    el.querySelectorAll<HTMLElement>(".kentos-sheet-item").forEach((item, i) => {
      item.style.setProperty("--i", String(Math.min(i, 12)));
    });
    stopFollowing.current = followVisualViewport(el);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !panel.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startY: e.clientY,
      lastY: e.clientY,
      lastT: e.timeStamp,
      velocity: 0,
      height: panel.current.offsetHeight,
      moved: false,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = panel.current;
    if (!d || !el) return;
    const raw = e.clientY - d.startY;
    if (!d.moved && Math.abs(raw) < 4) return;
    d.moved = true;
    // Upwards it resists like rubber; downwards it follows the finger.
    const offset = raw < 0 ? -Math.sqrt(-raw) * 2 : raw;
    const dt = e.timeStamp - d.lastT;
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt;
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    el.removeAttribute("data-settling");
    el.setAttribute("data-dragging", "");
    el.style.setProperty("--sheet-drag", `${offset}px`);
    const shade = backdrop.current;
    if (shade) {
      shade.setAttribute("data-dragging", "");
      shade.style.setProperty("--sheet-backdrop", String(1 - Math.min(1, Math.max(0, offset / d.height))));
    }
  };

  const onPointerUp = () => {
    const d = drag.current;
    const el = panel.current;
    drag.current = null;
    if (!d?.moved || !el) return;
    const offset = Number.parseFloat(el.style.getPropertyValue("--sheet-drag")) || 0;
    if (offset > d.height * dismissShare || (d.velocity > dismissVelocity && offset > 8)) {
      // The closing animation starts from the current offset and opacity.
      closer.current?.click();
      return;
    }
    // Glide back: a transition from the dragged transform to rest.
    el.setAttribute("data-settling", "");
    el.removeAttribute("data-dragging");
    backdrop.current?.removeAttribute("data-dragging");
  };

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        ref={backdrop}
        data-slot="action-sheet-backdrop"
        className="kentos-backdrop fixed inset-0 z-50 bg-(--surface-overlay)"
      />
      <DialogPrimitive.Content
        ref={setPanel}
        data-slot="action-sheet"
        {...(description ? {} : { "aria-describedby": undefined })}
        onOpenAutoFocus={(e) => {
          onOpenAutoFocus?.(e);
          focusSheetOnTouch(e, panel.current);
        }}
        className={cn(
          "kentos-sheet group/sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[min(88svh,44rem)] w-full flex-col rounded-t-2xl border border-b-0 bg-(--surface-card) text-foreground shadow-(--shadow-xl) outline-none sm:bottom-4 sm:max-w-md sm:rounded-2xl sm:border-b",
          // Above the on-screen keyboard and no taller than what stays visible
          // (see lib/sheet-viewport).
          "data-[keyboard]:bottom-(--kb-inset) data-[keyboard]:max-h-[calc(var(--vv-h)_-_0.75rem)] sm:data-[keyboard]:bottom-[calc(var(--kb-inset)_+_1rem)]",
          className,
        )}
        {...props}
      >
        <div
          data-slot="action-sheet-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="shrink-0 cursor-grab touch-none select-none pt-2.5 active:cursor-grabbing"
        >
          <div aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-(--border-strong)" />
          <div className={cn("px-5 pt-3 pb-2", hideTitle && "sr-only")}>
            <DialogPrimitive.Title className="font-semibold text-md text-strong">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-0.5 text-muted-foreground text-sm">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
        </div>
        {/* A primary item placed directly in the sheet moves to the top. */}
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-2 pb-2 *:data-[variant=primary]:order-first",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {showCancel ? (
          <div className="shrink-0 border-t p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] group-data-[keyboard]/sheet:pb-2 sm:pb-2">
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="kentos-sheet-item h-12 w-full rounded-xl font-semibold text-md text-strong outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) focus-visible:shadow-(--focus-shadow) active:bg-(--surface-active)"
              >
                {cancelLabel}
              </button>
            </DialogPrimitive.Close>
          </div>
        ) : (
          <div className="h-[env(safe-area-inset-bottom)] shrink-0 group-data-[keyboard]/sheet:hidden sm:hidden" />
        )}
        <DialogPrimitive.Close ref={closer} tabIndex={-1} aria-hidden className="hidden" />
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

const itemClass =
  "kentos-sheet-item group/item flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) focus-visible:bg-(--surface-hover) focus-visible:shadow-(--focus-shadow) active:bg-(--surface-active) disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

/**
 * One action: an icon tile, a label and an optional second line. Choosing it
 * runs onClick and closes the sheet (unless keepOpen). With asChild it
 * renders the given link.
 */
export function ActionSheetItem({
  icon: ItemIcon,
  label,
  description,
  variant = "default",
  keepOpen = false,
  asChild = false,
  checked,
  className,
  children,
  ...props
}: Omit<ComponentProps<"button">, "title"> & {
  icon?: Icon;
  label: string;
  description?: ReactNode;
  /** A choice: shows a check at the end when true (checkboxes, radio options). */
  checked?: boolean;
  /** primary tints the icon tile with the brand colour; destructive is for irreversible actions. */
  variant?: "default" | "primary" | "destructive";
  keepOpen?: boolean;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "button";
  const element = (
    <Comp
      data-slot="action-sheet-item"
      data-variant={variant}
      type={asChild ? undefined : "button"}
      aria-pressed={checked}
      className={cn(itemClass, className)}
      {...props}
    >
      {ItemIcon ? (
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg bg-(--surface-muted) text-muted-foreground transition-colors duration-(--duration-fast) group-hover/item:text-foreground",
            variant === "primary" &&
              "bg-primary text-primary-foreground group-hover/item:text-primary-foreground",
            variant === "destructive" &&
              "bg-(--status-danger-bg) text-destructive group-hover/item:text-destructive",
          )}
        >
          <ItemIcon className="size-[1.125rem]" />
        </span>
      ) : null}
      <Slot.Slottable>{children}</Slot.Slottable>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span
          className={cn(
            "truncate font-medium text-md text-strong",
            variant === "destructive" && "text-destructive",
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="text-muted-foreground text-sm leading-snug">{description}</span>
        ) : null}
      </span>
      {checked !== undefined ? (
        <CheckIcon
          aria-hidden
          className={cn(
            "size-5 shrink-0 text-brand-ink transition-opacity",
            checked ? "opacity-100" : "opacity-0",
          )}
        />
      ) : null}
    </Comp>
  );
  return keepOpen ? element : <DialogPrimitive.Close asChild>{element}</DialogPrimitive.Close>;
}

/** Items under a small heading. */
export function ActionSheetGroup({
  label,
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "title"> & { label?: string }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would add form semantics to a menu.
    <div role="group" aria-label={label} data-slot="action-sheet-group" className={className} {...props}>
      {label ? (
        <p className="kentos-sheet-item px-3 pt-3 pb-1 font-semibold text-2xs text-subtle uppercase tracking-(--tracking-caps)">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/** A thin line between groups of items. */
export function ActionSheetSeparator({ className, ...props }: ComponentProps<"hr">) {
  return (
    <hr
      data-slot="action-sheet-separator"
      className={cn("mx-3 my-1.5 h-px border-0 bg-border", className)}
      {...props}
    />
  );
}
