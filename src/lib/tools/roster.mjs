// The roster with teams, as the Canvas group export writes it:
//
//   name,canvas_user_id,user_id,login_id,sections,group_name,canvas_group_id,group_id
//
// `name` is "Last, First"; `login_id` is the student's email; `group_name` is
// the team, empty for a student in no group.

import { parseCsv } from "./csv.mjs";

/** The columns the tools read; the export's other columns are ignored. */
export const REQUIRED_COLUMNS = ["name", "login_id", "group_name"];

/** Splits "Last, First" into its parts; a name with no comma is all first. */
export function splitName(name) {
  const comma = name.indexOf(",");
  if (comma === -1) {
    return { first: name.trim(), last: "" };
  }
  return {
    first: name.slice(comma + 1).trim(),
    last: name.slice(0, comma).trim(),
  };
}

/**
 * Parses the roster CSV text into students, in file order:
 * `{ canvasUserId, email, first, last, name, team }`. Throws an Error naming
 * every problem when a required column is missing, a row has no email, or an
 * email appears twice.
 */
export function parseRoster(text) {
  const [header, ...rows] = parseCsv(text);
  if (!header) {
    throw new Error("The roster file is empty.");
  }
  const columns = header.map((cell) => cell.trim());
  const missing = REQUIRED_COLUMNS.filter((name) => !columns.includes(name));
  if (missing.length > 0) {
    throw new Error(
      `The roster is missing the column${missing.length > 1 ? "s" : ""} ${missing.join(", ")}. Export the roster with groups: ${REQUIRED_COLUMNS.join(", ")} are required.`
    );
  }
  const at = Object.fromEntries(columns.map((column, i) => [column, i]));
  const problems = [];
  const seen = new Map();
  const students = [];
  for (const [index, cells] of rows.entries()) {
    const row = index + 1;
    const cell = (name) => (cells[at[name]] ?? "").trim();
    const fullName = cell("name");
    // Lowercased once, here, so every tool compares one spelling.
    const email = cell("login_id").toLowerCase();
    if (email === "") {
      problems.push(
        `Data row ${row} (${fullName || "no name"}) has no login_id.`
      );
      continue;
    }
    if (seen.has(email)) {
      problems.push(
        `${email} appears on data rows ${seen.get(email)} and ${row}; a student belongs to one team.`
      );
      continue;
    }
    seen.set(email, row);
    students.push({
      canvasUserId: cell("canvas_user_id"),
      email,
      ...splitName(fullName),
      name: fullName,
      team: cell("group_name"),
    });
  }
  if (problems.length > 0) {
    throw new Error(problems.join("\n"));
  }
  return students;
}
