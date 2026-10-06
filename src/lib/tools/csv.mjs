// CSV in and out for the instructor tools. Pure functions: no DOM, no I/O,
// so node --test covers them and the browser runs the same code.

const BOM = String.fromCodePoint(0xfe_ff);

/**
 * One field and what ends it: a quoted field (doubled quotes inside), or a
 * bare one, then a comma, a line break, or the end of the text.
 */
const FIELD = /(?:"((?:[^"]|"")*)"|([^",\r\n]*))(,|\r\n|\n|\r|$)/gy;

/**
 * Parses RFC 4180 CSV into an array of rows, each an array of strings.
 * Handles a leading byte-order mark, quoted fields with commas, doubled
 * quotes and line breaks, and CRLF or LF line ends. Blank lines are dropped.
 */
export function parseCsv(text) {
  const source = text.startsWith(BOM) ? text.slice(BOM.length) : text;
  const rows = [];
  let row = [];
  FIELD.lastIndex = 0;
  while (FIELD.lastIndex < source.length) {
    const match = FIELD.exec(source);
    if (!match) {
      throw new Error(`Malformed CSV near character ${FIELD.lastIndex + 1}.`);
    }
    const [, quoted, bare, end] = match;
    row.push(quoted === undefined ? bare : quoted.replaceAll('""', '"'));
    if (end !== ",") {
      rows.push(row);
      row = [];
    }
    if (end === "") {
      break;
    }
  }
  if (row.length > 0) {
    row.push("");
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

const NEEDS_QUOTES = /[",\r\n]/;

/** Quotes a field when it holds a comma, a quote, or a line break. */
function quote(value) {
  const text = String(value ?? "");
  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Writes rows (arrays of values) as CSV with CRLF line ends. */
export function toCsv(rows) {
  return `${rows.map((row) => row.map(quote).join(",")).join("\r\n")}\r\n`;
}
