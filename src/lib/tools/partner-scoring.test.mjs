import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { scoreText } from "../../data/partner-tools.mjs";
import { parseRubricCsv } from "../rubric-csv.mjs";
import { parseCsv, toCsv } from "./csv.mjs";
import {
  aLowerBound,
  detectSurvey,
  editOf,
  neutralRating,
  noResponseScore,
  pointsFit,
  scorePartnerSurvey,
  teamComment,
  withEdit,
} from "./partner-scoring.mjs";
import { percentOf } from "./points.mjs";
import { parseQualtricsExport } from "./qualtrics-export.mjs";
import { parseRoster } from "./roster.mjs";
import { bandFor } from "./rubric-bands.mjs";
import { parseRubricExport, rubricExportCsv } from "./rubric-export.mjs";

const root = new URL("../../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const rubricPath = (name) =>
  `canvas/assignments/project-partner-evaluation/partner-${name}-rubric.csv`;
const rubrics = Object.fromEntries(
  [
    ["pulse", "pulse"],
    ["fall", "final-fall"],
    ["winter", "final-winter"],
    ["spring", "final-spring"],
  ].map(([key, file]) => [
    key,
    parseRubricCsv(read(rubricPath(file)), rubricPath(file)),
  ])
);
const A = aLowerBound(read("src/content/docs/learning-objectives/grading.mdx"));

const criterion = (rubric, title) =>
  rubrics[rubric].criteria.find((c) => c.title === title);

// The pulse export's three header rows, as Qualtrics writes them, trimmed to
// the columns the scorer reads plus a few it must ignore. Each statement is
// a question tagged by its criterion, with its two comment boxes after it.
const STATEMENTS = [
  [
    "Responsiveness",
    "Responsiveness: The team answers my messages within one working day, with an answer or a date.",
  ],
  [
    "Professionalism",
    "Professionalism: The team arrives at our meetings with a written agenda or status, and every student speaks.",
  ],
  [
    "Delivery",
    "Delivery quality: What the team has shown me so far, from written requirements to running software, matches what we agreed.",
  ],
  [
    "Reflection",
    "Reflection: The team asks for my feedback and acts on it, or tells me why not.",
  ],
];
const TAGS = STATEMENTS.map(([tag]) => tag);
const PULSE_COLUMNS = [
  ["StartDate", "Start Date", "startDate"],
  ["Status", "Response Type", "status"],
  ["Finished", "Finished", "finished"],
  ["RecordedDate", "Recorded Date", "recordedDate"],
  ["ResponseId", "Response ID", "_recordId"],
  ["RecipientEmail", "Recipient Email", "recipientEmail"],
  ...STATEMENTS.flatMap(([tag, text], i) => [
    [tag, text, `QID${3 * i + 2}`],
    [
      `${tag} Keep`,
      "Anything the team should keep doing?",
      `QID${3 * i + 3}_TEXT`,
    ],
    [
      `${tag} Comment`,
      "What would make this Strongly agree?",
      `QID${3 * i + 4}_TEXT`,
    ],
  ]),
  [
    "Q2",
    "Do you have any specific concerns with one or more students on your team?",
    "QID15",
  ],
  [
    "Q2 Names",
    "Please list the names of the students you wish to comment on.",
    "QID16_TEXT",
  ],
  [
    "Q2 Comments",
    "Explain your concern for each student listed above.",
    "QID17_TEXT",
  ],
  [
    "Q3",
    "What else would you like to share with the course instructors?",
    "QID18_TEXT",
  ],
  ["SC0", "Score", "SC_x"],
  ["Team", "Team", "Team"],
];

let responseCount = 0;

/** One pulse response: four answers, then overrides by export tag. */
function response(team, answers, extra = {}) {
  responseCount += 1;
  const cells = {
    Finished: "True",
    ...Object.fromEntries(TAGS.map((tag, i) => [tag, answers[i]])),
    Q2: "No",
    RecipientEmail: "partner@example.com",
    RecordedDate: "recorded",
    ResponseId: `R_${responseCount}`,
    SC0: "85.0",
    StartDate: "started",
    Status: "IP Address",
    Team: team,
    ...extra,
  };
  return PULSE_COLUMNS.map(([tag]) => cells[tag] ?? "");
}

const pulseExport = (rows) =>
  toCsv([
    PULSE_COLUMNS.map(([tag]) => tag),
    PULSE_COLUMNS.map(([, text]) => text),
    PULSE_COLUMNS.map(([, , id]) => JSON.stringify({ ImportId: id })),
    ...rows,
  ]);

const ROSTER_HEADER =
  "name,canvas_user_id,user_id,login_id,sections,group_name,canvas_group_id,group_id";
const rosterLine = (name, id, email, team) =>
  `"${name}",${id},0,${email},CS 461 001,${team},0,0`;
const ROSTER = [
  ROSTER_HEADER,
  rosterLine("Lovelace, Ada", "101", "ada@example.edu", "Engines"),
  rosterLine("Babbage, Charles", "102", "charles@example.edu", "Engines"),
  rosterLine("Hopper, Grace", "201", "grace@example.edu", "Compilers"),
  rosterLine("Turing, Alan", "301", "alan@example.edu", ""),
  rosterLine("Noether, Emmy", "401", "emmy@example.edu", "Rings"),
].join("\r\n");

const EXPORT_CRITERIA = [
  "Responsiveness",
  "Professionalism",
  "Delivery quality",
  "Reflection",
];
const exportText = (ids) =>
  toCsv([
    [
      "Student Id",
      "Student Name",
      ...EXPORT_CRITERIA.flatMap((name) => [
        `${name} - Rating`,
        `${name} - Points`,
        `${name} - Comments`,
      ]),
    ],
    ...ids.map(([id, name]) => [
      id,
      name,
      ...EXPORT_CRITERIA.flatMap(() => ["", "", ""]),
    ]),
  ]);
const EXPORT = exportText([
  ["101", "Lovelace, Ada"],
  ["102", "Babbage, Charles"],
  ["201", "Hopper, Grace"],
  ["301", "Turing, Alan"],
  ["999", "Nobody, Known"],
]);

function run(qualtricsText, { choices, exportCsv = EXPORT, overrides } = {}) {
  return scorePartnerSurvey({
    aBound: A,
    choices,
    overrides,
    qualtrics: parseQualtricsExport(qualtricsText),
    roster: parseRoster(ROSTER),
    rubric: rubrics.pulse,
    rubricExport: parseRubricExport(exportCsv),
    survey: "pulse",
  });
}

/** The output row for `id`, as `{ "<column>": value }`. */
function rowFor(result, id, exportCsv = EXPORT) {
  const [header] = parseCsv(exportCsv);
  const row = result.rows.find((cells) => cells[0] === id);
  return Object.fromEntries(header.map((column, i) => [column, row[i]]));
}

const STRONG = new Array(4).fill("Strongly agree");

test("the A lower bound is read from the grading scale", () => {
  assert.equal(A, 93);
  assert.throws(() => aLowerBound("no table here"), /A \| <points>/);
});

test("the metadata rows are skipped; previews and unfinished responses dropped", () => {
  const parsed = parseQualtricsExport(
    pulseExport([
      response("Engines", STRONG),
      response("Engines", STRONG, { Status: "Survey Preview" }),
      response("Compilers", STRONG, { Finished: "False" }),
    ])
  );
  assert.equal(parsed.responses.length, 1);
  assert.equal(parsed.responses[0].Team, "Engines");
  assert.deepEqual(parsed.dropped, { preview: 1, unfinished: 1 });
  assert.equal(parsed.columns[6].tag, "Responsiveness");
  assert.match(parsed.columns[6].text, /^Responsiveness: /);
});

test("a values export is refused, by Finished or by a numeric answer", () => {
  assert.throws(
    () =>
      parseQualtricsExport(
        pulseExport([response("Engines", STRONG, { Finished: "1" })])
      ),
    /values export.*labels export only/
  );
  assert.throws(
    () => run(pulseExport([response("Engines", ["5", "5", "4", "5"])])),
    /"5" to Responsiveness .*values export/
  );
});

test("an export with no finished response is refused", () => {
  assert.throws(
    () =>
      parseQualtricsExport(
        pulseExport([
          response("Engines", STRONG, { Status: "Survey Preview" }),
          response("Compilers", STRONG, { Finished: "False" }),
        ])
      ),
    /no finished response \(1 previews, 1 unfinished/
  );
});

test("a file without the ImportId row is refused", () => {
  const text = toCsv([
    PULSE_COLUMNS.map(([tag]) => tag),
    response("Engines", STRONG),
  ]);
  assert.throws(() => parseQualtricsExport(text), /fewer than three|ImportId/);
});

test("the pulse ratings, pinned: label in, points out", () => {
  const expected = [
    ["Strongly agree", 25],
    ["Somewhat agree", 22.5],
    ["Neither agree nor disagree", 20],
    ["Somewhat disagree", 17.5],
    ["Strongly disagree", 12.5],
  ];
  for (const c of rubrics.pulse.criteria) {
    assert.deepEqual(
      c.ratings.map((r) => [r.name, r.points]),
      expected
    );
  }
});

test("every rating of every pulse criterion scores through the whole run", () => {
  const { criteria } = rubrics.pulse;
  for (const [index, c] of criteria.entries()) {
    for (const rating of c.ratings) {
      const answers = [...STRONG];
      answers[index] = rating.name;
      const result = run(pulseExport([response("Engines", answers)]));
      const row = rowFor(result, "101");
      const column = EXPORT_CRITERIA[index];
      assert.equal(row[`${column} - Rating`], rating.name);
      assert.equal(row[`${column} - Points`], String(rating.points));
    }
  }
});

test("the Delivery tag scores the rubric's Delivery quality", () => {
  const result = run(
    pulseExport([
      response("Engines", [
        "Strongly agree",
        "Strongly agree",
        "Somewhat disagree",
        "Strongly agree",
      ]),
    ])
  );
  assert.equal(rowFor(result, "102")["Delivery quality - Points"], "17.5");
});

test("a criterion's comment reaches every student on the team, as written", () => {
  // Delivery quality's Comments cell already holds text from an earlier import.
  const [header, ...rows] = parseCsv(EXPORT);
  const delivery = header.indexOf("Delivery quality - Comments");
  const exportCsv = toCsv([
    header,
    ...rows.map((row) => row.with(delivery, "Imported earlier.")),
  ]);
  const result = run(
    pulseExport([
      response(
        "Engines",
        [
          "Strongly agree",
          "Somewhat agree",
          "Strongly agree",
          "Strongly agree",
        ],
        {
          "Professionalism Comment":
            "  Bring an agenda; Charles never speaks.  ",
          // Typed before the answer moved off Strongly agree, then hidden.
          "Professionalism Keep": "Great agendas.",
          "Responsiveness Keep": "Same-day answers, every time.",
        }
      ),
    ]),
    { exportCsv }
  );
  for (const id of ["101", "102"]) {
    const row = rowFor(result, id, exportCsv);
    assert.equal(
      row["Responsiveness - Comments"],
      "Same-day answers, every time."
    );
    assert.equal(
      row["Professionalism - Comments"],
      "Bring an agenda; Charles never speaks."
    );
    // A criterion with no comment clears what an earlier import left.
    assert.equal(row["Delivery quality - Comments"], "");
  }
});

test("an export missing a comment column stops the run", () => {
  const text = toCsv(
    [
      PULSE_COLUMNS.map(([tag]) => tag),
      PULSE_COLUMNS.map(([, label]) => label),
      PULSE_COLUMNS.map(([, , id]) => JSON.stringify({ ImportId: id })),
      response("Engines", STRONG),
    ].map((row) =>
      row.filter((_, i) => PULSE_COLUMNS[i][0] !== "Reflection Keep")
    )
  );
  assert.throws(() => run(text), /Reflection's comment \(Reflection Keep\)/);
});

test("a team with no finished response scores the A lower bound", () => {
  const result = run(
    pulseExport([
      response("Engines", STRONG),
      response("Compilers", STRONG, { Finished: "False" }),
    ])
  );
  const row = rowFor(result, "201");
  let total = 0;
  for (const name of EXPORT_CRITERIA) {
    assert.equal(row[`${name} - Rating`], "Somewhat agree");
    assert.equal(row[`${name} - Points`], "23.25");
    assert.match(row[`${name} - Comments`], /did not answer/);
    total += Number(row[`${name} - Points`]);
  }
  assert.equal(total, A);
  assert.deepEqual(result.report.noResponse, ["Compilers", "Rings"]);
});

test("the no-response split totals the A lower bound on every rubric", () => {
  for (const [key, rubric] of Object.entries(rubrics)) {
    const scores = rubric.criteria.map((c) => noResponseScore(c, A));
    const total = scores.reduce((sum, s) => sum + s.points, 0);
    assert.equal(Math.round(total * 1e6) / 1e6, A, key);
    for (const [i, c] of rubric.criteria.entries()) {
      assert.equal(scores[i].rating, bandFor(c, scores[i].points).name);
    }
  }
  // 93% of a fall facet sits between the top and middle anchors, so it is
  // named after the middle one, with its points kept exact.
  assert.deepEqual(noResponseScore(criterion("fall", "Reflection"), A), {
    points: 13.95,
    rating: "Middle anchor (80% of the points)",
  });
  assert.deepEqual(noResponseScore(criterion("pulse", "Responsiveness"), A), {
    points: 23.25,
    rating: "Somewhat agree",
  });
});

test("an answer the rubric does not name stops the run", () => {
  const answers = [...STRONG];
  answers[1] = "Mostly agree";
  assert.throws(
    () => run(pulseExport([response("Engines", answers)])),
    (error) =>
      error.message.includes('"Mostly agree"') &&
      error.message.includes("to Professionalism ") &&
      error.message.includes("Professionalism")
  );
  answers[1] = "";
  assert.throws(
    () => run(pulseExport([response("Engines", answers)])),
    /No answer to Professionalism /
  );
});

test("two finished responses for one team wait for a choice", () => {
  const text = pulseExport([
    response("Engines", STRONG, {
      ResponseId: "R_first",
      "Responsiveness Keep": "Fast replies.",
    }),
    response("Engines", new Array(4).fill("Strongly disagree"), {
      ResponseId: "R_second",
      "Responsiveness Comment": "Reply within a day.",
    }),
  ]);
  const waiting = run(text);
  assert.equal(waiting.pending, true);
  assert.equal(waiting.rows, undefined);
  assert.equal(waiting.duplicates[0].team, "Engines");
  assert.deepEqual(
    waiting.duplicates[0].responses.map((r) => r.ResponseId),
    ["R_first", "R_second"]
  );
  assert.ok(waiting.compare.some((field) => field.tag === "Delivery"));
  assert.ok(waiting.compare.some((field) => field.tag === "Delivery Comment"));
  assert.equal(run(text, { choices: { Engines: "R_gone" } }).pending, true);

  const chosen = run(text, { choices: { Engines: "R_second" } });
  assert.equal(chosen.pending, false);
  assert.equal(rowFor(chosen, "101")["Responsiveness - Points"], "12.5");
  // The comment comes from the chosen response, as the score does.
  assert.equal(
    rowFor(chosen, "101")["Responsiveness - Comments"],
    "Reply within a day."
  );
});

test("the validation report names every gap", () => {
  const result = run(
    pulseExport([
      response("Engines", STRONG),
      response("Looms", STRONG, { ResponseId: "R_looms" }),
    ])
  );
  const { report } = result;
  assert.deepEqual(report.unmatchedTeams, [
    { responseId: "R_looms", team: "Looms" },
  ]);
  assert.deepEqual(
    report.noTeam.map((s) => [s.id, s.reason]),
    [
      ["301", "in no group on the roster"],
      ["999", "not on the roster"],
    ]
  );
  assert.deepEqual(report.notInExport, [
    { name: "Noether, Emmy", team: "Rings" },
  ]);
  assert.equal(report.responded, 1);
  assert.equal(report.scored, 3);
  // A student with no team keeps the export's cells untouched.
  assert.equal(rowFor(result, "999")["Responsiveness - Points"], "");
});

test("responses from no roster group never block the run", () => {
  const result = run(
    pulseExport([
      response("Engines", STRONG),
      response("Looms", ["Mostly agree", "", "", ""], { Q3: "Hello" }),
      response("Looms", STRONG),
    ])
  );
  assert.equal(result.pending, false);
  assert.deepEqual(result.duplicates, []);
  assert.equal(result.report.unmatchedTeams.length, 2);
  assert.deepEqual(result.concerns.rows, [["Looms", "No", "", "", "Hello"]]);
});

test("a roster without canvas_user_id stops the run", () => {
  assert.throws(
    () =>
      scorePartnerSurvey({
        aBound: A,
        qualtrics: parseQualtricsExport(
          pulseExport([response("Engines", STRONG)])
        ),
        roster: [{ canvasUserId: "", team: "Engines" }],
        rubric: rubrics.pulse,
        rubricExport: parseRubricExport(EXPORT),
        survey: "pulse",
      }),
    /canvas_user_id/
  );
});

test("the concerns table holds only responses that raised something", () => {
  const result = run(
    pulseExport([
      response("Engines", STRONG, {
        Q2: "Yes",
        "Q2 Comments": "Missed two meetings.",
        "Q2 Names": "Charles",
      }),
      response("Compilers", STRONG),
      response("Rings", STRONG, { Q2: "", Q3: "Great work, thank you." }),
    ])
  );
  assert.deepEqual(result.concerns.header, [
    "Team",
    "Q2",
    "Q2 Names",
    "Q2 Comments",
    "Q3",
  ]);
  assert.deepEqual(result.concerns.rows, [
    ["Engines", "Yes", "Charles", "Missed two meetings.", ""],
    ["Rings", "", "", "", "Great work, thank you."],
  ]);
});

test("a rubric export for another rubric stops the run", () => {
  const other = toCsv([
    [
      "Student Id",
      "Student Name",
      "Teamwork - Rating",
      "Teamwork - Points",
      "Teamwork - Comments",
    ],
  ]);
  assert.throws(
    () => run(pulseExport([response("Engines", STRONG)]), { exportCsv: other }),
    /Missing: Responsiveness.*Not in the rubric: Teamwork/
  );
});

test("the pulse is detected from its questions; anything else is not", () => {
  const qualtrics = parseQualtricsExport(
    pulseExport([response("Engines", STRONG)])
  );
  assert.deepEqual(detectSurvey(qualtrics, rubrics), {
    kind: "pulse",
    reason: "",
  });
  const { kind, reason } = detectSurvey(
    { ...qualtrics, columns: qualtrics.columns.slice(0, 6) },
    rubrics
  );
  assert.equal(kind, null);
  assert.match(reason, /no Term column/);
});

test("a score between ratings is named after the highest rating at or below it", () => {
  const c = criterion("winter", "Design, Implementation, and Deployment");
  assert.equal(bandFor(c, 40).name, "Top anchor (full points)");
  assert.equal(bandFor(c, 39.99).name, "Middle anchor (80% of the points)");
  assert.equal(bandFor(c, 32).name, "Middle anchor (80% of the points)");
  assert.equal(bandFor(c, 31.99).name, "Low anchor (half the points)");
  assert.equal(bandFor(c, 20).name, "Low anchor (half the points)");
  assert.throws(() => bandFor(c, 19.99), /outside/);
  assert.throws(() => bandFor(c, 41), /outside/);
});

test("regression: 70% of spring Requirements' 5 points is 3.5, not 3", () => {
  const requirements = criterion("spring", "Requirements and Specifications");
  assert.equal(percentOf(requirements.maxPoints, 70), 3.5);
  assert.equal(bandFor(requirements, 3.5).name, "Low anchor (half the points)");
});

// Team scores (#611): the instructor's edits, by team and criterion.

const NEUTRAL = "Neither agree nor disagree";
const { labels } = scoreText.teams;

/** Engines answers Neither on Delivery quality; Compilers and Rings do not answer. */
const NEUTRAL_EXPORT = pulseExport([
  response(
    "Engines",
    ["Strongly agree", "Somewhat agree", NEUTRAL, "Strongly agree"],
    {
      "Delivery Comment": "We have not seen anything yet.",
      "Responsiveness Keep": "Same-day answers.",
    }
  ),
]);

const teamOf = (result, team) => result.teams.find((t) => t.team === team);
const cellOf = (result, team, title) =>
  teamOf(result, team).cells.find((c) => c.criterion === title);

/** One cell's edit, made against the answer `cell` shows. */
const edit = (cell, change = {}) => ({
  against: cell.answered,
  comment: null,
  points: null,
  ...change,
});

const csvOf = (result) => rubricExportCsv(parseCsv(EXPORT)[0], result.rows);

test("the pulse's neutral rating is on every pulse criterion; no end-of-term survey has one", () => {
  assert.equal(neutralRating("pulse", rubrics.pulse), NEUTRAL);
  for (const term of ["fall", "winter", "spring"]) {
    assert.equal(neutralRating(`final-${term}`, rubrics[term]), null);
  }
  const [first, ...rest] = rubrics.pulse.criteria;
  const without = {
    ...rubrics.pulse,
    criteria: [
      { ...first, ratings: first.ratings.filter((r) => r.name !== NEUTRAL) },
      ...rest,
    ],
  };
  assert.throws(
    () => neutralRating("pulse", without),
    /Responsiveness has no "Neither agree nor disagree" rating/
  );
});

test("a neutral pulse answer is flagged for review until it is kept", () => {
  const before = run(NEUTRAL_EXPORT);
  const delivery = cellOf(before, "Engines", "Delivery quality");
  assert.equal(delivery.neutral, true);
  assert.equal(delivery.review, true);
  assert.equal(delivery.reviewed, false);
  const flagged = before.teams.flatMap((t) =>
    t.cells.filter((c) => c.review).map((c) => `${t.team}: ${c.criterion}`)
  );
  // A team with no response scores no answer, so nothing there is neutral.
  assert.deepEqual(flagged, ["Engines: Delivery quality"]);
  assert.deepEqual(before.teamCounts, { edited: 0, notes: 0, review: 1 });

  const kept = run(NEUTRAL_EXPORT, {
    overrides: { Engines: { cells: { "Delivery quality": edit(delivery) } } },
  });
  const keptCell = cellOf(kept, "Engines", "Delivery quality");
  assert.equal(keptCell.review, false);
  assert.equal(keptCell.reviewed, true);
  assert.equal(keptCell.edited, false);
  assert.equal(csvOf(kept), csvOf(before));
});

test("with no edits the rubric assessment is byte-for-byte what it was", () => {
  const plain = csvOf(run(NEUTRAL_EXPORT));
  assert.equal(csvOf(run(NEUTRAL_EXPORT, { overrides: {} })), plain);
  // A blank note is no note.
  assert.equal(
    csvOf(run(NEUTRAL_EXPORT, { overrides: { Engines: { note: "  " } } })),
    plain
  );
  assert.deepEqual(run(NEUTRAL_EXPORT).editedColumns, [[], [], [], [], []]);
});

test("an edit's points are named by the rating at or below them, down to 0", () => {
  const delivery = cellOf(run(NEUTRAL_EXPORT), "Engines", "Delivery quality");
  const scoreWith = (points) =>
    run(NEUTRAL_EXPORT, {
      overrides: {
        Engines: { cells: { "Delivery quality": edit(delivery, { points }) } },
      },
    });
  for (const [points, rating] of [
    [22.5, "Somewhat agree"],
    [21, NEUTRAL],
    [15, "Strongly disagree"],
    [0, "Strongly disagree"],
  ]) {
    const result = scoreWith(points);
    const cell = cellOf(result, "Engines", "Delivery quality");
    assert.deepEqual(cell.final, {
      comment: "We have not seen anything yet.",
      points,
      rating,
    });
    assert.equal(cell.answered.points, 20);
    assert.equal(cell.edited, true);
    assert.equal(cell.review, false);
    for (const id of ["101", "102"]) {
      const row = rowFor(result, id);
      assert.equal(row["Delivery quality - Points"], String(points));
      assert.equal(row["Delivery quality - Rating"], rating);
    }
    // Another team keeps its scores.
    assert.equal(rowFor(result, "201")["Delivery quality - Points"], "23.25");
  }
  const result = scoreWith(15);
  assert.equal(teamOf(result, "Engines").total, 25 + 22.5 + 15 + 25);
  const [header] = parseCsv(EXPORT);
  const pointsAt = header.indexOf("Delivery quality - Points");
  const ratingAt = header.indexOf("Delivery quality - Rating");
  assert.deepEqual(result.editedColumns, [
    [ratingAt, pointsAt],
    [ratingAt, pointsAt],
    [],
    [],
    [],
  ]);
});

test("an edit no input scores is listed, not applied", () => {
  const before = run(NEUTRAL_EXPORT);
  const delivery = cellOf(before, "Engines", "Delivery quality");
  const result = run(NEUTRAL_EXPORT, {
    overrides: {
      Engines: {
        cells: {
          "Delivery quality": edit(delivery, { points: 26 }),
          Teamwork: edit(delivery, { points: 10 }),
        },
      },
      Looms: { cells: {}, note: "A team the roster does not have." },
    },
  });
  assert.deepEqual(result.unapplied, [
    { criterion: "Delivery quality", reason: "points", team: "Engines" },
    { criterion: "Teamwork", reason: "criterion", team: "Engines" },
    { criterion: null, reason: "team", team: "Looms" },
  ]);
  // Every reason has its wording.
  for (const entry of result.unapplied) {
    assert.doesNotMatch(scoreText.teams.unapplied.line(entry), /undefined/);
  }
  assert.equal(csvOf(result), csvOf(before));
  assert.equal(cellOf(result, "Engines", "Delivery quality").review, true);
});

test("the team note goes first, labeled, in every criterion's Comments cell", () => {
  assert.equal(teamComment("", "As written."), "As written.");
  assert.equal(teamComment("", ""), "");
  assert.equal(
    teamComment(" Scored from the comment. ", "As written."),
    `${labels.note}: Scored from the comment.\n\n${labels.comment}: As written.`
  );
  assert.equal(
    teamComment("Scored from the comment.", ""),
    `${labels.note}: Scored from the comment.`
  );

  const before = run(NEUTRAL_EXPORT);
  const delivery = cellOf(before, "Engines", "Delivery quality");
  const note = "Nothing to see by week 6; scored from the comment.";
  const result = run(NEUTRAL_EXPORT, {
    overrides: {
      Engines: {
        cells: { "Delivery quality": edit(delivery, { comment: "" }) },
        note,
      },
    },
  });
  for (const id of ["101", "102"]) {
    const row = rowFor(result, id);
    assert.equal(
      row["Responsiveness - Comments"],
      teamComment(note, "Same-day answers.")
    );
    // An emptied comment leaves the note alone in the cell.
    assert.equal(row["Delivery quality - Comments"], teamComment(note, ""));
    assert.equal(row["Professionalism - Comments"], teamComment(note, ""));
  }
  assert.equal(
    rowFor(result, "201")["Responsiveness - Comments"],
    rowFor(before, "201")["Responsiveness - Comments"]
  );
  assert.equal(teamOf(result, "Engines").note, note);
  const [header] = parseCsv(EXPORT);
  const comments = EXPORT_CRITERIA.map((name) =>
    header.indexOf(`${name} - Comments`)
  );
  assert.deepEqual(result.editedColumns[0].toSorted(), comments.toSorted());

  // An emptied comment with no note clears the cell, as an empty answer does.
  const cleared = run(NEUTRAL_EXPORT, {
    overrides: {
      Engines: {
        cells: {
          Responsiveness: edit(cellOf(before, "Engines", "Responsiveness"), {
            comment: "",
          }),
        },
      },
    },
  });
  assert.equal(rowFor(cleared, "101")["Responsiveness - Comments"], "");
  assert.equal(cellOf(cleared, "Engines", "Responsiveness").edited, true);
});

test("an edit made against another answer applies, flagged again, and shows both", () => {
  const delivery = cellOf(run(NEUTRAL_EXPORT), "Engines", "Delivery quality");
  const compilers = cellOf(run(NEUTRAL_EXPORT), "Compilers", "Reflection");
  const overrides = {
    Compilers: { cells: { Reflection: edit(compilers, { points: 25 }) } },
    Engines: { cells: { "Delivery quality": edit(delivery, { points: 15 }) } },
  };
  // The export again, with Delivery answered Strongly agree and a late
  // response from Compilers.
  const result = run(
    pulseExport([
      response("Engines", [
        "Strongly agree",
        "Somewhat agree",
        "Strongly agree",
        "Strongly agree",
      ]),
      response("Compilers", STRONG),
    ]),
    { overrides }
  );
  const stale = cellOf(result, "Engines", "Delivery quality");
  assert.equal(stale.stale, true);
  assert.equal(stale.review, true);
  assert.equal(stale.reviewed, false);
  assert.deepEqual(stale.against, delivery.answered);
  assert.equal(stale.answered.points, 25);
  assert.equal(stale.final.points, 15);
  assert.equal(rowFor(result, "101")["Delivery quality - Points"], "15");

  const late = cellOf(result, "Compilers", "Reflection");
  assert.equal(late.stale, true);
  assert.equal(late.review, true);
  assert.equal(late.against.points, 23.25);
  assert.equal(late.final.points, 25);
  // Its answer and its edit agree on the points, so nothing is edited.
  assert.equal(late.edited, false);
});

test("the editor saves only what changes; a kept neutral answer is the reviewed mark", () => {
  const before = run(NEUTRAL_EXPORT);
  const neutral = cellOf(before, "Engines", "Delivery quality");
  const plain = cellOf(before, "Engines", "Responsiveness");
  const said = (cell) => cell.answered.comment;

  assert.deepEqual(editOf(neutral, { comment: said(neutral), points: null }), {
    against: neutral.answered,
    comment: null,
    points: null,
  });
  assert.equal(editOf(plain, { comment: said(plain), points: null }), null);
  // Points or a comment equal to the answer's are kept as null.
  assert.equal(editOf(plain, { comment: said(plain), points: 25 }), null);
  assert.deepEqual(editOf(plain, { comment: "", points: 22.5 }), {
    against: plain.answered,
    comment: "",
    points: 22.5,
  });

  const delivery = criterion("pulse", "Delivery quality");
  assert.equal(pointsFit(delivery, 0), true);
  assert.equal(pointsFit(delivery, 25), true);
  assert.equal(pointsFit(delivery, 25.5), false);
  assert.equal(pointsFit(delivery, -1), false);
  assert.equal(pointsFit(delivery, Number.NaN), false);
});

test("an edit is saved under its team and criterion; an empty team is dropped", () => {
  const kept = { against: {}, comment: null, points: null };
  const one = withEdit(
    {},
    { criterion: "Reflection", edit: kept, note: "", team: "Engines" }
  );
  assert.deepEqual(one, { Engines: { cells: { Reflection: kept }, note: "" } });
  const noted = withEdit(one, {
    criterion: "Reflection",
    edit: null,
    note: "A note.",
    team: "Engines",
  });
  assert.deepEqual(noted, { Engines: { cells: {}, note: "A note." } });
  assert.deepEqual(
    withEdit(noted, {
      criterion: "Reflection",
      edit: null,
      note: "",
      team: "Engines",
    }),
    {}
  );
});
