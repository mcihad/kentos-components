import { type ComponentProps, useEffect, useState, useSyncExternalStore } from "react";
import { formatDateTime, formatRelative } from "../lib/format";
import { cn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

/*
 * A relative time that keeps itself current: "az önce", "5 dk önce",
 * "3 sa önce", then a date. The exact date and time are in a tooltip and in
 * the <time> element's dateTime. All instances share one ticker, which runs
 * every 15 seconds while any is mounted and the tab is visible.
 *
 *   <RelativeTime date={issue.lastSeen} />
 *   <RelativeTime date={deploy.at} tooltip={false} className="text-xs" />
 */

const listeners = new Set<() => void>();
let now = Date.now();
let timer = 0;

function tick() {
  now = Date.now();
  for (const l of listeners) l();
}

function onVisibility() {
  if (document.visibilityState === "visible") tick();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = Date.now();
    timer = window.setInterval(() => {
      if (document.visibilityState === "visible") tick();
    }, 15_000);
    document.addEventListener("visibilitychange", onVisibility);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };
}

/** The shared clock (ms), refreshed every 15 s while the tab is visible. */
export function useNow(live = true): number {
  const shared = useSyncExternalStore(
    live ? subscribe : noopSubscribe,
    () => now,
    () => now,
  );
  // Without live updates, freeze at the first render.
  const [fixed] = useState(() => Date.now());
  return live ? shared : fixed;
}

function noopSubscribe() {
  return () => {};
}

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function RelativeTime({
  date,
  live = true,
  tooltip = true,
  className,
  ...props
}: Omit<ComponentProps<"time">, "dateTime" | "children"> & {
  date: Date | string | number;
  /** Re-renders as time passes (default true). */
  live?: boolean;
  /** Shows the exact date and time on hover and focus (default true). */
  tooltip?: boolean;
}) {
  const at = toDate(date);
  const current = useNow(live);
  // The server and the first client render agree on nothing about "now":
  // render the absolute date until mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const valid = !Number.isNaN(at.getTime());
  const exact = valid ? formatDateTime(at) : "";
  const text = !valid ? "—" : mounted ? formatRelative(at, current) : exact;

  const element = (
    <time
      data-slot="relative-time"
      dateTime={valid ? at.toISOString() : undefined}
      title={tooltip ? undefined : exact}
      className={cn("tabular whitespace-nowrap", className)}
      {...props}
    >
      {text}
    </time>
  );
  if (!tooltip || !valid) return element;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{element}</TooltipTrigger>
      <TooltipContent>{exact}</TooltipContent>
    </Tooltip>
  );
}
