import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  catmeTags,
  criterionPrompts,
  variants,
} from "../../data/peer-evaluation.mjs";
import { parseRubricCsv } from "../rubric-csv.mjs";
import {
  buildPeerSurvey,
  peerSurveyQsf,
  ratedCriteria,
} from "./peer-survey-qsf.mjs";

const rubricPath = (file) =>
  new URL(
    `../../../canvas/assignments/peer-evaluation/${file}`,
    import.meta.url
  );
const readRubric = (file) =>
  parseRubricCsv(readFileSync(rubricPath(file), "utf8"), file);

const RUBRICS = {
  catme: readRubric(variants.catme.rubric),
  regular: readRubric(variants.midterm.rubric),
};
const rubricFor = (variant = "midterm") =>
  RUBRICS[variants[variant]?.instrument] ?? RUBRICS.regular;

const NOW = new Date(0);
const make = (options = {}) =>
  JSON.parse(
    peerSurveyQsf({
      now: NOW,
      rubric: rubricFor(options.variant),
      seed: 7,
      ...options,
    })
  );

const elements = (survey, name) =>
  survey.SurveyElements.filter((element) => element.Element === name);
const payload = (survey, name) => elements(survey, name)[0].Payload;
const questionByTag = (survey, tag) =>
  elements(survey, "SQ").find((q) => q.Payload.DataExportTag === tag).Payload;
const blockById = (survey, id) =>
  payload(survey, "BL").find((block) => block.ID === id);
const blockOf = (survey, qid) =>
  payload(survey, "BL").find((block) =>
    block.BlockElements.some((element) => element.QuestionID === qid)
  );

/** The flow as a list of [type, block description or branch field]. */
function outline(survey, flow = payload(survey, "FL").Flow) {
  return flow.flatMap((item) => {
    if (item.Type === "Branch") {
      return [
        [
          "Branch",
          item.BranchLogic[0][0].LeftOperand,
          item.BranchLogic[0][0].Operator,
        ],
        ...outline(survey, item.Flow).map((entry) => ["  ", ...entry]),
      ];
    }
    if (item.Type === "Block" || item.Type === "Standard") {
      return [[item.Type, blockById(survey, item.ID).Description]];
    }
    return [[item.Type]];
  });
}

test("the .qsf parses and mirrors the element types of a working survey", () => {
  const survey = make();
  assert.deepEqual(
    [...new Set(survey.SurveyElements.map((element) => element.Element))],
    ["BL", "FL", "PL", "PROJ", "QC", "RS", "SCO", "SO", "SQ", "STAT"]
  );
  const id = survey.SurveyEntry.SurveyID;
  assert.ok(survey.SurveyElements.every((element) => element.SurveyID === id));
  assert.equal(
    elements(survey, "RS")[0].PrimaryAttribute,
    survey.SurveyEntry.SurveyActiveResponseSet
  );
  assert.equal(
    elements(survey, "QC")[0].SecondaryAttribute,
    String(elements(survey, "SQ").length)
  );
  // A real export writes every SurveyEntry timestamp as a string; unset is
  // all zeros, as LastAccessed is.
  assert.equal(survey.SurveyEntry.SurveyStartDate, "0000-00-00 00:00:00");
  assert.equal(survey.SurveyEntry.SurveyExpirationDate, "0000-00-00 00:00:00");
  const options = payload(survey, "SO");
  assert.equal(options.AnonymizeResponse, "No");
  assert.equal(options.PartialDeletion, null);
  assert.equal(options.SurveyExpiration, "None");
  assert.equal(options.SurveyProtection, "ByInvitation");
});

/** Every mode with every instrument. */
const BUILDS = ["loop", "slots"].flatMap((mode) =>
  ["midterm", "catme"].map((variant) => ({ mode, variant }))
);

test("each question's SecondaryAttribute is its description, at most 100 characters", () => {
  // A real export never writes more than 100 characters there.
  for (const build of BUILDS) {
    for (const question of elements(make(build), "SQ")) {
      assert.equal(
        question.SecondaryAttribute,
        question.Payload.QuestionDescription
      );
      assert.ok(
        question.SecondaryAttribute.length <= 100,
        question.PrimaryAttribute
      );
    }
  }
});

test("export tags are unique", () => {
  for (const build of BUILDS) {
    const tags = elements(make(build), "SQ").map(
      (q) => q.Payload.DataExportTag
    );
    assert.equal(new Set(tags).size, tags.length, JSON.stringify(build));
  }
});

test("loop mode: flow order", () => {
  assert.deepEqual(outline(make()), [
    ["EmbeddedData"],
    ["Branch", "Team", "Empty"],
    ["  ", "Standard", "Guard"],
    ["  ", "EndSurvey"],
    ["Block", "Intro"],
    ["Standard", "Ratings"],
    ["Standard", "Split and comments"],
  ]);
});

test("flow IDs are unique and counted", () => {
  for (const build of BUILDS) {
    const { mode } = build;
    const flow = payload(make(build), "FL");
    const ids = [];
    const walk = (items) => {
      for (const item of items) {
        ids.push(item.FlowID);
        walk(item.Flow ?? []);
      }
    };
    walk(flow.Flow);
    assert.equal(new Set(ids).size, ids.length, mode);
    assert.equal(flow.Properties.Count, ids.length + 1, mode);
  }
});

test("embedded data is declared first, with no values", () => {
  const [embedded] = payload(make(), "FL").Flow;
  assert.deepEqual(
    embedded.EmbeddedData.map((item) => item.Field),
    [
      "Team",
      "TeamSize",
      "SelfFloor",
      ...Array.from({ length: 9 }, (_, i) => `Team Member ${i + 1}`),
    ]
  );
  assert.ok(embedded.EmbeddedData.every((item) => !("Value" in item)));
});

test("roster: choice IDs pinned 1 to 10, display logic on 2 to 10", () => {
  const roster = questionByTag(make(), "Roster");
  const ids = Array.from({ length: 10 }, (_, i) => i + 1);
  assert.deepEqual(roster.ChoiceOrder, ids);
  assert.deepEqual(Object.keys(roster.Choices), ids.map(String));
  assert.deepEqual(
    roster.RecodeValues,
    Object.fromEntries(ids.map((id) => [id, String(id)]))
  );
  assert.equal(roster.Choices[1].Display, "Yourself");
  assert.equal(roster.Choices[1].DisplayLogic, undefined);
  for (let slot = 1; slot <= 9; slot += 1) {
    const choice = roster.Choices[slot + 1];
    assert.equal(choice.Display, `\${e://Field/Team%20Member%20${slot}}`);
    assert.equal(choice.DisplayLogic[0][0].LeftOperand, `Team Member ${slot}`);
    assert.equal(choice.DisplayLogic[0][0].Operator, "NotEmpty");
  }
});

test("loop mode: the block loops over the roster's displayed choices", () => {
  const survey = make();
  const roster = questionByTag(survey, "Roster");
  const rating = questionByTag(survey, "Rating");
  const { Options } = blockOf(survey, rating.QuestionID);
  const locator = `q://${roster.QuestionID}/ChoiceGroup/DisplayedChoices`;
  assert.equal(Options.Looping, "Question");
  assert.equal(Options.LoopingOptions.QID, roster.QuestionID);
  assert.equal(Options.LoopingOptions.Locator, locator);
  assert.equal(Options.LoopingOptions.ChoiceGroupLocator, locator);
  assert.equal(
    Options.LoopingOptions.Static[1][2],
    "${e://Field/RecipientEmail}"
  );
  assert.equal(
    Options.LoopingOptions.Static[10][2],
    "${e://Field/Team%20Member%209}"
  );
  assert.equal(
    questionByTag(survey, "Ratee").DefaultChoices.TEXT.Text,
    "${lm://Field/2}"
  );
  assert.match(rating.QuestionText, /\$\{lm:\/\/Field\/1\}/);
});

test("the rating matrix is a forced radio grid with recodes 1 to 5", () => {
  for (const [mode, tag] of [
    ["loop", "Rating"],
    ["slots", "S3_Rating"],
  ]) {
    const rating = questionByTag(make({ mode }), tag);
    assert.equal(rating.QuestionType, "Matrix");
    assert.equal(rating.Selector, "Likert");
    assert.equal(rating.SubSelector, "SingleAnswer");
    assert.equal(rating.Validation.Settings.ForceResponse, "ON");
    assert.equal(Object.keys(rating.Choices).length, 4);
    assert.deepEqual(rating.AnswerOrder, [1, 2, 3, 4, 5]);
    assert.deepEqual(rating.RecodeValues, {
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
    });
    const [{ anchors }] = ratedCriteria(RUBRICS.regular);
    assert.equal(rating.Answers[1].Display, `1: ${anchors[0]}`);
    assert.equal(rating.Answers[5].Display, `5: ${anchors[4]}`);
    assert.match(rating.Answers[1].Display, /Better off without the member/);
  }
});

test("the ratee question is hidden by script, not display logic", () => {
  const ratee = questionByTag(make(), "Ratee");
  assert.equal(ratee.DisplayLogic, undefined);
  assert.match(ratee.QuestionJS, /display = "none"/);
});

test("the split carries the roster forward, totals 100, and is forced", () => {
  const survey = make();
  const roster = questionByTag(survey, "Roster");
  const split = questionByTag(survey, "Split");
  assert.equal(split.QuestionType, "CS");
  assert.deepEqual(split.DynamicChoices, {
    DynamicType: "ChoiceGroup",
    Locator: `q://${roster.QuestionID}/ChoiceGroup/DisplayedChoices`,
    Type: "Dynamic",
  });
  assert.deepEqual(split.Choices, {});
  assert.equal(split.Validation.Settings.Type, "ChoicesTotal");
  assert.equal(split.Validation.Settings.ChoiceTotal, "100");
  assert.equal(split.Validation.Settings.ForceResponse, "ON");
  assert.doesNotMatch(split.QuestionText, /SelfFloor/);
});

test("the floor shows on teams of three or more, the review range on teams of two", () => {
  for (const mode of ["loop", "slots"]) {
    const survey = make({ mode });
    const floor = questionByTag(survey, "SplitFloor");
    const pair = questionByTag(survey, "SplitPair");
    assert.equal(floor.QuestionType, "DB");
    assert.match(floor.QuestionText, /\$\{e:\/\/Field\/SelfFloor\}/);
    assert.match(pair.QuestionText, /45 to 55/);
    for (const [question, operator] of [
      [floor, "GreaterThan"],
      [pair, "EqualTo"],
    ]) {
      const logic = question.DisplayLogic;
      assert.equal(logic.Type, "BooleanExpression");
      assert.equal(logic.inPage, false);
      assert.equal(logic[0].Type, "If");
      assert.deepEqual(
        {
          LeftOperand: logic[0][0].LeftOperand,
          LogicType: logic[0][0].LogicType,
          Operator: logic[0][0].Operator,
          RightOperand: logic[0][0].RightOperand,
          Type: logic[0][0].Type,
        },
        {
          LeftOperand: "TeamSize",
          LogicType: "EmbeddedField",
          Operator: operator,
          RightOperand: "2",
          Type: "Expression",
        },
        mode
      );
    }
  }
});

test("Meta Info sits on the last page, with the last visible question", () => {
  const survey = make();
  const meta = questionByTag(survey, "Meta");
  assert.equal(meta.QuestionType, "Meta");
  assert.equal(meta.Selector, "Browser");
  assert.equal(Object.keys(meta.Choices).length, 7);
  const last = blockOf(survey, meta.QuestionID);
  assert.deepEqual(
    last.BlockElements.map(
      ({ QuestionID }) =>
        elements(survey, "SQ").find((q) => q.PrimaryAttribute === QuestionID)
          .Payload.DataExportTag
    ),
    [
      "SplitFloor",
      "SplitPair",
      "Split",
      "Allocations",
      "Overall",
      "Closing",
      "Meta",
    ]
  );
});

test("slots mode: one block per slot, each teammate behind its branch", () => {
  const survey = make({ mode: "slots" });
  const flow = outline(survey);
  assert.deepEqual(flow.slice(0, 6), [
    ["EmbeddedData"],
    ["Branch", "Team", "Empty"],
    ["  ", "Standard", "Guard"],
    ["  ", "EndSurvey"],
    ["Block", "Intro"],
    ["Standard", "Rate yourself"],
  ]);
  for (let slot = 1; slot <= 9; slot += 1) {
    const at = 6 + (slot - 1) * 2;
    assert.deepEqual(flow[at], ["Branch", `Team Member ${slot}`, "NotEmpty"]);
    assert.deepEqual(flow[at + 1], [
      "  ",
      "Standard",
      `Rate Team Member ${slot}`,
    ]);
  }
  assert.deepEqual(flow.at(-1), ["Standard", "Split and comments"]);
  assert.equal(
    questionByTag(survey, "S1_Ratee").DefaultChoices.TEXT.Text,
    "${e://Field/RecipientEmail}"
  );
  assert.equal(
    questionByTag(survey, "S4_Ratee").DefaultChoices.TEXT.Text,
    "${e://Field/Team%20Member%203}"
  );
  assert.ok(
    payload(survey, "BL").every((block) => !block.Options?.Looping),
    "no block loops"
  );
});

test("midterm and final differ only in the name, title, and closing question", () => {
  const midterm = make({ label: "CS 461", variant: "midterm" });
  const final = make({ label: "CS 461", variant: "final" });
  assert.equal(
    midterm.SurveyEntry.SurveyName,
    "CS 461 Midterm Peer Evaluation"
  );
  assert.equal(
    final.SurveyEntry.SurveyName,
    "CS 461 End-of-Term Peer Evaluation"
  );
  assert.equal(
    questionByTag(midterm, "Closing").QuestionText,
    variants.midterm.question
  );
  assert.equal(
    questionByTag(final, "Closing").QuestionText,
    variants.final.question
  );
  assert.equal(
    variants.final.question,
    "What did you learn about working in a team that you will carry into the next term?"
  );

  const mask = (survey, variant) =>
    JSON.stringify(survey)
      .replaceAll(variants[variant].title, "TITLE")
      .replaceAll(
        JSON.stringify(variants[variant].question).slice(1, -1),
        "QUESTION"
      )
      .replaceAll(
        JSON.stringify(variants[variant].question.slice(0, 97)).slice(1, -1),
        "QUESTION"
      );
  assert.equal(mask(midterm, "midterm"), mask(final, "final"));
});

test("unknown variant or mode throws", () => {
  const rubric = RUBRICS.regular;
  assert.throws(
    () => buildPeerSurvey({ rubric, variant: "spring" }),
    /variant/
  );
  assert.throws(
    () => buildPeerSurvey({ rubric, variant: "toString" }),
    /variant/
  );
  assert.throws(() => buildPeerSurvey({ mode: "per-page", rubric }), /mode/);
  assert.throws(() => buildPeerSurvey({}), /peer-evaluation-rubric\.csv/);
});

// The rubric CSVs feed the survey.

test("the regular survey rates the rubric's four criteria, not the point distribution", () => {
  const rated = ratedCriteria(RUBRICS.regular);
  assert.deepEqual(
    rated.map((c) => c.name),
    ["Quantity", "Quality", "Attitude as a team player", "Technical value"]
  );
  for (const criterion of rated) {
    assert.equal(criterion.anchors.length, 5);
  }
  const rating = questionByTag(make(), "Rating");
  assert.deepEqual(
    rating.ChoiceOrder.map((id) => rating.Choices[id].Display),
    rated.map((c) => criterionPrompts[c.name])
  );
});

test("every rated criterion of the regular rubric has a prompt, and no prompt is spare", () => {
  assert.deepEqual(
    ratedCriteria(RUBRICS.regular)
      .map((c) => c.name)
      .sort(),
    Object.keys(criterionPrompts).sort()
  );
});

test("a criterion with some but not all of the five bands stops the build", () => {
  const broken = {
    criteria: [
      {
        ratings: [
          { description: "Top", name: "Average of 5", points: 20 },
          { description: "Bottom", name: "Average of 1", points: 10 },
        ],
        title: "Quantity",
      },
    ],
    name: "Broken",
  };
  assert.throws(() => ratedCriteria(broken), /Average of 1" to "Average of 5/);
  const renamed = structuredClone(RUBRICS.regular);
  renamed.criteria[0].title = "Effort";
  assert.throws(() => make({ rubric: renamed }), /prompt.*"Effort"/);
});

// The spring end-of-term CATME variant.

const DIMENSIONS = ratedCriteria(RUBRICS.catme).map((dimension) => ({
  ...dimension,
  tag: catmeTags[dimension.name],
}));
const TAGS = DIMENSIONS.map((dimension) => dimension.tag);
const tagsOf = (survey) =>
  elements(survey, "SQ").map((q) => q.Payload.DataExportTag);

test("catme: the rubric's five dimensions, tags stripped, each with its export tag", () => {
  assert.deepEqual(
    DIMENSIONS.map((dimension) => dimension.name),
    [
      "Contributing to the team's work",
      "Interacting with teammates",
      "Keeping the team on track",
      "Expecting quality",
      "Having relevant knowledge, skills, and abilities",
    ]
  );
  assert.deepEqual(TAGS, [
    "Contributing",
    "Interacting",
    "OnTrack",
    "Quality",
    "Skills",
  ]);
  assert.deepEqual(
    Object.keys(catmeTags).sort(),
    DIMENSIONS.map((d) => d.name).sort()
  );
  const missing = structuredClone(RUBRICS.catme);
  missing.criteria[0].title = "Showing up";
  assert.throws(
    () => make({ rubric: missing, variant: "catme" }),
    /export tag.*"Showing up"/
  );
});

test("catme: flow order, the split page replaced by a comments page", () => {
  for (const mode of ["loop", "slots"]) {
    const regular = outline(make({ mode }));
    const catme = outline(make({ mode, variant: "catme" }));
    assert.deepEqual(catme.slice(0, -1), regular.slice(0, -1), mode);
    assert.deepEqual(catme.at(-1), ["Standard", "Comments"], mode);
  }
  assert.deepEqual(outline(make({ variant: "catme" })), [
    ["EmbeddedData"],
    ["Branch", "Team", "Empty"],
    ["  ", "Standard", "Guard"],
    ["  ", "EndSurvey"],
    ["Block", "Intro"],
    ["Standard", "Ratings"],
    ["Standard", "Comments"],
  ]);
});

test("catme: each page rates five dimensions, forced, recodes 1 to 5", () => {
  for (const [mode, prefix] of [
    ["loop", ""],
    ["slots", "S1_"],
    ["slots", "S3_"],
  ]) {
    const survey = make({ mode, variant: "catme" });
    const ratee = questionByTag(survey, `${prefix}Ratee`);
    const page = blockOf(survey, ratee.QuestionID).BlockElements.map(
      ({ QuestionID }) =>
        elements(survey, "SQ").find((q) => q.PrimaryAttribute === QuestionID)
          .Payload.DataExportTag
    );
    assert.deepEqual(
      page,
      ["Ratee", ...TAGS, "Comment"].map((tag) => prefix + tag),
      mode
    );
    for (const dimension of DIMENSIONS) {
      const q = questionByTag(survey, prefix + dimension.tag);
      assert.equal(q.QuestionType, "MC");
      assert.equal(q.Selector, "SAVR");
      assert.equal(q.SubSelector, "TX");
      assert.equal(q.Validation.Settings.ForceResponse, "ON");
      assert.deepEqual(q.ChoiceOrder, [5, 4, 3, 2, 1]);
      assert.deepEqual(q.RecodeValues, {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
      });
      for (let value = 1; value <= 5; value += 1) {
        assert.equal(
          q.Choices[value].Display,
          `${value}: ${dimension.anchors[value - 1]}`
        );
      }
      assert.ok(q.QuestionText.includes(dimension.name));
    }
    const comment = questionByTag(survey, `${prefix}Comment`);
    assert.equal(comment.Validation.Settings.ForceResponse, "OFF");
  }
  assert.match(
    questionByTag(make({ variant: "catme" }), "Quality").QuestionText,
    /\$\{lm:\/\/Field\/1\}/
  );
});

test("catme: no rating matrix and no split", () => {
  for (const mode of ["loop", "slots"]) {
    const survey = make({ mode, variant: "catme" });
    const tags = tagsOf(survey);
    for (const tag of [
      "Rating",
      "SplitFloor",
      "SplitPair",
      "Split",
      "Allocations",
    ]) {
      assert.ok(
        !tags.some((t) => t === tag || t.endsWith(`_${tag}`)),
        `${mode}: ${tag}`
      );
    }
    assert.ok(
      elements(survey, "SQ").every(
        (q) => !["Matrix", "CS"].includes(q.Payload.QuestionType)
      ),
      mode
    );
    assert.doesNotMatch(payload(survey, "SO").SurveyMetaDescription, /100/);
  }
});

test("catme: tags tell its export from the regular one", () => {
  const regular = new Set(tagsOf(make()));
  const catme = new Set(tagsOf(make({ variant: "catme" })));
  for (const tag of TAGS) {
    assert.ok(catme.has(tag), tag);
    assert.ok(!regular.has(tag), tag);
  }
});

test("catme: the last page is the overall comment, the closing question, and Meta Info", () => {
  const survey = make({ variant: "catme" });
  const meta = questionByTag(survey, "Meta");
  assert.deepEqual(
    blockOf(survey, meta.QuestionID).BlockElements.map(
      ({ QuestionID }) =>
        elements(survey, "SQ").find((q) => q.PrimaryAttribute === QuestionID)
          .Payload.DataExportTag
    ),
    ["Overall", "Closing", "Meta"]
  );
  assert.equal(
    questionByTag(survey, "Closing").QuestionText,
    "What did you learn about working in a team that you will carry into your next team?"
  );
  for (const tag of ["Overall", "Closing"]) {
    assert.equal(
      questionByTag(survey, tag).Validation.Settings.ForceResponse,
      "OFF"
    );
  }
  assert.equal(
    make({ label: "CS 463", variant: "catme" }).SurveyEntry.SurveyName,
    "CS 463 End-of-Term Peer Evaluation (CATME)"
  );
});

test("catme: head, display logic, and loop shapes match the regular survey", () => {
  for (const mode of ["loop", "slots"]) {
    const regular = make({ mode });
    const catme = make({ mode, variant: "catme" });
    assert.deepEqual(
      payload(catme, "FL").Flow.slice(0, 3),
      payload(regular, "FL").Flow.slice(0, 3),
      mode
    );
    for (const tag of ["Intro", "Roster", "Guard"]) {
      assert.deepEqual(
        questionByTag(catme, tag),
        questionByTag(regular, tag),
        `${mode}: ${tag}`
      );
    }
    // The branches around each slot block, block IDs aside.
    const branches = (survey) =>
      payload(survey, "FL")
        .Flow.filter((item) => item.Type === "Branch")
        .map(({ BranchLogic, FlowID }) => ({ BranchLogic, FlowID }));
    assert.deepEqual(branches(catme), branches(regular), mode);
  }
  const loopOptions = (survey) =>
    blockOf(survey, questionByTag(survey, "Ratee").QuestionID).Options;
  assert.deepEqual(
    loopOptions(make({ variant: "catme" })),
    loopOptions(make())
  );
  assert.equal(
    questionByTag(make({ variant: "catme" }), "Ratee").DefaultChoices.TEXT.Text,
    "${lm://Field/2}"
  );
  for (const slot of [1, 4, 10]) {
    assert.deepEqual(
      questionByTag(make({ mode: "slots", variant: "catme" }), `S${slot}_Ratee`)
        .DefaultChoices,
      questionByTag(make({ mode: "slots" }), `S${slot}_Ratee`).DefaultChoices
    );
  }
});
