import assert from "node:assert/strict";
import { test } from "node:test";
import { toCsv } from "./csv.mjs";
import {
  exportCsv,
  people,
  rosterCsv,
  rubric,
  rubrics,
  teamResponses,
} from "./peer-export.fixture.mjs";
import { parsePeerExport } from "./peer-export.mjs";
import { scorePeers } from "./peer-score.mjs";
import {
  criteriaTable,
  gapsTable,
  REPORT_KINDS,
  reportTable,
  responseCounts,
  stoppedTable,
} from "./peer-score-tables.mjs";
import { parseRoster } from "./roster.mjs";
import { matchRubricExport, parseRubricExport } from "./rubric-export.mjs";

const team = people("Owls", 3);
const grid = (value) => team.map(() => team.map(() => value));
const responses = teamResponses("Owls", team, {
  ratings: grid(4),
  split: [
    [20, 40, 40],
    [34, 33, 33],
    [34, 33, 33],
  ],
});
const stopped = { ...responses[2], finished: false };
const parsed = parsePeerExport(exportCsv([...responses.slice(0, 2), stopped]), {
  rubrics,
});
const students = parseRoster(rosterCsv({ Owls: team }));

test("the counts say what happens to each kind of response", () => {
  const { header, rows } = responseCounts(parsed, false);
  assert.deepEqual(header, ["Responses", "Count", "What happens"]);
  assert.deepEqual(rows[0].slice(0, 2), ["Finished", "2"]);
  assert.deepEqual(rows[2].slice(0, 2), ["Unfinished", "1"]);
  assert.equal(rows[3][2], "Left out.");
  assert.equal(
    responseCounts(parsed, true).rows[3][2],
    "Counted (staff test)."
  );
});

test("who stopped partway is named from the roster", () => {
  const nameOf = new Map(students.map((s) => [s.email, s.name]));
  assert.deepEqual(stoppedTable(parsed.stopped, nameOf).rows, [
    ["Tester3, Owls", "owls3@example.edu", "Owls", "unknown"],
  ]);
});

test("each criterion lists the export columns it fills", () => {
  const names = rubric.criteria.map((c) => c.title);
  const exported = parseRubricExport(
    toCsv([
      [
        "Student Id",
        "Student Name",
        ...names.flatMap((n) => [
          `${n} - Rating`,
          `${n} - Points`,
          `${n} - Comments`,
        ]),
      ],
    ])
  );
  const { rows } = criteriaTable(exported, matchRubricExport(exported, rubric));
  assert.deepEqual(rows[0], [
    "Quantity",
    "20",
    "Quantity - Rating; Quantity - Points; Quantity - Comments",
  ]);
});

test("the report lists errors first and the rubric export's problems last", () => {
  const scored = scorePeers({
    instrument: parsed.instrument,
    responses: parsed.responses,
    rubric: parsed.rubric,
    students,
  });
  const { rows } = reportTable(
    [{ level: "note", message: "n", who: "a" }, ...scored.problems],
    ["Row left as exported."]
  );
  assert.equal(rows.at(-1)[0], "Rubric export");
  const kinds = rows.slice(0, -1).map((row) => row[0]);
  const order = Object.values(REPORT_KINDS);
  assert.deepEqual(
    kinds,
    kinds.toSorted((a, b) => order.indexOf(a) - order.indexOf(b))
  );
  assert.ok(kinds.includes(REPORT_KINDS.note));
  const gaps = gapsTable(scored.results);
  assert.deepEqual(gaps.header, [
    "Student",
    "Team",
    "Ratings gap",
    "Share gap",
  ]);
  assert.equal(gaps.rows.length, 2);
});
