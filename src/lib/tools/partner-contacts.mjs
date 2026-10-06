// The partner surveys' contact list: one row per project partner per team,
// imported into Qualtrics as the distribution's mailing list. Qualtrics maps
// the columns by exact header name, and the survey reads them as embedded
// data. Pure: no DOM, no I/O.
//
// The partner sheet is the one the staff letters read
// (scripts/email/README.md): one row per team, with `Canvas Group Name` and
// `Project Partner / Mentor Email` read here and every other column ignored.
// A mentor standing in for a partner is listed the same way and gets the
// same survey. Several addresses in one cell are several partners.

import { parseCsv, toCsv } from "./csv.mjs";

export const SHEET_TEAM = "Canvas Group Name";
export const SHEET_EMAIL = "Project Partner / Mentor Email";

/** Group names compare case-insensitively, with runs of spaces as one. */
const tidy = (text) => text.replace(/\s+/g, " ").trim();
const teamKey = (text) => tidy(text).toLowerCase();

const SEPARATORS = /[\s,;]+/;

/** Splits a cell into its email addresses, as the staff letters do. */
const emailsIn = (cell) =>
  cell.split(SEPARATORS).filter((part) => part.includes("@"));

/**
 * Parses the partner sheet into `{ team, emails }` entries, in file order,
 * skipping rows with no group name. Throws when a column it reads is missing.
 */
export function parsePartnerSheet(text) {
  const [header, ...rows] = parseCsv(text);
  if (!header) {
    throw new Error("The partner sheet is empty.");
  }
  const columns = header.map((cell) => cell.trim());
  const missing = [SHEET_TEAM, SHEET_EMAIL].filter(
    (name) => !columns.includes(name)
  );
  if (missing.length > 0) {
    throw new Error(
      `The partner sheet is missing the column${missing.length > 1 ? "s" : ""} ${missing.join(", ")}. Save the staff partner sheet as CSV.`
    );
  }
  const teamAt = columns.indexOf(SHEET_TEAM);
  const emailAt = columns.indexOf(SHEET_EMAIL);
  return rows
    .map((cells) => ({
      emails: emailsIn(cells[emailAt] ?? ""),
      team: tidy(cells[teamAt] ?? ""),
    }))
    .filter((entry) => entry.team !== "");
}

/**
 * Builds the contact list from parsed roster students and partner sheet
 * entries. `values` holds the other embedded fields' values, the same on
 * every row (`{ MidtermCloseDate: "..." }`).
 *
 * Returns `{ rows, noPartner, notOnRoster, repeated, shared }`: `rows` are
 * objects keyed by `Email`, `Team` (the roster's spelling, which the scorer
 * joins on), and each `values` key, in roster team order; `noPartner` the
 * roster teams that get no survey, each with a `reason`; `notOnRoster` the
 * sheet's teams with no roster group; `repeated` the teams the sheet lists
 * twice (the first row is used, as the staff letters do); `shared` each
 * address that partners more than one team, with its teams.
 */
export function buildPartnerContacts(students, sheet, values = {}) {
  const teams = new Map();
  for (const student of students) {
    if (student.team !== "" && !teams.has(teamKey(student.team))) {
      teams.set(teamKey(student.team), student.team);
    }
  }
  const sheetByTeam = new Map();
  const repeated = [];
  for (const entry of sheet) {
    const key = teamKey(entry.team);
    if (sheetByTeam.has(key)) {
      repeated.push(entry.team);
      continue;
    }
    sheetByTeam.set(key, entry);
  }

  const rows = [];
  const noPartner = [];
  const teamsByEmail = new Map();
  for (const [key, team] of teams) {
    const entry = sheetByTeam.get(key);
    if (!entry) {
      noPartner.push({ reason: "not in the partner sheet", team });
      continue;
    }
    if (entry.emails.length === 0) {
      noPartner.push({ reason: "no partner email in the sheet", team });
      continue;
    }
    const emails = new Map(
      entry.emails.map((email) => [email.toLowerCase(), email])
    );
    for (const [address, email] of emails) {
      rows.push({ Email: email, Team: team, ...values });
      const partnered = teamsByEmail.get(address) ?? [];
      partnered.push(team);
      teamsByEmail.set(address, partnered);
    }
  }
  const notOnRoster = [...sheetByTeam]
    .filter(([key]) => !teams.has(key))
    .map(([, entry]) => entry.team);
  const shared = [...teamsByEmail]
    .filter(([, partnered]) => partnered.length > 1)
    .map(([email, partnered]) => ({ email, teams: partnered }));
  return { noPartner, notOnRoster, repeated, rows, shared };
}

/** The contact list as CSV text: `Email`, then the survey's `fields`. */
export function partnerContactsCsv(rows, fields) {
  const columns = ["Email", ...fields];
  return toCsv([
    columns,
    ...rows.map((row) => columns.map((column) => row[column] ?? "")),
  ]);
}
