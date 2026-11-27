/*
 * Helpers that keep bottom sheets usable with the on-screen keyboard.
 *
 * Phone browsers open the keyboard over the page: the layout viewport keeps
 * its height and only the visual viewport shrinks, so a sheet pinned to the
 * bottom edge ends up under the keyboard. followVisualViewport() watches
 * window.visualViewport and writes, on the sheet element:
 *
 *   data-keyboard   present while the keyboard covers part of the screen
 *   --kb-inset      how far the keyboard reaches up from the bottom edge
 *   --vv-h          the height that is still visible
 *
 * The sheet styles itself from these (bottom offset, height cap) without
 * re-rendering React.
 */

// A smaller gap is browser chrome (a collapsing address bar), not a keyboard.
const keyboardThreshold = 120;

const editable =
  "input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select,[contenteditable]";

/** Starts tracking the visual viewport for `el`; returns the cleanup. */
export function followVisualViewport(el: HTMLElement): () => void {
  const vv = typeof window === "undefined" ? undefined : window.visualViewport;
  if (!vv) return () => {};
  let frame = 0;

  const update = () => {
    frame = 0;
    // Pinch zoom also shrinks the visual viewport; that is not a keyboard.
    const zoomed = Math.abs(vv.scale - 1) > 0.01;
    const inset = zoomed ? 0 : Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    const keyboard = inset > keyboardThreshold;
    if (!keyboard) {
      el.removeAttribute("data-keyboard");
      el.style.removeProperty("--kb-inset");
      el.style.removeProperty("--vv-h");
      return;
    }
    el.setAttribute("data-keyboard", "");
    el.style.setProperty("--kb-inset", `${Math.round(inset)}px`);
    el.style.setProperty("--vv-h", `${Math.round(vv.height)}px`);
    // Keep the field being typed in visible inside the sheet's scroll area.
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && el.contains(focused) && focused.matches(editable)) {
      requestAnimationFrame(() => focused.scrollIntoView({ block: "nearest" }));
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  update();
  vv.addEventListener("resize", schedule);
  vv.addEventListener("scroll", schedule);
  return () => {
    cancelAnimationFrame(frame);
    vv.removeEventListener("resize", schedule);
    vv.removeEventListener("scroll", schedule);
  };
}

/**
 * Open-focus handler for touch screens: focuses the sheet itself instead of
 * its first field. Focusing a text field opens the keyboard (Android does it
 * even for programmatic focus), which then pushes the viewport around while
 * the sheet is still sliding in. The user taps the field to type. With a
 * mouse or keyboard the default (first focusable element) is kept.
 */
export function focusSheetOnTouch(e: Event, panel: HTMLElement | null) {
  if (e.defaultPrevented || !panel) return;
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  e.preventDefault();
  panel.focus({ preventScroll: true });
}
