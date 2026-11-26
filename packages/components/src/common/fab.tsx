import { PlusIcon } from "lucide-react";
import { type ComponentProps, type ComponentType, type RefObject, useEffect, useState } from "react";
import { cn } from "../lib/utils";

/**
 * Floating action button: the main action of a phone screen, in the thumb's
 * reach. Extended FABs carry a label next to the icon. It pops in, shrinks
 * under the finger and slides away while hidden (transform and opacity only).
 * Position it with className (e.g. "fixed right-4 bottom-4").
 */
export function Fab({
  icon: Icon = PlusIcon,
  label,
  extended = false,
  hidden = false,
  className,
  ...props
}: ComponentProps<"button"> & {
  icon?: ComponentType<{ className?: string }>;
  /** Visible text when extended, otherwise the accessible name. */
  label: string;
  extended?: boolean;
  /** Slides the button out, e.g. while the page scrolls down. */
  hidden?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot="fab"
      data-hidden={hidden || undefined}
      aria-label={extended ? undefined : label}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={cn(
        "kentos-fab inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground shadow-(--shadow-lg) outline-none hover:bg-(--brand-bg-hover) focus-visible:shadow-(--focus-shadow) [&_svg]:size-6",
        extended ? "pr-5 pl-4 font-semibold text-md" : "w-14",
        className,
      )}
      {...props}
    >
      <Icon />
      {extended ? label : null}
    </button>
  );
}

function scrollParent(el: HTMLElement | null): HTMLElement | Window {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === "auto" || overflow === "scroll") return node;
  }
  return window;
}

/**
 * True while the user scrolls down (past the first 48px), false as soon as
 * they scroll up: hides a FAB that would cover content being read. Watches
 * the nearest scrolling ancestor of ref, or the window.
 */
export function useHideOnScroll(ref: RefObject<HTMLElement | null>): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const target = scrollParent(ref.current);
    const position = () => (target instanceof Window ? window.scrollY : target.scrollTop);
    let last = position();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = position();
        const delta = y - last;
        if (Math.abs(delta) < 6) return;
        setHidden(delta > 0 && y > 48);
        last = y;
      });
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
  return hidden;
}
