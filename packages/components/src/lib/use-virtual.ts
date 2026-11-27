import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

/*
 * Windowing for long lists: only the rows in (and just around) the visible
 * part of a scrolling element are rendered. Rows may have any height: each
 * starts at `estimate` and is measured once rendered (a ResizeObserver
 * keeps the measurement current when it wraps or grows).
 *
 *   const v = useVirtualizer({ count: rows.length, estimate: 28, scrollRef });
 *   <div ref={scrollRef} className="overflow-auto">
 *     <div style={{ height: v.totalSize, position: "relative" }}>
 *       {v.items.map((item) => (
 *         <div key={item.index} ref={v.measure(item.index)} style={{ position: "absolute", top: item.start, insetInline: 0 }}>…</div>
 *       ))}
 *     </div>
 *   </div>
 */

export type VirtualItem = { index: number; start: number; size: number };

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useVirtualizer({
  count,
  estimate,
  overscan = 8,
  scrollRef,
}: {
  count: number;
  /** Height of a row before it is measured (px). */
  estimate: number;
  /** Extra rows rendered above and below the visible ones. */
  overscan?: number;
  scrollRef: RefObject<HTMLElement | null>;
}) {
  const sizes = useRef<number[]>([]);
  const [version, bump] = useReducer((n: number) => n + 1, 0);
  const [view, setView] = useState({ top: 0, height: 0 });
  const pending = useRef(0);

  // Prefix sums of row heights: offsets[i] is where row i starts.
  // biome-ignore lint/correctness/useExhaustiveDependencies: version changes when a measurement (kept in a ref) does.
  const offsets = useMemo(() => {
    const out = new Float64Array(count + 1);
    for (let i = 0; i < count; i++) out[i + 1] = out[i] + (sizes.current[i] ?? estimate);
    return out;
  }, [count, estimate, version]);

  useIsoLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const read = () => setView({ top: el.scrollTop, height: el.clientHeight });
    read();
    el.addEventListener("scroll", read, { passive: true });
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", read);
      ro.disconnect();
    };
  }, [scrollRef]);

  // First row whose bottom is below `y` (binary search).
  const rowAt = useCallback(
    (y: number) => {
      let lo = 0;
      let hi = count - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (offsets[mid + 1] <= y) lo = mid + 1;
        else hi = mid;
      }
      return Math.max(0, lo);
    },
    [count, offsets],
  );

  const items: VirtualItem[] = [];
  if (count > 0) {
    const first = Math.max(0, rowAt(view.top) - overscan);
    const last = Math.min(count - 1, rowAt(view.top + Math.max(view.height, estimate)) + overscan);
    for (let i = first; i <= last; i++)
      items.push({ index: i, start: offsets[i], size: offsets[i + 1] - offsets[i] });
  }

  // One observer for all rendered rows; heights are batched per frame.
  const observer = useRef<ResizeObserver | null>(null);
  const nodes = useRef(new Map<Element, number>());
  useEffect(() => {
    observer.current = new ResizeObserver((entries) => {
      let changed = false;
      for (const entry of entries) {
        const index = nodes.current.get(entry.target);
        if (index === undefined) continue;
        const h = Math.round((entry.target as HTMLElement).offsetHeight);
        if (h > 0 && sizes.current[index] !== h) {
          sizes.current[index] = h;
          changed = true;
        }
      }
      if (changed && !pending.current)
        pending.current = requestAnimationFrame(() => {
          pending.current = 0;
          bump();
        });
    });
    for (const el of nodes.current.keys()) observer.current.observe(el);
    return () => {
      observer.current?.disconnect();
      cancelAnimationFrame(pending.current);
      pending.current = 0;
    };
  }, []);

  /** Callback ref for row `index`: measures it. */
  const measure = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (!el) return;
      for (const [node, i] of nodes.current)
        if (i === index && node !== el) {
          observer.current?.unobserve(node);
          nodes.current.delete(node);
        }
      if (nodes.current.get(el) === index) return;
      nodes.current.set(el, index);
      observer.current?.observe(el);
    },
    [],
  );

  // Drop nodes React has removed.
  useEffect(() => {
    for (const node of nodes.current.keys())
      if (!node.isConnected) {
        observer.current?.unobserve(node);
        nodes.current.delete(node);
      }
  });

  /** Scrolls so row `index` is visible (`auto`: only if it is not). */
  const scrollToIndex = useCallback(
    (index: number, align: "start" | "center" | "end" | "auto" = "auto") => {
      const el = scrollRef.current;
      if (!el || count === 0) return;
      const i = Math.min(Math.max(0, index), count - 1);
      const top = offsets[i];
      const bottom = offsets[i + 1];
      const h = el.clientHeight;
      let target = el.scrollTop;
      if (align === "start") target = top;
      else if (align === "end") target = bottom - h;
      else if (align === "center") target = top - (h - (bottom - top)) / 2;
      else if (top < el.scrollTop) target = top;
      else if (bottom > el.scrollTop + h) target = bottom - h;
      el.scrollTop = Math.max(0, target);
    },
    [count, offsets, scrollRef],
  );

  /** Forgets measured heights (e.g. after toggling line wrapping). */
  const reset = useCallback(() => {
    sizes.current = [];
    bump();
  }, []);

  return { items, totalSize: offsets[count] ?? 0, measure, scrollToIndex, reset };
}
