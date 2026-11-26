import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";
import { formatNumber } from "../lib/format";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

/*
 * Page navigation under a list or table. Two modes:
 *
 *   numbered: the total is known  -> "21–40 / 245", first/prev, page numbers, next/last
 *   cursor:   only "is there more" -> prev and next (APIs with page tokens)
 *
 * Pages are 1-based. On phones the page numbers give way to "Sayfa 2 / 13".
 */

type Common = {
  /** Current page, starting at 1. */
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  /** Offers a page size choice when given, e.g. [20, 50, 100]. */
  pageSizes?: readonly number[];
  onPageSizeChange?: (size: number) => void;
  /** Noun for the summary, e.g. "hata" -> "21–40 / 245 hata". */
  itemLabel?: string;
  /** Disables the controls while a page loads. */
  disabled?: boolean;
  className?: string;
};

export type PaginationProps = Common &
  (
    | { total: number; hasNextPage?: never }
    | { total?: undefined /** Cursor mode: whether a next page exists. */; hasNextPage: boolean }
  );

/** The page numbers to show: first, last, the current one and its neighbours, with gaps. */
export function pageWindow(page: number, pageCount: number, siblings = 1): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const start = Math.max(2, page - siblings);
  const end = Math.min(pageCount - 1, page + siblings);
  const out: (number | "gap")[] = [1];
  if (start > 2) out.push("gap");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < pageCount - 1) out.push("gap");
  out.push(pageCount);
  return out;
}

export function Pagination(props: PaginationProps) {
  const {
    page,
    onPageChange,
    pageSize,
    pageSizes,
    onPageSizeChange,
    itemLabel,
    disabled = false,
    className,
  } = props;
  const numbered = props.total !== undefined;
  const total = props.total ?? 0;
  const pageCount = numbered ? Math.max(1, Math.ceil(total / pageSize)) : undefined;
  const hasPrev = page > 1;
  const hasNext = numbered ? page < (pageCount ?? 1) : props.hasNextPage;
  const from = total === 0 && numbered ? 0 : (page - 1) * pageSize + 1;
  const to = numbered ? Math.min(total, page * pageSize) : undefined;

  const go = (p: number) => {
    if (!disabled && p !== page) onPageChange(p);
  };

  return (
    <nav
      aria-label="Sayfalar"
      data-slot="pagination"
      className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm", className)}
    >
      <div className="flex min-w-0 items-center gap-3 text-muted-foreground">
        {numbered ? (
          <span className="tabular" aria-live="polite">
            {total === 0 ? (
              "Kayıt yok"
            ) : (
              <>
                <span className="font-medium text-foreground">
                  {formatNumber(from)}–{formatNumber(to ?? 0)}
                </span>{" "}
                / {formatNumber(total)}
                {itemLabel ? ` ${itemLabel}` : null}
              </>
            )}
          </span>
        ) : (
          <span className="tabular" aria-live="polite">
            Sayfa {formatNumber(page)}
          </span>
        )}
        {pageSizes?.length && onPageSizeChange ? (
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            disabled={disabled}
          >
            <SelectTrigger size="sm" className="w-auto gap-1.5" aria-label="Sayfa başına kayıt">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizes.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s} / sayfa
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        {numbered ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden sm:inline-flex"
            aria-label="İlk sayfa"
            disabled={disabled || !hasPrev}
            onClick={() => go(1)}
          >
            <ChevronsLeftIcon />
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          aria-label="Önceki sayfa"
          disabled={disabled || !hasPrev}
          onClick={() => go(page - 1)}
        >
          <ChevronLeftIcon />
          <span className="max-sm:sr-only">Önceki</span>
        </Button>
        {numbered && pageCount ? (
          <>
            <ul className="hidden items-center gap-1 md:flex">
              {pageWindow(page, pageCount).map((p, i) =>
                p === "gap" ? (
                  // biome-ignore lint/suspicious/noArrayIndexKey: gaps are positional.
                  <li key={`gap-${i}`} aria-hidden className="w-7 text-center text-subtle">
                    …
                  </li>
                ) : (
                  <li key={p}>
                    <Button
                      variant={p === page ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("min-w-(--control-h-sm) px-2 tabular", p === page && "text-strong")}
                      aria-current={p === page ? "page" : undefined}
                      aria-label={`Sayfa ${p}`}
                      disabled={disabled}
                      onClick={() => go(p)}
                    >
                      {formatNumber(p)}
                    </Button>
                  </li>
                ),
              )}
            </ul>
            <span className="px-1.5 text-muted-foreground tabular md:hidden">
              {formatNumber(page)} / {formatNumber(pageCount)}
            </span>
          </>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          aria-label="Sonraki sayfa"
          disabled={disabled || !hasNext}
          onClick={() => go(page + 1)}
        >
          <span className="max-sm:sr-only">Sonraki</span>
          <ChevronRightIcon />
        </Button>
        {numbered && pageCount ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden sm:inline-flex"
            aria-label="Son sayfa"
            disabled={disabled || !hasNext}
            onClick={() => go(pageCount)}
          >
            <ChevronsRightIcon />
          </Button>
        ) : null}
      </div>
    </nav>
  );
}
