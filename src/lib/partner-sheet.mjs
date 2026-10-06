// The staff partner sheet: one row per team, with `Canvas Group Name` and
// `Project Partner / Mentor Email` among its columns (scripts/email/README.md).
// The one reading of it, shared by the letter scripts in scripts/email/ and
// the partner survey's contact list (src/lib/tools/partner-contacts.mjs), so
// a team name or an address cell means the same thing to both. Pure: no DOM,
// no I/O.

import { parseCsv } from "./tools/csv.mjs";

export const SHEET_TEAM = "Canvas Group Name";
export const SHEET_EMAIL = "Project Partner / Mentor Email";

const SPACES = /\s+/g;
const SEPARATORS = /[\s,;]+/;

/** A group name as written, with runs of spaces as one and no ends. */
export const tidy = (text) => text.replace(SPACES, " ").trim();

/** Group names compare case-insensitively, after tidy. */
export const teamKey = (text) => tidy(text).toLowerCase();

/** The email addresses in one cell: split on spaces, commas, semicolons. */
export const emailsIn = (cell) =>
  cell.split(SEPARATORS).filter((part) => part.includes("@"));

/**
 * Parses the sheet's CSV text into `{ team, emails }` entries, in file
 * order, skipping rows with no group name. Throws when a column it reads is
 * missing. The letter scripts read the file with their own reader, which
 * also takes a tab-separated paste, and use the rules above.
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
