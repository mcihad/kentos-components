/*
 * Calendar-day helpers for date pickers. A "day" is a Date at local
 * midnight; times are dropped. Weeks start on Monday (Turkey). Formatting is
 * tr-TR.
 */

export type DateRange = { from: Date | null; to: Date | null };

/** The same calendar day at 00:00 local time. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function today(): Date {
  return startOfDay(new Date());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Moves by months, clamping the day to the target month's length (31 Jan + 1 → 28/29 Feb). */
export function addMonths(d: Date, n: number): Date {
  const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), last));
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/** Monday of the week containing d. */
export function startOfWeek(d: Date): Date {
  return addDays(startOfDay(d), -((d.getDay() + 6) % 7));
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Negative, zero or positive as day a is before, on or after day b. */
export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

/** Whether day d lies within [from, to], ends included (in either order). */
export function isBetween(d: Date, from: Date, to: Date): boolean {
  const [lo, hi] = compareDays(from, to) <= 0 ? [from, to] : [to, from];
  return compareDays(d, lo) >= 0 && compareDays(d, hi) <= 0;
}

/** Keeps d within [min, max]. */
export function clampDay(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDays(d, min) < 0) return startOfDay(min);
  if (max && compareDays(d, max) > 0) return startOfDay(max);
  return d;
}

/** Number of calendar days in [from, to], both included. */
export function daysInRange(from: Date, to: Date): number {
  return Math.round(Math.abs(compareDays(to, from)) / 86_400_000) + 1;
}

/** The 6×7 days shown for a month, Monday first, padded with neighbouring months. */
export function monthGrid(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

const monthYearFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" });
const monthFmt = new Intl.DateTimeFormat("tr-TR", { month: "long" });
const monthShortFmt = new Intl.DateTimeFormat("tr-TR", { month: "short" });
const weekdayShortFmt = new Intl.DateTimeFormat("tr-TR", { weekday: "short" });
const weekdayLongFmt = new Intl.DateTimeFormat("tr-TR", { weekday: "long" });
const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });
const dayLongFmt = new Intl.DateTimeFormat("tr-TR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "Kasım 2026" */
export function formatMonthYear(d: Date): string {
  return monthYearFmt.format(d);
}

/** "Kasım", or "Kas" when short. */
export function formatMonth(d: Date, short = false): string {
  return (short ? monthShortFmt : monthFmt).format(d);
}

/** Monday-first weekday names: ["Pzt", "Sal", …] or the long forms. */
export function weekdayNames(long = false): string[] {
  const monday = new Date(2024, 0, 1); // a Monday
  return Array.from({ length: 7 }, (_, i) =>
    (long ? weekdayLongFmt : weekdayShortFmt).format(addDays(monday, i)),
  );
}

/** "26 Kas 2026" */
export function formatDay(d: Date): string {
  return dayFmt.format(d);
}

/** "26 Kasım 2026 Perşembe": the accessible name of a calendar day. */
export function formatDayLong(d: Date): string {
  return dayLongFmt.format(d);
}

/**
 * "3 – 9 Kas 2026", "28 Eki – 3 Kas 2026", "28 Ara 2025 – 3 Oca 2026": the
 * shared month and year are written once.
 */
export function formatRange(from: Date, to: Date): string {
  if (isSameDay(from, to)) return formatDay(from);
  const [a, b] = compareDays(from, to) <= 0 ? [from, to] : [to, from];
  if (a.getFullYear() !== b.getFullYear()) return `${formatDay(a)} – ${formatDay(b)}`;
  if (a.getMonth() !== b.getMonth()) return `${a.getDate()} ${formatMonth(a, true)} – ${formatDay(b)}`;
  return `${a.getDate()} – ${formatDay(b)}`;
}

/**
 * Reads a typed day: "26.11.2026", "26/11/2026", "26-11-26", "2026-11-26".
 * Returns null for anything else or an impossible date (31.02).
 */
export function parseDay(text: string): Date | null {
  const t = text.trim();
  let y: number;
  let m: number;
  let d: number;
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
  const tr = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/.exec(t);
  if (iso) {
    [y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])];
  } else if (tr) {
    [d, m, y] = [Number(tr[1]), Number(tr[2]), Number(tr[3])];
    if (y < 100) y += 2000;
  } else {
    return null;
  }
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

/** A named range offered next to a range calendar ("Son 7 gün"). */
export type DateRangePreset = { label: string; range: () => { from: Date; to: Date } };

/** The usual reporting ranges, ending today. */
export const defaultRangePresets: readonly DateRangePreset[] = [
  { label: "Bugün", range: () => ({ from: today(), to: today() }) },
  { label: "Dün", range: () => ({ from: addDays(today(), -1), to: addDays(today(), -1) }) },
  { label: "Son 7 gün", range: () => ({ from: addDays(today(), -6), to: today() }) },
  { label: "Son 30 gün", range: () => ({ from: addDays(today(), -29), to: today() }) },
  { label: "Bu ay", range: () => ({ from: startOfMonth(today()), to: today() }) },
  {
    label: "Geçen ay",
    range: () => {
      const last = addMonths(startOfMonth(today()), -1);
      return { from: last, to: endOfMonth(last) };
    },
  },
  { label: "Son 90 gün", range: () => ({ from: addDays(today(), -89), to: today() }) },
  { label: "Bu yıl", range: () => ({ from: new Date(today().getFullYear(), 0, 1), to: today() }) },
];
