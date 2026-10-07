// CATME scoring (#6, #441): the spring end-of-term survey, the five
// dimensions and no split, read from an export shaped as Qualtrics writes
// it for the survey the generator builds (peer-export.fixture.mjs).

import assert from "node:assert/strict";
import { test } from "node:test";
import { toCsv } from "./csv.mjs";
import {
  catmeRubric,
  exportCsv,
  people,
  rosterCsv,
  rubrics,
  teamResponses,
} from "./peer-export.fixture.mjs";
import { parsePeerExport } from "./peer-export.mjs";
import {
  detailsCsv,
  feedbackCsv,
  fillPeerAssessment,
  gapRows,
} from "./peer-outputs.mjs";
import { peerCriteria, round, STATUS, scorePeers } from "./peer-score.mjs";
import { parseRoster } from "./roster.mjs";
import { parseRubricExport } from "./rubric-export.mjs";

const CATME = { variant: "catme" };

/** Parses and scores a CATME export against a roster. */
function run(teams, responses) {
  const parsed = parsePeerExport(exportCsv(responses, CATME), { rubrics });
  assert.deepEqual(parsed.problems, []);
  return {
    parsed,
    ...scorePeers({
      instrument: parsed.instrument,
      responses: parsed.responses,
      rubric: parsed.rubric,
      students: parseRoster(rosterCsv(teams)),
    }),
  };
}

const resultFor = (results, email) =>
  results.find((result) => result.student.email === email);
const messages = (problems, level) =>
  problems.filter((p) => p.level === level).map((p) => p.message);
const all = (n, value) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => value));

// A worked example, team of 4. Kea1's three teammates rate them, in rubric
// order (Contributing, Interacting, Keeping on track, Expecting quality,
// Skills):
//   Kea2: 5 4 3 5 2
//   Kea3: 4 4 4 5 3
//   Kea4: 4 4 5 5 4
// Means: 13/3, 4, 4, 5, 3. On 50 to 100 (1 = 50, each step 12.5):
//   50 + (10/3)(12.5) = 91.667, 87.5, 87.5, 100, 75.
// Score: (91.667 + 87.5 + 87.5 + 100 + 75) / 5 = 441.667 / 5 = 88.333.
// Kea1 rates themselves 5 on every dimension; the self-ratings are left out.
const kea = people("Kea", 4);
const workedExample = () =>
  teamResponses("Kea", kea, {
    ratings: [
      [5, 3, 3, 3],
      [[5, 4, 3, 5, 2], 3, 3, 3],
      [[4, 4, 4, 5, 3], 3, 3, 3],
      [[4, 4, 5, 5, 4], 3, 3, 3],
    ],
  });

test("the export of the generated CATME survey is detected and carries no split", () => {
  const csv = exportCsv(workedExample(), CATME);
  const [tags] = csv.split("\r\n");
  for (const tag of [
    "3_Contributing",
    "3_Interacting",
    "3_OnTrack",
    "3_Quality",
    "3_Skills",
    "3_Ratee",
    "3_Comment",
  ]) {
    assert.ok(tags.split(",").includes(tag), tag);
  }
  assert.doesNotMatch(tags, /Split|Rating/);
  const parsed = parsePeerExport(csv, { rubrics });
  assert.equal(parsed.type, "catme");
  assert.equal(parsed.rubric, catmeRubric);
  assert.equal(parsed.instrument, "catme");
  assert.deepEqual(parsed.warnings, []);
});

test("the CATME worked example scores 88.33, self-ratings excluded", () => {
  const { results, problems } = run({ Kea: kea }, workedExample());
  const kea1 = resultFor(results, "kea1@example.edu");
  assert.equal(kea1.status, STATUS.scored);
  assert.deepEqual(
    kea1.means.map((m) => round(m, 4)),
    [4.3333, 4, 4, 5, 3]
  );
  assert.deepEqual(
    kea1.criterionScores.map((s) => round(s, 3)),
    [91.667, 87.5, 87.5, 100, 75]
  );
  assert.equal(round(kea1.total, 3), 88.333);
  assert.equal(kea1.distribution, null);
  assert.equal(kea1.raters, 3);
  // Self average 5 minus the mean received (13/3 + 4 + 4 + 5 + 3) / 5.
  assert.equal(round(kea1.gap.ratings, 4), round(5 - 61 / 15, 4));
  assert.equal(kea1.gap.share, null);
  assert.deepEqual(messages(problems, "error"), []);
  // No split, so no split checks: nothing rescaled, no split error.
  assert.deepEqual(messages(problems, "note"), []);
});

test("the CATME rubric assessment: five criteria, by name", () => {
  const { results } = run({ Kea: kea }, workedExample());
  const names = catmeRubric.criteria.map((c) =>
    c.tags.length > 0 ? `${c.title} [${c.tags.join(", ")}]` : c.title
  );
  const header = [
    "Student Id",
    "Student Name",
    ...names.flatMap((n) => [
      `${n} - Rating`,
      `${n} - Points`,
      `${n} - Comments`,
    ]),
  ];
  const { csv } = fillPeerAssessment({
    instrument: "catme",
    results,
    rubric: catmeRubric,
    rubricExport: parseRubricExport(
      toCsv([
        header,
        ...kea.map((p) => [p.id, p.last, ...names.flatMap(() => ["", "", ""])]),
      ])
    ),
  });
  const row = csv.split("\r\n")[1].split(",");
  // 91.667, 87.5, 87.5, 100, 75 as a fifth: the highest band at or below.
  assert.deepEqual(row.slice(2), [
    "Average of 4",
    "18.33",
    "",
    "Average of 4",
    "17.5",
    "",
    "Average of 4",
    "17.5",
    "",
    "Average of 5",
    "20",
    "",
    "Average of 3",
    "15",
    "",
  ]);
});

test("a CATME dimension column the rubric does not rate stops the run", () => {
  const fewer = {
    ...catmeRubric,
    criteria: catmeRubric.criteria.filter(
      (c) => c.title !== "Expecting quality"
    ),
  };
  const parsed = parsePeerExport(exportCsv(workedExample(), CATME), {
    rubrics: { ...rubrics, catme: fewer },
  });
  assert.ok(
    parsed.problems.some((m) =>
      /Column N_Quality is a CATME dimension the rubric does not rate/.test(m)
    )
  );
  assert.deepEqual(parsed.responses, []);
});

test("a CATME team of ten fills every loop prefix", () => {
  const team = people("Lynx", 10);
  const { results, problems } = run(
    { Lynx: team },
    teamResponses("Lynx", team, { ratings: all(10, 4) })
  );
  assert.deepEqual(messages(problems, "error"), []);
  for (const result of results) {
    assert.equal(result.raters, 9);
    assert.equal(result.total, 87.5);
  }
});

test("a CATME team of two: low average and divergence flags over five dimensions", () => {
  const team = people("Yak", 2);
  const { results, problems } = run(
    { Yak: team },
    teamResponses("Yak", team, {
      ratings: [
        [5, 5],
        [2, 4],
      ],
    })
  );
  const reviews = messages(problems, "review");
  assert.ok(reviews.some((m) => /average 2, below 3/.test(m)));
  assert.ok(reviews.some((m) => /rated each other 5 and 2/.test(m)));
  // No split on CATME: no 45 to 55 review.
  assert.ok(!reviews.some((m) => /gave themselves/.test(m)));
  assert.equal(resultFor(results, "yak1@example.edu").total, 62.5);
});

test("a CATME non-completer scores 50, 10 points on each dimension", () => {
  const team = people("Elk", 3);
  const { results } = run(
    { Elk: team },
    teamResponses("Elk", team, { ratings: all(3, 5), skip: [2] })
  );
  const elk3 = resultFor(results, "elk3@example.edu");
  assert.equal(elk3.status, STATUS.didNotComplete);
  assert.equal(elk3.total, 50);
  assert.equal(resultFor(results, "elk1@example.edu").raters, 1);
  const header = [
    "Student Id",
    "Student Name",
    ...catmeRubric.criteria.flatMap(({ title }) => [
      `${title} - Rating`,
      `${title} - Points`,
      `${title} - Comments`,
    ]),
  ];
  const { csv } = fillPeerAssessment({
    instrument: "catme",
    results,
    rubric: catmeRubric,
    rubricExport: parseRubricExport(
      toCsv([
        header,
        [
          elk3.student.canvasUserId,
          "Elk",
          ...Array.from({ length: 15 }, () => ""),
        ],
      ])
    ),
  });
  const cells = csv.split("\r\n")[1].split(",");
  assert.deepEqual(
    [2, 5, 8, 11, 14].map((i) => [cells[i], cells[i + 1]]),
    Array.from({ length: 5 }, () => ["Average of 1", "10"])
  );
  assert.equal(cells[4], "Survey not completed: scores 50.");
});

test("a CATME response missing a ratee's page: reported, the ratee rated by the rest", () => {
  const team = people("Emu", 3);
  const responses = teamResponses("Emu", team, { ratings: all(3, 4) });
  responses[0].pages[3] = {};
  const { results, problems } = run({ Emu: team }, responses);
  assert.ok(
    messages(problems, "error").some((m) =>
      /No scored ratings page for Tester3, Emu/.test(m)
    )
  );
  const emu3 = resultFor(results, "emu3@example.edu");
  assert.equal(emu3.raters, 1);
  assert.equal(emu3.total, 87.5);
});

test("CATME downloads: no split columns, no comments in the feedback", () => {
  const responses = workedExample();
  responses[1].pages[2].comment = "Invented private remark";
  const { results } = run({ Kea: kea }, responses);
  const peer = peerCriteria(catmeRubric, "catme");
  const feedback = feedbackCsv(results, peer);
  assert.doesNotMatch(feedback, /Invented|share/);
  assert.match(feedback, /Keeping the team on track: mean rating/);
  assert.doesNotMatch(detailsCsv(results, peer), /share|Multiplier/);
  assert.ok(gapRows(results).every((row) => row.share === null));
});
