import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  Columns3Icon,
  InboxIcon,
  RotateCcwIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { useIsMobile } from "../lib/use-mobile";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import { Pagination, type PaginationProps } from "./pagination";
import { EmptyState } from "./states";
import { tdClass, trClass } from "./table";

/*
 * A plain table for showing records, not a spreadsheet: sortable columns,
 * a column chooser, pagination, loading and empty states, row clicks, and a
 * card list on phones. Sorting and paging run in the browser, or on the
 * server with `manual` (the table then only reports what the user asked for).
 *
 *   <DataTable
 *     columns={[
 *       { id: "name", header: "Ad", value: (p) => p.name, sortable: true },
 *       { id: "events", header: "Olay", value: (p) => p.events, align: "end", sortable: true,
 *         cell: (p) => formatNumber(p.events) },
 *     ]}
 *     rows={projects}
 *     getRowId={(p) => p.id}
 *     pageSize={20}
 *     columnsStorageKey="projects-columns"
 *   />
 */

export type SortValue = string | number | bigint | Date | boolean | null | undefined;

/** The active sort: a column id and direction, or null for the data's own order. */
export type SortState = { id: string; desc: boolean } | null;

export type DataColumn<T> = {
  id: string;
  /** Header text; also the name in the column chooser and on phone cards. */
  header: string;
  /** What the column holds, for sorting and the default cell. */
  value?: (row: T) => SortValue;
  /** Custom cell; defaults to the value as text. */
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  /** Numbers and dates read best aligned to the end. */
  align?: "start" | "center" | "end";
  /** CSS width, e.g. "8rem" or "20%". */
  width?: string;
  /** Whether the user may hide it (default true). */
  hideable?: boolean;
  /** Hidden until the user shows it. */
  hidden?: boolean;
  /** On phone cards: the card's title, a labelled detail (default) or left out. */
  mobile?: "title" | "detail" | "hidden";
  className?: string;
};

function compare(a: SortValue, b: SortValue): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "bigint" || typeof b === "bigint") {
    const x = BigInt(a as bigint);
    const y = BigInt(b as bigint);
    return x < y ? -1 : x > y ? 1 : 0;
  }
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return String(a).localeCompare(String(b), "tr", { numeric: true, sensitivity: "base" });
}

function display(v: SortValue): ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-subtle">—</span>;
  if (v instanceof Date) return v.toLocaleString("tr-TR");
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  return String(v);
}

function readHidden(key: string | undefined): string[] | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    const v: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(v) && v.every((x) => typeof x === "string") ? v : null;
  } catch {
    return null;
  }
}

// The header reads as labels, not as another row: no fill, small spaced
// capitals in a muted colour, shorter than the rows, and a firmer rule
// under it than the lines between rows.
const headClass = "border-(--border-strong) border-b text-left";
const headCellClass =
  "h-9 whitespace-nowrap px-3.5 font-semibold text-2xs text-subtle uppercase tracking-(--tracking-caps) align-middle";

const alignClass = { start: "text-left", center: "text-center", end: "text-right" } as const;

export type DataTableProps<T> = {
  columns: readonly DataColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  /** What the table lists, for screen readers ("Projeler"). */
  caption?: string;
  /** Controlled sort; pair with onSortChange. */
  sort?: SortState;
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /**
   * Server mode: rows arrive sorted and paged; the table does neither and
   * reports the user's choices through onSortChange and `pagination`.
   */
  manual?: boolean;
  /** Browser paging: rows per page (with pageSizes to let the user choose). */
  pageSize?: number;
  pageSizes?: readonly number[];
  /** Server paging: props for the Pagination under the table. */
  pagination?: PaginationProps;
  /** Noun for the pagination summary ("proje"). */
  itemLabel?: string;
  /** First load: skeleton rows instead of the table body. */
  loading?: boolean;
  /** A new page or sort is loading: the rows dim and the controls wait. */
  refreshing?: boolean;
  /** Shown instead of the rows when there are none. */
  empty?: ReactNode;
  /** Shown instead of the table when loading failed. */
  error?: ReactNode;
  /** localStorage key remembering which columns the user hid. */
  columnsStorageKey?: string;
  /** Controls at the start of the toolbar (search, filters). */
  toolbar?: ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  /** Forces the phone (true) or desktop (false) layout. */
  mobile?: boolean;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manual = false,
  pageSize,
  pageSizes,
  pagination,
  itemLabel,
  loading = false,
  refreshing = false,
  empty,
  error,
  columnsStorageKey,
  toolbar,
  onRowClick,
  rowClassName,
  mobile,
  className,
}: DataTableProps<T>) {
  const isMobile = useIsMobile(mobile);
  const [innerSort, setInnerSort] = useState<SortState>(defaultSort);
  const sort = sortProp !== undefined ? sortProp : innerSort;
  const defaults = useMemo(() => columns.filter((c) => c.hidden).map((c) => c.id), [columns]);
  const [hidden, setHidden] = useState<string[]>(() => readHidden(columnsStorageKey) ?? defaults);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize ?? 20);

  const saveHidden = (next: string[]) => {
    setHidden(next);
    if (!columnsStorageKey) return;
    try {
      localStorage.setItem(columnsStorageKey, JSON.stringify(next));
    } catch {
      // Not remembered; still applied.
    }
  };

  const visible = columns.filter((c) => !hidden.includes(c.id));
  const hideable = columns.filter((c) => c.hideable !== false);

  const setSort = (next: SortState) => {
    if (sortProp === undefined) setInnerSort(next);
    onSortChange?.(next);
    if (!manual) setPage(1);
  };
  // Click cycle: ascending, descending, back to the data's order.
  const cycle = (id: string) => {
    if (!sort || sort.id !== id) setSort({ id, desc: false });
    else if (!sort.desc) setSort({ id, desc: true });
    else setSort(null);
  };

  const sorted = useMemo(() => {
    if (manual || !sort) return rows;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.value) return rows;
    const get = col.value;
    const out = [...rows].sort((a, b) => compare(get(a), get(b)));
    return sort.desc ? out.reverse() : out;
  }, [rows, sort, manual, columns]);

  const clientPaging = !manual && pageSize !== undefined;
  const pageCount = clientPaging ? Math.max(1, Math.ceil(sorted.length / size)) : 1;
  // Keep the page in range when the data shrinks (filtering).
  useEffect(() => {
    if (clientPaging && page > pageCount) setPage(pageCount);
  }, [clientPaging, page, pageCount]);
  const shown = clientPaging ? sorted.slice((page - 1) * size, page * size) : sorted;

  const footer = clientPaging ? (
    <Pagination
      page={page}
      onPageChange={setPage}
      pageSize={size}
      pageSizes={pageSizes}
      onPageSizeChange={(s) => {
        setSize(s);
        setPage(1);
      }}
      total={sorted.length}
      itemLabel={itemLabel}
    />
  ) : pagination ? (
    <Pagination itemLabel={itemLabel} disabled={refreshing} {...pagination} />
  ) : null;

  const chooser =
    hideable.length > 1 ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <Columns3Icon />
            Sütunlar
            {hidden.length ? (
              <span className="rounded-full bg-(--surface-active) px-1.5 text-2xs tabular">
                {columns.length - hidden.length}/{columns.length}
              </span>
            ) : null}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
            Gösterilen sütunlar
          </DropdownMenuLabel>
          {hideable.map((c) => {
            const on = !hidden.includes(c.id);
            return (
              <DropdownMenuCheckboxItem
                key={c.id}
                checked={on}
                // At least one column stays.
                disabled={on && visible.length === 1}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(v) => saveHidden(v ? hidden.filter((h) => h !== c.id) : [...hidden, c.id])}
              >
                {c.header}
              </DropdownMenuCheckboxItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => saveHidden(defaults)}>
            <RotateCcwIcon />
            Varsayılana dön
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null;

  const emptyNode = empty ?? <EmptyState icon={InboxIcon} title="Kayıt yok" className="py-12" />;
  const skeletonRows = Array.from(
    { length: Math.min(pagination?.pageSize ?? pageSize ?? 5, 8) },
    (_, i) => i,
  );

  let body: ReactNode;
  if (error) {
    body = <div className="px-4 py-6">{error}</div>;
  } else if (isMobile) {
    body = (
      <MobileList
        columns={visible}
        rows={shown}
        getRowId={getRowId}
        loading={loading}
        skeletonRows={skeletonRows}
        refreshing={refreshing}
        empty={emptyNode}
        onRowClick={onRowClick}
        sort={sort}
        sortable={columns.filter((c) => c.sortable && c.value !== undefined)}
        onSort={setSort}
      />
    );
  } else {
    body = (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" aria-busy={loading || refreshing || undefined}>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className={headClass}>
            <tr>
              {visible.map((c) => {
                const active = sort?.id === c.id;
                const ariaSort = active
                  ? sort?.desc
                    ? "descending"
                    : "ascending"
                  : c.sortable
                    ? "none"
                    : undefined;
                const Icon = active ? (sort?.desc ? ArrowDownIcon : ArrowUpIcon) : ArrowUpDownIcon;
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={ariaSort}
                    style={c.width ? { width: c.width } : undefined}
                    className={cn(headCellClass, alignClass[c.align ?? "start"], c.sortable && "p-0")}
                  >
                    {c.sortable ? (
                      <button
                        type="button"
                        onClick={() => cycle(c.id)}
                        disabled={refreshing}
                        className={cn(
                          "group/sort inline-flex h-9 w-full items-center gap-1 px-3.5 uppercase tracking-(--tracking-caps) outline-none transition-colors duration-(--duration-fast) hover:text-foreground focus-visible:shadow-(--focus-shadow)",
                          c.align === "end" && "flex-row-reverse",
                          c.align === "center" && "justify-center",
                          active && "text-strong",
                        )}
                      >
                        {c.header}
                        <Icon
                          className={cn(
                            "size-3.5 shrink-0",
                            active
                              ? "opacity-100"
                              : "opacity-0 group-hover/sort:opacity-60 group-focus-visible/sort:opacity-60",
                          )}
                        />
                      </button>
                    ) : (
                      <span>{c.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody
            className={cn(
              "divide-y transition-opacity duration-(--duration-base)",
              refreshing && "pointer-events-none opacity-55",
            )}
          >
            {loading
              ? skeletonRows.map((i) => (
                  <tr key={i} className="h-(--row-h)">
                    {visible.map((c) => (
                      <td key={c.id} className={tdClass}>
                        <Skeleton
                          className={cn("h-4", i % 2 ? "w-3/5" : "w-4/5", c.align === "end" && "ml-auto")}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              : shown.map((row) => (
                  <tr
                    key={getRowId(row)}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === "Enter" && e.target === e.currentTarget) onRowClick(row);
                          }
                        : undefined
                    }
                    className={cn(
                      trClass,
                      onRowClick && "cursor-pointer outline-none focus-visible:bg-(--table-row-hover)",
                      rowClassName?.(row),
                    )}
                  >
                    {visible.map((c) => (
                      <td
                        key={c.id}
                        className={cn(
                          tdClass,
                          alignClass[c.align ?? "start"],
                          c.align === "end" && "tabular",
                          c.className,
                        )}
                      >
                        {c.cell ? c.cell(row) : display(c.value?.(row))}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
        {!loading && shown.length === 0 ? emptyNode : null}
      </div>
    );
  }

  return (
    <div data-slot="data-table" className={cn("card min-w-0 overflow-hidden", className)}>
      {toolbar || chooser ? (
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2.5 sm:px-4">
          {toolbar}
          {chooser}
        </div>
      ) : null}
      {body}
      {footer && !error ? <div className="border-t px-3 py-2.5 sm:px-4">{footer}</div> : null}
    </div>
  );
}

// Phones: each row is a card with a title and labelled details; sorting
// moves into a select above the list.
function MobileList<T>({
  columns,
  rows,
  getRowId,
  loading,
  skeletonRows,
  refreshing,
  empty,
  onRowClick,
  sort,
  sortable,
  onSort,
}: {
  columns: DataColumn<T>[];
  rows: readonly T[];
  getRowId: (row: T) => string;
  loading: boolean;
  skeletonRows: number[];
  refreshing: boolean;
  empty: ReactNode;
  onRowClick?: (row: T) => void;
  sort: SortState;
  sortable: DataColumn<T>[];
  onSort: (sort: SortState) => void;
}) {
  const sortId = useId();
  const title = columns.find((c) => c.mobile === "title") ?? columns.find((c) => c.mobile !== "hidden");
  const details = columns.filter((c) => c !== title && c.mobile !== "hidden");
  const cell = (c: DataColumn<T>, row: T) => (c.cell ? c.cell(row) : display(c.value?.(row)));
  return (
    <div>
      {sortable.length ? (
        <div className="flex items-center gap-2 border-b px-3 py-2 text-muted-foreground text-sm">
          <label htmlFor={sortId} className="shrink-0">
            Sırala
          </label>
          <select
            id={sortId}
            value={sort ? `${sort.id}:${sort.desc ? "desc" : "asc"}` : ""}
            onChange={(e) => {
              const [id, dir] = e.target.value.split(":");
              onSort(id ? { id, desc: dir === "desc" } : null);
            }}
            className="h-9 min-w-0 flex-1 rounded-md border border-(--input-border) bg-(--input-bg) px-2 text-base text-foreground"
          >
            <option value="">Varsayılan</option>
            {sortable.map((c) => (
              <optgroup key={c.id} label={c.header}>
                <option value={`${c.id}:asc`}>{c.header} (artan)</option>
                <option value={`${c.id}:desc`}>{c.header} (azalan)</option>
              </optgroup>
            ))}
          </select>
        </div>
      ) : null}
      {loading ? (
        <ul className="divide-y">
          {skeletonRows.map((i) => (
            <li key={i} className="grid gap-2 px-4 py-3.5">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3.5 w-4/5" />
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        empty
      ) : (
        <ul className={cn("divide-y transition-opacity", refreshing && "pointer-events-none opacity-55")}>
          {rows.map((row) => (
            <li key={getRowId(row)}>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: the role is set when the row is clickable. */}
              <div
                role={onRowClick ? "button" : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "grid gap-2 px-4 py-3.5 outline-none",
                  onRowClick &&
                    "cursor-pointer active:bg-(--table-row-hover) focus-visible:bg-(--table-row-hover)",
                )}
              >
                {title ? <div className="min-w-0 font-medium text-md">{cell(title, row)}</div> : null}
                {details.length ? (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {details.map((c) => (
                      <div key={c.id} className="contents">
                        <dt className="text-muted-foreground">{c.header}</dt>
                        <dd className={cn("min-w-0 text-right", c.align === "end" && "tabular")}>
                          {cell(c, row)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
