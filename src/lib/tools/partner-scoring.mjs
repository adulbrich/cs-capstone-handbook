// Scores the project partner surveys (#445) against the rules on
// src/content/docs/assignments/project-partner-evaluation.mdx. Every rating
// name and point value comes from the rubric CSVs under
// canvas/assignments/project-partner-evaluation/, parsed by
// src/lib/rubric-csv.mjs; the lower bound of an A comes from
// src/content/docs/learning-objectives/grading.mdx. The caller loads those
// files; this module is pure, so node --test and the browser run the same code.

import { nameKey } from "./rubric-export.mjs";

/** The midterm pulse's concern questions, by export tag, from its .qsf. */
const PULSE_CONCERNS = { flag: "Q2", text: ["Q2 Names", "Q2 Comments", "Q3"] };

/**
 * The four surveys. `rubric` names the rubric CSV each one scores against.
 * End-of-term scoring waits for the end-of-term export's header (#445), so
 * those three are detected and named but not scored.
 */
export const SURVEYS = {
  "final-fall": {
    rubric: "fall",
    supported: false,
    title: "End-of-Term Survey, fall",
  },
  "final-spring": {
    rubric: "spring",
    supported: false,
    title: "End-of-Term Survey, spring",
  },
  "final-winter": {
    rubric: "winter",
    supported: false,
    title: "End-of-Term Survey, winter",
  },
  pulse: {
    concerns: PULSE_CONCERNS,
    rubric: "pulse",
    supported: true,
    title: "Midterm Pulse",
  },
};

/** The surveys in the order a term runs them. */
export const SURVEY_ORDER = [
  "pulse",
  "final-fall",
  "final-winter",
  "final-spring",
];

/**
 * The end-of-term facet levels, in percent of the facet's points, as the
 * partner evaluation page states them: the three anchors at 100, 80, and 50,
 * and 90 or 70 between two anchors.
 */
export const ANCHOR_PERCENTS = [100, 90, 80, 70, 50];

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

/** `percent` of `points`, multiplied before dividing: 70% of 5 is 3.5. */
export function percentOf(points, percent) {
  return Math.round(points * percent * 100) / 10_000;
}

/**
 * The rating whose range contains `points`. With Criteria Enable Range on,
 * Canvas reads each rating as running from its own points down to, but not
 * including, the next lower rating's points ("25 to >22.5 pts"), and the
 * lowest rating down to 0.
 */
export function bandFor(criterion, points) {
  if (points < 0 || points > criterion.maxPoints) {
    throw new Error(
      `${points} is outside ${criterion.title}'s 0 to ${criterion.maxPoints} points.`
    );
  }
  const ascending = [...criterion.ratings].sort((a, b) => a.points - b.points);
  return ascending.find((rating) => rating.points >= points);
}

/** A criterion with three ratings is an end-of-term anchor facet. */
const isAnchorFacet = (criterion) => criterion.ratings.length === 3;

/**
 * Every level a partner can score on one criterion: `{ points, rating }`,
 * plus `percent` for an end-of-term anchor facet. An anchor facet scores at
 * each of ANCHOR_PERCENTS, rated at the anchor whose range holds it; any
 * other criterion (the pulse's five answers, the spring ladder's six rungs)
 * scores at its own ratings, by name.
 */
export function levelsFor(criterion) {
  if (!isAnchorFacet(criterion)) {
    return criterion.ratings.map((rating) => ({
      points: rating.points,
      rating: rating.name,
    }));
  }
  return ANCHOR_PERCENTS.map((percent) => {
    const points = percentOf(criterion.maxPoints, percent);
    return { percent, points, rating: bandFor(criterion, points).name };
  });
}

/**
 * The no-response score for one criterion: the lower bound of an A, as a
 * share of the rubric's 100 points, times the criterion's maximum, rated at
 * the band that contains it.
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

const asksAbout = (columns, rubric) =>
  rubric.criteria.every((criterion) => columnFor(columns, criterion));

/**
 * Which survey the export holds, from its question text: `{ kind, guessed }`.
 * The pulse names its four statements; an end-of-term export names the six
 * facets, and the term is `term` (the current one) until the user corrects
 * it, since fall and winter ask the same questions. `kind` is null when
 * neither matches.
 */
export function detectSurvey(columns, rubrics, term) {
  if (asksAbout(columns, rubrics.pulse)) {
    return { guessed: false, kind: "pulse" };
  }
  if (asksAbout(columns, rubrics.fall)) {
    return { guessed: true, kind: `final-${term}` };
  }
  return { guessed: false, kind: null };
}

/** Comparing two responses from one team: the columns worth reading. */
const COMPARE_TAGS = [
  "ResponseId",
  "RecordedDate",
  "RecipientFirstName",
  "RecipientLastName",
  "RecipientEmail",
];

/** Matches the rubric export's criteria to the rubric's, both ways. */
function checkExportCriteria(rubric, exportCriteria) {
  const rubricKeys = new Set(rubric.criteria.map((c) => nameKey(c.title)));
  const extra = [...exportCriteria.values()]
    .filter((entry) => !rubricKeys.has(nameKey(entry.name)))
    .map((entry) => entry.name);
  const missing = rubric.criteria
    .filter((c) => !exportCriteria.has(nameKey(c.title)))
    .map((c) => c.title);
  if (extra.length > 0 || missing.length > 0) {
    throw new Error(
      [
        `The rubric export does not match the ${rubric.name} rubric.`,
        missing.length > 0 ? `Missing: ${missing.join(", ")}.` : "",
        extra.length > 0 ? `Not in the rubric: ${extra.join(", ")}.` : "",
        "Export the rubric assessments of the assignment this survey grades.",
      ]
        .filter(Boolean)
        .join(" ")
    );
  }
}

/** The question columns, one per criterion, or an Error naming the gaps. */
function questionColumns(columns, rubric) {
  const missing = [];
  const map = rubric.criteria.map((criterion) => {
    const column = columnFor(columns, criterion);
    if (!column) {
      missing.push(criterion.title);
    }
    return { column, criterion };
  });
  if (missing.length > 0) {
    throw new Error(
      `No single question in the Qualtrics file asks about ${missing.join(", ")}. Is this the right survey?`
    );
  }
  return map;
}

/** One response's answer to one criterion, scored, or an Error. */
function scoreAnswer(response, { column, criterion }) {
  const answer = response[column.tag];
  const rating = criterion.ratings.find(
    (r) => nameKey(r.name) === nameKey(answer)
  );
  if (!rating) {
    const said = answer === "" ? "No answer" : `The answer "${answer}"`;
    throw new Error(
      `${said} to ${column.tag} ("${column.text}") from team ${response.Team || "(no team)"}, response ${response.ResponseId}, is not a rating of ${criterion.title}. The rubric names: ${criterion.ratings.map((r) => r.name).join(", ")}. Nothing was scored.`
    );
  }
  return { comment: null, points: rating.points, rating: rating.name };
}

/** Whether the export has a column with this export tag. */
const hasColumn = (columns, tag) =>
  columns.some((column) => column.tag === tag);

/** The concerns rows: every finished response that raised something. */
function concernRows(columns, responses, concerns) {
  const tags = [concerns.flag, ...concerns.text];
  const absent = tags.filter((tag) => !hasColumn(columns, tag));
  if (absent.length > 0) {
    throw new Error(
      `The Qualtrics file has no ${absent.join(", ")} column for the concerns table.`
    );
  }
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
 * parseRubricCsv, `aBound` from aLowerBound. `choices` maps a team to the
 * ResponseId that counts when the team sent more than one.
 *
 * Returns `{ duplicates, pending, compare, ... }`. While any duplicate team
 * has no valid choice, `pending` is true and nothing is scored. Otherwise it
 * also returns `rows` (the rubric export's rows, filled), `concerns`, and
 * `report`. Throws on anything that must stop the run: a mismatched rubric
 * export, a missing question, an answer the rubric does not name.
 */
export function scorePartnerSurvey({
  aBound,
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
  checkExportCriteria(rubric, rubricExport.criteria);
  const questions = questionColumns(columns, rubric);

  // Only responses from a roster group are scored or need a choice; the rest
  // are reported, and their concerns still reach the concerns table.
  const rosterTeams = new Set(
    roster.map((student) => student.team).filter((team) => team !== "")
  );
  const responsesByTeam = byTeam(
    responses.filter((response) => rosterTeams.has(response.Team))
  );
  const duplicates = [...responsesByTeam]
    .filter(([, list]) => list.length > 1)
    .map(([team, list]) => ({
      chosen: list.some((r) => r.ResponseId === choices[team])
        ? choices[team]
        : null,
      responses: list,
      team,
    }));
  const compare = [
    ...COMPARE_TAGS.filter((tag) => hasColumn(columns, tag)).map((tag) => ({
      label: tag,
      tag,
    })),
    ...questions.map(({ column, criterion }) => ({
      label: criterion.title,
      tag: column.tag,
    })),
    ...[definition.concerns.flag, ...definition.concerns.text]
      .filter((tag) => hasColumn(columns, tag))
      .map((tag) => ({ label: tag, tag })),
  ];
  const pending = duplicates.some((d) => d.chosen === null);
  if (pending) {
    return { compare, duplicates, pending };
  }

  const teamScores = new Map();
  for (const [team, list] of responsesByTeam) {
    const counted =
      list.length > 1
        ? list.find((r) => r.ResponseId === choices[team])
        : list[0];
    teamScores.set(
      team,
      questions.map((question) => scoreAnswer(counted, question))
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
      const at = rubricExport.criteria.get(nameKey(criterion.title));
      const score = teamScores.get(team)[i];
      cells[at.Rating] = score.rating;
      cells[at.Points] = String(score.points);
      if (score.comment !== null) {
        cells[at.Comments] = score.comment;
      }
    }
    return cells;
  });

  const exportIds = new Set(rubricExport.students.map((s) => s.id));
  return {
    compare,
    concerns: concernRows(columns, responses, definition.concerns),
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
