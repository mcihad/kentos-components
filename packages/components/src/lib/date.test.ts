import { describe, expect, it } from "vitest";
import {
  addMonths,
  daysInRange,
  formatRange,
  isBetween,
  monthGrid,
  parseDay,
  startOfWeek,
  weekdayNames,
} from "./date";

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);

describe("addMonths", () => {
  it("clamps the day to the target month", () => {
    expect(addMonths(day(2026, 1, 31), 1)).toEqual(day(2026, 2, 28));
    expect(addMonths(day(2024, 1, 31), 1)).toEqual(day(2024, 2, 29));
    expect(addMonths(day(2026, 3, 15), -3)).toEqual(day(2025, 12, 15));
  });
});

describe("weeks", () => {
  it("start on Monday", () => {
    expect(startOfWeek(day(2026, 11, 26))).toEqual(day(2026, 11, 23));
    expect(startOfWeek(day(2026, 11, 29))).toEqual(day(2026, 11, 23));
    expect(weekdayNames()[0]).toBe("Pzt");
  });

  it("fill a 6×7 month grid starting on a Monday", () => {
    const grid = monthGrid(day(2026, 11, 1));
    expect(grid).toHaveLength(42);
    expect(grid[0]).toEqual(day(2026, 10, 26));
    expect(grid[6]).toEqual(day(2026, 11, 1));
  });
});

describe("ranges", () => {
  it("include both ends in either order", () => {
    expect(isBetween(day(2026, 11, 5), day(2026, 11, 9), day(2026, 11, 1))).toBe(true);
    expect(isBetween(day(2026, 11, 10), day(2026, 11, 1), day(2026, 11, 9))).toBe(false);
    expect(daysInRange(day(2026, 11, 1), day(2026, 11, 7))).toBe(7);
  });

  it("are written with the shared month and year once", () => {
    expect(formatRange(day(2026, 11, 3), day(2026, 11, 9))).toBe("3 – 9 Kas 2026");
    expect(formatRange(day(2026, 10, 28), day(2026, 11, 3))).toBe("28 Eki – 3 Kas 2026");
    expect(formatRange(day(2025, 12, 28), day(2026, 1, 3))).toBe("28 Ara 2025 – 3 Oca 2026");
    expect(formatRange(day(2026, 11, 3), day(2026, 11, 3))).toBe("3 Kas 2026");
  });
});

describe("parseDay", () => {
  it("reads Turkish and ISO forms", () => {
    expect(parseDay("26.11.2026")).toEqual(day(2026, 11, 26));
    expect(parseDay("6/1/26")).toEqual(day(2026, 1, 6));
    expect(parseDay("2026-11-26")).toEqual(day(2026, 11, 26));
  });

  it("rejects impossible dates and other text", () => {
    expect(parseDay("31.02.2026")).toBeNull();
    expect(parseDay("yarın")).toBeNull();
    expect(parseDay("")).toBeNull();
  });
});
