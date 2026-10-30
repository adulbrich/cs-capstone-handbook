// Scores the project partner surveys (#445) against the rules on
// src/content/docs/assignments/project-partner-evaluation.mdx. Every rating
// name and point value comes from the rubric CSVs under
// canvas/assignments/project-partner-evaluation/, parsed by
// src/lib/rubric-csv.mjs; the lower bound of an A comes from
// src/content/docs/learning-objectives/grading.mdx. An end-of-term answer is
// scored by the same choice list the generator wrote into the survey
// (partner-facets.mjs), so a label and its points have one source. A
// criterion's comment boxes (#535) go into its Comments cell, verbatim, for
// every student on the team. The instructor's edits by team and criterion
// (#611) are applied to the team's scores before any row is filled. The
// caller loads those files; this module is pure, so node --test and the
// browser run the same code.

import { scoreText } from "../../data/partner-tools.mjs";
import { facetOffer, facetTag, isLadder } from "./partner-facets.mjs";
import {
  CONCERN_TAGS,
  commentTags,
  TERM_FIELD,
} from "./partner-survey-qsf.mjs";
import { percentOf } from "./points.mjs";
import { bandFor, descending, ratingFor } from "./rubric-bands.mjs";
import { fillCriterion, matchRubricExport, nameKey } from "./rubric-export.mjs";
import { finalSurvey, TERMS } from "./term-label.mjs";

/** The concern questions every partner survey asks, by export tag. */
const CONCERNS = {
  flag: CONCERN_TAGS.flag,
  text: [CONCERN_TAGS.names, CONCERN_TAGS.comments, CONCERN_TAGS.other],
};

/**
 * The four surveys. `rubric` names the rubric CSV each one scores against;
 * `question` finds one criterion's question in the export (pulseQuestion or
 * facetQuestion). An end-of-term survey also names its `term`, which a
 * response's Term must not contradict; the pulse names its `neutral` answer
 * (neutralRating).
 */
export const SURVEYS = {
  ...Object.fromEntries(
    TERMS.map((term) => [
      finalSurvey(term),
      {
        concerns: CONCERNS,
        question: facetQuestion,
        rubric: term,
        term,
        title: `End-of-Term Survey, ${term}`,
      },
    ])
  ),
  pulse: {
    concerns: CONCERNS,
    neutral: "Neither agree nor disagree",
    question: pulseQuestion,
    rubric: "pulse",
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
 * The rating a partner picks to say neither yes nor no, which the Team
 * scores step flags for review: the pulse's `neutral`, or null for an
 * end-of-term survey, whose anchors, between choices, and ladder rungs have
 * none. Throws when a criterion of `rubric` lacks it, so a renamed rating
 * stops the run instead of flagging nothing.
 */
export function neutralRating(survey, rubric) {
  const { neutral = null } = SURVEYS[survey];
  if (neutral === null) {
    return null;
  }
  const missing = rubric.criteria
    .filter((criterion) => !criterion.ratings.some((r) => r.name === neutral))
    .map((criterion) => criterion.title);
  if (missing.length > 0) {
    throw new Error(
      `${missing.join(", ")} has no "${neutral}" rating, the answer the Team scores step flags for review. If the ${rubric.name} rubric renamed it, rename SURVEYS.pulse.neutral to match.`
    );
  }
  return neutral;
}

/**
 * A criterion's Comments cell: the instruction team's note for the whole
 * team first, then the criterion's comment, each part labeled and a blank
 * one left out. With no note it is the comment as it was, so a cell reads as
 * it did before the note existed.
 */
export function teamComment(note, comment) {
  const said = (note ?? "").trim();
  if (said === "") {
    return comment;
  }
  const { labels } = scoreText.teams;
  return [
    `${labels.note}: ${said}`,
    comment ? `${labels.comment}: ${comment}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Whether the export has a column with this export tag. */
const hasColumn = (columns, tag) =>
  columns.some((column) => column.tag === tag);

const asksAbout = (columns, rubric) =>
  rubric.criteria.every((criterion) => hasColumn(columns, facetTag(criterion)));

/**
 * What the responses' Term column says: `terms`, each value once, and
 * `blank`, the responses that carry none.
 */
function termValues(responses) {
  const blank = responses.filter((r) => (r[TERM_FIELD] ?? "") === "");
  const terms = [
    ...new Set(
      responses.map((r) => r[TERM_FIELD] ?? "").filter((t) => t !== "")
    ),
  ];
  return { blank, terms };
}

/**
 * Which survey a parsed export holds: `{ kind, reason }`. The pulse has a
 * column tagged by each statement (facetTag) and no Term column, since an
 * end-of-term survey may share a tag. An end-of-term export carries a Term column
 * naming one term, and a column tagged by each of that term's facets
 * (facetTag). `kind` is null when neither matches, and `reason` says why.
 */
export function detectSurvey({ columns, responses }, rubrics) {
  if (!hasColumn(columns, TERM_FIELD) && asksAbout(columns, rubrics.pulse)) {
    return { kind: "pulse", reason: "" };
  }
  if (!hasColumn(columns, TERM_FIELD)) {
    return {
      kind: null,
      reason: `no pulse questions and no ${TERM_FIELD} column`,
    };
  }
  const { terms } = termValues(responses);
  if (terms.length !== 1 || !TERMS.includes(terms[0])) {
    return {
      kind: null,
      reason: `${TERM_FIELD} holds ${terms.length === 0 ? "nothing" : terms.join(", ")}, not one of ${TERMS.join(", ")}`,
    };
  }
  const [term] = terms;
  const missing = rubrics[term].criteria
    .map(facetTag)
    .filter((tag) => !hasColumn(columns, tag));
  if (missing.length > 0) {
    return {
      kind: null,
      reason: `${TERM_FIELD} is ${term}, but there is no ${missing.join(", ")} column`,
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
 * A rated question's columns: `{ question, missing }`, `missing` naming
 * what the export lacks. A question is `{ criterion, column, choices,
 * custom, comments }`: `column` the one tagged `tag`, `choices` `{ label,
 * points }` with the labels the export carries, `custom` a ladder's
 * custom-scale choice or null, and `comments` its comment boxes' tags
 * (commentTags: `keep` and `comment`).
 */
function questionColumns(columns, criterion, { choices, custom, ladder, tag }) {
  const column = columns.find((c) => c.tag === tag);
  const missing = column ? [] : [`${criterion.title} (${tag})`];
  if (custom && !hasColumn(columns, custom.column)) {
    missing.push(`${criterion.title}'s custom scale (${custom.column})`);
  }
  const comments = commentTags(tag, { ladder });
  for (const commentTag of [comments.keep, comments.comment].filter(Boolean)) {
    if (!hasColumn(columns, commentTag)) {
      missing.push(`${criterion.title}'s comment (${commentTag})`);
    }
  }
  return {
    missing,
    question: { choices, column, comments, criterion, custom },
  };
}

/**
 * A pulse criterion's question: tagged by the criterion (facetTag), its
 * choices the criterion's ratings, highest first, as the generator lists
 * them.
 */
function pulseQuestion(columns, criterion) {
  return questionColumns(columns, criterion, {
    choices: descending(criterion).map((r) => ({
      label: r.name,
      points: r.points,
    })),
    custom: null,
    ladder: false,
    tag: facetTag(criterion),
  });
}

/**
 * An end-of-term facet's question: its choices those the generator offers
 * (facetOffer), and for a ladder the custom-scale choice, whose share is in
 * `custom.column`.
 */
function facetQuestion(columns, criterion, between) {
  const { choices, custom, tag } = facetOffer(criterion, between);
  return questionColumns(columns, criterion, {
    choices,
    custom,
    ladder: isLadder(criterion),
    tag,
  });
}

/** One question per criterion, or an Error naming every one missing. */
function surveyQuestions(columns, rubric, definition, between) {
  const found = rubric.criteria.map((criterion) =>
    definition.question(columns, criterion, between)
  );
  const missing = found.flatMap((f) => f.missing);
  const questions = found.map((f) => f.question);
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
 * A response's comment on one question, trimmed, as written: the box its
 * answer showed, `keep` at the first choice (the top answer) and `comment`
 * at any other, as the generator's display logic does; a ladder has only
 * `comment`. Text left in a box the answer then hid is ignored.
 * An empty box gives "", which clears the Comments cell, so a comment from
 * an earlier import never stays beside a new score.
 */
function commentOf(response, { choices, comments }, choice) {
  const tag =
    comments.keep && choice === choices[0] ? comments.keep : comments.comment;
  return (response[tag] ?? "").trim();
}

/**
 * One response's answer to one question, scored: label in, points out, the
 * rating named by bandFor, and the partner's comment. Throws on a label the
 * question does not offer.
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
  return {
    comment: commentOf(response, question, choice),
    points,
    rating: bandFor(criterion, points).name,
  };
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

/** Whether two scores are the same answer: the points and the comment. */
const sameAnswer = (a, b) => a.points === b.points && a.comment === b.comment;

/** Whether `points` is a score `criterion` can take: 0 to its maximum. */
export const pointsFit = (criterion, points) =>
  Number.isFinite(points) && points >= 0 && points <= criterion.maxPoints;

/**
 * The edit the Team scores step saves for one `cell` (teamCell): the
 * `points` and `comment` the instructor left, each null where it is the
 * answer's (`points` null keeps the answer's). Null when it changes
 * nothing, unless the cell is a neutral answer, whose kept edit is the
 * reviewed mark.
 */
export function editOf(cell, { comment, points }) {
  const { answered, neutral } = cell;
  const edit = {
    against: answered,
    comment: comment === answered.comment ? null : comment,
    points: points === null || points === answered.points ? null : points,
  };
  return edit.comment === null && edit.points === null && !neutral
    ? null
    : edit;
}

/**
 * One survey's overrides with one cell's `edit` set (null removes it) and
 * its team's `note`. A team left with no edit and no note is dropped.
 */
export function withEdit(overrides, { criterion, edit, note, team }) {
  const cells = { ...overrides[team]?.cells };
  if (edit) {
    cells[criterion] = edit;
  } else {
    delete cells[criterion];
  }
  const { [team]: _, ...rest } = overrides;
  return Object.keys(cells).length > 0 || note !== ""
    ? { ...rest, [team]: { cells, note } }
    : rest;
}

/**
 * The overrides the current inputs can apply, as a Map from team to `{
 * cells, note }`, and `unapplied`, each one they cannot: `{ team, criterion,
 * reason }`, `reason` "team" for a team not scored (`criterion` null),
 * "criterion" for one not in the rubric, "points" for points outside 0 to
 * the criterion's maximum.
 */
function sortOverrides(overrides, teams, questions) {
  const criteria = new Map(
    questions.map(({ criterion }) => [criterion.title, criterion])
  );
  const applied = new Map();
  const unapplied = [];
  for (const [team, { cells = {}, note = "" }] of Object.entries(overrides)) {
    if (!teams.has(team)) {
      unapplied.push({ criterion: null, reason: "team", team });
      continue;
    }
    const kept = {};
    for (const [title, edit] of Object.entries(cells)) {
      const criterion = criteria.get(title);
      const { points } = edit;
      if (!criterion) {
        unapplied.push({ criterion: title, reason: "criterion", team });
      } else if (points !== null && !pointsFit(criterion, points)) {
        unapplied.push({ criterion: title, reason: "points", team });
      } else {
        kept[title] = edit;
      }
    }
    applied.set(team, { cells: kept, note });
  }
  return { applied, unapplied };
}

/**
 * One criterion of one team: the `answered` score (`{ points, rating,
 * comment }`), the `final` score once `edit` is applied, and its review
 * state. `edit` is null or `{ against, points, comment }`: `against` the
 * answer it was made against, `points` and `comment` null where it keeps
 * the answer's. An edit's points are named by ratingFor, so points below
 * the lowest rating take its name. A cell needs `review` when it is a
 * `neutral` answer with no edit, or `stale`: its edit was made against
 * another answer. The edit still applies.
 */
function teamCell(criterion, answered, edit, neutral) {
  const points = edit?.points ?? answered.points;
  const final = {
    comment: edit?.comment ?? answered.comment,
    points,
    rating:
      points === answered.points
        ? answered.rating
        : ratingFor(criterion, points),
  };
  const stale = edit !== null && !sameAnswer(edit.against, answered);
  const isNeutral = neutral !== null && answered.rating === neutral;
  return {
    against: edit?.against ?? null,
    answered,
    criterion: criterion.title,
    edited: !sameAnswer(final, answered),
    final,
    neutral: isNeutral,
    review: stale || (isNeutral && edit === null),
    reviewed: edit !== null && !stale,
    stale,
  };
}

const byName = new Intl.Collator("en", { numeric: true });

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
 * `between`, the between-anchor shares (pageRules in partner-facets.mjs). `choices` maps a team to
 * the ResponseId that counts when the team sent more than one. `overrides`
 * holds the instructor's edits: `{ [team]: { note, cells: { [criterion
 * title]: edit } } }`, `note` the team note and `edit` as teamCell takes it.
 *
 * Returns `{ duplicates, pending, compare, ... }`. While any duplicate team
 * has no valid choice, `pending` is true and nothing is scored. Otherwise it
 * also returns `rows` (the rubric export's rows, filled), `editedColumns`
 * (for each row, the columns an override changed), `teams` (each scored
 * team by name: `{ team, responded, note, total, cells }`, `cells` from
 * teamCell, in rubric order), `teamCounts` (the cells to `review`, the cells
 * `edited`, and the team `notes`), `unapplied` (sortOverrides), `concerns`,
 * and `report`. Throws on
 * anything that must stop the run: a mismatched rubric
 * export, a missing question, an answer the survey does not offer, a
 * custom-scale share out of range, a Term that names another term.
 */
export function scorePartnerSurvey({
  aBound,
  between,
  choices = {},
  overrides = {},
  qualtrics,
  roster,
  rubric,
  rubricExport,
  survey,
}) {
  const definition = SURVEYS[survey];
  if (!definition) {
    throw new Error(`Unknown survey ${survey}.`);
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
  // An end-of-term response whose Term names another term stops the run; one
  // with a blank Term is reported and not scored.
  let blankTerm = [];
  if (definition.term) {
    if (!Array.isArray(between)) {
      throw new Error(
        "The between-anchor shares from the partner evaluation page are missing, so the end-of-term choices cannot be built."
      );
    }
    const { blank, terms } = termValues(responses);
    const other = terms.filter((term) => term !== definition.term);
    if (other.length > 0) {
      throw new Error(
        `The Qualtrics file's ${TERM_FIELD} column holds ${other.join(", ")}, but the survey picked is ${definition.title}. Pick the survey its ${TERM_FIELD} names.`
      );
    }
    blankTerm = blank;
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

  // Only responses from a roster group, with no blank Term, are scored or
  // need a choice; the rest are reported, and their concerns still reach
  // the concerns table.
  const rosterTeams = new Set(
    roster.map((student) => student.team).filter((team) => team !== "")
  );
  const responsesByTeam = byTeam(
    responses.filter(
      (response) =>
        rosterTeams.has(response.Team) && !blankTerm.includes(response)
    )
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
    ...questions.flatMap(({ column, comments, criterion, custom }) => [
      { label: criterion.title, tag: column.tag },
      ...(custom ? [{ label: custom.column, tag: custom.column }] : []),
      ...[comments.keep, comments.comment]
        .filter(Boolean)
        .map((tag) => ({ label: tag, tag })),
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

  const neutral = neutralRating(survey, rubric);
  const { applied, unapplied } = sortOverrides(
    overrides,
    teamScores,
    questions
  );
  const teams = [...teamScores.keys()].sort(byName.compare).map((team) => {
    const { cells = {}, note = "" } = applied.get(team) ?? {};
    const responded = responsesByTeam.has(team);
    const scored = questions.map(({ criterion }, i) =>
      teamCell(
        criterion,
        teamScores.get(team)[i],
        cells[criterion.title] ?? null,
        responded ? neutral : null
      )
    );
    const total = scored.reduce((sum, cell) => sum + cell.final.points, 0);
    return {
      cells: scored,
      note: note.trim(),
      responded,
      team,
      total: Math.round(total * 10_000) / 10_000,
    };
  });
  const teamsByName = new Map(teams.map((entry) => [entry.team, entry]));
  const allCells = teams.flatMap((entry) => entry.cells);
  const teamCounts = {
    edited: allCells.filter((cell) => cell.edited).length,
    notes: teams.filter((entry) => entry.note !== "").length,
    review: allCells.filter((cell) => cell.review).length,
  };

  const studentsById = new Map(roster.map((s) => [s.canvasUserId, s]));
  const noTeam = [];
  const editedColumns = [];
  const rows = rubricExport.students.map((student) => {
    const cells = [...student.cells];
    const changed = [];
    editedColumns.push(changed);
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
    const { note } = teamsByName.get(team);
    for (const [i, { criterion }] of questions.entries()) {
      const columnsAt = rubricExport.criteria.get(nameKey(criterion.title));
      const { answered, final } = teamsByName.get(team).cells[i];
      fillCriterion(cells, columnsAt, {
        ...final,
        comment: teamComment(note, final.comment),
      });
      if (final.rating !== answered.rating) {
        changed.push(columnsAt.Rating);
      }
      if (final.points !== answered.points) {
        changed.push(columnsAt.Points);
      }
      if (note !== "" || final.comment !== answered.comment) {
        changed.push(columnsAt.Comments);
      }
    }
    return cells;
  });

  const exportIds = new Set(rubricExport.students.map((s) => s.id));
  return {
    compare,
    concerns: concernRows(responses, concerns, concernTags),
    duplicates,
    editedColumns,
    pending,
    report: {
      blankTerm: blankTerm.map((r) => ({
        responseId: r.ResponseId,
        team: r.Team,
      })),
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
    teamCounts,
    teams,
    unapplied,
  };
}
