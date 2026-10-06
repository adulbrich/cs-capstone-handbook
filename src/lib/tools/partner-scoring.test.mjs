import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseRubricCsv } from "../rubric-csv.mjs";
import { parseCsv, toCsv } from "./csv.mjs";
import {
  aLowerBound,
  bandFor,
  detectSurvey,
  noResponseScore,
  percentOf,
  scorePartnerSurvey,
} from "./partner-scoring.mjs";
import { parseQualtricsExport } from "./qualtrics-export.mjs";
import { parseRoster } from "./roster.mjs";
import { parseRubricExport } from "./rubric-export.mjs";

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
// the columns the scorer reads plus a few it must ignore.
const PROMPT =
  "Please rate your student team on the following dimensions for the current term.";
const PULSE_COLUMNS = [
  ["StartDate", "Start Date", "startDate"],
  ["Status", "Response Type", "status"],
  ["Finished", "Finished", "finished"],
  ["RecordedDate", "Recorded Date", "recordedDate"],
  ["ResponseId", "Response ID", "_recordId"],
  ["RecipientEmail", "Recipient Email", "recipientEmail"],
  [
    "Q1_1",
    `${PROMPT} - Responsiveness: The team answers my messages within one working day, with an answer or a date.`,
    "QID1_1",
  ],
  [
    "Q1_2",
    `${PROMPT} - Professionalism: The team arrives at our meetings with a written agenda or status, and every student speaks.`,
    "QID1_2",
  ],
  [
    "Q1_3",
    `${PROMPT} - Delivery Quality: What the team has shown me so far matches what we agreed and works as demonstrated.`,
    "QID1_3",
  ],
  [
    "Q1_4",
    `${PROMPT} - Reflection: The team acted on the feedback I gave since our last meetings, or told me why not.`,
    "QID1_4",
  ],
  [
    "Q2",
    "Do you have any specific concerns with one or more students on your team?",
    "QID4",
  ],
  [
    "Q2 Names",
    "Please list the names of the students you wish to comment on.",
    "QID5_TEXT",
  ],
  [
    "Q2 Comments",
    "Explain your concern for each student listed above.",
    "QID6_TEXT",
  ],
  [
    "Q3",
    "What else would you like to share with the course instructors?",
    "QID7_TEXT",
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
    Q1_1: answers[0],
    Q1_2: answers[1],
    Q1_3: answers[2],
    Q1_4: answers[3],
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

function run(qualtricsText, { choices, exportCsv = EXPORT } = {}) {
  return scorePartnerSurvey({
    aBound: A,
    choices,
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
  assert.equal(parsed.columns[6].tag, "Q1_1");
  assert.match(parsed.columns[6].text, / - Responsiveness: /);
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
    /"5" to Q1_1.*values export/
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

test("Qualtrics's Delivery Quality maps to the rubric's Delivery quality", () => {
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
      error.message.includes("Q1_2") &&
      error.message.includes("Professionalism")
  );
  answers[1] = "";
  assert.throws(
    () => run(pulseExport([response("Engines", answers)])),
    /No answer to Q1_2/
  );
});

test("two finished responses for one team wait for a choice", () => {
  const text = pulseExport([
    response("Engines", STRONG, { ResponseId: "R_first" }),
    response("Engines", new Array(4).fill("Strongly disagree"), {
      ResponseId: "R_second",
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
  assert.ok(waiting.compare.some((field) => field.tag === "Q1_3"));
  assert.equal(run(text, { choices: { Engines: "R_gone" } }).pending, true);

  const chosen = run(text, { choices: { Engines: "R_second" } });
  assert.equal(chosen.pending, false);
  assert.equal(rowFor(chosen, "101")["Responsiveness - Points"], "12.5");
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
  const { columns } = parseQualtricsExport(
    pulseExport([response("Engines", STRONG)])
  );
  assert.deepEqual(detectSurvey(columns, rubrics, "fall"), {
    guessed: false,
    kind: "pulse",
  });
  const facets = rubrics.fall.criteria.map((c, i) => ({
    tag: `Q${i + 1}`,
    text: `Rate the team. - ${c.title}: ${c.description}`,
  }));
  assert.deepEqual(detectSurvey(facets, rubrics, "winter"), {
    guessed: true,
    kind: "final-winter",
  });
  assert.deepEqual(detectSurvey(columns.slice(0, 6), rubrics, "fall"), {
    guessed: false,
    kind: null,
  });
});

test("end-of-term scoring is refused until its export is known", () => {
  assert.throws(
    () =>
      scorePartnerSurvey({
        aBound: A,
        qualtrics: parseQualtricsExport(
          pulseExport([response("Engines", STRONG)])
        ),
        roster: [],
        rubric: rubrics.fall,
        rubricExport: parseRubricExport(EXPORT),
        survey: "final-fall",
      }),
    /not supported yet/
  );
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
