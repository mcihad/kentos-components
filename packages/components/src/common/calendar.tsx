import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  addDays,
  addMonths,
  compareDays,
  type DateRange,
  formatDayLong,
  formatMonth,
  formatMonthYear,
  isBetween,
  isSameDay,
  isSameMonth,
  monthGrid,
  startOfDay,
  startOfMonth,
  startOfWeek,
  today,
  weekdayNames,
} from "../lib/date";
import { cn } from "../lib/utils";

/*
 * A month calendar in Turkish, weeks starting on Monday. Picks one day
 * (mode="single") or a range (mode="range": the first click sets the start,
 * the second the end, with a preview while pointing). Fully keyboard driven
 * with a roving focus: arrows move by day and week, Home/End to the week's ends,
 * Page Up/Down by month (with Shift by year), Enter or Space picks. The
 * caption opens a month and year chooser for distant dates.
 *
 *   <Calendar value={day} onValueChange={setDay} />
 *   <Calendar mode="range" value={range} onValueChange={setRange} numberOfMonths={2} />
 */

type CalendarBase = {
  /** First month shown; controlled. Defaults to the selection's month or today. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /** Months side by side (2 for ranges on wide screens). */
  numberOfMonths?: 1 | 2;
  min?: Date | null;
  max?: Date | null;
  /** Days that cannot be picked besides those outside min/max. */
  isDisabled?: (day: Date) => boolean;
  /** Focuses the selected (or today's) day on mount. */
  autoFocus?: boolean;
  className?: string;
};

export type CalendarProps = CalendarBase &
  (
    | { mode?: "single"; value: Date | null; onValueChange: (day: Date) => void }
    | {
        mode: "range";
        value: DateRange;
        onValueChange: (range: DateRange) => void;
        /** Longest range in days; further days are disabled while the end is chosen. */
        maxDays?: number;
      }
  );

const weekdays = weekdayNames();
const weekdaysLong = weekdayNames(true);

export function Calendar(props: CalendarProps) {
  const { numberOfMonths = 1, min, max, isDisabled, autoFocus, className } = props;
  const range = props.mode === "range" ? props.value : null;
  const single = props.mode === "range" ? null : props.value;
  const anchor = single ?? range?.from ?? range?.to ?? null;

  const [ownMonth, setOwnMonth] = useState(() => startOfMonth(anchor ?? clampToBounds(today(), min, max)));
  const month = props.month ? startOfMonth(props.month) : ownMonth;
  const setMonth = (m: Date) => {
    const first = startOfMonth(m);
    setOwnMonth(first);
    props.onMonthChange?.(first);
  };

  const [focused, setFocused] = useState(() => anchor ?? clampToBounds(today(), min, max));
  const [hover, setHover] = useState<Date | null>(null);
  const [view, setView] = useState<"days" | "months">("days");
  const grid = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);

  // After keyboard navigation, focus follows the roving day.
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${key(focused)}"]`)?.focus();
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: only on mount.
  useEffect(() => {
    if (autoFocus) grid.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, []);

  const lastMonth = addMonths(month, numberOfMonths - 1);
  const maxDays = props.mode === "range" ? props.maxDays : undefined;
  const picking = range?.from && !range.to ? range.from : null;

  const disabled = (d: Date) => {
    if (min && compareDays(d, min) < 0) return true;
    if (max && compareDays(d, max) > 0) return true;
    if (picking && maxDays && Math.abs(compareDays(d, picking)) / 86_400_000 >= maxDays) return true;
    return isDisabled?.(d) ?? false;
  };

  const pick = (d: Date) => {
    if (disabled(d)) return;
    setFocused(d);
    if (props.mode === "range") {
      const { from, to } = props.value;
      if (!from || to) props.onValueChange({ from: d, to: null });
      else if (compareDays(d, from) < 0) props.onValueChange({ from: d, to: from });
      else props.onValueChange({ from, to: d });
    } else {
      props.onValueChange(d);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const target = stepFor(e.key, e.shiftKey, focused);
    if (!target) return;
    e.preventDefault();
    const next = clampToBounds(target, min, max);
    setFocused(next);
    if (props.mode === "range" && picking) setHover(next);
    if (compareDays(next, month) < 0) setMonth(next);
    else if (compareDays(next, addMonths(lastMonth, 1)) >= 0)
      setMonth(addMonths(next, -(numberOfMonths - 1)));
    moveFocus.current = true;
  };

  // The range drawn: the chosen one, or the start and the pointed day while picking.
  const drawn = useMemo(() => {
    if (!range?.from) return null;
    const end = range.to ?? hover;
    if (!end) return { from: range.from, to: range.from };
    return compareDays(end, range.from) < 0 ? { from: end, to: range.from } : { from: range.from, to: end };
  }, [range?.from, range?.to, hover]);

  // The roving tab stop must be a visible day.
  const tabDay =
    compareDays(focused, month) >= 0 && compareDays(focused, addMonths(lastMonth, 1)) < 0 ? focused : month;

  const header = (
    <div className="flex items-center justify-between gap-1 px-0.5 pb-2">
      <NavButton
        label={view === "days" ? "Önceki ay" : "Önceki yıl"}
        disabled={
          view === "days"
            ? !!min && compareDays(month, startOfMonth(min)) <= 0
            : !!min && month.getFullYear() <= min.getFullYear()
        }
        onClick={() => setMonth(addMonths(month, view === "days" ? -1 : -12))}
      >
        <ChevronLeftIcon />
      </NavButton>
      <button
        type="button"
        aria-live="polite"
        aria-label={
          view === "days" ? `${formatMonthYear(month)}, ay ve yıl seç` : `${month.getFullYear()}, günlere dön`
        }
        onClick={() => setView(view === "days" ? "months" : "days")}
        className="flex h-8 items-center gap-1 rounded-md px-2 font-semibold text-sm text-strong capitalize outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) focus-visible:shadow-(--focus-shadow)"
      >
        {view === "days"
          ? numberOfMonths === 2
            ? `${formatMonthYear(month)} – ${formatMonthYear(lastMonth)}`
            : formatMonthYear(month)
          : month.getFullYear()}
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-muted-foreground transition-transform duration-(--duration-fast)",
            view === "months" && "rotate-180",
          )}
        />
      </button>
      <NavButton
        label={view === "days" ? "Sonraki ay" : "Sonraki yıl"}
        disabled={
          view === "days"
            ? !!max && compareDays(lastMonth, startOfMonth(max)) >= 0
            : !!max && month.getFullYear() >= max.getFullYear()
        }
        onClick={() => setMonth(addMonths(month, view === "days" ? 1 : 12))}
      >
        <ChevronRightIcon />
      </NavButton>
    </div>
  );

  if (view === "months") {
    return (
      <div data-slot="calendar" className={cn("w-fit p-3", className)}>
        {header}
        <div className="grid w-[17.5rem] grid-cols-3 gap-1.5">
          {Array.from({ length: 12 }, (_, i) => {
            const m = new Date(month.getFullYear(), i, 1);
            const out =
              (!!min && compareDays(addMonths(m, 1), startOfMonth(min)) <= 0) ||
              (!!max && compareDays(m, max) > 0);
            const current = anchor && isSameMonth(m, anchor);
            return (
              <button
                key={formatMonth(m)}
                type="button"
                disabled={out}
                onClick={() => {
                  setMonth(m);
                  setFocused(
                    clampToBounds(
                      new Date(m.getFullYear(), m.getMonth(), Math.min(focused.getDate(), 28)),
                      min,
                      max,
                    ),
                  );
                  setView("days");
                }}
                className={cn(
                  "h-11 rounded-md text-sm capitalize outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) focus-visible:shadow-(--focus-shadow) disabled:pointer-events-none disabled:opacity-40",
                  isSameMonth(m, today()) && "font-semibold text-(--text-brand)",
                  current && "bg-(--brand-bg) font-semibold text-(--brand-fg) hover:bg-(--brand-bg-hover)",
                )}
              >
                {formatMonth(m, true)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div data-slot="calendar" className={cn("w-fit p-3", className)}>
      {header}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: keydown is delegated from the day buttons. */}
      <div ref={grid} onKeyDown={onKeyDown} className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        {Array.from({ length: numberOfMonths }, (_, i) => {
          const shown = addMonths(month, i);
          return (
            <table
              key={key(shown)}
              aria-label={formatMonthYear(shown)}
              className="border-separate border-spacing-y-0.5"
              onPointerLeave={() => setHover(null)}
            >
              {numberOfMonths === 2 ? (
                <caption className="pb-1.5 font-medium text-muted-foreground text-xs capitalize">
                  {formatMonthYear(shown)}
                </caption>
              ) : null}
              <thead>
                <tr>
                  {weekdays.map((w, wi) => (
                    <th
                      key={w}
                      scope="col"
                      abbr={weekdaysLong[wi]}
                      className="size-10 p-0 text-center font-medium text-subtle text-xs md:size-9"
                    >
                      {w}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chunk(monthGrid(shown), 7).map((week) => (
                  <tr key={key(week[0] ?? shown)}>
                    {week.map((d) => {
                      const outside = !isSameMonth(d, shown);
                      if (outside && numberOfMonths === 2) return <td key={key(d)} className="p-0" />;
                      const off = disabled(d);
                      const isToday = isSameDay(d, today());
                      const selected = single
                        ? isSameDay(d, single)
                        : !!drawn && (isSameDay(d, drawn.from) || isSameDay(d, drawn.to));
                      const inside = !!drawn && !selected && isBetween(d, drawn.from, drawn.to);
                      const isStart = !!drawn && isSameDay(d, drawn.from) && !isSameDay(drawn.from, drawn.to);
                      const isEnd = !!drawn && isSameDay(d, drawn.to) && !isSameDay(drawn.from, drawn.to);
                      return (
                        <td
                          key={key(d)}
                          className={cn(
                            "p-0",
                            (inside || isStart || isEnd) && "bg-(--surface-brand-subtle)",
                            isStart && "rounded-l-md",
                            isEnd && "rounded-r-md",
                            inside && "first:rounded-l-md last:rounded-r-md",
                          )}
                        >
                          <button
                            type="button"
                            data-day={key(d)}
                            tabIndex={isSameDay(d, tabDay) ? 0 : -1}
                            disabled={off}
                            aria-label={`${formatDayLong(d)}${isToday ? ", bugün" : ""}${inside ? ", aralıkta" : ""}`}
                            aria-pressed={selected}
                            aria-current={isToday ? "date" : undefined}
                            onClick={() => pick(d)}
                            onFocus={() => setFocused(d)}
                            onPointerEnter={() => picking && setHover(d)}
                            className={cn(
                              "relative grid size-10 place-items-center rounded-md text-sm tabular outline-none transition-colors duration-(--duration-fast) md:size-9",
                              "hover:bg-(--surface-hover) focus-visible:shadow-(--focus-shadow) disabled:pointer-events-none disabled:text-subtle disabled:line-through disabled:decoration-(--border-strong)",
                              outside && "text-subtle",
                              inside && "hover:bg-(--surface-selected)",
                              isToday && !selected && "font-semibold text-(--text-brand)",
                              selected &&
                                "bg-(--brand-bg) font-semibold text-(--brand-fg) hover:bg-(--brand-bg-hover)",
                            )}
                          >
                            {d.getDate()}
                            {isToday ? (
                              <span
                                aria-hidden
                                className={cn(
                                  "absolute bottom-1 size-1 rounded-full",
                                  selected ? "bg-(--brand-fg)" : "bg-(--text-brand)",
                                )}
                              />
                            ) : null}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })}
      </div>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-(--duration-fast) hover:bg-(--surface-hover) hover:text-foreground focus-visible:shadow-(--focus-shadow) disabled:pointer-events-none disabled:opacity-40 [&>svg]:size-4"
    >
      {children}
    </button>
  );
}

/** Where a navigation key moves the focused day, or null for other keys. */
function stepFor(key: string, shift: boolean, from: Date): Date | null {
  switch (key) {
    case "ArrowLeft":
      return addDays(from, -1);
    case "ArrowRight":
      return addDays(from, 1);
    case "ArrowUp":
      return addDays(from, -7);
    case "ArrowDown":
      return addDays(from, 7);
    case "Home":
      return startOfWeek(from);
    case "End":
      return addDays(startOfWeek(from), 6);
    case "PageUp":
      return addMonths(from, shift ? -12 : -1);
    case "PageDown":
      return addMonths(from, shift ? 12 : 1);
    default:
      return null;
  }
}

function clampToBounds(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDays(d, min) < 0) return startOfDay(min);
  if (max && compareDays(d, max) > 0) return startOfDay(max);
  return startOfDay(d);
}

function key(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
