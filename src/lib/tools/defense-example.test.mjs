import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { example } from "../../data/defense-scoresheets.mjs";
import { parseRubricCsv } from "../rubric-csv.mjs";
import {
  EXAMPLE_PDF,
  EXAMPLE_SOURCES,
  exampleFingerprint,
  pdfTitle,
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

test("the fingerprint changes with the sheet and with each source the example prints", () => {
  const sheet = { criteria: [{ title: "Planning" }], rule: {}, total: 20 };
  const files = Object.fromEntries(EXAMPLE_SOURCES.map((p) => [p, "text"]));
  const read = (path) => files[path];
  const base = exampleFingerprint(sheet, read);
  assert.match(base, /^[0-9a-f]{12}$/);
  assert.equal(exampleFingerprint({ ...sheet }, read), base);
  assert.notEqual(
    exampleFingerprint({ ...sheet, criteria: [{ title: "Plans" }] }, read),
    base
  );
  for (const path of EXAMPLE_SOURCES) {
    const edited = (p) => (p === path ? "text, edited" : files[p]);
    assert.notEqual(exampleFingerprint(sheet, edited), base, path);
  }
});

test("the example PDF the defense page links was printed from the current rubric and sources", () => {
  const read = (path) => readFileSync(new URL(path, root), "utf8");
  const csv = "canvas/assignments/defense/defense-rubric.csv";
  const sheet = liveSheet(parseRubricCsv(read(csv), csv), csv);
  const pdf = readFileSync(new URL(`public/${EXAMPLE_PDF}`, root));
  assert.equal(
    pdfTitle(pdf),
    example.title(exampleFingerprint(sheet, read)),
    `public/${EXAMPLE_PDF} was printed before an edit to the defense rubric or to ${EXAMPLE_SOURCES.join(", ")}: run npm run defense:example and commit the PDF.`
  );
});
