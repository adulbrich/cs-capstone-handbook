import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseRubricCsv, rubricTotal } from "../rubric-csv.mjs";
import {
  BAND_NAMES,
  bandRow,
  columnShares,
  coverRows,
  FIT_SCALES,
  firstFit,
  liveSheet,
  pageCounts,
  printPages,
  readList,
  sessionMinutes,
  sessionRule,
  sessionTeams,
} from "./defense-sheets.mjs";
import { parseRoster } from "./roster.mjs";

const root = new URL("../../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const HEADER =
  "Rubric Name,Criteria Name,Criteria Description,Criteria Enable Range,Rating Name,Rating Description,Rating Points,Rating Name,Rating Description,Rating Points,Rating Name,Rating Description,Rating Points,Rating Name,Rating Description,Rating Points";
const MEETS =
  "Not every item under Exceeds, and no red flag: 8 points with one item missing, 6 with two, 4 with more.";
const MISSING = "No-show, or no attempt; a reported absence is rescheduled.";

/** A CSV field, quoted, with its quotes doubled. */
const field = (text) => `"${text.replaceAll('"', '""')}"`;

/** An invented criterion row; any band can be swapped out. */
function row({
  doesNotMeet = "Any red flag: (1) Silent: says nothing at all.",
  exceeds,
  meets = MEETS,
  missing = MISSING,
  question = "Asks: what happened?",
  title,
}) {
  return [
    "Invented Defense",
    field(title),
    field(question),
    "true",
    "Exceeds Expectations",
    field(exceeds),
    "10",
    "Meets Expectations",
    field(meets),
    "8",
    "Does Not Meet Expectations",
    field(doesNotMeet),
    "2",
    "Missing",
    field(missing),
    "0",
  ].join(",");
}

const PLANNING = {
  doesNotMeet:
    'Any red flag: (1) No plan: cannot say what the plan was; (2) Contradicted: claims a plan the board (the "roadmap") contradicts.',
  exceeds:
    'All three, none undone by a follow-up question, and no red flag: (1) Names the plan: says what it was (milestones, a board, a "roadmap"), not just "we planned"; (2) Two risks: names two (doing nothing counts); (3) What changed: says what changed and why.',
  title: "Planning [SO5]",
};
const TESTING = {
  exceeds:
    "All two, none undone by a follow-up question, and no red flag: (1) Tests: names the tests; (2) Gaps: names a gap.",
  title: "Testing [SO6]",
};

const rubric = (...rows) =>
  parseRubricCsv([HEADER, ...rows.map(row)].join("\n"), "invented.csv");

test("a list keeps the parentheses and quotes inside an item, labels each item, and drops the closing period", () => {
  const { items, preamble } = readList(PLANNING.exceeds, "Planning");
  assert.equal(
    preamble,
    "All three, none undone by a follow-up question, and no red flag"
  );
  assert.deepEqual(items, [
    {
      label: "Names the plan",
      text: 'says what it was (milestones, a board, a "roadmap"), not just "we planned"',
    },
    { label: "Two risks", text: "names two (doing nothing counts)" },
    { label: "What changed", text: "says what changed and why" },
  ]);
});

test("a one-item list is one item", () => {
  assert.deepEqual(
    readList("Any red flag: (1) Silent: says nothing at all.", "x").items,
    [{ label: "Silent", text: "says nothing at all" }]
  );
});

test("a list the sheet cannot print as items throws, naming where", () => {
  assert.throws(
    () => readList("All three: (1) A: a; (2) B: b.", "Planning, Exceeds"),
    /Planning, Exceeds: the preamble says "All three" but the list has 2 items/
  );
  assert.throws(
    () => readList("Any: (1) A: a; (3) C: c.", "x"),
    /item \(3\) follows item \(1\)/
  );
  assert.throws(
    () => readList("Any: (1) A: a; (2) no label here.", "x"),
    /item \(2\): no "Label: "/
  );
  assert.throws(
    () => readList("Every item, with no list.", "x"),
    /no numbered list/
  );
  assert.throws(
    () => readList("Any: (1) A: a; (2) A: b.", "x"),
    /two items are labeled "A"/
  );
});

test("an All that is not a count, or a count past eight, is no mismatch", () => {
  assert.equal(
    readList("All of these, and more: (1) A: a; (2) B: b.", "x").items.length,
    2
  );
  const nine = Array.from({ length: 9 }, (_, i) => `(${i + 1}) L${i}: t`);
  assert.equal(
    readList(`All nine, none undone: ${nine.join("; ")}.`, "x").items.length,
    9
  );
});

test("the live sheet reads each criterion's question, items, red flags, and the one scoring rule", () => {
  const sheet = liveSheet(rubric(PLANNING, TESTING), "invented.csv");
  assert.equal(sheet.total, 20);
  assert.deepEqual(
    sheet.criteria.map((c) => [
      c.title,
      c.tags,
      c.items.length,
      c.flags.length,
    ]),
    [
      ["Planning", ["SO5"], 3, 2],
      ["Testing", ["SO6"], 2, 1],
    ]
  );
  assert.equal(sheet.criteria[0].question, "Asks: what happened?");
  assert.deepEqual(sheet.rule, {
    doesNotMeet: 2,
    exceeds: 10,
    exceedsCondition: "none undone by a follow-up question, and no red flag",
    flagRule: "Any red flag",
    itemCondition: "none undone by a follow-up question",
    ladder: [8, 6, 4],
    meetsRule: "8 points with one item missing, 6 with two, 4 with more.",
    missing: {
      description: MISSING,
      lead: "No-show, or no attempt",
      points: 0,
    },
  });
  assert.deepEqual(bandRow(sheet.rule), [
    { key: "exceeds", points: [10] },
    { key: "meets", points: [8, 6, 4] },
    { key: "doesNotMeet", points: [2] },
    { key: "missing", points: [0] },
  ]);
});

test("criteria that score differently, or bands the sheet does not print, fail the build", () => {
  assert.throws(
    () =>
      liveSheet(
        rubric(PLANNING, { ...TESTING, missing: "Absent; rescheduled." }),
        "invented.csv"
      ),
    /criterion 2 \(Testing\) scores differently from criterion 1/
  );
  assert.throws(
    () =>
      liveSheet(
        rubric(PLANNING, {
          ...TESTING,
          exceeds: TESTING.exceeds.replace(
            "by a follow-up question",
            "by the record"
          ),
        }),
        "invented.csv"
      ),
    /criterion 2 \(Testing\) scores differently/
  );
  assert.throws(
    () =>
      liveSheet(
        rubric(PLANNING, {
          ...TESTING,
          exceeds: "Every item: (1) Tests: names the tests.",
        }),
        "invented.csv"
      ),
    /the preamble does not read "All <count>, <condition>"/
  );
  assert.throws(
    () =>
      liveSheet(
        rubric(PLANNING, {
          ...TESTING,
          exceeds: TESTING.exceeds.replace(", and no red flag", ""),
        }),
        "invented.csv"
      ),
    /the condition does not end ", and no red flag"/
  );
  assert.throws(
    () =>
      liveSheet(
        rubric({ ...PLANNING, missing: "No-show, or no attempt." }),
        "invented.csv"
      ),
    /Missing: no semicolon/
  );
  assert.throws(
    () => liveSheet(rubric(PLANNING, PLANNING), "invented.csv"),
    /two criteria are titled "Planning"/
  );
  assert.throws(
    () =>
      liveSheet(
        rubric(PLANNING, {
          ...TESTING,
          meets: "Not every item: 6 with one missing, 4 with two.",
        }),
        "invented.csv"
      ),
    /must start at its 8 points/
  );
  const renamed = [HEADER, row(PLANNING)]
    .join("\n")
    .replace("Missing,", "Absent,");
  assert.throws(
    () => liveSheet(parseRubricCsv(renamed, "invented.csv"), "invented.csv"),
    /a band the live sheet does not print, "Absent"/
  );
});

test("the defense rubric prints word for word, under one rule its bands state", () => {
  const path = "canvas/assignments/defense/defense-rubric.csv";
  const parsed = parseRubricCsv(read(path), path);
  const sheet = liveSheet(parsed, path);
  assert.equal(sheet.criteria.length, parsed.criteria.length);
  assert.equal(sheet.total, rubricTotal(parsed.criteria));
  const first = parsed.criteria[0].ratings;
  const firstBand = (name) => first.find((r) => r.name === name).description;
  assert.ok(
    firstBand(BAND_NAMES.exceeds).includes(
      `, ${sheet.rule.exceedsCondition}: (1) `
    )
  );
  assert.ok(
    firstBand(BAND_NAMES.doesNotMeet).startsWith(`${sheet.rule.flagRule}: (1) `)
  );
  assert.ok(firstBand(BAND_NAMES.meets).endsWith(`: ${sheet.rule.meetsRule}`));
  assert.equal(firstBand(BAND_NAMES.missing), sheet.rule.missing.description);
  // Every item is the CSV's own text, so nothing on the sheet is retyped.
  parsed.criteria.forEach((criterion, i) => {
    const band = (name) =>
      criterion.ratings.find((r) => r.name === name).description;
    const { flags, items, question } = sheet.criteria[i];
    assert.equal(question, criterion.description);
    for (const [list, name] of [
      [items, BAND_NAMES.exceeds],
      [flags, BAND_NAMES.doesNotMeet],
    ]) {
      list.forEach(({ label, text }, k) => {
        assert.ok(
          band(name).includes(`(${k + 1}) ${label}: ${text}`),
          `${criterion.title}, ${name}, item ${k + 1}`
        );
      });
    }
  });
});

test("the session length and weeks come from the defense page", () => {
  const rule = sessionRule(read("src/content/docs/assignments/defense.mdx"));
  assert.equal(sessionMinutes(3, rule), 3 * rule.perStudent + rule.setup);
  const page = (sentence) =>
    `Once per term, between week 4 and week 6, your team meets an assessor.\n\n${sentence}`;
  assert.deepEqual(
    sessionRule(
      page(
        "The session is 7 minutes per student plus about twelve minutes for setup and wrap."
      )
    ),
    { perStudent: 7, setup: 12, weeks: ["week 4", "week 6"] }
  );
  assert.throws(
    () => sessionRule(page("The session is short.")),
    /defense\.mdx: no "<n> minutes per student/
  );
  assert.throws(
    () =>
      sessionRule(
        "Ten minutes per student plus about ten minutes for setup and wrap."
      ),
    /defense\.mdx: no "between week <n>/
  );
});

// An invented roster: teams numbered past 9, a student in no group.
const ROSTER = `name,canvas_user_id,user_id,login_id,sections,group_name,canvas_group_id,group_id
"Okafor, Sam",1,1,okafors@example.edu,001,Team 10: Lanterns,1,1
"Lee, Jordan",2,2,leej@example.edu,001,Team 2: Fieldnotes,2,2
"Alvarez, Mateo",3,3,alvarezm@example.edu,001,Team 10: Lanterns,1,1
"Raman, Priya",4,4,ramanp@example.edu,001,,,
"Chen, Ana",5,5,chena@example.edu,001,Team 2: Fieldnotes,2,2
"Alvarez, Lucia",6,6,alvarezl@example.edu,001,Team 10: Lanterns,1,1`;

test("teams sort by number, members by name, and students in no group come last together", () => {
  const teams = sessionTeams(parseRoster(ROSTER));
  assert.deepEqual(
    teams.map((t) => [t.team, t.noTeam, t.members.map((m) => m.email)]),
    [
      ["Team 2: Fieldnotes", false, ["chena@example.edu", "leej@example.edu"]],
      [
        "Team 10: Lanterns",
        false,
        ["alvarezl@example.edu", "alvarezm@example.edu", "okafors@example.edu"],
      ],
      ["", true, ["ramanp@example.edu"]],
    ]
  );
});

test("a cover's table has a row per student and one blank, and no speaking order", () => {
  const [fieldnotes] = sessionTeams(parseRoster(ROSTER));
  const rows = coverRows(fieldnotes);
  assert.deepEqual(rows, [
    { id: "chena@example.edu", name: "Ana Chen" },
    { id: "leej@example.edu", name: "Jordan Lee" },
    { id: "", name: "" },
  ]);
  assert.ok(rows.every((r) => Object.keys(r).join() === "id,name"));
});

test("the teams picked print a cover, a sheet per student, and a blank when asked, and the counts add up", () => {
  const teams = sessionTeams(parseRoster(ROSTER));
  const selected = new Set(["Team 10: Lanterns", ""]);
  const plain = printPages(teams, { selected });
  assert.deepEqual(
    plain.map((p) => [p.kind, p.team.team, p.student?.email ?? null]),
    [
      ["cover", "Team 10: Lanterns", null],
      ["sheet", "Team 10: Lanterns", "alvarezl@example.edu"],
      ["sheet", "Team 10: Lanterns", "alvarezm@example.edu"],
      ["sheet", "Team 10: Lanterns", "okafors@example.edu"],
      ["cover", "", null],
      ["sheet", "", "ramanp@example.edu"],
    ]
  );
  assert.deepEqual(pageCounts(plain), {
    blanks: 0,
    covers: 2,
    pages: 6,
    sheets: 4,
    teams: 2,
  });
  const withBlanks = printPages(teams, { blankSheets: true, selected });
  assert.deepEqual(pageCounts(withBlanks), {
    blanks: 2,
    covers: 2,
    pages: 8,
    sheets: 4,
    teams: 2,
  });
  assert.equal(new Set(withBlanks.map((p) => p.id)).size, withBlanks.length);
  assert.deepEqual(printPages(teams, { selected: new Set() }), []);
});

test("a criterion's columns split the width by their text, the red flags between a fifth and a half", () => {
  // Each item weighs its text plus 20; the red flags' title weighs 20.
  const item = (n) => ({ label: "L", text: "x".repeat(n - 21) });
  assert.deepEqual(
    columnShares({ flags: [item(40)], items: [item(90)] }),
    [0.6, 0.4]
  );
  assert.deepEqual(
    columnShares({ flags: [item(21)], items: [item(400)] }),
    [0.8, 0.2]
  );
  assert.deepEqual(
    columnShares({ flags: [item(300)], items: [item(30)] }),
    [0.5, 0.5]
  );
});

test("a sheet takes the largest scale that fits, or none", () => {
  assert.equal(
    firstFit((s) => s <= 0.975),
    0.97
  );
  assert.equal(
    firstFit((s) => s <= 0.92),
    0.92
  );
  assert.equal(FIT_SCALES.at(-1), 0.85);
  assert.equal(
    firstFit(() => true),
    1
  );
  assert.equal(
    firstFit(() => false),
    null
  );
});
