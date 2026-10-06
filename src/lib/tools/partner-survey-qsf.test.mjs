import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  concernText,
  criterionNotes,
  customScaleText,
  distributionEmails,
  pulsePrompt,
} from "../../data/partner-evaluation.mjs";
import { parseRubricCsv } from "../rubric-csv.mjs";
import { toCsv } from "./csv.mjs";
import {
  customScaleChoice,
  facetChoices,
  facetGuidance,
  isLadder,
} from "./partner-facets.mjs";
import {
  aLowerBound,
  detectSurvey,
  scorePartnerSurvey,
} from "./partner-scoring.mjs";
import {
  buildPartnerSurvey,
  facetTag,
  partnerSurveyQsf,
  pulseScale,
  VARIANTS,
} from "./partner-survey-qsf.mjs";
import { parseQualtricsExport } from "./qualtrics-export.mjs";
import { parseRoster } from "./roster.mjs";
import { parseRubricExport } from "./rubric-export.mjs";

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
    detectSurvey(
      qualtrics.columns,
      { fall: fallRubric, pulse: pulseRubric },
      "fall"
    ),
    {
      guessed: false,
      kind: "pulse",
    }
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

const TERMS = ["fall", "winter", "spring"];
const finalRubrics = Object.fromEntries(
  TERMS.map((term) => [
    term,
    parseRubricCsv(
      read(rubricFile(`final-${term}`)),
      rubricFile(`final-${term}`)
    ),
  ])
);
const guidance = facetGuidance(
  read("src/content/docs/assignments/project-partner-evaluation.mdx")
);
const finalOptions = (term) => ({
  ...OPTIONS,
  guidance,
  rubric: finalRubrics[term],
  variant: `final-${term}`,
});
const finals = Object.fromEntries(
  TERMS.map((term) => [term, buildPartnerSurvey(finalOptions(term))])
);
const questionsOf = (survey) =>
  survey.SurveyElements.filter((e) => e.Element === "SQ").map((e) => e.Payload);
const tagged = (survey, tag) =>
  questionsOf(survey).find((q) => q.DataExportTag === tag);

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

test("each end-of-term survey asks one forced question per facet, in CSV order, then the shared concern questions", () => {
  for (const term of TERMS) {
    const rubric = finalRubrics[term];
    const tags = questionsOf(finals[term]).map((q) => q.DataExportTag);
    assert.equal(new Set(tags).size, tags.length, term);
    assert.deepEqual(tags, [
      "Start",
      ...rubric.criteria.flatMap((_, i) => [
        `${facetTag(i)} Guide`,
        facetTag(i),
      ]),
      "Guard",
      "Q2",
      "Q2 Names",
      "Q2 Comments",
      "Q3",
    ]);
    for (const [i, criterion] of rubric.criteria.entries()) {
      const q = tagged(finals[term], facetTag(i));
      assert.equal(q.QuestionType, "MC");
      assert.equal(q.Selector, "SAVR");
      assert.equal(
        q.QuestionText,
        `${criterion.title}: ${criterion.description}`
      );
      assert.equal(q.Validation.Settings.ForceResponse, "ON");
      const custom = customScaleChoice(criterion, "");
      const expected = [
        ...facetChoices(criterion).map((c) => c.label),
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

test("the text above each facet holds the page's What it looks like list and the CSV's anchor descriptions", () => {
  for (const term of TERMS) {
    for (const [i, criterion] of finalRubrics[term].criteria.entries()) {
      const guide = tagged(finals[term], `${facetTag(i)} Guide`).QuestionText;
      for (const bullet of guidance.get(criterion.title)) {
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
    assert.deepEqual(VARIANTS[`final-${term}`].fields, [
      "Team",
      "FinalCloseDate",
    ]);
    assert.equal(guard.BranchLogic[0][0].LeftOperand, "Team");
    assert.equal(guard.Flow.at(-1).Type, "EndSurvey");
    assert.equal(ratings.Type, "Block");
    assert.equal(notes.Type, "Standard");
    const ids = JSON.stringify(flowPayload).match(/FL_\d+/g);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(flowPayload.Properties.Count, ids.length);
  }
});

test("the end-of-term intro pipes the team and close date, and states the page's between rule and weight", () => {
  for (const term of TERMS) {
    const intro = tagged(finals[term], "Start").QuestionText;
    assert.match(intro, /\$\{e:\/\/Field\/Team\}/);
    assert.match(intro, /\$\{e:\/\/Field\/FinalCloseDate\}/);
    assert.match(intro, /worth 90% or 70% of the facet's points/);
    assert.match(intro, /set 20% of each student's grade/);
    assert.match(intro, /on 6 facets/);
    assert.equal(
      intro.includes(
        "Verification and Validation is scored on the outcome ladder"
      ),
      term === "spring",
      term
    );
    assert.ok(intro.includes(OPTIONS.pageUrl));
  }
  assert.ok(
    distributionEmails["final-fall"].body.includes(
      "${e://Field/FinalCloseDate}"
    )
  );
});

test("an end-of-term survey without a What it looks like list for a facet stops the build", () => {
  const partial = new Map(guidance);
  partial.delete("Teamwork");
  assert.throws(
    () => buildPartnerSurvey({ ...finalOptions("fall"), guidance: partial }),
    /no "What it looks like" list for Teamwork/
  );
  assert.throws(
    () => buildPartnerSurvey({ ...finalOptions("fall"), guidance: undefined }),
    /no "What it looks like" list for Reflection/
  );
});

// The contract with the end-of-term scorer (#445): a labels export shaped as
// Qualtrics writes it for each generated survey. The scorer finds a facet's
// column by its tag F<i> and its text "<criterion>: ...", maps the label
// through facetChoices to points, reads the custom share from F<i>_<id>_TEXT,
// the term from Term, and the concerns from Q2 to Q3.

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
      const choices = facetChoices(criterion);
      return choices[i % choices.length];
    });
    for (const [i, choice] of picked.entries()) {
      cells[facetTag(i)] = choice.label;
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
      const column = qualtrics.columns.find((c) => c.tag === facetTag(i));
      assert.ok(column.text.startsWith(`${criterion.title}: `), column.text);
      const label = response[facetTag(i)];
      const choice = facetChoices(criterion).find((c) => c.label === label);
      assert.ok(choice, `${term} ${criterion.title}: ${label}`);
      assert.equal(choice.points, picked[i].points);
    }
    const ladder = rubric.criteria.findIndex(isLadder);
    const textTags = qualtrics.columns
      .map((c) => c.tag)
      .filter((tag) => tag.endsWith("_TEXT"));
    assert.deepEqual(
      textTags,
      ladder === -1
        ? []
        : [
            `${facetTag(ladder)}_${customScaleChoice(rubric.criteria[ladder], "").id}_TEXT`,
          ],
      term
    );
  }
});

test("the end-of-term ImportIds: the facets are QID3 to QID13 by twos, the concerns QID15 to QID18", () => {
  const ids = Object.fromEntries(
    exportColumns(finals.spring).map(([tag, , id]) => [tag, id])
  );
  assert.deepEqual(
    [
      "F1",
      "F2",
      "F3",
      "F4",
      "F4_7_TEXT",
      "F5",
      "F6",
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
