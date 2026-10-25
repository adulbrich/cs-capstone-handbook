import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { distributionEmail, variants } from "../../data/peer-evaluation.mjs";
import { parseRubricCsv } from "../rubric-csv.mjs";
import { pageRules } from "./partner-facets.mjs";
import { buildPartnerSurvey } from "./partner-survey-qsf.mjs";
import { buildContacts } from "./peer-contacts.mjs";
import { people, rubrics } from "./peer-export.fixture.mjs";
import { buildPeerSurvey, MODES } from "./peer-survey-qsf.mjs";
import { logicHolds, respondentValues, surveyPages } from "./survey-pages.mjs";
import { finalSurvey, TERMS } from "./term-label.mjs";

const NOW = new Date(0);

/** Contact rows for invented teams of the given sizes. */
function rowsFor(sizes) {
  const students = Object.entries(sizes).flatMap(([team, size]) =>
    people(team, size).map((p) => ({
      ...p,
      canvasUserId: p.id,
      name: `${p.last}, ${p.first}`,
      team,
    }))
  );
  return buildContacts(students).rows;
}

const rows = rowsFor({ Pair: 2, Quad: 4 });
const quad = respondentValues(rows.find((r) => r.Team === "Quad"));
const pair = respondentValues(rows.find((r) => r.Team === "Pair"));

const survey = (variant, mode = "loop") =>
  buildPeerSurvey({
    mode,
    now: NOW,
    rubric: rubrics[variants[variant].instrument],
    seed: 3,
    variant,
  });

const kinds = (page) => page.questions.map((q) => q.kind);

test("a team of four sees intro, a rating page per member, then the split", () => {
  const pages = surveyPages(survey("midterm"), quad);
  assert.equal(pages.length, 1 + 4 + 1);
  const [intro, self, ...rest] = pages;
  assert.match(intro.questions[0].html, /<b>Quad<\/b>/);
  assert.deepEqual(
    intro.questions[1].choices.map((c) => c.html),
    [
      "Yourself",
      ...[2, 3, 4].map((n) => `Quad Tester${n} (quad${n}@example.edu)`),
    ]
  );
  assert.deepEqual(kinds(self), ["matrix", "essay"]);
  assert.match(self.questions[0].html, /You are rating: <b>Yourself<\/b>/);
  assert.equal(self.questions[0].rows.length, 4);
  assert.equal(self.questions[0].columns.length, 5);
  assert.match(rest[0].questions[0].html, /Quad Tester2/);
  const closing = rest.at(-1);
  // Teams of three or more see the floor, not the pair's range.
  assert.deepEqual(kinds(closing), [
    "text",
    "split",
    "essay",
    "essay",
    "essay",
  ]);
  assert.match(closing.questions[0].html, /at least <b>25<\/b>/);
  assert.equal(closing.questions[1].choices.length, 4);
  assert.equal(closing.questions[1].total, 100);
  assert.equal(closing.questions.at(-1).html, variants.midterm.question);
});

test("a team of two sees the even-split range instead of the floor", () => {
  const closing = surveyPages(survey("final"), pair).at(-1);
  assert.match(closing.questions[0].html, /45 to 55/);
  assert.equal(closing.questions[1].choices.length, 2);
  assert.equal(closing.questions.at(-1).html, variants.final.question);
});

test("both modes show a respondent the same pages", () => {
  for (const variant of Object.keys(variants)) {
    const strip = (pages) =>
      pages.map((page) => page.questions.map(({ html, kind }) => [kind, html]));
    const [loop, slots] = MODES.map((mode) =>
      surveyPages(survey(variant, mode), quad)
    );
    assert.equal(loop.length, slots.length, variant);
    assert.deepEqual(strip(loop), strip(slots), variant);
  }
});

test("CATME rates five dimensions per member and has no split", () => {
  const pages = surveyPages(survey("catme"), quad);
  assert.equal(pages.length, 1 + 4 + 1);
  assert.deepEqual(kinds(pages[1]), [
    "single",
    "single",
    "single",
    "single",
    "single",
    "essay",
  ]);
  // Best first, as the survey lists them.
  assert.match(pages[1].questions[0].choices[0].html, /^5: /);
  assert.ok(!pages.at(-1).questions.some((q) => q.kind === "split"));
});

test("a contact with no team still sees the survey, rating only themself", () => {
  const values = Object.fromEntries(
    Object.entries(quad).map(([key, value]) =>
      key === "Team" || key.startsWith("Team Member") ? [key, ""] : [key, value]
    )
  );
  const pages = surveyPages(survey("midterm"), values);
  // Intro, the self-rating, and the split.
  assert.equal(pages.length, 1 + 1 + 1);
  assert.deepEqual(
    pages[0].questions[1].choices.map((c) => c.html),
    ["Yourself"]
  );
});

test("piped values are escaped", () => {
  const row = respondentValues({ ...rows[0], Team: "<b>x</b>" });
  const [intro] = surveyPages(survey("midterm"), row);
  assert.match(intro.questions[0].html, /&lt;b&gt;x&lt;\/b&gt;/);
});

test("logic other than on embedded fields stops the preview", () => {
  assert.throws(
    () =>
      logicHolds(
        {
          0: { 0: { LogicType: "Question" }, Type: "If" },
          Type: "BooleanExpression",
        },
        {}
      ),
    /embedded fields only/
  );
});

test("the distribution email pipes the team and the two links, none nested", () => {
  const { body, subject } = distributionEmail;
  assert.ok(subject.includes("${e://Field/Team}"));
  assert.ok(body.includes("${e://Field/Team}"));
  assert.ok(body.includes("${l://SurveyLink?d=Take the survey}"));
  assert.ok(body.includes("${e://Field/CloseDate}"));
  assert.doesNotMatch(body, /\[close/);
  assert.ok(body.includes("${l://OptOutLink?d=Unsubscribe}"));
  // No piped text nested inside a link's display text.
  assert.doesNotMatch(body, /\$\{l:\/\/[^}]*\$\{/);
  // Every field the email pipes is a contact list column.
  for (const [, name] of `${subject}\n${body}`.matchAll(
    /\$\{e:\/\/Field\/([^}]*)\}/g
  )) {
    assert.ok(Object.hasOwn(rows[0], decodeURIComponent(name)), name);
  }
});

// The partner surveys (#558): page breaks inside one block, comment boxes
// shown in page by the answer, and a ladder's custom-scale text box.

const root = new URL("../../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const partnerRubric = (name) => {
  const file = `canvas/assignments/project-partner-evaluation/partner-${name}-rubric.csv`;
  return parseRubricCsv(read(file), file);
};
const partnerRules = pageRules(
  read("src/content/docs/assignments/project-partner-evaluation.mdx")
);
const partnerSurvey = (variant, rubric) =>
  buildPartnerSurvey({
    now: NOW,
    pageUrl: "https://example.edu/assignments/project-partner-evaluation/",
    rubric,
    rules: partnerRules,
    seed: 3,
    variant,
    weights: { final: 20, pulse: 5 },
  });
const partner = respondentValues({
  Email: "partner@example.com",
  FinalCloseDate: "the final close",
  MidtermCloseDate: "the midterm close",
  Team: "Quad",
});

test("the pulse is one rating page, then the notes page", () => {
  const rubric = partnerRubric("pulse");
  const pages = surveyPages(partnerSurvey("pulse", rubric), partner);
  assert.equal(pages.length, 2);
  const [rating, notes] = pages;
  assert.deepEqual(kinds(rating), [
    "text",
    ...rubric.criteria.flatMap(() => ["single", "essay", "essay"]),
  ]);
  assert.match(rating.questions[0].html, /the midterm close/);
  assert.deepEqual(kinds(notes), ["single", "line", "essay", "essay"]);
});

test("a comment box shown by the answer says which answers show it", () => {
  const rubric = partnerRubric("pulse");
  const [rating, notes] = surveyPages(partnerSurvey("pulse", rubric), partner);
  const [question, keep, comment] = rating.questions.slice(1, 4);
  const labels = question.choices.map((c) => c.html);
  assert.equal(question.when, undefined);
  assert.deepEqual(keep.when, labels.slice(0, 1));
  assert.equal(keep.forced, false);
  assert.deepEqual(comment.when, labels.slice(1));
  assert.equal(comment.forced, true);
  assert.deepEqual(notes.questions[1].when, ["Yes"]);
  assert.deepEqual(notes.questions[2].when, ["Yes"]);
  assert.equal(notes.questions[3].when, undefined);
});

test("an End-of-Term Survey gives each facet a page of its own", () => {
  for (const term of TERMS) {
    const rubric = partnerRubric(`final-${term}`);
    const pages = surveyPages(
      partnerSurvey(finalSurvey(term), rubric),
      partner
    );
    assert.equal(pages.length, rubric.criteria.length + 1, term);
    // The intro shares the first facet's page.
    assert.equal(pages[0].questions[0].kind, "text", term);
    assert.match(pages[0].questions[0].html, /the final close/, term);
    for (const [i, criterion] of rubric.criteria.entries()) {
      const page = pages[i];
      const guide = page.questions.at(i === 0 ? 1 : 0);
      assert.match(guide.html, new RegExp(criterion.title), term);
    }
  }
});

test("a ladder's custom scale shows its text box, and one optional comment", () => {
  const rubric = partnerRubric("final-spring");
  const pages = surveyPages(
    partnerSurvey(finalSurvey("spring"), rubric),
    partner
  );
  const ladders = pages
    .flatMap((shown) => shown.questions)
    .filter((q) => q.kind === "single" && q.choices.some((c) => c.entry));
  assert.ok(ladders.length > 0);
  for (const ladder of ladders) {
    assert.equal(ladder.choices.filter((c) => c.entry).length, 1);
    assert.ok(ladder.choices.at(-1).entry);
  }
  const page = pages.find((p) => p.questions.includes(ladders[0]));
  const after = page.questions.slice(page.questions.indexOf(ladders[0]) + 1);
  assert.deepEqual(kinds({ questions: after }), ["essay"]);
  assert.equal(after[0].when, undefined);
  assert.equal(after[0].forced, false);
});

test("in-page logic on anything but a selected answer stops the preview", () => {
  const pulse = partnerSurvey("pulse", partnerRubric("pulse"));
  const keep = pulse.SurveyElements.find(
    (e) => e.Element === "SQ" && e.Payload.InPageDisplayLogic
  ).Payload;
  keep.InPageDisplayLogic[0][0].Operator = "NotSelected";
  assert.throws(() => surveyPages(pulse, partner), /Selected/);
});
