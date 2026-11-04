// The example live sheet the defense page links
// (public/defense-live-sheet-example.pdf). Its PDF title carries a
// fingerprint of the live sheet the rubric prints, so a test can tell a PDF
// printed from an older rubric: the PDF is printed by
// scripts/defense-example-pdf.mjs from /tools/defense-scoresheets/example/,
// whose <title> is exampleTitle. Node only (node:crypto): the example page
// runs it at build time, and npm test reads the PDF.

import { createHash } from "node:crypto";

/** The PDF under public/, as the defense page links it. */
export const EXAMPLE_PDF = "defense-live-sheet-example.pdf";

/** Twelve hex digits of the SHA-256 of the live sheet (liveSheet). */
export const sheetFingerprint = (sheet) =>
  createHash("sha256").update(JSON.stringify(sheet)).digest("hex").slice(0, 12);

/** The example page's title, and so the PDF's. */
export const exampleTitle = (sheet) =>
  `Defense live sheet example, rubric ${sheetFingerprint(sheet)}`;

const LITERAL_TITLE = /\/Title\s*\(((?:\\.|[^\\)])*)\)/;
const HEX_TITLE = /\/Title\s*<([0-9A-Fa-f\s]*)>/;
const ESCAPE = /\\([nrtbf()\\]|[0-7]{1,3})/g;
const ESCAPED = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
const HEX_SPACE = /\s/g;
const OCTAL = /^[0-7]/;

/**
 * The title in a PDF's document information, or null when it has none.
 * Chromium writes it as a literal string, `/Title (...)`; a UTF-16 hex
 * string, `/Title <FEFF...>`, is read too.
 */
export function pdfTitle(bytes) {
  const text = Buffer.from(bytes).toString("latin1");
  const literal = text.match(LITERAL_TITLE);
  if (literal) {
    return literal[1].replace(ESCAPE, (_, c) =>
      OCTAL.test(c)
        ? String.fromCharCode(Number.parseInt(c, 8))
        : (ESCAPED[c] ?? c)
    );
  }
  const hex = text.match(HEX_TITLE);
  if (!hex) {
    return null;
  }
  const raw = Buffer.from(hex[1].replace(HEX_SPACE, ""), "hex");
  if (raw[0] === 0xfe && raw[1] === 0xff) {
    return raw.subarray(2).swap16().toString("utf16le");
  }
  return raw.toString("latin1");
}
