// The downloads made from the peer scores: what goes into the rubric
// assessment, the only thing students see, then the instructor's details,
// the self-versus-peer gaps, and the comments. Pure: no DOM, no I/O.

import { toCsv } from "./csv.mjs";
import {
  hasSplit,
  NON_COMPLETION_SCORE,
  peerCriteria,
  round,
  STATUS,
} from "./peer-score.mjs";
import { bandFor } from "./rubric-bands.mjs";
import {
  fillCriterion,
  matchRubricExport,
  nameKey,
  rubricExportCsv,
} from "./rubric-export.mjs";

/**
 * A result as rubric scores on the 0 to 100 scale, keyed by criterion name
 * (nameKey): each rated criterion, then the distribution when the survey has
 * one (`peer` from peerCriteria). A student who did not complete scores 50
 * on each; a student with nothing to score from is left to the instructor
 * (null).
 */
export function peerRubricScores(result, peer) {
  const { distribution, rated } = peer;
  const criteria = hasSplit(peer) ? [...rated, distribution] : rated;
  const keyed = (scores) =>
    new Map(
      criteria.map((criterion, i) => [nameKey(criterion.title), scores[i]])
    );
  if (result.status === STATUS.didNotComplete) {
    return {
      comment: `Survey not completed: scores ${NON_COMPLETION_SCORE}.`,
      scores: keyed(criteria.map(() => NON_COMPLETION_SCORE)),
    };
  }
  if (result.status !== STATUS.scored) {
    return null;
  }
  return {
    comment: null,
    scores: keyed(
      hasSplit(peer)
        ? [...result.criterionScores, result.distribution.score]
        : result.criterionScores
    ),
  };
}

/**
 * The rating a points value is named after (bandFor: the highest at or
 * below it). Points outside the bands are named after the nearest band: a
 * distribution above 20 points is the top band, and a non-completer's 10 on
 * the distribution is the lowest. The points written stay exact.
 */
export function ratingFor(criterion, points) {
  const lowest = Math.min(...criterion.ratings.map((r) => r.points));
  const named = Math.min(Math.max(points, lowest), criterion.maxPoints);
  return bandFor(criterion, named).name;
}

/**
 * Writes one result's rubric scores into a row's cells, in place: each
 * criterion gets its score times its points over 100, to two decimals, and
 * the rating ratingFor names; a non-completer's note goes on the first
 * criterion. Returns false, leaving the row, when the result has no score.
 */
function fillRow(out, result, { pairs, peer }) {
  const filled = peerRubricScores(result, peer);
  if (!filled) {
    return false;
  }
  for (const [i, { columnsAt, criterion }] of pairs.entries()) {
    const score = filled.scores.get(nameKey(criterion.title));
    const points = round((score * criterion.maxPoints) / 100);
    fillCriterion(out, columnsAt, {
      comment: i === 0 ? filled.comment : null,
      points,
      rating: ratingFor(criterion, points),
    });
  }
  return true;
}

/**
 * Fills the rubric export (parseRubricExport) from the scored results, each
 * criterion matched by name (fillRow). A student with no score, or not on a
 * scored team, keeps the exported row. Students added from another section
 * (`otherSection`, peer-roster.mjs) are not in this course's export: they
 * are filled into rows of their own under the same header, Student Id left
 * empty, as `otherSections` (null when there are none), for whoever grades
 * their section. Returns `{ csv, otherSections, problems }`, `problems`
 * naming each row left as exported and every result with no exported row.
 * `instrument` is "regular" or "catme".
 */
export function fillPeerAssessment({
  instrument,
  rubricExport,
  rubric,
  results,
}) {
  const context = {
    pairs: matchRubricExport(rubricExport, rubric),
    peer: peerCriteria(rubric, instrument),
  };
  const own = results.filter((result) => !result.student.otherSection);
  const others = results.filter((result) => result.student.otherSection);
  const byId = new Map(
    own.map((result) => [String(result.student.canvasUserId), result])
  );
  const problems = [];
  const used = new Set();
  const rows = rubricExport.students.map(({ cells, id, name }) => {
    const out = [...cells];
    const result = byId.get(id);
    if (!result) {
      problems.push(
        `${name || id}: in the rubric export but on no scored team of the roster. Row left as exported.`
      );
      return out;
    }
    used.add(id);
    if (!fillRow(out, result, context)) {
      problems.push(`${name}: no score. Row left as exported; grade by hand.`);
    }
    return out;
  });
  for (const result of own) {
    if (!used.has(String(result.student.canvasUserId))) {
      problems.push(
        `${result.student.name}: scored but not in the rubric export (Canvas user ID "${result.student.canvasUserId}").`
      );
    }
  }
  const nameAt = rubricExport.header
    .map((column) => column.trim())
    .indexOf("Student Name");
  const otherRows = others.map((result) => {
    const out = rubricExport.header.map(() => "");
    out[nameAt] = result.student.name;
    if (!fillRow(out, result, context)) {
      problems.push(
        `${result.student.name} (another section): no score. Grade by hand.`
      );
    }
    return out;
  });
  return {
    csv: rubricExportCsv(rubricExport.header, rows),
    otherSections:
      others.length > 0
        ? rubricExportCsv(rubricExport.header, otherRows)
        : null,
    problems,
  };
}

/** Columns that exist only on a survey with a split (hasSplit). */
const splitOnly = (peer) => (make) => (hasSplit(peer) ? make() : []);

/** A number for a table or a CSV: two decimals by default, empty when absent. */
export const cell = (value, places = 2) =>
  value === null || value === undefined ? "" : round(value, places);

/**
 * Everything the scorer computed, one row per student, for the instructor.
 * `peer` is peerCriteria's; the split's columns appear only with a split.
 */
export function detailsCsv(results, peer) {
  const { rated } = peer;
  const split = splitOnly(peer);
  const names = rated.map(({ title }) => title);
  const header = [
    "Student Name",
    "Email",
    "Canvas user ID",
    "Team",
    "N",
    "Status",
    "Peer score",
    "Raters",
    ...names.map((name) => `${name}: mean`),
    ...names.map((name) => `${name}: score`),
    ...split(() => [
      "Mean share received",
      "Normalized share",
      "Clamped",
      "Multiplier",
      "Distribution score",
    ]),
    "Gap: ratings",
    ...split(() => ["Gap: share"]),
  ];
  const rows = results.map((result) => [
    result.student.name,
    result.student.email,
    result.student.canvasUserId,
    result.team,
    result.teamSize,
    result.status,
    cell(result.total),
    result.raters,
    ...result.means.map((m) => cell(m)),
    ...result.criterionScores.map((s) => cell(s)),
    ...split(() => [
      cell(result.meanShare),
      cell(result.distribution?.normalized),
      cell(result.distribution?.clamped),
      cell(result.distribution?.multiplier, 4),
      cell(result.distribution?.score),
    ]),
    cell(result.gap?.ratings),
    ...split(() => [cell(result.gap?.share)]),
  ]);
  return toCsv([header, ...rows]);
}

/**
 * Self versus peers, largest first: the self rating's mean over the rated
 * criteria minus the mean received (on the 1 to 5 scale), and the raw self
 * share, before any rescale, minus the mean share received, normalized for
 * team size (times N, divided by 5). It queues a look; it never changes a
 * score. A student is listed whenever both sides of the ratings gap exist;
 * the share gap is null on a survey without a split, or when the student's
 * own split or every share they received was left out.
 */
export function gapRows(results) {
  return results
    .filter((result) => result.gap !== null)
    .map((result) => ({
      name: result.student.name,
      ratings: result.gap.ratings,
      share: result.gap.share,
      team: result.team,
    }))
    .sort((a, b) => b.ratings - a.ratings || (b.share ?? 0) - (a.share ?? 0));
}

/** The comments, instructor only: never in the rubric assessment. */
export function commentsCsv(comments) {
  return toCsv([
    ["Team", "Rater", "About", "Question", "Comment"],
    ...comments.map((c) => [c.team, c.rater, c.ratee, c.question, c.text]),
  ]);
}
