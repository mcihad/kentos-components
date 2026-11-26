// Table styling of the KentOS design system. The header reads as labels,
// not as another row: no fill, small spaced capitals in the subtle text
// colour, shorter than the rows, and a firmer rule under it than the lines
// between rows. Body rows follow the density (--row-h) with a quiet hover.
// Capitals follow Turkish rules (i → İ) with <html lang="tr">.
export const theadClass = "border-(--border-strong) border-b text-left";
export const thClass =
  "h-9 whitespace-nowrap px-3.5 align-middle font-semibold text-2xs text-subtle uppercase tracking-(--tracking-caps)";
export const trClass =
  "h-(--row-h) transition-colors duration-(--duration-fast) hover:bg-(--table-row-hover)";
export const tdClass = "px-3.5 py-2";
