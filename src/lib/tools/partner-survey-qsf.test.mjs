import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  concernText,
  criterionNotes,
  customScaleText,
  distributionEmails,
  ladderPrompts,
  pulsePrompt,
} from "../../data/partner-evaluation.mjs";
import { parseRubricCsv } from "../rubric-csv.mjs";
import { toCsv } from "./csv.mjs";
import {
  customScaleChoice,
  facetChoices,
  facetTag,
  isLadder,
  pageRules,
} from "./partner-facets.mjs";
import {
  aLowerBound,
  detectSurvey,
  SURVEY_ORDER,
  SURVEYS,
  scorePartnerSurvey,
} from "./partner-scoring.mjs";
import {
  buildPartnerSurvey,
  partnerSurveyQsf,
  pulseScale,
  VARIANTS,
} from "./partner-survey-qsf.mjs";
import { parseQualtricsExport } from "./qualtrics-export.mjs";
import { parseRoster } from "./roster.mjs";
import { bandFor } from "./rubric-bands.mjs";
import { parseRubricExport } from "./rubric-export.mjs";
import { finalSurvey, TERMS } from "./term-label.mjs";

const root = new URL("../../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const rubricFile = (name) =>
  `canvas/assignments/project-partner-evaluation/partner-${name}-rubric.csv`;
const pulseRubric = parseRubricCsv(
  read(rubricFile("pulse")),
  rubricFile("pulse")
);
const fallRubric = parseRubricCsv(
  read(rubricFile("final-fall")),
  rubricFile("final-fall")
);
const A = aLowerBound(read("src/content/docs/learning-objectives/grading.mdx"));

const OPTIONS = {
  label: "CS_461_001_F2000",
  now: new Date(2000, 0, 1, 9, 30, 0),
  pageUrl: "https://example.edu/assignments/project-partner-evaluation/",
  rubric: pulseRubric,
  seed: 7,
  variant: "pulse",
  weights: { final: 20, pulse: 5 },
};

const qsf = buildPartnerSurvey(OPTIONS);
const elements = (type) => qsf.SurveyElements.filter((e) => e.Element === type);
const questions = elements("SQ").map((e) => e.Payload);
const byTag = (tag) => questions.find((q) => q.DataExportTag === tag);
const options = elements("SO")[0].Payload;
const flow = elements("FL")[0].Payload;

test("every pulse rubric criterion has its statement in the CSV", () => {
  for (const criterion of pulseRubric.criteria) {
    assert.notEqual(criterion.description, "", criterion.title);
  }
});

test("the .qsf is JSON and keeps the choices that made the peer survey import", () => {
  const text = partnerSurveyQsf(OPTIONS);
  assert.deepEqual(JSON.parse(text), qsf);
  for (const element of elements("SQ")) {
    assert.equal(
      element.SecondaryAttribute,
      element.Payload.QuestionDescription
    );
    assert.ok(element.SecondaryAttribute.length <= 100);
  }
  const entry = qsf.SurveyEntry;
  for (const key of [
    "SurveyStartDate",
    "SurveyExpirationDate",
    "LastAccessed",
    "LastActivated",
  ]) {
    assert.equal(entry[key], "0000-00-00 00:00:00", key);
  }
  assert.equal(options.SurveyExpiration, "None");
  assert.equal(options.SurveyProtection, "ByInvitation");
  assert.equal(options.PartialData, "+1 month");
  assert.equal(
    entry.SurveyName,
    "CS_461_001_F2000 Project Partner Midterm Pulse"
  );
  assert.equal(elements("QC")[0].SecondaryAttribute, String(questions.length));
});

test("export tags are unique and match the reference survey's", () => {
  const tags = questions.map((q) => q.DataExportTag);
  assert.equal(new Set(tags).size, tags.length);
  for (const tag of ["Start", "Q1", "Q2", "Q2 Names", "Q2 Comments", "Q3"]) {
    assert.ok(tags.includes(tag), tag);
  }
});

test("the matrix rows are the CSV statements and its columns the CSV rating names, lowest first", () => {
  const matrix = byTag("Q1");
  assert.equal(matrix.QuestionType, "Matrix");
  assert.equal(matrix.QuestionText, pulsePrompt);
  assert.equal(matrix.Validation.Settings.ForceResponse, "ON");
  assert.deepEqual(
    matrix.ChoiceOrder.map((id) => matrix.Choices[id].Display),
    pulseRubric.criteria.map((c) => `${c.title}: ${c.description}`)
  );
  for (const criterion of pulseRubric.criteria) {
    assert.deepEqual(
      matrix.AnswerOrder.map((id) => matrix.Answers[id].Display),
      [...criterion.ratings]
        .sort((a, b) => a.points - b.points)
        .map((r) => r.name)
    );
  }
});

test("the concern questions: Q2 Yes or No, its follow-ups shown on Yes, then Q3", () => {
  const flag = byTag("Q2");
  assert.equal(flag.QuestionText, concernText.flag);
  assert.deepEqual(
    flag.ChoiceOrder.map((id) => flag.Choices[id].Display),
    ["Yes", "No"]
  );
  for (const tag of ["Q2 Names", "Q2 Comments"]) {
    // Qualtrics logic is keyed "0", "1", ...: an object, not an array.
    const logic = byTag(tag).DisplayLogic["0"]["0"];
    assert.equal(
      logic.LeftOperand,
      `q://${flag.QuestionID}/SelectableChoice/1`
    );
    assert.equal(logic.Operator, "Selected");
  }
  assert.equal(byTag("Q3").DisplayLogic, undefined);
  for (const tag of ["Q2", "Q2 Names", "Q2 Comments", "Q3"]) {
    assert.equal(byTag(tag).Validation.Settings.ForceResponse, "OFF", tag);
  }
});

test("embedded data is declared first, then the guard, the ratings, and the notes", () => {
  const [embedded, guard, ratings, notes] = flow.Flow;
  assert.deepEqual(
    embedded.EmbeddedData.map((f) => f.Field),
    VARIANTS.pulse.fields
  );
  assert.ok(embedded.EmbeddedData.every((f) => f.Value === undefined));
  assert.equal(guard.BranchLogic[0][0].LeftOperand, "Team");
  assert.equal(guard.Flow.at(-1).Type, "EndSurvey");
  const blocks = elements("BL")[0].Payload;
  const blockOf = (id) => blocks.find((b) => b.ID === id);
  const tagsIn = (id) =>
    blockOf(id).BlockElements.map(
      (e) => questions.find((q) => q.QuestionID === e.QuestionID).DataExportTag
    );
  assert.deepEqual(tagsIn(ratings.ID), ["Start", "Q1"]);
  assert.deepEqual(tagsIn(notes.ID), ["Q2", "Q2 Names", "Q2 Comments", "Q3"]);
  const ids = JSON.stringify(flow).match(/FL_\d+/g);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(flow.Properties.Count, ids.length);
});

test("the intro pipes the team and close date and names the rubric's own words", () => {
  const intro = byTag("Start").QuestionText;
  assert.match(intro, /\$\{e:\/\/Field\/Team\}/);
  assert.match(intro, /\$\{e:\/\/Field\/MidtermCloseDate\}/);
  assert.match(intro, /set 5% of each student's grade/);
  assert.match(intro, /sets 20%/);
  assert.match(intro, /from Strongly disagree to Strongly agree/);
  assert.ok(intro.includes(OPTIONS.pageUrl));
  // The note's rating and criterion come from the CSV.
  assert.match(intro, /answer Neither agree nor disagree on Reflection\./);
});

test("every criterion note names a pulse rubric criterion", () => {
  const titles = pulseRubric.criteria.map((c) => c.title.toLowerCase());
  for (const key of Object.keys(criterionNotes)) {
    assert.ok(titles.includes(key), key);
  }
});

test("every variant's distribution email names the team in its subject and body", () => {
  for (const key of Object.keys(VARIANTS)) {
    const email = distributionEmails[key];
    assert.ok(email, key);
    assert.ok(email.subject.includes("${e://Field/Team}"), key);
    assert.ok(email.body.includes("${e://Field/Team}"), key);
    assert.ok(email.body.includes("${l://SurveyLink?d=Take the survey}"), key);
    // No piped text nested inside a link's display text.
    assert.doesNotMatch(email.body, /\$\{l:\/\/[^}]*\$\{/, key);
    assert.ok(email.body.includes("${l://OptOutLink"), key);
  }
  assert.ok(
    distributionEmails.pulse.body.includes("${e://Field/MidtermCloseDate}")
  );
});

test("a criterion with no statement, or criteria on different scales, stop the build", () => {
  const blank = {
    ...pulseRubric,
    criteria: pulseRubric.criteria.map((c, i) =>
      i === 1 ? { ...c, description: "" } : c
    ),
  };
  assert.throws(() => pulseScale(blank), /no statement.*Professionalism/);
  const renamed = {
    ...pulseRubric,
    criteria: pulseRubric.criteria.map((c, i) =>
      i === 2
        ? {
            ...c,
            ratings: c.ratings.map((r) => ({ ...r, name: `${r.name}!` })),
          }
        : c
    ),
  };
  assert.throws(() => pulseScale(renamed), /share one scale.*Delivery quality/);
  assert.throws(
    () => buildPartnerSurvey({ ...OPTIONS, variant: "nope" }),
    /Unknown variant/
  );
});

// The contract with the scorer (#445): a labels export shaped as Qualtrics
// writes it for the generated survey scores without a change to the scorer.

/** The export's columns for the generated survey: tag, text, ImportId. */
function exportColumns(survey) {
  const columns = [
    ["StartDate", "Start Date", "startDate"],
    ["Status", "Response Type", "status"],
    ["Finished", "Finished", "finished"],
    ["RecordedDate", "Recorded Date", "recordedDate"],
    ["ResponseId", "Response ID", "_recordId"],
    ["RecipientEmail", "Recipient Email", "recipientEmail"],
  ];
  for (const element of survey.SurveyElements) {
    const q = element.Payload;
    if (element.Element !== "SQ" || q.QuestionType === "DB") {
      continue;
    }
    if (q.QuestionType === "Matrix") {
      for (const id of q.ChoiceOrder) {
        columns.push([
          `${q.DataExportTag}_${id}`,
          `${q.QuestionText} - ${q.Choices[id].Display}`,
          `${q.QuestionID}_${id}`,
        ]);
      }
    } else {
      const suffix = q.QuestionType === "TE" ? "_TEXT" : "";
      columns.push([
        q.DataExportTag,
        q.QuestionText,
        `${q.QuestionID}${suffix}`,
      ]);
      // A choice with a text box adds its own column after the question's.
      for (const id of q.ChoiceOrder ?? []) {
        if (q.Choices[id].TextEntry === "true") {
          columns.push([
            `${q.DataExportTag}_${id}_TEXT`,
            `${q.QuestionText} - ${q.Choices[id].Display} - Text`,
            `${q.QuestionID}_${id}_TEXT`,
          ]);
        }
      }
    }
  }
  const fields = survey.SurveyElements.find((e) => e.Element === "FL").Payload
    .Flow[0].EmbeddedData;
  for (const { Field: name } of fields) {
    columns.push([name, name, name]);
  }
  return columns;
}

test("the export's ImportIds match the reference survey's: QID1_1 to QID1_4, then QID4 to QID7", () => {
  const ids = Object.fromEntries(
    exportColumns(qsf).map(([tag, , id]) => [tag, id])
  );
  assert.deepEqual(
    ["Q1_1", "Q1_2", "Q1_3", "Q1_4", "Q2", "Q2 Names", "Q2 Comments", "Q3"].map(
      (tag) => ids[tag]
    ),
    [
      "QID1_1",
      "QID1_2",
      "QID1_3",
      "QID1_4",
      "QID4",
      "QID5_TEXT",
      "QID6_TEXT",
      "QID7_TEXT",
    ]
  );
});

test("a labels export of the generated survey scores with the merged scorer", () => {
  const columns = exportColumns(qsf);
  const answers = [
    "Strongly agree",
    "Somewhat agree",
    "Somewhat disagree",
    "Strongly disagree",
  ];
  const cells = {
    Finished: "True",
    MidtermCloseDate: "the Friday of week 6",
    Q2: "Yes",
    "Q2 Comments": "Missed two meetings.",
    "Q2 Names": "Charles Babbage",
    Q3: "",
    RecipientEmail: "partner@example.com",
    RecordedDate: "recorded",
    ResponseId: "R_1",
    StartDate: "started",
    Status: "Email",
    Team: "Engines",
  };
  for (const [i, answer] of answers.entries()) {
    cells[`Q1_${i + 1}`] = answer;
  }
  const qualtrics = parseQualtricsExport(
    toCsv([
      columns.map(([tag]) => tag),
      columns.map(([, text]) => text),
      columns.map(([, , id]) => JSON.stringify({ ImportId: id })),
      columns.map(([tag]) => cells[tag] ?? ""),
    ])
  );
  assert.deepEqual(
    detectSurvey(qualtrics, { fall: fallRubric, pulse: pulseRubric }),
    { kind: "pulse", reason: "" }
  );

  const roster = parseRoster(
    [
      "name,canvas_user_id,user_id,login_id,sections,group_name,canvas_group_id,group_id",
      '"Lovelace, Ada",101,0,ada@example.edu,CS 461 001,Engines,0,0',
      '"Babbage, Charles",102,0,charles@example.edu,CS 461 001,Engines,0,0',
    ].join("\r\n")
  );
  const names = pulseRubric.criteria.map((c) => c.title);
  const rubricExport = parseRubricExport(
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
      ["101", "Lovelace, Ada", ...names.flatMap(() => ["", "", ""])],
      ["102", "Babbage, Charles", ...names.flatMap(() => ["", "", ""])],
    ])
  );
  const result = scorePartnerSurvey({
    aBound: A,
    qualtrics,
    roster,
    rubric: pulseRubric,
    rubricExport,
    survey: "pulse",
  });
  const expected = pulseRubric.criteria.flatMap((criterion, i) => {
    const rating = criterion.ratings.find((r) => r.name === answers[i]);
    return [rating.name, String(rating.points), ""];
  });
  for (const row of result.rows) {
    assert.deepEqual(row.slice(2), expected);
  }
  assert.deepEqual(result.concerns.rows, [
    ["Engines", "Yes", "Charles Babbage", "Missed two meetings.", ""],
  ]);
  assert.deepEqual(result.report.noResponse, []);
});

// The End-of-Term Survey of each term (#446).

const PAGE = read(
  "src/content/docs/assignments/project-partner-evaluation.mdx"
);
const rules = pageRules(PAGE);
const finalRubrics = Object.fromEntries(
  TERMS.map((term) => [
    term,
    parseRubricCsv(
      read(rubricFile(`final-${term}`)),
      rubricFile(`final-${term}`)
    ),
  ])
);
const finalOptions = (term) => ({
  ...OPTIONS,
  rubric: finalRubrics[term],
  rules,
  variant: finalSurvey(term),
});
const finals = Object.fromEntries(
  TERMS.map((term) => [term, buildPartnerSurvey(finalOptions(term))])
);
const questionsOf = (survey) =>
  survey.SurveyElements.filter((e) => e.Element === "SQ").map((e) => e.Payload);
const tagged = (survey, tag) =>
  questionsOf(survey).find((q) => q.DataExportTag === tag);
const choicesOf = (criterion) => facetChoices(criterion, rules.between);
const customOf = (criterion) =>
  customScaleChoice(criterion, choicesOf(criterion));

test("each end-of-term survey keeps the import-proven settings and names itself", () => {
  for (const term of TERMS) {
    const survey = finals[term];
    assert.deepEqual(JSON.parse(partnerSurveyQsf(finalOptions(term))), survey);
    for (const element of survey.SurveyElements.filter(
      (e) => e.Element === "SQ"
    )) {
      assert.equal(
        element.SecondaryAttribute,
        element.Payload.QuestionDescription
      );
      assert.ok(element.SecondaryAttribute.length <= 100);
    }
    const so = survey.SurveyElements.find((e) => e.Element === "SO").Payload;
    assert.equal(so.SurveyExpiration, "None");
    assert.equal(so.SurveyProtection, "ByInvitation");
    assert.equal(so.PartialData, "+1 month");
    assert.equal(survey.SurveyEntry.SurveyStartDate, "0000-00-00 00:00:00");
    assert.equal(
      survey.SurveyEntry.SurveyName,
      "CS_461_001_F2000 Project Partner End-of-Term Survey"
    );
  }
});

test("each end-of-term survey asks one forced question per facet, tagged by facet, then the shared concern questions", () => {
  for (const term of TERMS) {
    const rubric = finalRubrics[term];
    const tags = questionsOf(finals[term]).map((q) => q.DataExportTag);
    assert.equal(new Set(tags).size, tags.length, term);
    assert.deepEqual(tags, [
      "Start",
      ...rubric.criteria.flatMap((c) => [`${facetTag(c)} Guide`, facetTag(c)]),
      "Guard",
      "Q2",
      "Q2 Names",
      "Q2 Comments",
      "Q3",
    ]);
    for (const criterion of rubric.criteria) {
      const q = tagged(finals[term], facetTag(criterion));
      assert.equal(q.QuestionType, "MC");
      assert.equal(q.Selector, "SAVR");
      assert.equal(q.Validation.Settings.ForceResponse, "ON");
      const custom = customOf(criterion);
      const expected = [
        ...choicesOf(criterion).map((c) => c.label),
        ...(custom ? [customScaleText(custom)] : []),
      ];
      assert.deepEqual(
        q.ChoiceOrder.map((id) => q.Choices[id].Display),
        expected,
        `${term} ${criterion.title}`
      );
      // Recodes pinned to the choice IDs, highest choice first.
      assert.deepEqual(
        q.RecodeValues,
        Object.fromEntries(expected.map((_, j) => [j + 1, String(j + 1)]))
      );
      const boxes = q.ChoiceOrder.filter(
        (id) => q.Choices[id].TextEntry === "true"
      );
      assert.deepEqual(boxes, custom ? [custom.id] : []);
    }
    // The concern questions are the pulse's, word for word.
    for (const tag of ["Q2", "Q2 Names", "Q2 Comments", "Q3"]) {
      assert.equal(
        tagged(finals[term], tag).QuestionText,
        byTag(tag).QuestionText,
        tag
      );
    }
  }
});

test("a facet's question is its CSV statement, except a ladder, which asks the partner in the second person", () => {
  for (const term of TERMS) {
    for (const criterion of finalRubrics[term].criteria) {
      const tag = facetTag(criterion);
      const text = tagged(finals[term], tag).QuestionText;
      assert.equal(
        text,
        `${criterion.title}: ${isLadder(criterion) ? ladderPrompts[tag] : criterion.description}`
      );
      assert.doesNotMatch(text, /the partner scores/);
    }
  }
  for (const tag of Object.keys(ladderPrompts)) {
    assert.ok(
      TERMS.some((term) =>
        finalRubrics[term].criteria.some(
          (c) => isLadder(c) && facetTag(c) === tag
        )
      ),
      `${tag} names a ladder facet`
    );
  }
});

test("the custom-scale entry must be a number from the lowest to the highest rung's share", () => {
  const criterion = finalRubrics.spring.criteria.find(isLadder);
  const q = tagged(finals.spring, facetTag(criterion));
  const { id, max, min } = customOf(criterion);
  assert.equal(
    q.Choices[id].Display,
    `We agreed a custom scale in the Definition of Shipped. Enter the score as a percent of the points, ${min} to ${max}:`
  );
  const settings = q.Validation.Settings;
  assert.equal(settings.Type, "CustomValidation");
  assert.equal(settings.ForceResponse, "ON");
  const logic = settings.CustomValidation.Logic;
  assert.equal(logic[0][0].Operator, "NotSelected");
  assert.equal(
    logic[0][0].LeftOperand,
    `q://${q.QuestionID}/SelectableChoice/${id}`
  );
  assert.equal(logic[1].Type, "Or");
  const entry = `q://${q.QuestionID}/ChoiceTextEntryValue/${id}`;
  assert.deepEqual(
    [logic[1][0], logic[1][1]].map((e) => [
      e.LeftOperand,
      e.Operator,
      e.RightOperand,
    ]),
    [
      [entry, "GreaterThanOrEqual", String(min)],
      [entry, "LessThanOrEqual", String(max)],
    ]
  );
  assert.equal(logic[1][1].Conjuction, "And");
  for (const term of ["fall", "winter"]) {
    for (const anchored of finalRubrics[term].criteria) {
      const { Type } = tagged(finals[term], facetTag(anchored)).Validation
        .Settings;
      assert.equal(Type, "None");
    }
  }
});

test("each facet is a page: its guide above its question, the intro on the first", () => {
  for (const term of TERMS) {
    const survey = finals[term];
    const flowPayload = survey.SurveyElements.find(
      (e) => e.Element === "FL"
    ).Payload;
    const ratingBlock = survey.SurveyElements.find(
      (e) => e.Element === "BL"
    ).Payload.find((b) => b.ID === flowPayload.Flow[2].ID);
    const pages = [[]];
    for (const element of ratingBlock.BlockElements) {
      if (element.Type === "Page Break") {
        pages.push([]);
      } else {
        pages
          .at(-1)
          .push(
            questionsOf(survey).find((q) => q.QuestionID === element.QuestionID)
              .DataExportTag
          );
      }
    }
    assert.deepEqual(
      pages,
      finalRubrics[term].criteria.map((c, i) => [
        ...(i === 0 ? ["Start"] : []),
        `${facetTag(c)} Guide`,
        facetTag(c),
      ])
    );
  }
});

test("the text above each facet holds the page's What it looks like list and the CSV's anchor descriptions", () => {
  for (const term of TERMS) {
    for (const criterion of finalRubrics[term].criteria) {
      const guide = tagged(
        finals[term],
        `${facetTag(criterion)} Guide`
      ).QuestionText;
      for (const bullet of rules.guidance[criterion.title]) {
        assert.ok(guide.includes(`<li>${bullet}</li>`), bullet);
      }
      for (const rating of criterion.ratings) {
        assert.ok(guide.includes(`<b>${rating.name}</b>`), rating.name);
        assert.ok(guide.includes(rating.description), rating.name);
      }
      assert.match(guide, isLadder(criterion) ? /The rungs/ : /The anchors/);
    }
  }
});

test("the end-of-term flow sets Term to its term and declares the contact list's fields empty", () => {
  for (const term of TERMS) {
    const survey = finals[term];
    const flowPayload = survey.SurveyElements.find(
      (e) => e.Element === "FL"
    ).Payload;
    const [embedded, guard, ratings, notes] = flowPayload.Flow;
    assert.deepEqual(
      embedded.EmbeddedData.map((f) => [f.Field, f.Type, f.Value]),
      [
        ["Team", "Recipient", undefined],
        ["FinalCloseDate", "Recipient", undefined],
        ["Term", "Custom", term],
      ]
    );
    assert.deepEqual(VARIANTS[finalSurvey(term)].fields, [
      "Team",
      "FinalCloseDate",
    ]);
    assert.equal(VARIANTS[finalSurvey(term)].closeField, "FinalCloseDate");
    assert.equal(guard.BranchLogic[0][0].LeftOperand, "Team");
    assert.equal(guard.Flow.at(-1).Type, "EndSurvey");
    assert.equal(ratings.Type, "Block");
    assert.equal(notes.Type, "Standard");
    const ids = JSON.stringify(flowPayload).match(/FL_\d+/g);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(flowPayload.Properties.Count, ids.length);
  }
});

test("the variants, the emails, and the scorer's surveys share one term list", () => {
  const finalKeys = TERMS.map(finalSurvey);
  assert.deepEqual(
    Object.keys(VARIANTS)
      .filter((k) => k !== "pulse")
      .sort(),
    [...finalKeys].sort()
  );
  for (const key of finalKeys) {
    assert.ok(distributionEmails[key], key);
    assert.ok(SURVEYS[key], key);
  }
  assert.deepEqual(SURVEY_ORDER, ["pulse", ...finalKeys]);
});

test("the end-of-term intro pipes the team and close date, and states the page's between rule and weight", () => {
  for (const term of TERMS) {
    const intro = tagged(finals[term], "Start").QuestionText;
    assert.match(intro, /\$\{e:\/\/Field\/Team\}/);
    assert.match(intro, /\$\{e:\/\/Field\/FinalCloseDate\}/);
    assert.ok(
      intro.includes(
        `worth ${rules.between.join("% or ")}% of the facet's points`
      )
    );
    assert.match(intro, /set 20% of each student's grade/);
    assert.match(intro, /on 6 facets/);
    assert.ok(intro.includes(OPTIONS.pageUrl));
  }
  assert.ok(
    distributionEmails["final-fall"].body.includes(
      "${e://Field/FinalCloseDate}"
    )
  );
});

test("an end-of-term survey without a What it looks like list for a facet stops the build", () => {
  const { Teamwork: _dropped, ...partial } = rules.guidance;
  assert.throws(
    () =>
      buildPartnerSurvey({
        ...finalOptions("fall"),
        rules: { ...rules, guidance: partial },
      }),
    /no "What it looks like" list for Teamwork/
  );
  assert.throws(
    () => buildPartnerSurvey({ ...finalOptions("fall"), rules: undefined }),
    /no "What it looks like" list for Reflection/
  );
});

// The contract with the end-of-term scorer (#445): a labels export shaped as
// Qualtrics writes it for each generated survey. The scorer finds a facet's
// column by its tag (facetTag) and its text "<criterion>: ...", maps the
// label through facetChoices to points, reads the custom share from
// <tag>_<id>_TEXT, the term from Term, and the concerns from Q2 to Q3.

test("a labels export of each end-of-term survey carries the tags and labels the scorer reads", () => {
  for (const term of TERMS) {
    const survey = finals[term];
    const rubric = finalRubrics[term];
    const columns = exportColumns(survey);
    const cells = {
      FinalCloseDate: "the Friday of week 10",
      Finished: "True",
      Q2: "No",
      "Q2 Comments": "",
      "Q2 Names": "",
      Q3: "Thank you.",
      RecipientEmail: "partner@example.com",
      RecordedDate: "recorded",
      ResponseId: "R_1",
      StartDate: "started",
      Status: "Email",
      Team: "Engines",
      Term: term,
    };
    // Each facet answers its i-th choice, wrapping, so every kind of
    // choice (anchor, between, rung) appears across the terms.
    const picked = rubric.criteria.map((criterion, i) => {
      const choices = choicesOf(criterion);
      return choices[i % choices.length];
    });
    for (const [i, choice] of picked.entries()) {
      cells[facetTag(rubric.criteria[i])] = choice.label;
    }
    const qualtrics = parseQualtricsExport(
      toCsv([
        columns.map(([tag]) => tag),
        columns.map(([, text]) => text),
        columns.map(([, , id]) => JSON.stringify({ ImportId: id })),
        columns.map(([tag]) => cells[tag] ?? ""),
      ])
    );
    const [response] = qualtrics.responses;
    assert.equal(response.Term, term);
    for (const tag of ["Team", "Q2", "Q2 Names", "Q2 Comments", "Q3"]) {
      assert.ok(
        qualtrics.columns.some((c) => c.tag === tag),
        `${term} ${tag}`
      );
    }
    for (const [i, criterion] of rubric.criteria.entries()) {
      const tag = facetTag(criterion);
      const column = qualtrics.columns.find((c) => c.tag === tag);
      assert.ok(column.text.startsWith(`${criterion.title}: `), column.text);
      const choice = choicesOf(criterion).find(
        (c) => c.label === response[tag]
      );
      assert.ok(choice, `${term} ${criterion.title}: ${response[tag]}`);
      assert.equal(choice.points, picked[i].points);
    }
    const ladder = rubric.criteria.find(isLadder);
    const textTags = qualtrics.columns
      .map((c) => c.tag)
      .filter((tag) => tag.endsWith("_TEXT"));
    assert.deepEqual(
      textTags,
      ladder ? [`${facetTag(ladder)}_${customOf(ladder).id}_TEXT`] : [],
      term
    );
  }
});

test("the spring export's columns and ImportIds", () => {
  const ids = Object.fromEntries(
    exportColumns(finals.spring).map(([tag, , id]) => [tag, id])
  );
  assert.deepEqual(
    [
      "Reflection",
      "Requirements",
      "Design",
      "VnV",
      "VnV_7_TEXT",
      "Teamwork",
      "Communication",
      "Q2",
      "Q2 Names",
      "Q2 Comments",
      "Q3",
      "Term",
    ].map((tag) => ids[tag]),
    [
      "QID3",
      "QID5",
      "QID7",
      "QID9",
      "QID9_7_TEXT",
      "QID11",
      "QID13",
      "QID15",
      "QID16_TEXT",
      "QID17_TEXT",
      "QID18_TEXT",
      "Term",
    ]
  );
});

// The end-of-term contract with the scorer (#445): a labels export of each
// generated End-of-Term Survey scores by the same choice list the survey
// offers, label in, points out.

/** A labels export of `survey`, one row per cell map. */
function labelsExport(survey, rows) {
  const columns = exportColumns(survey);
  return parseQualtricsExport(
    toCsv([
      columns.map(([tag]) => tag),
      columns.map(([, text]) => text),
      columns.map(([, , id]) => JSON.stringify({ ImportId: id })),
      ...rows.map((cells) => columns.map(([tag]) => cells[tag] ?? "")),
    ])
  );
}

let finalCount = 0;

/** One finished end-of-term response: the top choice on every facet. */
function finalResponse(term, team, overrides = {}) {
  finalCount += 1;
  const cells = {
    Finished: "True",
    Q2: "No",
    RecordedDate: "recorded",
    ResponseId: `R_final_${finalCount}`,
    StartDate: "started",
    Status: "Email",
    Team: team,
    Term: term,
  };
  for (const criterion of finalRubrics[term].criteria) {
    cells[facetTag(criterion)] = choicesOf(criterion)[0].label;
  }
  return { ...cells, ...overrides };
}

const FINAL_ROSTER = parseRoster(
  [
    "name,canvas_user_id,user_id,login_id,sections,group_name,canvas_group_id,group_id",
    '"Lovelace, Ada",101,0,ada@example.edu,CS 461 001,Engines,0,0',
    '"Hopper, Grace",201,0,grace@example.edu,CS 461 001,Compilers,0,0',
  ].join("\r\n")
);

const finalRubricExport = (term) => {
  const names = finalRubrics[term].criteria.map((c) => c.title);
  return parseRubricExport(
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
      ["101", "Lovelace, Ada", ...names.flatMap(() => ["", "", ""])],
      ["201", "Hopper, Grace", ...names.flatMap(() => ["", "", ""])],
    ])
  );
};

const scoreFinal = (term, rows, survey = finalSurvey(term)) =>
  scorePartnerSurvey({
    aBound: A,
    between: rules.between,
    qualtrics: labelsExport(finals[term], rows),
    roster: FINAL_ROSTER,
    rubric: finalRubrics[term],
    rubricExport: finalRubricExport(term),
    survey,
  });

/** One criterion's Rating and Points in the row of `id`. */
function scoreOf(result, term, id, criterion) {
  const exported = finalRubricExport(term);
  const at = exported.criteria.get(criterion.title.toLowerCase());
  const row = result.rows.find((cells) => cells[0] === id);
  return { points: row[at.Points], rating: row[at.Rating] };
}

test("each generated end-of-term export is detected by its Term and facet tags", () => {
  const all = { ...finalRubrics, pulse: pulseRubric };
  for (const term of TERMS) {
    const qualtrics = labelsExport(finals[term], [
      finalResponse(term, "Engines"),
    ]);
    assert.deepEqual(detectSurvey(qualtrics, all), {
      kind: finalSurvey(term),
      reason: "",
    });
    assert.equal(SURVEYS[finalSurvey(term)].term, term);
  }
  const mixed = labelsExport(finals.fall, [
    finalResponse("fall", "Engines"),
    finalResponse("fall", "Compilers", { Term: "winter" }),
  ]);
  assert.equal(detectSurvey(mixed, all).kind, null);
  assert.match(detectSurvey(mixed, all).reason, /fall, winter/);
  const summer = labelsExport(finals.fall, [
    finalResponse("fall", "Engines", { Term: "summer" }),
  ]);
  assert.equal(detectSurvey(summer, all).kind, null);
  // A facet column missing from the export is named.
  const noFacet = labelsExport(finals.winter, [
    finalResponse("winter", "Engines"),
  ]);
  noFacet.columns = noFacet.columns.filter((c) => c.tag !== "Teamwork");
  assert.match(detectSurvey(noFacet, all).reason, /no Teamwork column/);
});

test("every choice of every end-of-term facet scores its points, named by bandFor", () => {
  for (const term of TERMS) {
    for (const criterion of finalRubrics[term].criteria) {
      for (const choice of choicesOf(criterion)) {
        const result = scoreFinal(term, [
          finalResponse(term, "Engines", {
            [facetTag(criterion)]: choice.label,
          }),
          finalResponse(term, "Compilers"),
        ]);
        assert.deepEqual(
          scoreOf(result, term, "101", criterion),
          {
            points: String(choice.points),
            rating: bandFor(criterion, choice.points).name,
          },
          `${term} ${criterion.title}: ${choice.label}`
        );
      }
    }
  }
  // Spring Requirements at 70% is 3.5 points, named after the low anchor.
  const requirements = finalRubrics.spring.criteria.find(
    (c) => facetTag(c) === "Requirements"
  );
  const seventy = choicesOf(requirements).find((c) => c.percent === 70);
  const result = scoreFinal("spring", [
    finalResponse("spring", "Engines", { Requirements: seventy.label }),
  ]);
  assert.deepEqual(scoreOf(result, "spring", "101", requirements), {
    points: "3.5",
    rating: "Low anchor (half the points)",
  });
});

test("the spring custom scale scores its share of the points, and stops out of range", () => {
  const ladder = finalRubrics.spring.criteria.find(isLadder);
  const custom = customOf(ladder);
  const tag = facetTag(ladder);
  const column = `${tag}_${custom.id}_TEXT`;
  assert.equal(column, "VnV_7_TEXT");
  const answer = (share) =>
    finalResponse("spring", "Engines", {
      [column]: share,
      [tag]: customScaleText(custom),
    });
  for (const [share, points] of [
    ["50", "20"],
    ["75", "30"],
    ["100", "40"],
  ]) {
    const result = scoreFinal("spring", [answer(share)]);
    assert.deepEqual(scoreOf(result, "spring", "101", ladder), {
      points,
      rating: bandFor(ladder, Number(points)).name,
    });
  }
  for (const bad of ["", "49", "101", "120", "abc"]) {
    assert.throws(
      () => scoreFinal("spring", [answer(bad)]),
      /custom-scale share in VnV_7_TEXT.*from 50 to 100/,
      bad
    );
  }
});

test("an end-of-term label the survey does not offer stops the run", () => {
  assert.throws(
    () =>
      scoreFinal("fall", [
        finalResponse("fall", "Engines", { Teamwork: "Mostly fine" }),
      ]),
    /"Mostly fine" to Teamwork .* not a choice for Teamwork/
  );
});

test("an end-of-term export scored as another term stops the run", () => {
  assert.throws(
    () =>
      scoreFinal(
        "winter",
        [finalResponse("winter", "Engines")],
        finalSurvey("fall")
      ),
    /Term column holds winter.*End-of-Term Survey, fall/
  );
  assert.throws(
    () => scoreFinal("fall", [finalResponse("fall", "Engines", { Term: "" })]),
    /Term column holds 1 blank.*every response must name its term/
  );
});

test("two end-of-term responses for one team wait for a choice", () => {
  const rows = [
    finalResponse("winter", "Engines", { ResponseId: "R_top" }),
    finalResponse("winter", "Engines", {
      ResponseId: "R_low",
      Teamwork: "Low anchor (half the points)",
    }),
  ];
  const waiting = scoreFinal("winter", rows);
  assert.equal(waiting.pending, true);
  assert.deepEqual(
    waiting.duplicates[0].responses.map((r) => r.ResponseId),
    ["R_top", "R_low"]
  );
  const teamwork = finalRubrics.winter.criteria.find(
    (c) => facetTag(c) === "Teamwork"
  );
  const chosen = scorePartnerSurvey({
    aBound: A,
    between: rules.between,
    choices: { Engines: "R_low" },
    qualtrics: labelsExport(finals.winter, rows),
    roster: FINAL_ROSTER,
    rubric: finalRubrics.winter,
    rubricExport: finalRubricExport("winter"),
    survey: finalSurvey("winter"),
  });
  assert.deepEqual(scoreOf(chosen, "winter", "101", teamwork), {
    points: "5",
    rating: "Low anchor (half the points)",
  });
});

test("an end-of-term team with no response scores the A lower bound; concerns are kept", () => {
  for (const term of TERMS) {
    const result = scoreFinal(term, [
      finalResponse(term, "Engines", {
        Q2: "Yes",
        "Q2 Comments": "Quiet in meetings.",
        "Q2 Names": "Ada",
      }),
    ]);
    assert.deepEqual(result.report.noResponse, ["Compilers"]);
    let total = 0;
    for (const criterion of finalRubrics[term].criteria) {
      const { points, rating } = scoreOf(result, term, "201", criterion);
      assert.equal(rating, bandFor(criterion, Number(points)).name);
      total += Number(points);
    }
    assert.equal(Math.round(total * 1e6) / 1e6, A, term);
    assert.deepEqual(result.concerns.rows, [
      ["Engines", "Yes", "Ada", "Quiet in meetings.", ""],
    ]);
  }
});
