// A generated survey's pages as one respondent sees them, read from the
// same .qsf object the download is written from (buildPeerSurvey), so the
// preview cannot drift from the file. Pure: no DOM, no I/O.
//
// It follows the Survey Flow for one contact: embedded data is the
// contact's, a branch runs when its logic holds, an EndSurvey stops, and
// each block is a page. A looped block is one page per displayed choice of
// its roster question, with the Loop & Merge fields filled in. Questions
// hidden by display logic, by JavaScript (the ratee), or by type (Meta Info)
// are not shown. Logic on embedded fields is all the generated surveys use;
// anything else stops the preview rather than guess.

import { pipeHtml } from "./piped-text.mjs";

const INDEX = /^\d+$/;
const HIDDEN_BY_SCRIPT = /style\.display\s*=\s*"none"/;
const LOCATOR_QID = /^q:\/\/(\w+)\//;

/** Whether one expression on an embedded field holds for `values`. */
function expressionHolds(expression, values) {
  if (expression.LogicType !== "EmbeddedField") {
    throw new Error(
      `The preview reads logic on embedded fields only, not ${expression.LogicType}.`
    );
  }
  const value = String(values[expression.LeftOperand] ?? "");
  switch (expression.Operator) {
    case "Empty":
      return value === "";
    case "NotEmpty":
      return value !== "";
    case "EqualTo":
      return value === String(expression.RightOperand);
    case "GreaterThan":
      return Number(value) > Number(expression.RightOperand);
    default:
      throw new Error(
        `The preview does not read the operator ${expression.Operator}.`
      );
  }
}

/**
 * Whether display or branch logic holds: every expression of an "If"
 * group, the generated surveys' only shape. No logic always holds.
 */
export function logicHolds(logic, values) {
  if (!logic) {
    return true;
  }
  return Object.entries(logic)
    .filter(([key]) => INDEX.test(key))
    .every(([, group]) =>
      Object.entries(group)
        .filter(([key]) => INDEX.test(key))
        .every(([, expression]) => expressionHolds(expression, values))
    );
}

/** The choices a question shows, in order, as `{ id, html }`. */
function shownChoices(question, values) {
  return (question.ChoiceOrder ?? [])
    .map((id) => ({ choice: question.Choices[id], id }))
    .filter(({ choice }) => logicHolds(choice.DisplayLogic, values))
    .map(({ choice, id }) => ({
      html: pipeHtml(choice.Display, { values }),
      id,
    }));
}

const hiddenByScript = (question) =>
  HIDDEN_BY_SCRIPT.test(question.QuestionJS ?? "");

/** A question as the preview renders it, or null when the respondent does not see it. */
function questionView(question, context) {
  const { questions, values } = context;
  if (
    question.QuestionType === "Meta" ||
    hiddenByScript(question) ||
    !logicHolds(question.DisplayLogic, values)
  ) {
    return null;
  }
  const html = pipeHtml(question.QuestionText, context);
  const forced = question.Validation?.Settings?.ForceResponse === "ON";
  switch (question.QuestionType) {
    case "DB":
      return { html, kind: "text" };
    case "MC":
      return {
        choices: shownChoices(question, values),
        forced,
        html,
        kind: question.Selector === "MAVR" ? "multiple" : "single",
      };
    case "Matrix":
      return {
        columns: question.AnswerOrder.map((id) => question.Answers[id].Display),
        forced,
        html,
        kind: "matrix",
        rows: question.ChoiceOrder.map((id) => question.Choices[id].Display),
      };
    case "TE":
      return {
        forced,
        html,
        kind: question.Selector === "ESTB" ? "essay" : "line",
      };
    case "CS": {
      const [, source] = question.DynamicChoices.Locator.match(LOCATOR_QID);
      return {
        choices: shownChoices(questions.get(source), values),
        forced,
        html,
        kind: "split",
        total: Number(question.Validation.Settings.ChoiceTotal),
      };
    }
    default:
      throw new Error(
        `The preview does not show ${question.QuestionType} questions.`
      );
  }
}

/** One page: the block's title and the questions the respondent sees. */
function pageOf(block, context, title = block.Description) {
  const shown = block.BlockElements.filter((e) => e.Type === "Question")
    .map((e) => questionView(context.questions.get(e.QuestionID), context))
    .filter(Boolean);
  return { questions: shown, title };
}

/** A looped block: one page per displayed choice of its roster question. */
function loopPages(block, context) {
  const options = block.Options.LoopingOptions;
  const roster = context.questions.get(options.QID);
  return shownChoices(roster, context.values).map(({ html, id }) => {
    const loop = { 1: html };
    for (const [n, text] of Object.entries(options.Static?.[id] ?? {})) {
      loop[n] = pipeHtml(text, { values: context.values });
    }
    return pageOf(block, { ...context, loop }, `${block.Description}: ${html}`);
  });
}

/**
 * The pages one respondent sees, in order: `[{ title, questions }]`, each
 * question `{ kind, html, ... }` with its piped text filled in and escaped.
 * Kinds: "text"; "single" and "multiple" with `choices`; "matrix" with
 * `rows` and `columns`; "essay" and "line"; "split" with `choices` and
 * `total`. `qsf` is the survey object (buildPeerSurvey); `values` the
 * respondent's embedded data by field name (a contact list row, with
 * `RecipientEmail`).
 */
export function surveyPages(qsf, values) {
  const element = (name) =>
    qsf.SurveyElements.find((e) => e.Element === name).Payload;
  const blocks = new Map(element("BL").map((block) => [block.ID, block]));
  const questions = new Map(
    qsf.SurveyElements.filter((e) => e.Element === "SQ").map((e) => [
      e.Payload.QuestionID,
      e.Payload,
    ])
  );
  const context = { blocks, loop: {}, questions, values };
  const pages = [];
  walkFlow(element("FL").Flow, context, pages);
  return pages.filter((page) => page.questions.length > 0);
}

/**
 * Adds the pages of a flow's elements to `pages`, in order. Returns false
 * once an EndSurvey is reached, so the caller stops too.
 */
function walkFlow(flow, context, pages) {
  for (const item of flow) {
    if (item.Type === "EndSurvey") {
      return false;
    }
    if (item.Type === "Branch") {
      if (
        logicHolds(item.BranchLogic, context.values) &&
        !walkFlow(item.Flow, context, pages)
      ) {
        return false;
      }
    } else if (item.Type === "Standard" || item.Type === "Block") {
      const block = context.blocks.get(item.ID);
      pages.push(
        ...(block.Options?.Looping
          ? loopPages(block, context)
          : [pageOf(block, context)])
      );
    }
  }
  return true;
}

/** A contact list row as the embedded data a respondent's survey reads. */
export const respondentValues = (row) => ({
  ...row,
  RecipientEmail: row.Email,
});
