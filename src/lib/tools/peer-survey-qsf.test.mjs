import assert from "node:assert/strict";
import { test } from "node:test";
import { variants } from "../../data/peer-evaluation.mjs";
import { buildPeerSurvey, peerSurveyQsf } from "./peer-survey-qsf.mjs";

const NOW = new Date(0);
const make = (options) =>
  JSON.parse(peerSurveyQsf({ now: NOW, seed: 7, ...options }));

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
  assert.equal(options.SurveyExpiration, "off");
});

test("each question's SecondaryAttribute is its description, at most 100 characters", () => {
  // A real export never writes more than 100 characters there.
  for (const mode of ["loop", "slots"]) {
    for (const question of elements(make({ mode }), "SQ")) {
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
  for (const mode of ["loop", "slots"]) {
    const tags = elements(make({ mode }), "SQ").map(
      (q) => q.Payload.DataExportTag
    );
    assert.equal(new Set(tags).size, tags.length, mode);
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
  for (const mode of ["loop", "slots"]) {
    const flow = payload(make({ mode }), "FL");
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
    assert.match(rating.Answers[1].Display, /Better off without member/);
    assert.match(rating.Answers[5].Display, /Outstanding! Super asset to team/);
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
  assert.match(split.QuestionText, /\$\{e:\/\/Field\/SelfFloor\}/);
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
    ["Split", "Allocations", "Overall", "Closing", "Meta"]
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
  assert.throws(() => buildPeerSurvey({ variant: "spring" }), /variant/);
  assert.throws(() => buildPeerSurvey({ mode: "per-page" }), /mode/);
});
