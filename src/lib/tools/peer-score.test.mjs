import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsv, toCsv } from "./csv.mjs";
import { memberLabel } from "./peer-contacts.mjs";
import {
  exportCsv,
  people,
  rosterCsv,
  rubric,
  rubrics,
  stamp,
  teamResponses,
} from "./peer-export.fixture.mjs";
import { parsePeerExport } from "./peer-export.mjs";
import {
  emailIn,
  mapColumns,
  readRating,
  rosterChoiceOf,
} from "./peer-export-columns.mjs";
import {
  commentsCsv,
  fillPeerAssessment,
  gapRows,
  ratingFor,
} from "./peer-outputs.mjs";
import { withAdded } from "./peer-roster.mjs";
import {
  distributionScore,
  peerCriteria,
  round,
  scorePeers,
} from "./peer-score.mjs";
import { parseRoster } from "./roster.mjs";
import { parseRubricExport } from "./rubric-export.mjs";

/** Parses, selects, and scores an export against a roster. */
function run(teams, responses, options = {}) {
  const parsed = parsePeerExport(exportCsv(responses, options), {
    ...options,
    rubrics,
  });
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

/** A ratings grid where everyone gives everyone `value`. */
const all = (n, value) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => value));
/** A split grid where everyone gives everyone 100 / n. */
const even = (n) =>
  Array.from({ length: n }, () => Array.from({ length: n }, () => 100 / n));

// The worked example on the Peer Evaluations page, team of 4: the student's
// three teammates rate them 4, 4, 5, 4 and give them 28 points each.
const owls = people("Owls", 4);
const workedExample = () =>
  teamResponses("Owls", owls, {
    ratings: [
      [3, 3, 3, 3],
      [[4, 4, 5, 4], 3, 3, 3],
      [[4, 4, 5, 4], 3, 3, 3],
      [[4, 4, 5, 4], 3, 3, 3],
    ],
    split: [
      [25, 25, 25, 25],
      [28, 26, 23, 23],
      [28, 24, 25, 23],
      [28, 24, 23, 25],
    ],
  });

test("the published worked example scores 93.1", () => {
  const { results, problems } = run({ Owls: owls }, workedExample());
  const student = resultFor(results, "owls1@example.edu");
  assert.equal(student.status, "scored");
  assert.deepEqual(student.means, [4, 4, 5, 4]);
  assert.deepEqual(student.criterionScores, [87.5, 87.5, 100, 87.5]);
  assert.equal(student.meanShare, 28);
  assert.ok(Math.abs(student.distribution.normalized - 22.4) < 1e-9);
  assert.ok(Math.abs(student.distribution.score - 102.856) < 1e-9);
  assert.equal(round(student.total, 1), 93.1);
  assert.equal(student.raters, 3);
  assert.deepEqual(messages(problems, "error"), []);
  assert.deepEqual(messages(problems, "note"), []);
});

test("the distribution clamps the normalized share to [10, 40]", () => {
  assert.equal(distributionScore(1, 4).clamped, 10);
  assert.ok(Math.abs(distributionScore(1, 4).score - 85) < 1e-9);
  assert.equal(distributionScore(100, 4).clamped, 40);
  assert.ok(Math.abs(distributionScore(100, 4).score - 115) < 1e-9);
  assert.ok(Math.abs(distributionScore(20, 5).score - 100) < 1e-9);
});

test("a values export is refused: labels only", () => {
  assert.throws(
    () =>
      parsePeerExport(exportCsv(workedExample(), { labels: false }), {
        rubrics,
      }),
    /values export/
  );
  assert.equal(
    parsePeerExport(exportCsv(workedExample()), { rubrics }).type,
    "regular"
  );
});

test("a team of ten fills every slot and loop prefix", () => {
  const team = people("Lynx", 10);
  const { results, problems } = run(
    { Lynx: team },
    teamResponses("Lynx", team, { ratings: all(10, 4), split: even(10) })
  );
  assert.deepEqual(messages(problems, "error"), []);
  for (const result of results) {
    assert.equal(result.raters, 9);
    assert.equal(result.distribution.normalized, 20);
    assert.ok(Math.abs(result.total - 90) < 1e-9);
  }
});

test("a team of three: a self share below the floor is rescaled", () => {
  const team = people("Fox", 3);
  const { results, problems } = run(
    { Fox: team },
    teamResponses("Fox", team, {
      ratings: all(3, 4),
      split: [
        [20, 40, 40],
        [30, 40, 30],
        [34, 33, 33],
      ],
    })
  );
  // Fox1 gave themselves 20 of a floor of 33: raised to 33, and the 40s
  // scaled by 67 / 80 to 33.5 each.
  assert.equal(messages(problems, "note").length, 1);
  assert.match(messages(problems, "note")[0], /raised to 33/);
  const fox2 = resultFor(results, "fox2@example.edu");
  assert.equal(fox2.meanShare, (33.5 + 33) / 2);
  const fox3 = resultFor(results, "fox3@example.edu");
  assert.equal(fox3.meanShare, (33.5 + 30) / 2);
  // What Fox1 received is unchanged by their own rescale.
  assert.equal(resultFor(results, "fox1@example.edu").meanShare, (30 + 34) / 2);
});

test("a teammate who never submitted: rated by the others, scores 50", () => {
  const team = people("Elk", 3);
  const { results, problems } = run(
    { Elk: team },
    teamResponses("Elk", team, {
      ratings: all(3, 5),
      skip: [2],
      split: even(3).map(() => [34, 33, 33]),
    })
  );
  const elk3 = resultFor(results, "elk3@example.edu");
  assert.equal(elk3.status, "did not complete");
  assert.equal(elk3.total, 50);
  assert.equal(elk3.raters, 2);
  assert.equal(elk3.gap, null);
  const elk1 = resultFor(results, "elk1@example.edu");
  assert.equal(elk1.status, "scored");
  assert.equal(elk1.raters, 1);
  assert.deepEqual(messages(problems, "error"), []);
});

test("a finished response missing a page: reported, the ratee rated by the rest", () => {
  const team = people("Emu", 3);
  const responses = teamResponses("Emu", team, {
    ratings: all(3, 4),
    split: even(3).map(() => [34, 33, 33]),
  });
  responses[0].pages[3] = {};
  const { results, problems } = run({ Emu: team }, responses);
  assert.ok(
    messages(problems, "error").some((m) =>
      /No scored ratings page for Tester3, Emu/.test(m)
    )
  );
  const emu3 = resultFor(results, "emu3@example.edu");
  assert.equal(emu3.raters, 1);
  assert.equal(emu3.status, "scored");
  // The split still counts: Emu1's 33 for Emu3 is in the mean.
  assert.equal(emu3.meanShare, 33);
});

test("a team of two: flags for the split range and corroboration", () => {
  const team = people("Yak", 2);
  const { results, problems } = run(
    { Yak: team },
    teamResponses("Yak", team, {
      ratings: [
        [5, 5],
        [2, 4],
      ],
      split: [
        [60, 40],
        [50, 50],
      ],
    })
  );
  const reviews = messages(problems, "review");
  assert.ok(
    reviews.some((m) => /gave themselves 60, outside 45 to 55/.test(m))
  );
  assert.ok(reviews.some((m) => /average 2, below 3/.test(m)));
  assert.ok(reviews.some((m) => /rated each other 5 and 2/.test(m)));
  // SelfFloor is 0 on a team of two: nothing is rescaled.
  assert.deepEqual(messages(problems, "note"), []);
  // The flags never change a score.
  const yak1 = resultFor(results, "yak1@example.edu");
  assert.deepEqual(yak1.criterionScores, [62.5, 62.5, 62.5, 62.5]);
  assert.equal(yak1.meanShare, 50);
});

test("a team of two with a non-completer: one scores 50, one has no score", () => {
  const team = people("Ibis", 2);
  const { results, problems } = run(
    { Ibis: team },
    teamResponses("Ibis", team, {
      ratings: all(2, 4),
      skip: [1],
      split: even(2),
    })
  );
  assert.equal(resultFor(results, "ibis1@example.edu").status, "no ratings");
  assert.equal(resultFor(results, "ibis1@example.edu").total, null);
  assert.equal(resultFor(results, "ibis2@example.edu").total, 50);
  assert.ok(
    messages(problems, "error").some((m) => /No teammate's ratings/.test(m))
  );
});

test("a ratee answer that disagrees with the loop position is not scored", () => {
  const team = people("Cod", 3);
  const responses = teamResponses("Cod", team, {
    ratings: all(3, 4),
    split: even(3).map(() => [34, 33, 33]),
  });
  // Cod1's page 2 claims to rate Cod3; position 2 is Cod2.
  responses[0].pages[2].ratee = memberLabel(team[2]);
  // Cod2's page 3 holds unresolved piped text.
  responses[1].pages[3].ratee = "${e://Field/Team%20Member%202}";
  const { results, problems } = run({ Cod: team }, responses);
  const errors = messages(problems, "error");
  assert.ok(errors.some((m) => /loop page 2|Loop page 2/.test(m)));
  assert.ok(
    errors.some((m) => /Loop page 3: the ratee answer "\$\{e:/.test(m))
  );
  assert.ok(
    errors.some((m) => /No scored ratings page for Tester2, Cod/.test(m))
  );
  // Cod2 lost Cod1's ratings, so only Cod3 rated them.
  assert.equal(resultFor(results, "cod2@example.edu").raters, 1);
});

test("an export without the Ratee column scores by position, with a warning", () => {
  const { parsed, results } = run({ Owls: owls }, workedExample(), {
    ratee: false,
  });
  assert.equal(parsed.warnings.length, 1);
  assert.equal(round(resultFor(results, "owls1@example.edu").total, 1), 93.1);
});

test("a split that does not total 100 is left out", () => {
  const team = people("Ant", 3);
  const responses = teamResponses("Ant", team, {
    ratings: all(3, 4),
    split: [
      [34, 33, 33],
      [34, 33, 30],
      [34, 33, 33],
    ],
  });
  const { results, problems } = run({ Ant: team }, responses);
  assert.ok(messages(problems, "error").some((m) => /totals 97/.test(m)));
  assert.equal(resultFor(results, "ant1@example.edu").meanShare, 34);
});

test("self-versus-peer gaps, largest first, never change a score", () => {
  const team = people("Owl", 3);
  const { results } = run(
    { Owl: team },
    teamResponses("Owl", team, {
      ratings: [
        [4, 4, 4],
        [5, 5, 5],
        [3, 3, 3],
      ],
      split: [
        [40, 30, 30],
        [34, 33, 33],
        [34, 33, 33],
      ],
    })
  );
  const rows = gapRows(results);
  assert.deepEqual(
    rows.map((row) => [row.name, row.ratings]),
    [
      ["Tester2, Owl", 1.5],
      ["Tester1, Owl", 0],
      ["Tester3, Owl", -1.5],
    ]
  );
  // Owl1 gave themselves 40 and received 34: (40 - 34) * 3 / 5.
  assert.ok(Math.abs(rows[1].share - 3.6) < 1e-9);
});

test("the latest finished response per student counts", () => {
  const base = { members: [], pages: {}, split: { 1: 100 }, team: "Owls" };
  const response = (email, finished, minute, status) => ({
    ...base,
    email,
    finished,
    recordedDate: stamp(minute),
    status,
  });
  const csv = exportCsv([
    response("a@example.edu", true, 9),
    response("a@example.edu", true, 5),
    response("a@example.edu", false, 1),
    response("b@example.edu", false, 2),
    response("b@example.edu", false, 3),
    response("c@example.edu", true, 4, "Survey Preview"),
  ]);
  const parsed = parsePeerExport(csv, { rubrics });
  assert.deepEqual(
    parsed.responses.map((r) => [r.email, r.recordedDate]),
    [["a@example.edu", stamp(9)]]
  );
  assert.equal(parsed.dropped.superseded, 1);
  assert.equal(parsed.dropped.preview, 1);
  assert.deepEqual(
    parsed.stopped.map((r) => [r.email, r.recordedDate]),
    [["b@example.edu", stamp(3)]]
  );
  const withPreviews = parsePeerExport(csv, { includePreviews: true, rubrics });
  assert.equal(withPreviews.responses.length, 2);
});

test("the survey type is detected from the columns", () => {
  const type = (tags) => mapColumns(tags.map((tag) => ({ tag }))).type;
  assert.equal(type(["1_Rating_1", "Split_x1", "RecipientEmail"]), "regular");
  // CATME is told by its dimensions' tags, not by a missing matrix.
  assert.equal(
    type(["1_Ratee", "1_Contributing", "1_OnTrack", "1_Comment"]),
    "catme"
  );
  assert.equal(type(["1_Ratee", "1_Comment"]), "unknown");
  assert.equal(type(["S1_Rating_1", "Split_x1"]), "slots");
  assert.equal(type(["Q1", "Q2"]), "unknown");
  // A matrix with no split is the regular survey with a header error.
  const map = mapColumns(
    ["RecipientEmail", "RecordedDate", "Team", "1_Rating_1"].map((tag) => ({
      tag,
    }))
  );
  assert.equal(map.type, "regular");
  assert.match(map.problems[0], /no Split column/);
});

test("cell readers: rating labels, emails in either form", () => {
  assert.equal(readRating("4: Good solid effort; took initiative"), 4);
  // A rubric description carries its own colon after the number's.
  assert.equal(readRating("5: Outstanding: a super asset to the team."), 5);
  // The leading number is the contract: bare anchor text is not read.
  assert.ok(Number.isNaN(readRating("OK, but nothing special.")));
  assert.equal(readRating(""), null);
  assert.ok(Number.isNaN(readRating("great")));
  assert.equal(emailIn("Ada Lovelace (Ada@Example.edu)"), "ada@example.edu");
  assert.equal(emailIn("ada@example.edu"), "ada@example.edu");
  assert.equal(emailIn("${e://Field/RecipientEmail}"), "");
});

test("the loop prefix names a roster choice, or an iteration when switched", () => {
  // Slots 1 and 3 filled, slot 2 empty.
  assert.equal(rosterChoiceOf(3, [1, 3]), 3);
  assert.equal(rosterChoiceOf(1, [1, 3], "iteration"), 1);
  assert.equal(rosterChoiceOf(2, [1, 3], "iteration"), 2);
  assert.equal(rosterChoiceOf(3, [1, 3], "iteration"), 4);
});

test("a RecordedDate a spreadsheet rewrote stops the run", () => {
  const responses = workedExample();
  responses[0].recordedDate = "1/1/99 10:00";
  assert.throws(
    () => parsePeerExport(exportCsv(responses), { rubrics }),
    /RecordedDate "1\/1\/99 10:00".*Export the responses again/
  );
});

test("the self floor comes from the roster; a differing survey value warns", () => {
  const team = people("Gnu", 3);
  const responses = teamResponses("Gnu", team, {
    ratings: all(3, 4),
    split: [
      [30, 35, 35],
      [34, 33, 33],
      [34, 33, 33],
    ],
  });
  responses[0].selfFloor = 20;
  const { problems } = run({ Gnu: team }, responses);
  assert.ok(
    messages(problems, "warning").some((m) =>
      /showed SelfFloor 20; a team of 3 has 33/.test(m)
    )
  );
  // 30 is below the computed 33, so it is raised; the survey said 20.
  assert.ok(messages(problems, "note").some((m) => /raised to 33/.test(m)));
});

test("a header whose ImportId disagrees with its tag is refused", () => {
  const map = mapColumns([
    { importId: "recipientEmail", tag: "RecipientEmail" },
    { importId: "3_QID5_1", tag: "2_Rating_1" },
    { importId: "QID9_x1", tag: "Split_x1" },
  ]);
  assert.equal(map.problems.length, 1);
  assert.match(map.problems[0], /loop prefix or row disagrees/);
});

/** A rubric-assessment export for the given students, criteria named as in `names`. */
function assessmentCsv(students, names) {
  const header = [
    "Student Id",
    "Student Name",
    ...names.flatMap((name) => [
      `${name} - Rating`,
      `${name} - Points`,
      `${name} - Comments`,
    ]),
  ];
  return toCsv([
    header,
    ...students.map((p) => [
      p.id,
      `${p.last}, ${p.first}`,
      ...names.flatMap(() => ["", "", ""]),
    ]),
  ]);
}

const plainNames = rubric.criteria.map((c) => c.title);
const taggedNames = rubric.criteria.map((c) =>
  c.tags.length > 0 ? `${c.title} [${c.tags.join(", ")}]` : c.title
);

test("ratings: the highest at or below the points, the nearest band outside", () => {
  const [quantity, , , , distribution] = rubric.criteria;
  assert.equal(ratingFor(quantity, 20), "Average of 5");
  assert.equal(ratingFor(quantity, 18.75), "Average of 4");
  assert.equal(ratingFor(quantity, 10), "Average of 1");
  assert.equal(ratingFor(distribution, 23), "Equal share or more");
  assert.equal(ratingFor(distribution, 20), "Equal share or more");
  assert.equal(ratingFor(distribution, 18.5), "Less than an equal share");
  assert.equal(ratingFor(distribution, 10), "Less than an equal share");
});

/** Fills a rubric export for `students`, criteria named as in `names`. */
function fill(results, students, names) {
  return fillPeerAssessment({
    instrument: "regular",
    results,
    rubric,
    rubricExport: parseRubricExport(assessmentCsv(students, names)),
  });
}

test("criteria match by name, with or without outcome tags", () => {
  const { results } = run({ Owls: owls }, workedExample());
  for (const names of [plainNames, taggedNames]) {
    const [header, row] = parseCsv(fill(results, owls, names).csv);
    assert.equal(header[2], `${names[0]} - Rating`);
    assert.equal(row[2], "Average of 4");
  }
  assert.throws(
    () => fill(results, owls, ["Quantity", "Effort"]),
    /Missing: Quality.*Not in the rubric: Effort/s
  );
});

test("a student from another section is scored and written to a CSV of their own", () => {
  // Owls 4 is enrolled in another section: not in this course's roster or
  // rubric export, added by hand. Their ratings count toward their
  // teammates, and their own row goes to the other-section CSV.
  const [visitor] = owls.slice(3);
  const rostered = parseRoster(rosterCsv({ Owls: owls.slice(0, 3) }));
  const { students } = withAdded(rostered, [
    {
      email: visitor.email,
      name: `${visitor.last}, ${visitor.first}`,
      team: "Owls",
    },
  ]);
  const parsed = parsePeerExport(exportCsv(workedExample()), { rubrics });
  const scored = scorePeers({
    instrument: parsed.instrument,
    responses: parsed.responses,
    rubric,
    students,
  });
  assert.equal(round(resultFor(scored.results, owls[0].email).total, 1), 93.1);
  assert.equal(resultFor(scored.results, visitor.email).status, "scored");
  const filled = fill(scored.results, owls.slice(0, 3), plainNames);
  assert.deepEqual(filled.problems, []);
  const [header, ...rows] = parseCsv(filled.csv);
  assert.equal(rows.length, 3);
  const [otherHeader, other, ...more] = parseCsv(filled.otherSections);
  assert.deepEqual(otherHeader, header);
  assert.equal(more.length, 0);
  assert.equal(other[0], "");
  assert.equal(other[1], `${visitor.last}, ${visitor.first}`);
  assert.match(other[2], /^Average of [1-5]$/);
  assert.equal(
    fill(scored.results.slice(0, 3), owls.slice(0, 3), plainNames)
      .otherSections,
    null
  );
});

test("a reordered rubric scores an export generated from the old order the same", () => {
  const { results } = run({ Owls: owls }, workedExample());
  // Every criterion moved: the distribution first, the rated ones reversed.
  // Matrix rows are matched to criteria by their question text, and rubric
  // columns by name, so nothing is read by position.
  const reordered = { ...rubric, criteria: [...rubric.criteria].reverse() };
  const peer = peerCriteria(reordered, "regular");
  assert.equal(peer.distribution.title, "Point distribution");
  assert.equal(peer.rated[0].title, "Technical value");
  const parsed = parsePeerExport(exportCsv(workedExample()), {
    rubrics: { ...rubrics, regular: reordered },
  });
  assert.deepEqual(parsed.problems, []);
  const rescored = scorePeers({
    instrument: parsed.instrument,
    responses: parsed.responses,
    rubric: reordered,
    students: parseRoster(rosterCsv({ Owls: owls })),
  }).results;
  const owls1 = resultFor(rescored, "owls1@example.edu");
  // Technical value, Attitude, Quality, Quantity: 4, 5, 4, 4.
  assert.deepEqual(owls1.means, [4, 5, 4, 4]);
  assert.equal(round(owls1.total, 1), 93.1);
  const byName = (csv) => {
    const [header, row] = parseCsv(csv);
    return Object.fromEntries(header.map((name, i) => [name, row[i]]));
  };
  const shuffled = fillPeerAssessment({
    instrument: "regular",
    results: rescored,
    rubric: reordered,
    rubricExport: parseRubricExport(assessmentCsv(owls, plainNames)),
  });
  const plain = fill(results, owls, plainNames);
  assert.deepEqual(byName(shuffled.csv), byName(plain.csv));
  assert.equal(byName(plain.csv)["Attitude as a team player - Points"], "20");
  assert.throws(
    () =>
      peerCriteria(
        { ...rubric, criteria: rubric.criteria.slice(0, 4) },
        "regular"
      ),
    /expects 1, the point distribution/
  );
  assert.throws(() => peerCriteria(rubric), /Unknown peer instrument/);
});

test("a matrix row naming no rated criterion, or two rows naming one, stops the run", () => {
  const csv = exportCsv(workedExample());
  const quality = "How about the quality of the member's work?";
  const quantity = "Did the member do an appropriate quantity of work?";
  const none = parsePeerExport(csv.replaceAll(quality, "An invented row"), {
    rubrics,
  });
  assert.ok(none.problems.some((m) => /names no rated criterion/.test(m)));
  assert.ok(
    none.problems.some((m) =>
      /no column for the rubric criterion "Quality"/.test(m)
    )
  );
  assert.deepEqual(none.responses, []);
  const twice = parsePeerExport(csv.replaceAll(quality, quantity), {
    rubrics,
  });
  assert.ok(
    twice.problems.some((m) =>
      /Two matrix rows name the rubric criterion "Quantity"/.test(m)
    )
  );
  // A rubric that rates fewer criteria than the matrix has rows.
  const fewer = {
    ...rubric,
    criteria: rubric.criteria.filter((c) => c.title !== "Quality"),
  };
  const extra = parsePeerExport(csv, {
    rubrics: { ...rubrics, regular: fewer },
  });
  assert.ok(
    extra.problems.some((m) =>
      /Matrix column N_Rating_2 .* names no rated criterion/.test(m)
    )
  );
});

test("the rubric assessment is filled from the scores", () => {
  const ibis = people("Ibis", 2, 10);
  const teams = { Ibis: ibis, Owls: owls };
  const { results } = run(teams, [
    ...workedExample(),
    ...teamResponses("Ibis", ibis, {
      ratings: all(2, 4),
      skip: [1],
      split: even(2),
    }),
  ]);
  const { csv, problems } = fill(results, [...owls, ...ibis], taggedNames);
  const [header, ...rows] = parseCsv(csv);
  assert.equal(header[2], `${taggedNames[0]} - Rating`);
  const row = (id) => rows.find((cells) => cells[0] === id);
  // Owls1, the worked example: 87.5, 87.5, 100, 87.5, 102.856 as points.
  assert.deepEqual(row("1").slice(2), [
    "Average of 4",
    "17.5",
    "",
    "Average of 4",
    "17.5",
    "",
    "Average of 5",
    "20",
    "",
    "Average of 4",
    "17.5",
    "",
    "Equal share or more",
    "20.57",
    "",
  ]);
  // Ibis2 did not complete: 10 points each, the note on the first criterion.
  assert.deepEqual(row("11").slice(2, 6), [
    "Average of 1",
    "10",
    "Survey not completed: scores 50.",
    "Average of 1",
  ]);
  assert.equal(row("11")[14], "Less than an equal share");
  // Ibis1 has no teammate's answers: left as exported, and named.
  assert.deepEqual(
    row("10").slice(2),
    Array.from({ length: 15 }, () => "")
  );
  assert.ok(problems.some((p) => /Tester1, Ibis: no score/.test(p)));
});

test("what students see, the filled rubric, never holds a comment; the instructor's file does", () => {
  const responses = workedExample();
  responses[1].pages[2].comment = "Invented private remark";
  responses[1].open = { Overall: "Invented overall remark" };
  const { comments, results } = run({ Owls: owls }, responses);
  assert.doesNotMatch(fill(results, owls, plainNames).csv, /Invented/);
  const instructor = commentsCsv(comments);
  assert.match(instructor, /Invented private remark/);
  assert.match(instructor, /Invented overall remark/);
});
