import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareText, scoreText } from "../../data/partner-tools.mjs";
import {
  noPartnerTable,
  partnersTable,
  rosterTeams,
  sharedTable,
} from "./partner-tables.mjs";

const student = (name, team) => ({
  email: `${name.toLowerCase()}@example.edu`,
  name,
  team,
});

test("the roster's teams keep file order and count a team of one", () => {
  const { noGroup, table, teams } = rosterTeams([
    student("Ada", "Beta"),
    student("Bo", "Alpha"),
    student("Cy", "Beta"),
    student("Di", ""),
  ]);
  assert.equal(teams, 2);
  assert.equal(noGroup, 1);
  assert.deepEqual(table.rows, [
    ["Beta", "2", "Ada; Cy"],
    ["Alpha", "1", "Bo"],
  ]);
});

test("a team's partners share one line", () => {
  const table = partnersTable([
    { Email: "p@example.com", Team: "Beta" },
    { Email: "q@example.com", Team: "Beta" },
    { Email: "p@example.com", Team: "Alpha" },
  ]);
  assert.deepEqual(table.rows, [
    ["Beta", "p@example.com; q@example.com"],
    ["Alpha", "p@example.com"],
  ]);
});

test("the sheet's cautions are tables of their entries", () => {
  assert.deepEqual(
    noPartnerTable([{ reason: "not in the partner sheet", team: "Beta" }]).rows,
    [["Beta", "not in the partner sheet"]]
  );
  assert.deepEqual(
    sharedTable([{ email: "p@example.com", teams: ["Alpha", "Beta"] }]).rows,
    [["p@example.com", "Alpha; Beta"]]
  );
});

test("the Send checklist's order lists every line once, and only those", () => {
  const { checklist, order } = prepareText.send;
  assert.equal(new Set(order).size, order.length);
  assert.deepEqual([...order].sort(), Object.keys(checklist).sort());
  assert.equal(order.at(-1), "close");
});

test("the report says nothing about a problem that did not happen", () => {
  const report = {
    blankTerm: [],
    noResponse: [],
    noTeam: [],
    notInExport: [],
    responded: 3,
    scored: 12,
    unmatchedTeams: [],
  };
  const lines = scoreText.results.lines({ aBound: 93, report });
  assert.equal(lines.length, 1);
  assert.match(lines[0], /12 students scored/);
  assert.match(lines[0], /93 of 100/);
  const more = scoreText.results.lines({
    aBound: 93,
    report: {
      ...report,
      noResponse: ["Beta"],
      unmatchedTeams: [{ responseId: "R_1", team: "" }],
    },
  });
  assert.equal(more.length, 3);
  assert.match(more[2], /\(empty\) \(R_1\)/);
});
