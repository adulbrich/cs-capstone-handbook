import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  concernText,
  criterionNotes,
  pulsePrompt,
} from "../../data/partner-evaluation.mjs";
import { parseRubricCsv } from "../rubric-csv.mjs";
import { toCsv } from "./csv.mjs";
import {
  aLowerBound,
  detectSurvey,
  scorePartnerSurvey,
} from "./partner-scoring.mjs";
import {
  buildPartnerSurvey,
  partnerSurveyQsf,
  pulseScale,
  VARIANTS,
} from "./partner-survey-qsf.mjs";
import { plain } from "./qsf.mjs";
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
          `${plain(q.QuestionText)} - ${q.Choices[id].Display}`,
          `${q.QuestionID}_${id}`,
        ]);
      }
    } else {
      const suffix = q.QuestionType === "TE" ? "_TEXT" : "";
      columns.push([
        q.DataExportTag,
        plain(q.QuestionText),
        `${q.QuestionID}${suffix}`,
      ]);
    }
  }
  const fields = survey.SurveyElements.find((e) => e.Element === "FL").Payload
    .Flow[0].EmbeddedData;
  for (const { Field: name } of fields) {
    columns.push([name, name, name]);
  }
  return columns;
}

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
