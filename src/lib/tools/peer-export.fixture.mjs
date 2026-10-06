// Invented peer evaluation exports for the tests, shaped as Qualtrics
// exports the generated survey: three header rows (export tag, question
// text, ImportId), loop columns prefixed by roster choice, the split per
// carried-forward choice, then the embedded data. The QIDs are read from the
// generator, so a change to the survey shows up here. Every name and email
// is invented.

import { anchors } from "../../data/peer-evaluation.mjs";
import { toCsv } from "./csv.mjs";
import { memberLabel, SLOTS, selfFloor } from "./peer-contacts.mjs";
import { buildPeerSurvey } from "./peer-survey-qsf.mjs";

const qids = Object.fromEntries(
  buildPeerSurvey({ now: new Date(0), seed: 1 })
    .SurveyElements.filter((element) => element.Element === "SQ")
    .map(({ Payload }) => [Payload.DataExportTag, Payload.QuestionID])
);

const CHOICES = SLOTS + 1;

/** The columns, each `[tag, text, importId]`, in Qualtrics' order. */
function columns({ ratee = true } = {}) {
  const cols = [
    ["StartDate", "Start Date", "startDate"],
    ["Status", "Response Type", "status"],
    ["Finished", "Finished", "finished"],
    ["RecordedDate", "Recorded Date", "recordedDate"],
    ["ResponseId", "Response ID", "_recordId"],
    ["RecipientEmail", "Recipient Email", "recipientEmail"],
    ["Last Seen Question IDs", "Last Seen Question IDs", "LastSeenQuestions"],
  ];
  for (let choice = 1; choice <= CHOICES; choice += 1) {
    cols.push([`Roster_${choice}`, "Roster", `${qids.Roster}_${choice}`]);
  }
  for (let n = 1; n <= CHOICES; n += 1) {
    if (ratee) {
      cols.push([`${n}_Ratee`, "Ratee", `${n}_${qids.Ratee}_TEXT`]);
    }
    for (let row = 1; row <= 4; row += 1) {
      cols.push([`${n}_Rating_${row}`, "Rating", `${n}_${qids.Rating}_${row}`]);
    }
    cols.push([`${n}_Comment`, "Comment", `${n}_${qids.Comment}_TEXT`]);
  }
  for (let choice = 1; choice <= CHOICES; choice += 1) {
    cols.push([`Split_x${choice}`, "Split", `${qids.Split}_x${choice}`]);
  }
  for (const tag of ["Allocations", "Overall", "Closing"]) {
    cols.push([tag, tag, `${qids[tag]}_TEXT`]);
  }
  for (const name of ["Team", "TeamSize", "SelfFloor"]) {
    cols.push([name, name, name]);
  }
  for (let slot = 1; slot <= SLOTS; slot += 1) {
    const name = `Team Member ${slot}`;
    cols.push([name, name, name]);
  }
  return cols;
}

/** A timestamp in Qualtrics' format, `minute` minutes after a fixed start. */
export const stamp = (minute) =>
  `1999-01-01 10:${String(minute).padStart(2, "0")}:00`;

/** A rating as the export writes it: the value, or its choice text. */
const ratingCell = (value, labels) =>
  labels && value ? `${value}: ${anchors[value - 1]}` : (value ?? "");

const finishedCell = (finished, labels) => {
  if (labels) {
    return finished ? "True" : "False";
  }
  return finished ? 1 : 0;
};

/** One response's cells, by tag. */
function cellsOf(r, i, labels) {
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
    for (const [c, value] of (page.ratings ?? []).entries()) {
      values[`${prefix}_Rating_${c + 1}`] = ratingCell(value, labels);
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
 * open }`. `labels: false` writes a values export instead, which the tools
 * refuse; `ratee: false` drops the Ratee columns.
 */
export function exportCsv(responses, { labels = true, ratee = true } = {}) {
  const cols = columns({ ratee });
  const header = [
    cols.map(([tag]) => tag),
    cols.map(([, text]) => text),
    cols.map(([, , id]) => JSON.stringify({ ImportId: id })),
  ];
  const rows = responses.map((r, i) =>
    cols.map(([tag]) => cellsOf(r, i, labels)[tag] ?? "")
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
 * gave member e (four values; a number repeats); `split[r]` is member r's
 * points, by member. Members in `skip` send nothing. Each respondent's
 * Team Member slots list the others in roster order, as the contact list
 * does.
 */
export function teamResponses(team, members, { ratings, skip = [], split }) {
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
        ratings: Array.isArray(given) ? given : [given, given, given, given],
      };
      shares[position + 1] = split[r][e];
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
