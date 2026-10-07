// The Score page's previews as tables, `{ header, rows }` (table-view.mjs):
// what the export holds, who stopped partway, how the rubric export matches
// the rubric, the report, and the self-versus-peer gaps. Pure: no DOM, no
// I/O.

import { gapRows, cell as show } from "./peer-outputs.mjs";

/** How many responses of each kind the export held, and what happens to each. */
export function responseCounts({ dropped, responses }, includePreviews) {
  return {
    header: ["Responses", "Count", "What happens"],
    rows: [
      ["Finished", responses.length, "Scored: the latest per student."],
      [
        "Earlier submissions",
        dropped.superseded,
        "Left out: a later one counts.",
      ],
      ["Unfinished", dropped.unfinished, "Left out."],
      [
        "Previews",
        dropped.preview,
        includePreviews ? "Counted (staff test)." : "Left out.",
      ],
    ].map(([kind, count, what]) => [kind, String(count), what]),
  };
}

/** Who started and never finished; `nameOf` maps an email to a roster name. */
export const stoppedTable = (stopped, nameOf) => ({
  header: ["Student", "Email", "Team", "Last question seen"],
  rows: stopped.map((r) => [
    nameOf.get(r.email) ?? "",
    r.email,
    r.team,
    r.lastSeen || "unknown",
  ]),
});

/** Each rubric criterion and the rubric export's columns it fills (matchRubricExport). */
export const criteriaTable = (rubricExport, pairs) => ({
  header: ["Rubric criterion", "Points", "Export columns"],
  rows: pairs.map(({ columnsAt, criterion }) => [
    criterion.title,
    String(criterion.maxPoints),
    ["Rating", "Points", "Comments"]
      .map((field) => rubricExport.header[columnsAt[field]])
      .join("; "),
  ]),
});

/** The report's kinds, in the order they are listed. */
export const REPORT_KINDS = {
  error: "Error: left out of the score",
  note: "Note: self share rescaled",
  review: "Review: the score stands",
  warning: "Warning",
};

/**
 * The scorer's problems (scorePeers), errors first, then the rubric
 * export's (fillPeerAssessment), as one table.
 */
export const reportTable = (problems, rubricProblems) => ({
  header: ["Kind", "Who", "What"],
  rows: [
    ...Object.entries(REPORT_KINDS).flatMap(([level, kind]) =>
      problems
        .filter((p) => p.level === level)
        .map((p) => [kind, p.who, p.message])
    ),
    ...rubricProblems.map((message) => ["Rubric export", "", message]),
  ],
});

/** Self versus peers, largest first (gapRows). */
export const gapsTable = (results) => ({
  header: ["Student", "Team", "Ratings gap", "Share gap"],
  rows: gapRows(results).map((row) => [
    row.name,
    row.team,
    String(show(row.ratings)),
    String(show(row.share)),
  ]),
});
