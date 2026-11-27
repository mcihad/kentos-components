import {
  type ComponentProps,
  type Key,
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useVirtualizer } from "../lib/use-virtual";
import { cn } from "../lib/utils";
import { Spinner } from "./spinner";

/*
 * A long list that renders only the rows in view (lib/use-virtual): event
 * lists, members, audit entries. Rows may have any height; each is measured
 * once rendered. Near the end it calls onEndReached (load the next page);
 * `loading` shows a row with a spinner under the last item. The scroll area
 * has a fixed height (`height` or a class).
 *
 *   <VirtualList
 *     items={events}
 *     getKey={(e) => e.id}
 *     estimateSize={56}
 *     height="32rem"
 *     renderItem={(e) => <EventRow event={e} />}
 *     onEndReached={fetchNextPage}
 *     loading={isFetchingNextPage}
 *   />
 */

export type VirtualListHandle = {
  scrollToIndex: (index: number, align?: "start" | "center" | "end" | "auto") => void;
};

export function VirtualList<T>({
  items,
  renderItem,
  getKey,
  estimateSize = 48,
  overscan = 6,
  height,
  onEndReached,
  endThreshold = 5,
  loading = false,
  loadingText = "Yükleniyor…",
  empty,
  label,
  listRef,
  divided = false,
  className,
  style,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  items: readonly T[];
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => Key;
  /** Row height before it is measured (px). */
  estimateSize?: number;
  overscan?: number;
  /** CSS height of the scroll area (or size it with a class). */
  height?: string;
  /** Called when the last `endThreshold` rows come into view. */
  onEndReached?: () => void;
  endThreshold?: number;
  /** Shows a loading row after the last item. */
  loading?: boolean;
  loadingText?: string;
  /** Shown when there are no items and nothing is loading. */
  empty?: ReactNode;
  /** Accessible name of the list. */
  label?: string;
  listRef?: Ref<VirtualListHandle>;
  /** Draws a rule between rows. */
  divided?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const count = items.length + (loading ? 1 : 0);
  const v = useVirtualizer({ count, estimate: estimateSize, overscan, scrollRef });

  useImperativeHandle(listRef, () => ({ scrollToIndex: v.scrollToIndex }), [v.scrollToIndex]);

  // Ask for more once the last rows are rendered; once per item count.
  const lastIndex = v.items.at(-1)?.index ?? -1;
  const askedAt = useRef(-1);
  useEffect(() => {
    if (!onEndReached || loading || items.length === 0) return;
    if (lastIndex >= items.length - endThreshold && askedAt.current !== items.length) {
      askedAt.current = items.length;
      onEndReached();
    }
  }, [lastIndex, items.length, endThreshold, loading, onEndReached]);

  return (
    <div
      ref={scrollRef}
      data-slot="virtual-list"
      style={{ height, ...style }}
      className={cn("relative overflow-auto overscroll-contain", className)}
      {...props}
    >
      {items.length === 0 && !loading ? (
        <div className="grid h-full place-items-center p-6 text-center text-muted-foreground text-sm">
          {empty}
        </div>
      ) : (
        <ul
          aria-label={label}
          aria-busy={loading || undefined}
          className="relative"
          style={{ height: v.totalSize }}
        >
          {v.items.map((row) => {
            const isLoader = row.index >= items.length;
            return (
              <li
                key={isLoader ? "__loading" : (getKey?.(items[row.index], row.index) ?? row.index)}
                ref={v.measure(row.index)}
                aria-setsize={loading ? -1 : items.length}
                aria-posinset={isLoader ? undefined : row.index + 1}
                style={{ transform: `translateY(${row.start}px)` }}
                className={cn(
                  "absolute inset-x-0 top-0",
                  divided && !isLoader && row.index < items.length - 1 && "border-b",
                )}
              >
                {isLoader ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground text-sm">
                    <Spinner />
                    {loadingText}
                  </div>
                ) : (
                  renderItem(items[row.index], row.index)
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
