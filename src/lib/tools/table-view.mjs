// A table preview's model: a CSV as a header and rows, and the rows a
// viewer sees after a text filter and a column sort. Pure: no DOM, no I/O.

import { parseCsv } from "./csv.mjs";

/**
 * A CSV's text as `{ header, rows }`, every row as long as the header (a
 * short row padded with empty cells). An empty file is an empty table.
 */
export function tableFromCsv(text) {
  const [header = [], ...rows] = parseCsv(text);
  return {
    header,
    rows: rows.map((row) => header.map((_, i) => row[i] ?? "")),
  };
}

const NUMBER = /^-?\d+(\.\d+)?$/;
const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

/**
 * Compares two cells: as numbers when both are numbers, as text otherwise
 * (numbers inside text in order, "Team 2" before "Team 10"). An empty cell
 * sorts last in either direction, so `direction` is applied by the caller.
 */
export function compareCells(a, b) {
  const x = a.trim();
  const y = b.trim();
  if (NUMBER.test(x) && NUMBER.test(y)) {
    return Number(x) - Number(y);
  }
  return collator.compare(x, y);
}

/**
 * The rows a viewer sees: those with a cell containing `filter` (any case),
 * sorted by column `sort.column` ("ascending" or "descending"), ties in
 * file order. `sort` null keeps file order. Each row keeps its file index
 * as `index`, for a stable key.
 */
export function viewRows(rows, { filter = "", sort = null } = {}) {
  const needle = filter.trim().toLowerCase();
  const indexed = rows
    .map((cells, index) => ({ cells, index }))
    .filter(
      ({ cells }) =>
        needle === "" ||
        cells.some((cell) => cell.toLowerCase().includes(needle))
    );
  if (!sort) {
    return indexed;
  }
  const sign = sort.direction === "descending" ? -1 : 1;
  return indexed.toSorted((a, b) => {
    const x = a.cells[sort.column] ?? "";
    const y = b.cells[sort.column] ?? "";
    const blank = (x.trim() === "") - (y.trim() === "");
    if (blank !== 0) {
      return blank;
    }
    return sign * compareCells(x, y) || a.index - b.index;
  });
}

/**
 * The next sort after a click on column `column`: ascending first, then
 * descending, then back to file order.
 */
export function nextSort(sort, column) {
  if (sort?.column !== column) {
    return { column, direction: "ascending" };
  }
  return sort.direction === "ascending"
    ? { column, direction: "descending" }
    : null;
}
