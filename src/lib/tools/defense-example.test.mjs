import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseRubricCsv } from "../rubric-csv.mjs";
import {
  EXAMPLE_PDF,
  exampleTitle,
  pdfTitle,
  sheetFingerprint,
} from "./defense-example.mjs";
import { liveSheet } from "./defense-sheets.mjs";

const root = new URL("../../../", import.meta.url);

test("a PDF's title reads from a literal string, escapes and all, or a UTF-16 hex string", () => {
  const literal = Buffer.from(
    "%PDF-1.4\n1 0 obj << /Title (A \\(draft\\) sheet\\051) /Producer (x) >>",
    "latin1"
  );
  assert.equal(pdfTitle(literal), "A (draft) sheet)");
  const hex = Buffer.from(
    `<< /Title <FEFF${Buffer.from("Sheet", "utf16le").swap16().toString("hex")}> >>`,
    "latin1"
  );
  assert.equal(pdfTitle(hex), "Sheet");
  assert.equal(pdfTitle(Buffer.from("<< /Producer (x) >>")), null);
});

test("the fingerprint changes with any word the live sheet prints", () => {
  const sheet = { criteria: [{ title: "Planning" }], rule: {}, total: 20 };
  const reworded = { ...sheet, criteria: [{ title: "Plans" }] };
  assert.match(sheetFingerprint(sheet), /^[0-9a-f]{12}$/);
  assert.notEqual(sheetFingerprint(sheet), sheetFingerprint(reworded));
  assert.equal(exampleTitle(sheet), exampleTitle({ ...sheet }));
});

test("the example PDF the defense page links was printed from the current rubric", () => {
  const path = "canvas/assignments/defense/defense-rubric.csv";
  const sheet = liveSheet(
    parseRubricCsv(readFileSync(new URL(path, root), "utf8"), path),
    path
  );
  const pdf = readFileSync(new URL(`public/${EXAMPLE_PDF}`, root));
  assert.equal(
    pdfTitle(pdf),
    exampleTitle(sheet),
    `public/${EXAMPLE_PDF} was printed from an older rubric: run npm run defense:example and commit the PDF.`
  );
});
