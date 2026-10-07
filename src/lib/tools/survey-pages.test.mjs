import assert from "node:assert/strict";
import { test } from "node:test";
import { distributionEmail, variants } from "../../data/peer-evaluation.mjs";
import { buildContacts, memberLabel } from "./peer-contacts.mjs";
import { people, rubrics } from "./peer-export.fixture.mjs";
import { buildPeerSurvey, MODES } from "./peer-survey-qsf.mjs";
import { escapeHtml, pipedSegments, pipeHtml } from "./piped-text.mjs";
import { logicHolds, respondentValues, surveyPages } from "./survey-pages.mjs";

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

test("a contact with no team sees only the guard page", () => {
  const pages = surveyPages(survey("midterm"), { ...quad, Team: "" });
  assert.equal(pages.length, 1);
  assert.match(pages[0].questions[0].html, /personal link/);
});

test("piped values are escaped", () => {
  const row = respondentValues({ ...rows[0], Team: "<b>x</b>" });
  const [intro] = surveyPages(survey("midterm"), row);
  assert.match(intro.questions[0].html, /&lt;b&gt;x&lt;\/b&gt;/);
  assert.equal(escapeHtml(`a&"'`), "a&amp;&quot;&#39;");
  assert.equal(
    pipeHtml("${lm://Field/2} ${e://Field/Team%20Member%201}", {
      loop: { 2: "<i>ok</i>" },
      values: {
        "Team Member 1": memberLabel({ email: "a@b.c", first: "A", last: "B" }),
      },
    }),
    "<i>ok</i> A B (a@b.c)"
  );
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

test("the email preview shows one student's values and the link text", () => {
  const segments = pipedSegments(distributionEmail.body, { Team: "Quad" });
  const links = segments.filter((s) => s.kind === "link").map((s) => s.text);
  assert.deepEqual(links, ["Take the survey", "Unsubscribe"]);
  assert.ok(segments.some((s) => s.kind === "field" && s.text === "Quad"));
  assert.ok(!segments.some((s) => s.text.includes("${")));
  assert.deepEqual(pipedSegments("Hi ${e://Field/Missing}"), [
    { kind: "text", text: "Hi " },
    { kind: "field", text: "[Missing]" },
  ]);
});
