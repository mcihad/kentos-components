import { useSyncExternalStore } from "react";

/** Below Tailwind's md breakpoint: phones and small tablets in portrait. */
export const mobileQuery = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * Whether the viewport is below the md breakpoint, updated live. `force`
 * overrides it (showcases, previews).
 */
export function useIsMobile(force?: boolean): boolean {
  const matches = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(mobileQuery).matches,
    () => false,
  );
  return force ?? matches;
}
