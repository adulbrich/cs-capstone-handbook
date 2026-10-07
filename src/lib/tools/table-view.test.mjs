import assert from "node:assert/strict";
import { test } from "node:test";
import {
  compareCells,
  nextSort,
  tableFromCsv,
  viewRows,
} from "./table-view.mjs";

const table = tableFromCsv(
  "Team,Name,Score\r\nTeam 10,Ada,9.5\r\nTeam 2,Grace,10\r\nTeam 2,Alan,\r\nTeam 1,Edsger\r\n"
);

const names = (rows) => rows.map((row) => row.cells[1]);

test("a CSV becomes a header and rows padded to its width", () => {
  assert.deepEqual(table.header, ["Team", "Name", "Score"]);
  assert.deepEqual(table.rows[3], ["Team 1", "Edsger", ""]);
  assert.deepEqual(tableFromCsv(""), { header: [], rows: [] });
});

test("the filter matches any cell, any case", () => {
  assert.deepEqual(names(viewRows(table.rows, { filter: "team 2" })), [
    "Grace",
    "Alan",
  ]);
  assert.deepEqual(names(viewRows(table.rows, { filter: "ADA" })), ["Ada"]);
  assert.equal(viewRows(table.rows, { filter: "  " }).length, 4);
});

test("numbers sort as numbers, text in natural order, blanks last", () => {
  const up = { column: 2, direction: "ascending" };
  const down = { column: 2, direction: "descending" };
  assert.deepEqual(names(viewRows(table.rows, { sort: up })), [
    "Ada",
    "Grace",
    "Alan",
    "Edsger",
  ]);
  assert.deepEqual(names(viewRows(table.rows, { sort: down })), [
    "Grace",
    "Ada",
    "Alan",
    "Edsger",
  ]);
  const teams = viewRows(table.rows, {
    sort: { column: 0, direction: "ascending" },
  });
  assert.deepEqual(
    teams.map((row) => row.cells[0]),
    ["Team 1", "Team 2", "Team 2", "Team 10"]
  );
  // Ties keep file order and every row keeps its file index.
  assert.deepEqual(
    teams.map((row) => row.index),
    [3, 1, 2, 0]
  );
  assert.ok(compareCells("2", "10") < 0);
});

test("a header click cycles ascending, descending, file order", () => {
  const first = nextSort(null, 1);
  assert.deepEqual(first, { column: 1, direction: "ascending" });
  const second = nextSort(first, 1);
  assert.deepEqual(second, { column: 1, direction: "descending" });
  assert.equal(nextSort(second, 1), null);
  assert.deepEqual(nextSort(second, 0), { column: 0, direction: "ascending" });
});
