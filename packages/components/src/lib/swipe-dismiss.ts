/*
 * Swipe to close for panels that slide in from the left or right edge (the
 * phone sidebar, side sheets and drawers). Bottom sheets have their own drag
 * handle (common/action-sheet, common/drawer).
 *
 * Touch and pen only; a mouse drag keeps selecting text. A gesture is taken
 * only once it moves sideways towards the closing edge; vertical movement is
 * left to the browser, which scrolls the panel (the panel sets
 * touch-action: pan-y). The panel follows the finger and the overlay fades
 * with it. Released past 30% of the width, or flicked, the panel closes and
 * the exit animation carries on from where it was let go (tw-animate's exit
 * keyframes start from the current transform); otherwise it springs back.
 */

// Released further than this share of the width, or flicked faster than
// this many px/ms towards the edge, closes the panel.
const dismissShare = 0.3;
const dismissVelocity = 0.4;
// Movement before the gesture is read as a swipe or a scroll.
const slop = 8;

const interactive = "input,textarea,select,[contenteditable],[role=slider],[data-swipe-ignore]";

/** True when the touch starts on a control, or inside something that scrolls sideways. */
function ignored(target: EventTarget | null, panel: HTMLElement): boolean {
  if (!(target instanceof Element)) return true;
  if (target.closest(interactive)) return true;
  for (let el: Element | null = target; el && el !== panel; el = el.parentElement) {
    if (el.scrollWidth > el.clientWidth + 1) {
      const overflow = getComputedStyle(el).overflowX;
      if (overflow === "auto" || overflow === "scroll") return true;
    }
  }
  return false;
}

type Options = {
  /** The edge the panel is attached to; swiping towards it closes. */
  side: "left" | "right";
  /** The panel's backdrop, faded while dragging. */
  overlay?: () => HTMLElement | null;
  /** Closes the panel (for Radix: click a hidden Close). */
  onDismiss: () => void;
};

function swallowClick(e: Event) {
  e.preventDefault();
  e.stopPropagation();
}

/** Adds swipe-to-close to `panel`; returns the cleanup. */
export function attachSwipeDismiss(panel: HTMLElement, { side, overlay, onDismiss }: Options): () => void {
  const sign = side === "left" ? -1 : 1;
  let start: { x: number; y: number } | null = null;
  let swiping = false;
  let travel = 0;
  let width = 1;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;

  const shade = () => overlay?.() ?? null;

  const reset = () => {
    start = null;
    swiping = false;
  };

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" || !e.isPrimary || ignored(e.target, panel)) return;
    start = { x: e.clientX, y: e.clientY };
    swiping = false;
    travel = 0;
    velocity = 0;
    width = panel.offsetWidth || 1;
    lastX = e.clientX;
    lastT = e.timeStamp;
  };

  const onMove = (e: PointerEvent) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!swiping) {
      if (Math.abs(dx) < slop && Math.abs(dy) < slop) return;
      // A scroll, or a swipe away from the edge: not ours.
      if (Math.abs(dx) <= Math.abs(dy) || Math.sign(dx) !== sign) {
        reset();
        return;
      }
      swiping = true;
      try {
        panel.setPointerCapture(e.pointerId);
      } catch {
        // The pointer is already gone (or synthetic); tracking still works.
      }
      // A swipe during the opening slide takes over from it.
      for (const a of panel.getAnimations()) a.finish();
      panel.style.transition = "none";
      const s = shade();
      if (s) s.style.transition = "none";
      panel.setAttribute("data-swiping", "");
    }
    e.preventDefault();
    // Towards the edge it follows the finger; the other way it resists.
    const toward = dx * sign;
    travel = toward >= 0 ? toward : -Math.sqrt(-toward) * 2;
    const dt = e.timeStamp - lastT;
    if (dt > 0) velocity = ((e.clientX - lastX) / dt) * sign;
    lastX = e.clientX;
    lastT = e.timeStamp;
    panel.style.transform = `translate3d(${travel * sign}px, 0, 0)`;
    const s = shade();
    if (s) s.style.opacity = String(1 - Math.min(1, Math.max(0, travel / width)));
  };

  const onUp = () => {
    if (!start) return;
    const wasSwiping = swiping;
    reset();
    if (!wasSwiping) return;
    panel.removeAttribute("data-swiping");
    const s = shade();
    const dismiss = travel > width * dismissShare || (velocity > dismissVelocity && travel > 16);
    if (dismiss) {
      // The exit animation starts from the inline transform and opacity.
      panel.style.transition = "";
      if (s) s.style.transition = "";
      onDismiss();
    }
    // The finger lifts over whatever it ended on: that is not a tap. Armed
    // after onDismiss, which may close by clicking a hidden button. The click
    // follows pointerup at once; drop the guard soon in case none comes.
    panel.addEventListener("click", swallowClick, { capture: true, once: true });
    window.setTimeout(() => panel.removeEventListener("click", swallowClick, true), 100);
    if (dismiss) return;
    const spring = "var(--duration-panel) var(--ease-sheet)";
    panel.style.transition = `transform ${spring}`;
    panel.style.transform = "";
    if (s) {
      s.style.transition = `opacity ${spring}`;
      s.style.opacity = "";
    }
    panel.addEventListener(
      "transitionend",
      () => {
        panel.style.transition = "";
        if (s) s.style.transition = "";
      },
      { once: true },
    );
  };

  panel.addEventListener("pointerdown", onDown);
  panel.addEventListener("pointermove", onMove, { passive: false });
  panel.addEventListener("pointerup", onUp);
  panel.addEventListener("pointercancel", onUp);
  return () => {
    panel.removeEventListener("pointerdown", onDown);
    panel.removeEventListener("pointermove", onMove);
    panel.removeEventListener("pointerup", onUp);
    panel.removeEventListener("pointercancel", onUp);
  };
}
