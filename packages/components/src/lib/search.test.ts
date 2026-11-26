import { describe, expect, it } from "vitest";
import { foldText, matchesQuery, matchRange } from "./search";

describe("foldText", () => {
  it("folds Turkish letters and dotted capitals", () => {
    expect(foldText("Müşteriler")).toBe("musteriler");
    expect(foldText("İZLEME")).toBe("izleme");
    expect(foldText("IŞIK")).toBe("isik");
    expect(foldText("Çağrı")).toHaveLength("Çağrı".length);
  });
});

describe("matchesQuery", () => {
  it("matches labels and keywords without diacritics", () => {
    expect(matchesQuery("musteri", "Müşteriler")).toBe(true);
    expect(matchesQuery("ŞİKAYET", "Geri bildirim", ["şikâyet"])).toBe(true);
    expect(matchesQuery("pano", "Hatalar")).toBe(false);
    expect(matchesQuery("  ", "Hatalar")).toBe(true);
  });
});

describe("matchRange", () => {
  it("returns indices in the original text", () => {
    const text = "Zamanlanmış görevler";
    const range = matchRange(text, "gorev");
    expect(range).toEqual([12, 17]);
    expect(range && text.slice(...range)).toBe("görev");
    expect(matchRange(text, "yok")).toBeNull();
  });
});
