// Reads the peer evaluation's Qualtrics labels export into responses, each
// with its looped ratings in long form, and keeps the latest per student.
// The file itself (header rows, values exports, Finished, previews) is
// qualtrics-export.mjs; this module is the peer survey's shape on top of it.
// Which responses score what is peer-score.mjs. Pure: no DOM, no I/O.

import { criteria } from "../../data/peer-evaluation.mjs";
import { SLOTS } from "./peer-contacts.mjs";
import {
  emailIn,
  mapColumns,
  readNumber,
  readRating,
  rosterChoiceOf,
  SURVEY_TYPE,
} from "./peer-export-columns.mjs";
import { parseQualtricsExport } from "./qualtrics-export.mjs";

/** One response, keyed by tag, as the scorer reads it. */
function reshape(map, row, index) {
  const at = (tag) => (tag ? (row[tag] ?? "") : "");
  const fixed = (key) => at(map.fixed[key]);
  const members = Array.from({ length: SLOTS }, (_, slot) =>
    emailIn(at(map.members[slot + 1]))
  );
  const filledSlots = members.flatMap((email, slot) =>
    email === "" ? [] : [slot + 1]
  );

  const iterations = [];
  for (const [prefix, columns] of Object.entries(map.loop)) {
    const ratings = criteria.map((_, r) => readRating(at(columns.ratings[r])));
    const comment = at(columns.comment);
    const rateeAnswer = columns.ratee === "" ? null : at(columns.ratee);
    if (ratings.every((r) => r === null) && comment === "" && !rateeAnswer) {
      continue;
    }
    iterations.push({
      choice: rosterChoiceOf(Number(prefix), filledSlots),
      comment,
      prefix: Number(prefix),
      rateeAnswer,
      ratings,
    });
  }
  iterations.sort((a, b) => a.prefix - b.prefix);

  const shares = new Map();
  for (const [choice, tag] of Object.entries(map.split)) {
    const points = readNumber(at(tag));
    if (points !== null) {
      shares.set(Number(choice), points);
    }
  }

  return {
    email: fixed("email").toLowerCase(),
    iterations,
    lastSeen: fixed("lastSeen"),
    members,
    open: Object.fromEntries(
      Object.keys(map.open).map((tag) => [tag, at(tag)])
    ),
    recordedDate: fixed("recordedDate"),
    responseId: fixed("responseId"),
    row: index + 1,
    selfFloor: readNumber(fixed("selfFloor")),
    shares,
    team: fixed("team"),
    teamSize: readNumber(fixed("teamSize")),
  };
}

/** Qualtrics' RecordedDate, which sorts as text. */
const RECORDED_DATE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

/**
 * Stops when a RecordedDate is not "YYYY-MM-DD HH:MM:SS": the latest
 * response per student is picked by comparing them as text, which only
 * works in that format. A spreadsheet that re-saved the file rewrites them.
 */
function checkRecordedDates(responses) {
  const bad = responses.filter((r) => !RECORDED_DATE.test(r.recordedDate));
  if (bad.length > 0) {
    throw new Error(
      `RecordedDate "${bad[0].recordedDate}" (response ${bad[0].responseId || bad[0].row}${bad.length > 1 ? ` and ${bad.length - 1} more` : ""}) is not "YYYY-MM-DD HH:MM:SS". Export the responses again from Qualtrics and drop that file here; do not open and re-save it in Excel.`
    );
  }
}

/**
 * The latest response per RecipientEmail by RecordedDate
 * ("YYYY-MM-DD HH:MM:SS" sorts as text; a tie keeps the later row). Returns
 * `{ kept, superseded }`.
 */
export function latestPerStudent(responses) {
  const latest = new Map();
  let superseded = 0;
  for (const response of responses) {
    const current = latest.get(response.email);
    if (current) {
      superseded += 1;
    }
    if (!current || response.recordedDate >= current.recordedDate) {
      latest.set(response.email, response);
    }
  }
  return { kept: [...latest.values()], superseded };
}

/**
 * Parses the export text. Returns `{ type, problems, warnings, responses,
 * dropped, stopped }`. `type` is one of SURVEY_TYPE;
 * `responses` (the latest finished response per student) is empty unless it
 * is "regular" with no `problems` (header errors). `dropped` counts previews,
 * unfinished, and superseded responses; `stopped` lists who started and
 * never finished, by their latest attempt. Throws what parseQualtricsExport
 * throws: a values export, missing header rows, no finished response.
 *
 * Each response: `{ row, responseId, email, recordedDate, lastSeen, team,
 * teamSize, selfFloor, members, iterations, shares, open }`.
 * `members[slot - 1]` is the email in Team Member `slot`, or "".
 * `iterations` are the looped pages with any answer: `{ prefix, choice,
 * rateeAnswer, ratings, comment }`, `rateeAnswer` being the hidden
 * question's text, or null when the export has no Ratee column. `shares`
 * maps roster choice to the points given. `open` maps the open question
 * tags to text.
 */
export function parsePeerExport(text, { includePreviews = false } = {}) {
  const parsed = parseQualtricsExport(text, { includePreviews });
  const map = mapColumns(parsed.columns);
  const dropped = { ...parsed.dropped, superseded: 0 };
  const result = {
    dropped,
    problems: map.problems,
    responses: [],
    stopped: [],
    type: map.type,
    warnings: map.warnings,
  };
  if (map.type !== SURVEY_TYPE.regular || map.problems.length > 0) {
    return result;
  }
  const finishedRows = parsed.responses.map((row, i) => reshape(map, row, i));
  checkRecordedDates(finishedRows);
  const { kept, superseded } = latestPerStudent(finishedRows);
  dropped.superseded = superseded;
  const finished = new Set(kept.map((response) => response.email));
  result.responses = kept;
  result.stopped = latestPerStudent(
    parsed.unfinished.map((row, i) => reshape(map, row, i))
  ).kept.filter((response) => !finished.has(response.email));
  return result;
}
