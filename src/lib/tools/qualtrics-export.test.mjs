import assert from "node:assert/strict";
import { test } from "node:test";
import { toCsv } from "./csv.mjs";
import { parseQualtricsExport } from "./qualtrics-export.mjs";
import { nameKey } from "./rubric-export.mjs";

const TAGS = ["Status", "Finished", "ResponseId", "Q1"];
const IDS = ["status", "finished", "_recordId", "QID1"].map((id) =>
  JSON.stringify({ ImportId: id })
);
const exportOf = (rows) => toCsv([TAGS, TAGS, IDS, ...rows]);
const ROWS = [
  ["IP Address", "True", "R_1", "a"],
  ["Survey Preview", "True", "R_2", "b"],
  ["IP Address", "False", "R_3", "c"],
];

test("each column carries its ImportId", () => {
  const { columns } = parseQualtricsExport(exportOf(ROWS));
  assert.deepEqual(columns.at(-1), { importId: "QID1", tag: "Q1", text: "Q1" });
});

test("previews are dropped unless asked for; unfinished responses are returned", () => {
  const plain = parseQualtricsExport(exportOf(ROWS));
  assert.deepEqual(
    plain.responses.map((r) => r.ResponseId),
    ["R_1"]
  );
  assert.deepEqual(plain.dropped, { preview: 1, unfinished: 1 });
  assert.deepEqual(
    plain.unfinished.map((r) => r.ResponseId),
    ["R_3"]
  );
  const staff = parseQualtricsExport(exportOf(ROWS), { includePreviews: true });
  assert.deepEqual(
    staff.responses.map((r) => r.ResponseId),
    ["R_1", "R_2"]
  );
  assert.equal(staff.dropped.preview, 0);
});

test("nameKey ignores case, spaces, and a trailing tag bracket", () => {
  assert.equal(nameKey(" Delivery Quality "), "delivery quality");
  assert.equal(
    nameKey("Attitude as a team player [SO5]"),
    nameKey("attitude as a team player")
  );
});
