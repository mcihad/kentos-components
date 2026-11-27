import { ArrowDownIcon, ChevronDownIcon, ChevronUpIcon, WrapTextIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { formatClock, formatNumber } from "../lib/format";
import { foldText } from "../lib/search";
import { useVirtualizer } from "../lib/use-virtual";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { CopyButton } from "./copy-button";
import { FilterChip } from "./filter-chip";
import { SearchInput } from "./input-group";

/*
 * A log: thousands of lines with time, level, source and message, in a
 * fixed-height box that only renders the visible lines. Level chips filter
 * (with counts), the search highlights matches and steps through them
 * (Enter / Shift+Enter), long lines scroll or wrap. Following the tail: while
 * scrolled to the bottom, new lines keep it there; scrolled up, a button
 * counts the new lines and jumps back.
 *
 *   <LogViewer lines={lines} height="28rem" />
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export type LogLine = {
  id?: string | number;
  time?: Date | string | number;
  level?: LogLevel;
  source?: string;
  message: string;
};

const levels: { level: LogLevel; label: string }[] = [
  { level: "debug", label: "Ayıklama" },
  { level: "info", label: "Bilgi" },
  { level: "warn", label: "Uyarı" },
  { level: "error", label: "Hata" },
  { level: "fatal", label: "Ölümcül" },
];

const levelText: Record<LogLevel, string> = {
  debug: "text-subtle",
  info: "text-(--status-info-fg)",
  warn: "text-(--status-warning-fg)",
  error: "text-(--status-danger-fg)",
  fatal: "text-(--status-danger-fg) font-semibold",
};

const levelRow: Partial<Record<LogLevel, string>> = {
  warn: "bg-(--status-warning-bg)/50",
  error: "bg-(--status-danger-bg)/60",
  fatal: "bg-(--status-danger-bg)",
};

// Within this many px of the end counts as "at the bottom".
const bottomSlack = 32;

const levelTag: Record<LogLevel, string> = {
  debug: "DBG",
  info: "INF",
  warn: "WRN",
  error: "ERR",
  fatal: "FTL",
};

/** Wraps every occurrence of the (folded) query in <mark>. */
function marked(text: string, query: string, current: boolean): ReactNode {
  if (!query) return text;
  const folded = foldText(text);
  const out: ReactNode[] = [];
  let from = 0;
  let at = folded.indexOf(query);
  while (at >= 0) {
    if (at > from) out.push(text.slice(from, at));
    out.push(
      <mark
        key={at}
        className={cn(
          "rounded-[2px] text-inherit",
          current
            ? "bg-(--code-line-hl-border) text-black"
            : "bg-(--code-line-hl) outline outline-(--code-line-hl-border)/50",
        )}
      >
        {text.slice(at, at + query.length)}
      </mark>,
    );
    from = at + query.length;
    at = folded.indexOf(query, from);
  }
  if (from < text.length) out.push(text.slice(from));
  return out;
}

function toDate(v: LogLine["time"]): Date | null {
  if (v === undefined) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function LogViewer({
  lines,
  height = "24rem",
  follow: followProp = true,
  showSource = true,
  toolbar = true,
  emptyText = "Henüz günlük satırı yok.",
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  lines: LogLine[];
  /** CSS height of the scrolling area. */
  height?: string;
  /** Starts following the tail (default true). */
  follow?: boolean;
  showSource?: boolean;
  /** Search, level chips, wrap and copy (default true). */
  toolbar?: boolean;
  emptyText?: string;
}) {
  const [hidden, setHidden] = useState<Set<LogLevel>>(new Set());
  const [query, setQuery] = useState("");
  const [wrap, setWrap] = useState(false);
  const [following, setFollowing] = useState(followProp);
  const [hit, setHit] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seen = useRef(lines.length);
  const [unseen, setUnseen] = useState(0);

  const counts = useMemo(() => {
    const c: Record<LogLevel, number> = { debug: 0, info: 0, warn: 0, error: 0, fatal: 0 };
    for (const l of lines) if (l.level) c[l.level]++;
    return c;
  }, [lines]);

  const shown = useMemo(
    () => (hidden.size ? lines.filter((l) => !l.level || !hidden.has(l.level)) : lines),
    [lines, hidden],
  );
  const folded = foldText(query.trim());
  const hits = useMemo(() => {
    if (!folded) return [];
    const out: number[] = [];
    shown.forEach((l, i) => {
      if (foldText(l.message).includes(folded) || (l.source && foldText(l.source).includes(folded)))
        out.push(i);
    });
    return out;
  }, [shown, folded]);

  const v = useVirtualizer({ count: shown.length, estimate: 24, scrollRef });

  // Row heights change with wrapping and with what is shown.
  const { reset } = v;
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when these change.
  useEffect(() => reset(), [wrap, hidden, reset]);

  // Follow the tail: new lines keep a bottom-scrolled view at the bottom.
  // Whether the view was at the bottom is read from the scroll position
  // against the height before these lines, not from state: a scroll event
  // can still be pending when lines arrive.
  const lastTotal = useRef(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the line count changes.
  useEffect(() => {
    const added = lines.length - seen.current;
    seen.current = lines.length;
    const el = scrollRef.current;
    const wasAtBottom = !el || lastTotal.current - el.scrollTop - el.clientHeight <= bottomSlack;
    if (following && wasAtBottom) {
      if (el) {
        // Skipped if the user scrolls before the next frame.
        const from = el.scrollTop;
        requestAnimationFrame(() => {
          if (el.scrollTop === from) el.scrollTop = el.scrollHeight;
        });
      }
    } else if (added > 0) {
      if (following) setFollowing(false);
      setUnseen((n) => n + added);
    }
  }, [lines.length]);
  // After the effect above, so it sees the previous height.
  useEffect(() => {
    lastTotal.current = v.totalSize;
  });

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= bottomSlack;
    if (atBottom !== following) setFollowing(atBottom);
    if (atBottom) setUnseen(0);
  };

  const jumpToEnd = () => {
    setFollowing(true);
    setUnseen(0);
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const goTo = (n: number) => {
    if (hits.length === 0) return;
    const next = (n + hits.length) % hits.length;
    setHit(next);
    setFollowing(false);
    v.scrollToIndex(hits[next], "center");
  };

  // A new query starts at its first match.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the query changes.
  useEffect(() => {
    setHit(0);
    if (hits.length) {
      setFollowing(false);
      v.scrollToIndex(hits[0], "center");
    }
  }, [folded]);

  const currentLine = hits[hit];
  const text = useMemo(
    () =>
      shown
        .map((l) => {
          const t = toDate(l.time);
          return [t ? t.toISOString() : "", l.level ? levelTag[l.level] : "", l.source ?? "", l.message]
            .filter(Boolean)
            .join(" ");
        })
        .join("\n"),
    [shown],
  );

  return (
    <div
      data-slot="log-viewer"
      className={cn("relative grid min-w-0 overflow-hidden rounded-lg border bg-(--code-bg)", className)}
      {...props}
    >
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          <SearchInput
            value={query}
            onValueChange={setQuery}
            placeholder="Günlükte ara"
            aria-label="Günlükte ara"
            className="w-full sm:w-56"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goTo(hit + (e.shiftKey ? -1 : 1));
              }
            }}
          />
          {folded ? (
            <div className="flex items-center gap-0.5 text-muted-foreground text-xs">
              <span aria-live="polite" className="tabular mr-1">
                {hits.length ? `${hit + 1}/${formatNumber(hits.length)}` : "Eşleşme yok"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Önceki eşleşme"
                disabled={!hits.length}
                onClick={() => goTo(hit - 1)}
              >
                <ChevronUpIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Sonraki eşleşme"
                disabled={!hits.length}
                onClick={() => goTo(hit + 1)}
              >
                <ChevronDownIcon />
              </Button>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-1.5">
            {levels
              .filter(({ level }) => counts[level] > 0)
              .map(({ level, label }) => (
                <FilterChip
                  key={level}
                  selected={!hidden.has(level)}
                  count={formatNumber(counts[level])}
                  className="h-7 px-2.5 text-xs"
                  onClick={() =>
                    setHidden((prev) => {
                      const next = new Set(prev);
                      if (next.has(level)) next.delete(level);
                      else next.add(level);
                      return next;
                    })
                  }
                >
                  {label}
                </FilterChip>
              ))}
          </div>
          <span className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground aria-pressed:bg-(--surface-active) aria-pressed:text-foreground"
            aria-label="Satırları kaydır"
            aria-pressed={wrap}
            title="Satırları kaydır"
            onClick={() => setWrap((w) => !w)}
          >
            <WrapTextIcon />
          </Button>
          <CopyButton value={text} label="Görünen satırları kopyala" />
        </div>
      ) : null}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-label="Günlük"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: the log scrolls; keyboard users need to reach it.
        tabIndex={0}
        style={{ height }}
        className="overflow-auto overscroll-contain font-mono text-xs leading-6 outline-none focus-visible:shadow-[inset_var(--focus-shadow)]"
      >
        {shown.length === 0 ? (
          <p className="grid h-full place-items-center font-sans text-muted-foreground text-sm">
            {lines.length === 0 ? emptyText : "Seçili seviyelerde satır yok."}
          </p>
        ) : (
          <div className={cn("relative", !wrap && "min-w-max")} style={{ height: v.totalSize }}>
            {v.items.map((item) => {
              const line = shown[item.index];
              const t = toDate(line.time);
              const isHit = item.index === currentLine;
              return (
                <div
                  key={line.id ?? item.index}
                  ref={v.measure(item.index)}
                  data-level={line.level}
                  style={{ transform: `translateY(${item.start}px)` }}
                  className={cn(
                    "absolute inset-x-0 top-0 flex gap-3 px-3",
                    line.level && levelRow[line.level],
                    isHit && "shadow-[inset_2px_0_0_var(--code-line-hl-border)]",
                  )}
                >
                  <span
                    aria-hidden
                    className="w-[5ch] shrink-0 select-none text-right text-(--code-gutter) tabular"
                  >
                    {item.index + 1}
                  </span>
                  {t ? (
                    <time dateTime={t.toISOString()} className="shrink-0 text-(--code-gutter) tabular">
                      {formatClock(t)}
                    </time>
                  ) : null}
                  {line.level ? (
                    <span className={cn("w-[3ch] shrink-0", levelText[line.level])}>
                      {levelTag[line.level]}
                    </span>
                  ) : null}
                  {showSource && line.source ? (
                    <span className="max-w-48 shrink-0 truncate text-(--code-type)">
                      {marked(line.source, folded, false)}
                    </span>
                  ) : null}
                  <span className={cn("min-w-0", wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre")}>
                    {marked(line.message, folded, isHit)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {!following && shown.length > 0 ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={jumpToEnd}
          className="absolute right-3 bottom-3 shadow-(--shadow-md)"
        >
          <ArrowDownIcon />
          {unseen > 0 ? `${formatNumber(unseen)} yeni satır` : "En alta git"}
        </Button>
      ) : null}
    </div>
  );
}
