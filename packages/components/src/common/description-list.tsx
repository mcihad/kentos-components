import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "../lib/utils";

/*
 * Label–value pairs (a <dl>): record details, settings summaries, the side
 * panel of an issue. Empty values show a dash.
 *
 * Layouts:
 *   rows    label column and value column; stacks on phones. `divided`
 *           draws a rule between rows. `labelWidth` sets the label column.
 *   inline  label on the left, value pushed right: narrow side panels.
 *   grid    label above value in 2–4 columns: headline figures, summaries.
 *
 *   <DescriptionList layout="rows" divided>
 *     <DescriptionItem label="Proje">e-Belediye</DescriptionItem>
 *     <DescriptionItem label="DSN" mono>https://…</DescriptionItem>
 *   </DescriptionList>
 */
export function DescriptionList({
  layout = "rows",
  divided = false,
  columns = 2,
  labelWidth = "10rem",
  className,
  style,
  ...props
}: ComponentProps<"dl"> & {
  layout?: "rows" | "inline" | "grid";
  divided?: boolean;
  /** Columns of the grid layout from sm up (phones: two, or one when 2). */
  columns?: 2 | 3 | 4;
  /** Width of the label column in the rows layout. */
  labelWidth?: string;
}) {
  return (
    <dl
      data-slot="description-list"
      data-layout={layout}
      style={{ "--dl-label": labelWidth, ...style } as CSSProperties}
      className={cn(
        "group/dl text-sm",
        layout === "rows" && (divided ? "divide-y" : "grid gap-3 sm:gap-2"),
        layout === "inline" && (divided ? "divide-y" : "grid gap-2.5"),
        layout === "grid" && "grid gap-x-6 gap-y-4",
        layout === "grid" && columns === 2 && "grid-cols-1 sm:grid-cols-2",
        layout === "grid" && columns === 3 && "grid-cols-2 sm:grid-cols-3",
        layout === "grid" && columns === 4 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
      {...props}
    />
  );
}

/** One label and value. */
export function DescriptionItem({
  label,
  hint,
  mono = false,
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  label: ReactNode;
  children?: ReactNode;
  /** A muted line under the value (an explanation, a secondary value). */
  hint?: ReactNode;
  /** Monospace value: keys, hashes, URLs. */
  mono?: boolean;
}) {
  const empty = children === null || children === undefined || children === "" || children === false;
  return (
    <div
      data-slot="description-item"
      className={cn(
        // rows
        "group-data-[layout=rows]/dl:grid group-data-[layout=rows]/dl:gap-0.5 group-data-[layout=rows]/dl:sm:grid-cols-[var(--dl-label)_minmax(0,1fr)] group-data-[layout=rows]/dl:sm:gap-x-5",
        "group-data-[layout=rows]/dl:in-[.divide-y]:py-2.5",
        // inline
        "group-data-[layout=inline]/dl:flex group-data-[layout=inline]/dl:items-baseline group-data-[layout=inline]/dl:justify-between group-data-[layout=inline]/dl:gap-4",
        "group-data-[layout=inline]/dl:in-[.divide-y]:py-2",
        // grid
        "group-data-[layout=grid]/dl:flex group-data-[layout=grid]/dl:min-w-0 group-data-[layout=grid]/dl:flex-col group-data-[layout=grid]/dl:gap-1",
        className,
      )}
      {...props}
    >
      <dt className="text-muted-foreground group-data-[layout=grid]/dl:text-xs group-data-[layout=inline]/dl:shrink-0">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 break-words text-foreground group-data-[layout=inline]/dl:text-right",
          mono && "font-mono text-[0.92em]",
        )}
      >
        {empty ? (
          <span className="text-subtle">
            <span aria-hidden>—</span>
            <span className="sr-only">Yok</span>
          </span>
        ) : (
          children
        )}
        {hint ? <span className="mt-0.5 block text-muted-foreground text-xs">{hint}</span> : null}
      </dd>
    </div>
  );
}
