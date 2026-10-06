// The partner surveys' contact list: one row per project partner per team,
// imported into Qualtrics as the distribution's mailing list. Qualtrics maps
// the columns by exact header name, and the survey reads them as embedded
// data. Pure: no DOM, no I/O.
//
// The partner sheet is read by src/lib/partner-sheet.mjs, as the staff
// letters read it. A mentor standing in for a partner is listed the same way
// and gets the same survey. Several addresses in one cell are several
// partners, and so are addresses on a second row for the same team.

import { teamKey } from "../partner-sheet.mjs";
import { toCsv } from "./csv.mjs";

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
 * on more than one row, whose addresses are merged; `shared` each
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
    const first = sheetByTeam.get(key);
    if (first) {
      // A second row for a team is a co-partner: its addresses join the
      // first row's. The staff letters keep the first row instead.
      repeated.push(entry.team);
      first.emails = [...first.emails, ...entry.emails];
      continue;
    }
    sheetByTeam.set(key, { ...entry, emails: [...entry.emails] });
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
