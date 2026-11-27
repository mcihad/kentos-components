import { ChevronRightIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import { formatNumber } from "../lib/format";
import { cn } from "../lib/utils";
import { CopyButton } from "./copy-button";

/*
 * A collapsible view of JSON-like data: event payloads, request context,
 * local variables. Objects and arrays open and close (collapsed ones show
 * how many keys or items they hold); strings, numbers, booleans and null
 * are coloured like code. Long strings are cut with a "Tamamını göster"
 * link. A toolbar can open or close everything and copy the JSON.
 *
 *   <JsonViewer value={event.contexts} defaultExpandDepth={1} />
 *   <JsonViewer value={frame.vars} toolbar={false} />
 */

type Path = string;
const longString = 160;

function isContainer(v: unknown): v is Record<string, unknown> | unknown[] {
  return v !== null && typeof v === "object";
}

function entriesOf(v: Record<string, unknown> | unknown[], sortKeys: boolean): [string, unknown][] {
  if (Array.isArray(v)) return v.map((item, i) => [String(i), item]);
  const list = Object.entries(v);
  return sortKeys ? list.sort(([a], [b]) => a.localeCompare(b, "tr")) : list;
}

/** Every container path down to `depth` (Infinity: all). */
function pathsTo(value: unknown, depth: number, path: Path = "$", level = 0, out: Path[] = []): Path[] {
  if (!isContainer(value) || level >= depth) return out;
  out.push(path);
  for (const [k, v] of entriesOf(value, false)) pathsTo(v, depth, `${path}.${k}`, level + 1, out);
  return out;
}

function Primitive({ value }: { value: unknown }) {
  const [full, setFull] = useState(false);
  if (value === null) return <span className="text-(--code-number)">null</span>;
  if (value === undefined) return <span className="text-(--code-comment)">undefined</span>;
  if (typeof value === "boolean") return <span className="text-(--code-number)">{String(value)}</span>;
  if (typeof value === "number" || typeof value === "bigint")
    return <span className="text-(--code-number) tabular">{String(value)}</span>;
  const text = String(value);
  const cut = !full && text.length > longString;
  return (
    <span className="break-all text-(--code-string)">
      "{cut ? text.slice(0, longString) : text}
      {cut ? (
        <>
          …"{" "}
          <button
            type="button"
            onClick={() => setFull(true)}
            className="rounded-sm font-sans text-link text-xs underline-offset-2 outline-none hover:underline focus-visible:shadow-(--focus-shadow)"
          >
            Tamamını göster ({formatNumber(text.length)} karakter)
          </button>
        </>
      ) : (
        '"'
      )}
    </span>
  );
}

function Node({
  name,
  value,
  path,
  expanded,
  toggle,
  sortKeys,
  isIndex,
}: {
  name: string | null;
  value: unknown;
  path: Path;
  expanded: Set<Path>;
  toggle: (path: Path) => void;
  sortKeys: boolean;
  isIndex: boolean;
}) {
  const key: ReactNode =
    name === null ? null : (
      <span className={cn("shrink-0", isIndex ? "text-(--code-gutter)" : "text-(--code-type)")}>
        {isIndex ? name : `"${name}"`}
        <span className="text-muted-foreground">: </span>
      </span>
    );

  if (!isContainer(value)) {
    return (
      <li className="flex min-w-0 items-baseline py-px pl-5">
        {key}
        <Primitive value={value} />
      </li>
    );
  }

  const array = Array.isArray(value);
  const entries = entriesOf(value, sortKeys);
  const open = expanded.has(path);
  const [o, c] = array ? ["[", "]"] : ["{", "}"];
  const summary = array ? `${formatNumber(entries.length)} öğe` : `${formatNumber(entries.length)} anahtar`;

  return (
    <li className="min-w-0">
      <button
        type="button"
        aria-expanded={open}
        disabled={entries.length === 0}
        onClick={() => toggle(path)}
        className="group/row flex min-w-0 max-w-full items-baseline rounded-sm py-px text-left outline-none hover:bg-(--surface-hover) focus-visible:shadow-(--focus-shadow) disabled:cursor-default disabled:hover:bg-transparent"
      >
        <span className="grid w-5 shrink-0 place-items-center self-center">
          {entries.length > 0 ? (
            <ChevronRightIcon
              aria-hidden
              className={cn(
                "size-3.5 text-muted-foreground transition-transform duration-(--duration-fast)",
                open && "rotate-90",
              )}
            />
          ) : null}
        </span>
        {key}
        <span className="text-muted-foreground">{o}</span>
        {open ? null : (
          <>
            {entries.length > 0 ? <span className="px-1 text-(--code-comment)">…</span> : null}
            <span className="text-muted-foreground">{c}</span>
            <span className="ml-2 font-sans text-(--code-comment) text-xs">{summary}</span>
          </>
        )}
      </button>
      {open ? (
        <>
          <ul className="ml-[0.5625rem] border-(--border-default) border-l pl-1.5">
            {entries.map(([k, v]) => (
              <Node
                key={k}
                name={k}
                value={v}
                path={`${path}.${k}`}
                expanded={expanded}
                toggle={toggle}
                sortKeys={sortKeys}
                isIndex={array}
              />
            ))}
          </ul>
          <span className="pl-5 text-muted-foreground">{c}</span>
        </>
      ) : null}
    </li>
  );
}

export function JsonViewer({
  value,
  defaultExpandDepth = 1,
  sortKeys = false,
  toolbar = true,
  label,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  value: unknown;
  /** Levels open at first (0: all closed, Infinity: all open). */
  defaultExpandDepth?: number;
  /** Sorts object keys alphabetically. */
  sortKeys?: boolean;
  /** Open all / close all / copy (default true). */
  toolbar?: boolean;
  /** Shown at the start of the toolbar. */
  label?: ReactNode;
}) {
  const initial = useMemo(() => pathsTo(value, defaultExpandDepth), [value, defaultExpandDepth]);
  const [expanded, setExpanded] = useState(() => new Set(initial));
  const json = useMemo(() => {
    try {
      return JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? v.toString() : v), 2) ?? String(value);
    } catch {
      return String(value);
    }
  }, [value]);

  const toggle = (path: Path) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const toolbarButton =
    "rounded-sm px-1.5 py-0.5 text-muted-foreground text-xs outline-none hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow)";

  return (
    <div
      data-slot="json-viewer"
      className={cn("min-w-0 overflow-hidden rounded-lg border bg-(--code-bg)", className)}
      {...props}
    >
      {toolbar ? (
        <div className="flex min-h-9 items-center gap-1 border-b py-1 pr-1 pl-3">
          <span className="min-w-0 flex-1 truncate text-muted-foreground text-xs">{label}</span>
          {isContainer(value) ? (
            <>
              <button
                type="button"
                className={toolbarButton}
                onClick={() => setExpanded(new Set(pathsTo(value, Number.POSITIVE_INFINITY)))}
              >
                Tümünü aç
              </button>
              <button type="button" className={toolbarButton} onClick={() => setExpanded(new Set())}>
                Tümünü kapat
              </button>
            </>
          ) : null}
          <CopyButton value={json} label="JSON'u kopyala" />
        </div>
      ) : null}
      <ul className="overflow-x-auto px-2 py-2 font-mono text-[0.8125rem] leading-6">
        <Node
          name={null}
          value={value}
          path="$"
          expanded={expanded}
          toggle={toggle}
          sortKeys={sortKeys}
          isIndex={false}
        />
      </ul>
    </div>
  );
}
