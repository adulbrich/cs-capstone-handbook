// The peer evaluation's contact list: one row per student, imported into
// Qualtrics as the distribution's mailing list. Qualtrics maps the columns by
// exact header name, and the survey reads them as embedded data.

import { toCsv } from "./csv.mjs";

/** The largest team the survey supports, the respondent included. */
export const MAX_TEAM_SIZE = 10;

/** Teammate slots per student: everyone on the largest team but the respondent. */
export const SLOTS = MAX_TEAM_SIZE - 1;

export const CONTACT_COLUMNS = [
  "Email",
  "Team",
  "TeamSize",
  "SelfFloor",
  "CloseDate",
  ...Array.from({ length: SLOTS }, (_, i) => `Team Member ${i + 1}`),
];

/**
 * The least a respondent may give themselves in the split: floor(100 / N),
 * except 0 on a team of two, where the split is reviewed instead.
 */
export function selfFloor(teamSize) {
  return teamSize === 2 ? 0 : Math.floor(100 / teamSize);
}

/** How a teammate appears in the survey: "First Last (email)". */
export function memberLabel(student) {
  const name = [student.first, student.last].filter(Boolean).join(" ");
  return name ? `${name} (${student.email})` : student.email;
}

const CLOSE_FORMAT = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "long",
  timeZoneName: "short",
  weekday: "long",
});

/**
 * The close date as the email shows it: the weekday, the day, the time, and
 * the instructor's time zone, such as "Friday, <month> 4 at 5:00 PM PST",
 * from a Date. The month's name comes from Intl at run time. Narrow spaces
 * become plain ones, so the text pastes cleanly.
 */
export const formatCloseDate = (date) =>
  CLOSE_FORMAT.format(date).replace(/\s/g, " ");

/**
 * Builds the contact list from parsed roster students. `closeDate` is a
 * Date, written on every row as the email shows it (formatCloseDate); with
 * none, the column is empty.
 *
 * Returns `{ rows, excluded }`: `rows` are objects keyed by CONTACT_COLUMNS,
 * in roster order; `excluded` lists the students left out, each with a
 * `reason` ("alone on a team" or "in no team"). Throws an Error naming every
 * team larger than MAX_TEAM_SIZE: such a team is never truncated.
 */
export function buildContacts(students, { closeDate = null } = {}) {
  const closeText = closeDate ? formatCloseDate(closeDate) : "";
  const teams = new Map();
  for (const student of students) {
    if (student.team === "") {
      continue;
    }
    if (!teams.has(student.team)) {
      teams.set(student.team, []);
    }
    teams.get(student.team).push(student);
  }

  const oversized = [...teams]
    .filter(([, members]) => members.length > MAX_TEAM_SIZE)
    .map(([team, members]) => `${team} (${members.length})`);
  if (oversized.length > 0) {
    throw new Error(
      `The survey supports teams of up to ${MAX_TEAM_SIZE}, the respondent included. Too large: ${oversized.join(", ")}. Split the team or raise the limit; nothing was generated.`
    );
  }

  const rows = [];
  const excluded = [];
  for (const student of students) {
    if (student.team === "") {
      excluded.push({ ...student, reason: "in no team" });
      continue;
    }
    const members = teams.get(student.team);
    if (members.length === 1) {
      excluded.push({ ...student, reason: "alone on a team" });
      continue;
    }
    const teammates = members
      .filter((member) => member !== student)
      .map(memberLabel);
    const row = {
      CloseDate: closeText,
      Email: student.email,
      SelfFloor: String(selfFloor(members.length)),
      Team: student.team,
      TeamSize: String(members.length),
    };
    for (let slot = 1; slot <= SLOTS; slot += 1) {
      row[`Team Member ${slot}`] = teammates[slot - 1] ?? "";
    }
    rows.push(row);
  }
  return { excluded, rows };
}

/** The contact list as CSV text, header first. */
export function contactsCsv(rows) {
  return toCsv([
    CONTACT_COLUMNS,
    ...rows.map((row) => CONTACT_COLUMNS.map((column) => row[column])),
  ]);
}
