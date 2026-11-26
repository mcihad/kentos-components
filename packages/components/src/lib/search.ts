// Turkish-aware text matching for client-side filters (sidebar search,
// pickers). Folding maps every character to exactly one character, so indices
// in the folded text are indices in the original and matches can be
// highlighted.

const folds: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

/** Lowercases with Turkish rules and drops diacritics: "Müşteriler" → "musteriler". */
export function foldText(text: string): string {
  let out = "";
  for (const ch of text) {
    const lower = ch.toLocaleLowerCase("tr");
    // A few characters lowercase to two code units outside Turkish; keep the
    // original then so indices stay aligned.
    const one = lower.length === ch.length ? lower : ch;
    out += folds[one] ?? one;
  }
  return out;
}

/** Whether the query occurs in the label or one of the keywords; an empty query matches everything. */
export function matchesQuery(query: string, label: string, keywords: readonly string[] = []): boolean {
  const q = foldText(query.trim());
  if (!q) return true;
  return foldText(label).includes(q) || keywords.some((k) => foldText(k).includes(q));
}

/** The first occurrence of the query in the text as [start, end), or null. */
export function matchRange(text: string, query: string): [number, number] | null {
  const q = foldText(query.trim());
  if (!q) return null;
  const at = foldText(text).indexOf(q);
  return at < 0 ? null : [at, at + q.length];
}
