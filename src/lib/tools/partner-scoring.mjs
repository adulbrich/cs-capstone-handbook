// Scores the project partner surveys (#445) against the rules on
// src/content/docs/assignments/project-partner-evaluation.mdx. Every rating
// name and point value comes from the rubric CSVs under
// canvas/assignments/project-partner-evaluation/, parsed by
// src/lib/rubric-csv.mjs; the lower bound of an A comes from
// src/content/docs/learning-objectives/grading.mdx. An end-of-term answer is
// scored by the same choice list the generator wrote into the survey
// (partner-facets.mjs), so a label and its points have one source. The
// caller loads those files; this module is pure, so node --test and the
// browser run the same code.

import { customScaleText } from "../../data/partner-evaluation.mjs";
import {
  customScaleChoice,
  facetChoices,
  facetTag,
} from "./partner-facets.mjs";
import { bandFor, percentOf } from "./rubric-bands.mjs";
import { fillCriterion, matchRubricExport, nameKey } from "./rubric-export.mjs";
import { finalSurvey, TERMS } from "./term-label.mjs";

/**
 * The concern questions, by export tag: the pulse's, which the end-of-term
 * surveys ask word for word.
 */
const CONCERNS = { flag: "Q2", text: ["Q2 Names", "Q2 Comments", "Q3"] };

/**
 * The four surveys. `rubric` names the rubric CSV each one scores against;
 * an end-of-term survey also names its `term`, which its export's Term
 * column must hold.
 */
export const SURVEYS = {
  ...Object.fromEntries(
    TERMS.map((term) => [
      finalSurvey(term),
      {
        concerns: CONCERNS,
        rubric: term,
        supported: true,
        term,
        title: `End-of-Term Survey, ${term}`,
      },
    ])
  ),
  pulse: {
    concerns: CONCERNS,
    rubric: "pulse",
    supported: true,
    title: "Midterm Pulse",
  },
};

/** The surveys in the order a term runs them. */
export const SURVEY_ORDER = ["pulse", ...TERMS.map(finalSurvey)];

const A_ROW = /^A\s*\|\s*(\d+(?:\.\d+)?)\s*\|/m;

/** The lower bound of an A, read from the grading scale's table. */
export function aLowerBound(gradingText) {
  const match = gradingText.match(A_ROW);
  if (!match) {
    throw new Error(
      "No `A | <points>` row in the grading scale; the no-response score cannot be computed."
    );
  }
  return Number(match[1]);
}

/**
 * The no-response score for one criterion: the lower bound of an A, as a
 * share of the rubric's 100 points, times the criterion's maximum, named
 * after the highest rating at or below it (bandFor).
 */
export function noResponseScore(criterion, aBound) {
  const points = percentOf(criterion.maxPoints, aBound);
  return { points, rating: bandFor(criterion, points).name };
}

/**
 * The column that asks about `criterion`: a matrix row whose question text
 * reads "<prompt> - <criterion>: <statement>", matched case-insensitively.
 * Returns null when no column or more than one does.
 */
export function columnFor(columns, criterion) {
  const name = ` - ${nameKey(criterion.title)}`;
  const found = columns.filter((column) => {
    const text = column.text.toLowerCase();
    return text.includes(`${name}:`) || text.endsWith(name);
  });
  return found.length === 1 ? found[0] : null;
}

/** Whether the export has a column with this export tag. */
const hasColumn = (columns, tag) =>
  columns.some((column) => column.tag === tag);

const asksAbout = (columns, rubric) =>
  rubric.criteria.every((criterion) => columnFor(columns, criterion));

/** The Term values the responses carry, each once, blanks left out. */
const termsOf = (responses) =>
  [...new Set(responses.map((r) => r.Term ?? ""))].filter((t) => t !== "");

/**
 * Which survey a parsed export holds: `{ kind, reason }`. The pulse names its
 * four statements in a matrix. An end-of-term export carries a Term column
 * naming one term, and a column tagged by each of that term's facets
 * (facetTag). `kind` is null when neither matches, and `reason` says why.
 */
export function detectSurvey({ columns, responses }, rubrics) {
  if (asksAbout(columns, rubrics.pulse)) {
    return { kind: "pulse", reason: "" };
  }
  if (!hasColumn(columns, "Term")) {
    return {
      kind: null,
      reason: "no pulse questions and no Term column",
    };
  }
  const terms = termsOf(responses);
  if (terms.length !== 1 || !TERMS.includes(terms[0])) {
    return {
      kind: null,
      reason: `Term holds ${terms.length === 0 ? "nothing" : terms.join(", ")}, not one of ${TERMS.join(", ")}`,
    };
  }
  const [term] = terms;
  const missing = rubrics[term].criteria
    .map(facetTag)
    .filter((tag) => !hasColumn(columns, tag));
  if (missing.length > 0) {
    return {
      kind: null,
      reason: `Term is ${term}, but there is no ${missing.join(", ")} column`,
    };
  }
  return { kind: finalSurvey(term), reason: "" };
}

/** Comparing two responses from one team: the columns worth reading. */
const COMPARE_TAGS = [
  "ResponseId",
  "RecordedDate",
  "RecipientFirstName",
  "RecipientLastName",
  "RecipientEmail",
];

/**
 * One question per criterion: `{ criterion, column, choices, custom }`.
 * `choices` are `{ label, points }`, the labels the export carries. The
 * pulse's are the criterion's ratings, found by its matrix row. An
 * end-of-term facet's are facetChoices, found by its tag; a ladder adds the
 * custom-scale choice, whose share is in `custom.column`. Throws naming
 * every criterion with no column.
 */
function surveyQuestions(columns, rubric, definition, between) {
  const missing = [];
  const questions = rubric.criteria.map((criterion) => {
    if (!definition.term) {
      const column = columnFor(columns, criterion);
      if (!column) {
        missing.push(criterion.title);
      }
      const choices = criterion.ratings.map((r) => ({
        label: r.name,
        points: r.points,
      }));
      return { choices, column, criterion, custom: null };
    }
    const tag = facetTag(criterion);
    const column = columns.find((c) => c.tag === tag);
    if (!column) {
      missing.push(`${criterion.title} (${tag})`);
    }
    const choices = facetChoices(criterion, between);
    const scale = customScaleChoice(criterion, choices);
    const custom = scale && {
      ...scale,
      column: `${tag}_${scale.id}_TEXT`,
      label: customScaleText(scale),
    };
    if (custom && !hasColumn(columns, custom.column)) {
      missing.push(`${criterion.title}'s custom scale (${custom.column})`);
    }
    return { choices, column, criterion, custom };
  });
  if (missing.length > 0) {
    throw new Error(
      `No single question in the Qualtrics file asks about ${missing.join(", ")}. Is this the right survey?`
    );
  }
  return questions;
}

const NUMERIC = /^\d+(?:\.\d+)?$/;

/** Where an answer came from, for an error message. */
const answerSource = (response, column) =>
  `${column.tag} ("${column.text}") from team ${response.Team || "(no team)"}, response ${response.ResponseId}`;

/** The custom-scale share as points, or an Error when it is missing or out of range. */
function customPoints(response, { column, criterion, custom }) {
  const entry = response[custom.column] ?? "";
  const share = Number(entry);
  if (
    entry === "" ||
    !Number.isFinite(share) ||
    share < custom.min ||
    share > custom.max
  ) {
    throw new Error(
      `The custom-scale share in ${custom.column} is "${entry}" for ${answerSource(response, column)}: it must be a percent of the points from ${custom.min} to ${custom.max}. Nothing was scored.`
    );
  }
  return percentOf(criterion.maxPoints, share);
}

/**
 * One response's answer to one question, scored: label in, points out, the
 * rating named by bandFor. Throws on a label the question does not offer.
 */
function scoreAnswer(response, question) {
  const { choices, column, criterion, custom } = question;
  const answer = response[column.tag];
  const choice = choices.find((c) => nameKey(c.label) === nameKey(answer));
  let points = choice?.points;
  if (!choice && custom && nameKey(answer) === nameKey(custom.label)) {
    points = customPoints(response, question);
  } else if (!choice) {
    const said = answer === "" ? "No answer" : `The answer "${answer}"`;
    const values = NUMERIC.test(answer)
      ? " A number where a label belongs: this looks like a values export; export with choice labels (labels export only)."
      : "";
    const offered = [
      ...choices.map((c) => c.label),
      ...(custom ? [custom.label] : []),
    ];
    throw new Error(
      `${said} to ${answerSource(response, column)} is not a choice for ${criterion.title}. The survey offers: ${offered.join("; ")}.${values} Nothing was scored.`
    );
  }
  return { comment: null, points, rating: bandFor(criterion, points).name };
}

/**
 * The concerns rows: every finished response that raised something. A flag
 * of "No" with every text answer blank raises nothing, so it is left out.
 * `tags` is the flag, then the text questions.
 */
function concernRows(responses, concerns, tags) {
  const header = ["Team", ...tags];
  const rows = responses
    .filter(
      (response) =>
        !["", "no"].includes(response[concerns.flag].toLowerCase()) ||
        concerns.text.some((tag) => response[tag] !== "")
    )
    .map((response) => [response.Team, ...tags.map((tag) => response[tag])]);
  return { header, rows };
}

/** Groups responses by team, in file order. */
function byTeam(responses) {
  const teams = new Map();
  for (const response of responses) {
    const list = teams.get(response.Team) ?? [];
    list.push(response);
    teams.set(response.Team, list);
  }
  return teams;
}

/**
 * Scores one partner survey for every student in the rubric export.
 *
 * Inputs are parsed already: `roster` from parseRoster, `rubricExport` from
 * parseRubricExport, `qualtrics` from parseQualtricsExport, `rubric` from
 * parseRubricCsv, `aBound` from aLowerBound, and, for an end-of-term survey,
 * `between` from pageRules (partner-facets.mjs). `choices` maps a team to
 * the ResponseId that counts when the team sent more than one.
 *
 * Returns `{ duplicates, pending, compare, ... }`. While any duplicate team
 * has no valid choice, `pending` is true and nothing is scored. Otherwise it
 * also returns `rows` (the rubric export's rows, filled), `concerns`, and
 * `report`. Throws on anything that must stop the run: a mismatched rubric
 * export, a missing question, an answer the survey does not offer, a
 * custom-scale share out of range, a Term that is not the survey's.
 */
export function scorePartnerSurvey({
  aBound,
  between,
  choices = {},
  qualtrics,
  roster,
  rubric,
  rubricExport,
  survey,
}) {
  const definition = SURVEYS[survey];
  if (!definition?.supported) {
    throw new Error(
      `${definition?.title ?? survey} scoring is not supported yet.`
    );
  }
  const { columns, responses } = qualtrics;
  if (!hasColumn(columns, "Team")) {
    throw new Error(
      "The Qualtrics file has no Team column. The survey's contact list carries Team as embedded data."
    );
  }
  if (roster.some((s) => s.team !== "" && s.canvasUserId === "")) {
    throw new Error(
      "A student on a team has no canvas_user_id in the roster, so they cannot be matched to the rubric export. Export the roster with groups."
    );
  }
  if (definition.term) {
    if (!Array.isArray(between)) {
      throw new Error(
        "The between-anchor shares (pageRules) are missing, so the end-of-term choices cannot be built."
      );
    }
    const terms = termsOf(responses);
    if (terms.some((term) => term !== definition.term)) {
      throw new Error(
        `The Qualtrics file's Term column holds ${terms.join(", ")}, but the survey picked is ${definition.title}. Pick the survey its Term names.`
      );
    }
  }
  matchRubricExport(rubricExport, rubric);
  const questions = surveyQuestions(columns, rubric, definition, between);
  const { concerns } = definition;
  const concernTags = [concerns.flag, ...concerns.text];
  const absent = concernTags.filter((tag) => !hasColumn(columns, tag));
  if (absent.length > 0) {
    throw new Error(
      `The Qualtrics file has no ${absent.join(", ")} column for the concerns table.`
    );
  }

  // Only responses from a roster group are scored or need a choice; the rest
  // are reported, and their concerns still reach the concerns table.
  const rosterTeams = new Set(
    roster.map((student) => student.team).filter((team) => team !== "")
  );
  const responsesByTeam = byTeam(
    responses.filter((response) => rosterTeams.has(response.Team))
  );
  // The response that counts for each team: its only one, or the one chosen.
  const counted = new Map(
    [...responsesByTeam].map(([team, list]) => [
      team,
      list.length === 1
        ? list[0]
        : (list.find((r) => r.ResponseId === choices[team]) ?? null),
    ])
  );
  const duplicates = [...responsesByTeam]
    .filter(([, list]) => list.length > 1)
    .map(([team, list]) => ({
      chosen: counted.get(team)?.ResponseId ?? null,
      responses: list,
      team,
    }));
  const compare = [
    ...COMPARE_TAGS.filter((tag) => hasColumn(columns, tag)).map((tag) => ({
      label: tag,
      tag,
    })),
    ...questions.flatMap(({ column, criterion, custom }) => [
      { label: criterion.title, tag: column.tag },
      ...(custom ? [{ label: custom.column, tag: custom.column }] : []),
    ]),
    ...concernTags.map((tag) => ({ label: tag, tag })),
  ];
  const pending = duplicates.some((d) => d.chosen === null);
  if (pending) {
    return { compare, duplicates, pending };
  }

  const teamScores = new Map();
  for (const [team, response] of counted) {
    teamScores.set(
      team,
      questions.map((question) => scoreAnswer(response, question))
    );
  }
  const noResponse = [...rosterTeams].filter((team) => !teamScores.has(team));
  const noResponseNote = `Your project partner did not answer this survey; it scores the lower bound of an A, ${aBound} of 100.`;
  for (const team of noResponse) {
    teamScores.set(
      team,
      questions.map(({ criterion }) => ({
        ...noResponseScore(criterion, aBound),
        comment: noResponseNote,
      }))
    );
  }

  const studentsById = new Map(roster.map((s) => [s.canvasUserId, s]));
  const noTeam = [];
  const rows = rubricExport.students.map((student) => {
    const cells = [...student.cells];
    const team = studentsById.get(student.id)?.team ?? "";
    if (!rosterTeams.has(team)) {
      noTeam.push({
        id: student.id,
        name: student.name,
        reason: studentsById.has(student.id)
          ? "in no group on the roster"
          : "not on the roster",
      });
      return cells;
    }
    for (const [i, { criterion }] of questions.entries()) {
      const columnsAt = rubricExport.criteria.get(nameKey(criterion.title));
      fillCriterion(cells, columnsAt, teamScores.get(team)[i]);
    }
    return cells;
  });

  const exportIds = new Set(rubricExport.students.map((s) => s.id));
  return {
    compare,
    concerns: concernRows(responses, concerns, concernTags),
    duplicates,
    pending,
    report: {
      dropped: qualtrics.dropped,
      noResponse,
      noTeam,
      notInExport: roster
        .filter((s) => s.team !== "" && !exportIds.has(s.canvasUserId))
        .map((s) => ({ name: s.name, team: s.team })),
      responded: responsesByTeam.size,
      scored: rows.length - noTeam.length,
      unmatchedTeams: responses
        .filter((r) => !rosterTeams.has(r.Team))
        .map((r) => ({ responseId: r.ResponseId, team: r.Team })),
    },
    rows,
  };
}
