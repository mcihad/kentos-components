import { ChevronRightIcon, Rows3Icon } from "lucide-react";
import { type ComponentProps, Fragment, type ReactNode, useMemo, useState } from "react";
import { languageOf } from "../lib/highlight";
import { cn } from "../lib/utils";
import { Badge } from "../ui/badge";
import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { FilterChip } from "./filter-chip";
import { JsonViewer } from "./json-viewer";

/*
 * An exception and its stack frames, shaped like Sentry's event payload
 * (exception.values[].stacktrace.frames, oldest frame first).
 *
 * Frames from the application are emphasised; runs of library frames fold
 * into one row ("8 kütüphane karesi") unless "Tüm kareler" is on. A frame
 * opens to its source context (the failing line highlighted) and its local
 * variables. The newest frame is on top by default; the first application
 * frame starts open. "Ham" shows the trace as text to copy. Chained
 * exceptions (a cause) are listed one after another.
 *
 *   <StackTrace exceptions={event.exception.values} />
 */

export type StackFrame = {
  function?: string;
  module?: string;
  filename?: string;
  absPath?: string;
  lineNo?: number;
  colNo?: number;
  /** Part of the application (not a library or the runtime). */
  inApp?: boolean;
  /** The failing line and the lines around it. */
  context?: { pre?: string[]; line: string; post?: string[] };
  vars?: Record<string, unknown>;
  package?: string;
};

export type StackException = {
  type: string;
  value?: string;
  module?: string;
  mechanism?: { type?: string; handled?: boolean };
  /** Oldest first, as SDKs send them. */
  frames: StackFrame[];
};

function frameLocation(f: StackFrame): string {
  const file = f.filename ?? f.absPath ?? f.module ?? "?";
  return f.lineNo ? `${file}:${f.lineNo}${f.colNo ? `:${f.colNo}` : ""}` : file;
}

function frameName(f: StackFrame): string {
  return f.function || "<anonim>";
}

/** Lets long dotted or slashed names wrap after a separator instead of mid-word. */
function breakable(name: string): ReactNode {
  const parts = name.split(/(?<=[./\\:])/);
  return parts.map((part, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: parts of a fixed string.
    <Fragment key={i}>
      {i > 0 ? <wbr /> : null}
      {part}
    </Fragment>
  ));
}

/** The trace as text, newest call last (the order most runtimes print). */
export function stackTraceText(exceptions: StackException[]): string {
  return exceptions
    .map((ex) => {
      const head = `${ex.module ? `${ex.module}.` : ""}${ex.type}${ex.value ? `: ${ex.value}` : ""}`;
      const frames = [...ex.frames]
        .reverse()
        .map((f) => `  at ${frameName(f)} (${frameLocation(f)})`)
        .join("\n");
      return `${head}\n${frames}`;
    })
    .join("\n\nNeden olan:\n");
}

type Row =
  | { kind: "frame"; frame: StackFrame; index: number }
  | { kind: "folded"; frames: StackFrame[]; key: string };

function rowsOf(frames: StackFrame[], newestFirst: boolean, all: boolean, unfolded: Set<string>): Row[] {
  const ordered = frames.map((frame, index) => ({ frame, index }));
  if (newestFirst) ordered.reverse();
  // With no application frame at all, folding would hide everything.
  const anyApp = frames.some((f) => f.inApp);
  if (all || !anyApp) return ordered.map((o) => ({ kind: "frame", ...o }));
  const rows: Row[] = [];
  let run: typeof ordered = [];
  const flush = () => {
    if (run.length === 0) return;
    const key = `${run[0].index}-${run.at(-1)?.index}`;
    if (run.length === 1 || unfolded.has(key))
      rows.push(...run.map((o) => ({ kind: "frame" as const, ...o })));
    else rows.push({ kind: "folded", frames: run.map((o) => o.frame), key });
    run = [];
  };
  for (const o of ordered) {
    if (o.frame.inApp) {
      flush();
      rows.push({ kind: "frame", ...o });
    } else run.push(o);
  }
  flush();
  return rows;
}

function FrameRow({ frame, open, onToggle }: { frame: StackFrame; open: boolean; onToggle: () => void }) {
  const ctx = frame.context;
  const hasDetail = !!ctx || (frame.vars && Object.keys(frame.vars).length > 0);
  const pre = ctx?.pre ?? [];
  const code = ctx ? [...pre, ctx.line, ...(ctx.post ?? [])].join("\n") : "";
  const start = frame.lineNo ? frame.lineNo - pre.length : 1;
  return (
    <li className={cn("border-b last:border-b-0", !frame.inApp && "bg-(--surface-muted)/40")}>
      <button
        type="button"
        aria-expanded={hasDetail ? open : undefined}
        disabled={!hasDetail}
        onClick={onToggle}
        className="group/frame flex w-full min-w-0 items-start gap-2 px-3 py-2 text-left outline-none hover:bg-(--surface-hover) focus-visible:shadow-[inset_var(--focus-shadow)] disabled:cursor-default disabled:hover:bg-transparent"
      >
        <ChevronRightIcon
          aria-hidden
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-(--duration-fast)",
            open && "rotate-90",
            !hasDetail && "invisible",
          )}
        />
        <span className="grid min-w-0 flex-1 gap-0.5">
          <span
            className={cn(
              "break-words font-mono text-[0.8125rem]",
              frame.inApp ? "font-semibold text-strong" : "text-muted-foreground",
            )}
          >
            {breakable(frameName(frame))}
          </span>
          <span className="break-words font-mono text-muted-foreground text-xs">
            {breakable(frame.filename ?? frame.absPath ?? frame.module ?? "?")}
            {frame.lineNo ? (
              <span className="text-subtle">
                :{frame.lineNo}
                {frame.colNo ? `:${frame.colNo}` : ""}
              </span>
            ) : null}
          </span>
        </span>
        {frame.inApp ? (
          <Badge variant="brand" size="sm" className="mt-0.5">
            Uygulama
          </Badge>
        ) : frame.package ? (
          <span className="mt-0.5 hidden max-w-40 truncate font-mono text-subtle text-xs sm:block">
            {frame.package}
          </span>
        ) : null}
      </button>
      {open && hasDetail ? (
        <div className="grid gap-3 px-3 pb-3 sm:pl-9">
          {ctx ? (
            <CodeBlock
              code={code}
              language={languageOf(frame.filename ?? frame.absPath)}
              startLine={start}
              highlight={frame.lineNo ? [frame.lineNo] : []}
              copy={false}
              wrap={false}
            />
          ) : null}
          {frame.vars && Object.keys(frame.vars).length > 0 ? (
            <JsonViewer value={frame.vars} label="Yerel değişkenler" defaultExpandDepth={1} />
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function ExceptionBlock({
  exception,
  newestFirst,
  all,
}: {
  exception: StackException;
  newestFirst: boolean;
  all: boolean;
}) {
  const firstApp = useMemo(() => {
    const ordered = exception.frames.map((f, i) => [f, i] as const);
    if (newestFirst) ordered.reverse();
    return ordered.find(([f]) => f.inApp)?.[1] ?? (newestFirst ? exception.frames.length - 1 : 0);
  }, [exception.frames, newestFirst]);
  const [open, setOpen] = useState<Set<number>>(() => new Set([firstApp]));
  const [unfolded, setUnfolded] = useState<Set<string>>(new Set());
  const rows = rowsOf(exception.frames, newestFirst, all, unfolded);
  const handled = exception.mechanism?.handled;

  return (
    <section className="min-w-0">
      <header className="mb-2 grid gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-all font-mono font-semibold text-(--status-danger-fg) text-sm">
            {exception.module ? (
              <span className="font-normal text-muted-foreground">{exception.module}.</span>
            ) : null}
            {exception.type}
          </h3>
          {handled === false ? (
            <Badge variant="danger" size="sm">
              İşlenmedi
            </Badge>
          ) : handled === true ? (
            <Badge variant="neutral" size="sm">
              İşlendi
            </Badge>
          ) : null}
          {exception.mechanism?.type ? (
            <span className="font-mono text-subtle text-xs">{exception.mechanism.type}</span>
          ) : null}
        </div>
        {exception.value ? <p className="break-words text-sm text-strong">{exception.value}</p> : null}
      </header>
      {exception.frames.length === 0 ? (
        <p className="text-muted-foreground text-sm">Yığın izi gönderilmemiş.</p>
      ) : (
        <ol className="overflow-hidden rounded-lg border bg-(--surface-card)">
          {rows.map((row) =>
            row.kind === "frame" ? (
              <FrameRow
                key={row.index}
                frame={row.frame}
                open={open.has(row.index)}
                onToggle={() =>
                  setOpen((prev) => {
                    const next = new Set(prev);
                    if (next.has(row.index)) next.delete(row.index);
                    else next.add(row.index);
                    return next;
                  })
                }
              />
            ) : (
              <li key={row.key} className="border-b bg-(--surface-muted)/40 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setUnfolded((prev) => new Set(prev).add(row.key))}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-muted-foreground text-xs outline-none hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-[inset_var(--focus-shadow)]"
                >
                  <Rows3Icon aria-hidden className="size-3.5" />
                  {row.frames.length} kütüphane karesi gizlendi — göster
                </button>
              </li>
            ),
          )}
        </ol>
      )}
    </section>
  );
}

export function StackTrace({
  exceptions,
  defaultNewestFirst = true,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  /** Sentry order: the cause first, the exception that was raised last. */
  exceptions: StackException[];
  defaultNewestFirst?: boolean;
}) {
  const [newestFirst, setNewestFirst] = useState(defaultNewestFirst);
  const [all, setAll] = useState(false);
  const [raw, setRaw] = useState(false);
  // The raised exception first, then what caused it.
  const shown = [...exceptions].reverse();
  const text = stackTraceText(shown);

  return (
    <div
      data-slot="stack-trace"
      className={cn("grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3", className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {/* The chips scroll sideways on narrow screens; copy stays at the end. */}
        <div className="-ml-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5 pl-1 [scrollbar-width:none] max-sm:pr-6 max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)]">
          <FilterChip selected={newestFirst} onClick={() => setNewestFirst((v) => !v)} disabled={raw}>
            En yeni üstte
          </FilterChip>
          <FilterChip selected={all} onClick={() => setAll((v) => !v)} disabled={raw}>
            Tüm kareler
          </FilterChip>
          <FilterChip selected={raw} onClick={() => setRaw((v) => !v)}>
            Ham
          </FilterChip>
        </div>
        <CopyButton value={text} label="Yığın izini kopyala" />
      </div>
      {raw ? (
        <CodeBlock code={text} language="plain" lineNumbers={false} copy={false} />
      ) : (
        shown.map((ex, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: exceptions have no id and never reorder.
          <Fragment key={i}>
            {i > 0 ? (
              <p className="flex items-center gap-2 text-muted-foreground text-xs">
                <span className="h-px flex-1 bg-border" />
                Neden olan
                <span className="h-px flex-1 bg-border" />
              </p>
            ) : null}
            <ExceptionBlock exception={ex} newestFirst={newestFirst} all={all} />
          </Fragment>
        ))
      )}
    </div>
  );
}
