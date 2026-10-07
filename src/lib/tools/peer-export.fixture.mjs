// Invented peer evaluation exports for the tests, shaped as Qualtrics
// exports the generated survey: three header rows (export tag, question
// text, ImportId), loop columns prefixed by roster choice, the split per
// carried-forward choice, then the embedded data. The QIDs are read from the
// generator, so a change to the survey shows up here. Every name and email
// is invented.

import { readFileSync } from "node:fs";
import { catmeTags, variants } from "../../data/peer-evaluation.mjs";
import { parseRubricCsv } from "../rubric-csv.mjs";
import { toCsv } from "./csv.mjs";
import { memberLabel, SLOTS, selfFloor } from "./peer-contacts.mjs";
import { buildPeerSurvey, ratedCriteria } from "./peer-survey-qsf.mjs";

const readRubric = (file) => {
  const path = `canvas/assignments/peer-evaluation/${file}`;
  return parseRubricCsv(
    readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8"),
    path
  );
};

/** The regular peer evaluation rubric, parsed as the page parses it. */
export const rubric = readRubric("peer-evaluation-rubric.csv");
/** The CATME rubric, parsed as the page parses it. */
export const catmeRubric = readRubric("catme-rubric.csv");
/** Both, keyed by instrument, as parsePeerExport takes them. */
export const rubrics = { catme: catmeRubric, regular: rubric };

const CHOICES = SLOTS + 1;
const prefixes = Array.from({ length: CHOICES }, (_, i) => `${i + 1}_`);

/**
 * One question's export columns, `[tag, text, importId]`, as Qualtrics
 * writes them: a matrix row each, a multi-answer choice each, a split
 * choice each (carried forward, `x` IDs), a text answer as `_TEXT`.
 */
function questionColumns(q, prefix = "") {
  const tag = prefix + q.DataExportTag;
  const id = prefix + q.QuestionID;
  switch (q.QuestionType) {
    case "Matrix":
      return q.ChoiceOrder.map((row) => [`${tag}_${row}`, tag, `${id}_${row}`]);
    case "CS":
      return prefixes.map((_, c) => [
        `${tag}_x${c + 1}`,
        tag,
        `${id}_x${c + 1}`,
      ]);
    case "MC":
      return q.Selector === "MAVR"
        ? q.ChoiceOrder.map((c) => [`${tag}_${c}`, tag, `${id}_${c}`])
        : [[tag, tag, id]];
    case "TE":
      return [[tag, tag, `${id}_TEXT`]];
    default:
      return [];
  }
}

/**
 * The export's columns for the survey the generator builds for `variant`,
 * each `[tag, text, importId]`: the metadata, then each question in survey
 * order, the looped block's once per roster choice behind its `N_` prefix,
 * then the embedded data. A contract test: the scorer reads what the
 * generated survey exports.
 */
function columns(variant, { ratee = true } = {}) {
  const survey = buildPeerSurvey({
    now: new Date(0),
    rubric: rubrics[variants[variant].instrument],
    seed: 1,
    variant,
  });
  const element = (name) =>
    survey.SurveyElements.find((e) => e.Element === name).Payload;
  const looped = new Set(
    element("BL")
      .filter((block) => block.Options?.Looping)
      .flatMap((block) => block.BlockElements.map((e) => e.QuestionID))
  );
  const questions = survey.SurveyElements.filter((e) => e.Element === "SQ").map(
    (e) => e.Payload
  );
  const cols = [
    ["StartDate", "Start Date", "startDate"],
    ["Status", "Response Type", "status"],
    ["Finished", "Finished", "finished"],
    ["RecordedDate", "Recorded Date", "recordedDate"],
    ["ResponseId", "Response ID", "_recordId"],
    ["RecipientEmail", "Recipient Email", "recipientEmail"],
    ["Last Seen Question IDs", "Last Seen Question IDs", "LastSeenQuestions"],
    ...questions
      .filter((q) => !looped.has(q.QuestionID))
      .flatMap((q) => questionColumns(q)),
    ...prefixes.flatMap((prefix) =>
      questions
        .filter((q) => looped.has(q.QuestionID))
        .filter((q) => ratee || q.DataExportTag !== "Ratee")
        .flatMap((q) => questionColumns(q, prefix))
    ),
    ...element("FL").Flow[0].EmbeddedData.map(({ Field: name }) => [
      name,
      name,
      name,
    ]),
  ];
  return cols;
}

/** Where each rated criterion's answer goes, and its anchors, per variant. */
function ratingsOf(variant) {
  const { instrument } = variants[variant];
  const rated = ratedCriteria(rubrics[instrument]);
  return rated.map((criterion, r) => ({
    anchors: criterion.anchors,
    tag: (prefix) =>
      instrument === "catme"
        ? `${prefix}_${catmeTags[criterion.title]}`
        : `${prefix}_Rating_${r + 1}`,
  }));
}

/** A timestamp in Qualtrics' format, `minute` minutes after a fixed start. */
export const stamp = (minute) =>
  `1999-01-01 10:${String(minute).padStart(2, "0")}:00`;

/** A rating as the export writes it: the value, or its choice text. */
const ratingCell = (value, anchors, labels) =>
  labels && value ? `${value}: ${anchors[value - 1]}` : (value ?? "");

const finishedCell = (finished, labels) => {
  if (labels) {
    return finished ? "True" : "False";
  }
  return finished ? 1 : 0;
};

/** One response's cells, by tag. */
function cellsOf(r, i, labels, ratings) {
  const values = {
    Finished: finishedCell(r.finished, labels),
    RecipientEmail: r.email,
    RecordedDate: r.recordedDate ?? stamp(i),
    ResponseId: `R_${i + 1}`,
    SelfFloor: r.selfFloor ?? "",
    Status: r.status ?? (labels ? "IP Address" : 0),
    Team: r.team,
    TeamSize: r.teamSize ?? "",
    ...r.open,
  };
  for (let slot = 1; slot <= SLOTS; slot += 1) {
    values[`Team Member ${slot}`] = r.members?.[slot - 1] ?? "";
  }
  for (const [prefix, page] of Object.entries(r.pages ?? {})) {
    values[`${prefix}_Ratee`] = page.ratee ?? "";
    values[`${prefix}_Comment`] = page.comment ?? "";
    for (const [c, { anchors, tag }] of ratings.entries()) {
      values[tag(prefix)] = ratingCell(page.ratings?.[c], anchors, labels);
    }
  }
  for (const [choice, points] of Object.entries(r.split ?? {})) {
    values[`Split_x${choice}`] = points;
  }
  return values;
}

/**
 * A labels export from response objects: `{ email, team, teamSize,
 * selfFloor, members: [label per slot], finished, status, recordedDate,
 * pages: { prefix: { ratee, ratings, comment } }, split: { choice: points },
 * open }`, for the survey the generator builds for `variant` ("midterm" by
 * default, or "catme"). `labels: false` writes a values export instead,
 * which the tools refuse; `ratee: false` drops the Ratee columns.
 */
export function exportCsv(
  responses,
  { labels = true, ratee = true, variant = "midterm" } = {}
) {
  const cols = columns(variant, { ratee });
  const ratings = ratingsOf(variant);
  const header = [
    cols.map(([tag]) => tag),
    cols.map(([, text]) => text),
    cols.map(([, , id]) => JSON.stringify({ ImportId: id })),
  ];
  const rows = responses.map((r, i) =>
    cols.map(([tag]) => cellsOf(r, i, labels, ratings)[tag] ?? "")
  );
  return toCsv([...header, ...rows]);
}

const ROSTER_HEADER = [
  "name",
  "canvas_user_id",
  "user_id",
  "login_id",
  "sections",
  "group_name",
  "canvas_group_id",
  "group_id",
];

/** `size` invented people on `team`: `{ first, last, email, id }`. */
export function people(team, size, firstId = 1) {
  return Array.from({ length: size }, (_, i) => ({
    email: `${team.toLowerCase()}${i + 1}@example.edu`,
    first: team,
    id: String(firstId + i),
    last: `Tester${i + 1}`,
  }));
}

/** The Canvas roster with groups for invented teams: `{ team: people }`. */
export function rosterCsv(teams) {
  const rows = Object.entries(teams).flatMap(([team, members]) =>
    members.map((p) => [
      `${p.last}, ${p.first}`,
      p.id,
      p.id,
      p.email,
      "CS 461 001",
      team,
      "1",
      "1",
    ])
  );
  return toCsv([ROSTER_HEADER, ...rows]);
}

/**
 * The responses a whole team would send. `ratings[r][e]` is what member r
 * gave member e (one value per rated criterion; a number repeats);
 * `split[r]` is member r's points, by member, left out for CATME. Members
 * in `skip` send nothing. Each respondent's
 * Team Member slots list the others in roster order, as the contact list
 * does.
 */
export function teamResponses(team, members, { ratings, skip = [], split }) {
  // Enough repeats for either rubric; the export writes as many as it rates.
  const repeat = (value) => Array.from({ length: 5 }, () => value);
  const n = members.length;
  return members.flatMap((rater, r) => {
    if (skip.includes(r)) {
      return [];
    }
    const others = members.filter((_, i) => i !== r);
    const order = [r, ...members.map((_, i) => i).filter((i) => i !== r)];
    const pages = {};
    const shares = {};
    for (const [position, e] of order.entries()) {
      const given = ratings[r][e];
      pages[position + 1] = {
        ratee: position === 0 ? rater.email : memberLabel(members[e]),
        ratings: Array.isArray(given) ? given : repeat(given),
      };
      if (split) {
        shares[position + 1] = split[r][e];
      }
    }
    return [
      {
        email: rater.email,
        finished: true,
        members: others.map(memberLabel),
        pages,
        selfFloor: selfFloor(n),
        split: shares,
        team,
        teamSize: n,
      },
    ];
  });
}
