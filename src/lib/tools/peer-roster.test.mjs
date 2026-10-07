import assert from "node:assert/strict";
import { test } from "node:test";
import { buildContacts } from "./peer-contacts.mjs";
import { people, rosterCsv } from "./peer-export.fixture.mjs";
import {
  addedStudent,
  addedStudentProblems,
  LEFT_OUT,
  leftOutTable,
  rosterModel,
  rosterSummary,
  teamsTable,
  withAdded,
} from "./peer-roster.mjs";
import { parseRoster } from "./roster.mjs";

const roster = parseRoster(
  rosterCsv({
    Big: people("Big", 11, 100),
    Pair: people("Pair", 2, 1),
    Solo: people("Solo", 1, 10),
    Trio: people("Trio", 3, 20),
  })
);

const ada = {
  email: " Ada@Example.edu ",
  name: "Lovelace, Ada",
  team: "Trio",
};

test("an added student has the roster's shape, no Canvas ID, and the marker", () => {
  assert.deepEqual(addedStudent(ada), {
    canvasUserId: "",
    email: "ada@example.edu",
    first: "Ada",
    last: "Lovelace",
    name: "Lovelace, Ada",
    otherSection: true,
    team: "Trio",
  });
});

test("the form refuses a blank field, a bad email, and an email already listed", () => {
  assert.deepEqual(addedStudentProblems(ada, roster), []);
  assert.equal(
    addedStudentProblems({ email: "x", name: " ", team: "" }, roster).length,
    3
  );
  assert.deepEqual(
    addedStudentProblems({ ...ada, email: "TRIO1@example.edu" }, roster),
    ["trio1@example.edu is already on the roster."]
  );
});

test("withAdded appends added students; the roster wins on a clash", () => {
  const { skipped, students } = withAdded(roster, [
    ada,
    { ...ada, email: "pair1@example.edu", name: "Copy, Pair" },
  ]);
  assert.equal(students.length, roster.length + 1);
  assert.equal(students.at(-1).email, "ada@example.edu");
  assert.deepEqual(
    skipped.map((s) => s.email),
    ["pair1@example.edu"]
  );
});

test("an added student joins their team's contact rows and teammates", () => {
  const small = roster.filter((s) => s.team !== "Big");
  const { students } = withAdded(small, [ada]);
  const { rows } = buildContacts(students);
  const mine = rows.find((row) => row.Email === "ada@example.edu");
  assert.equal(mine.Team, "Trio");
  assert.equal(mine.TeamSize, "4");
  const teammate = rows.find((row) => row.Email === "trio1@example.edu");
  assert.equal(teammate.TeamSize, "4");
  assert.ok(Object.values(teammate).includes("Ada Lovelace (ada@example.edu)"));
});

test("the summary lists teams and who is left out, and why", () => {
  const { students } = withAdded(roster, [
    ada,
    { email: "nogroup@example.edu", name: "Hopper, Grace", team: "Nowhere" },
  ]);
  const withNoGroup = [
    ...students,
    { ...students[0], email: "free@example.edu", name: "Free", team: "" },
  ];
  const summary = rosterSummary(withNoGroup);
  assert.deepEqual(
    summary.teams.map((t) => [t.team, t.size, t.otherSection]),
    [
      ["Big", 11, 0],
      ["Pair", 2, 0],
      ["Solo", 1, 0],
      ["Trio", 4, 1],
      ["Nowhere", 1, 1],
    ]
  );
  assert.deepEqual(summary.oversized, ["Big"]);
  const reasons = Object.groupBy(summary.leftOut, (s) => s.reason);
  assert.equal(reasons[LEFT_OUT.oversized].length, 11);
  assert.deepEqual(
    reasons[LEFT_OUT.alone].map((s) => s.email),
    ["solo1@example.edu", "nogroup@example.edu"]
  );
  assert.equal(reasons[LEFT_OUT.alone][1].otherSection, true);
  assert.deepEqual(
    reasons[LEFT_OUT.noGroup].map((s) => s.email),
    ["free@example.edu"]
  );
});

test("the roster model reads the saved file and adds the added students", () => {
  assert.deepEqual(rosterModel(null), {
    error: "",
    skipped: [],
    students: null,
    summary: null,
  });
  const text = rosterCsv({ Trio: people("Trio", 3) });
  const model = rosterModel({ name: "r.csv", text }, [ada]);
  assert.equal(model.error, "");
  assert.equal(model.students.length, 4);
  assert.equal(model.summary.teams[0].otherSection, 1);
  const broken = rosterModel({ name: "x.csv", text: "a,b\n1,2\n" });
  assert.match(broken.error, /missing the columns/);
  assert.equal(broken.students, null);
});

test("the previews mark added students and say why a team gets no survey", () => {
  const { students } = withAdded(roster, [ada]);
  const summary = rosterSummary(students);
  const teams = teamsTable(summary);
  assert.deepEqual(teams.header, ["Team", "Size", "Members", "Note"]);
  const trio = teams.rows.find((row) => row[0] === "Trio");
  assert.match(trio[2], /Lovelace, Ada \(another section\)$/);
  assert.equal(trio[3], "1 from another section");
  assert.equal(
    teams.rows.find((row) => row[0] === "Big")[3],
    "Over 10: split the team"
  );
  assert.equal(
    teams.rows.find((row) => row[0] === "Solo")[3],
    "Alone: no survey"
  );
  const left = leftOutTable(summary);
  assert.equal(left.rows.length, 12);
  assert.deepEqual(left.rows.at(-1).slice(2), ["Solo", LEFT_OUT.alone]);
});
