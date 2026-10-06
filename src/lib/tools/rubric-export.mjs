// The Canvas rubric-assessment export for one assignment, and the same file
// filled in for import:
//
//   Student Id,Student Name,<criterion> - Rating,<criterion> - Points,<criterion> - Comments,...
//
// One row per student. The header is echoed back verbatim on the way out.

import { parseCsv, toCsv } from "./csv.mjs";

const FIELDS = ["Rating", "Points", "Comments"];
const CRITERION_COLUMN = / - (Rating|Points|Comments)$/;

const TRAILING_TAGS = /\s*\[[^\]]*\]\s*$/;

/**
 * Criterion names compare trimmed, case-insensitive, and without a trailing
 * bracket ("Delivery Quality"; "Attitude as a team player [SO5]" matches the
 * rubric CSV's tag-free title).
 */
export const nameKey = (name) =>
  name.replace(TRAILING_TAGS, "").trim().toLowerCase();

/**
 * Parses the export: `{ header, criteria, students }`. `criteria` maps each
 * criterion name to its Rating, Points, and Comments column indexes;
 * `students` is `{ id, name, cells }` in file order. Throws when the
 * student columns are missing or a criterion lacks one of its three columns.
 */
export function parseRubricExport(text) {
  const [header, ...rows] = parseCsv(text);
  if (!header) {
    throw new Error("The rubric export is empty.");
  }
  const columns = header.map((cell) => cell.trim());
  const idAt = columns.indexOf("Student Id");
  const nameAt = columns.indexOf("Student Name");
  if (idAt === -1 || nameAt === -1) {
    throw new Error(
      "The rubric export has no Student Id or Student Name column. Export the assignment's rubric assessments from Canvas."
    );
  }
  const criteria = new Map();
  for (const [i, column] of columns.entries()) {
    const match = column.match(CRITERION_COLUMN);
    if (!match) {
      continue;
    }
    const name = column.slice(0, match.index);
    const entry = criteria.get(nameKey(name)) ?? { name };
    entry[match[1]] = i;
    criteria.set(nameKey(name), entry);
  }
  if (criteria.size === 0) {
    throw new Error(
      "The rubric export has no `<criterion> - Rating` columns. Is a rubric attached to the assignment?"
    );
  }
  for (const entry of criteria.values()) {
    const missing = FIELDS.filter((field) => entry[field] === undefined);
    if (missing.length > 0) {
      throw new Error(
        `The rubric export has no "${entry.name} - ${missing.join('" or "')}" column.`
      );
    }
  }
  const students = rows.map((cells) => ({
    cells: columns.map((_, i) => cells[i] ?? ""),
    id: (cells[idAt] ?? "").trim(),
    name: (cells[nameAt] ?? "").trim(),
  }));
  return { criteria, header, students };
}

/**
 * Writes one criterion's score into a student's `cells`, in place.
 * `columnsAt` is that criterion's entry in parseRubricExport's `criteria`
 * (its Rating, Points, and Comments indexes). A null `comment` leaves the
 * exported comment as it was.
 */
export function fillCriterion(cells, columnsAt, { comment, points, rating }) {
  cells[columnsAt.Rating] = rating;
  cells[columnsAt.Points] = String(points);
  if (comment !== null) {
    cells[columnsAt.Comments] = comment;
  }
}

/**
 * Pairs each rubric criterion (parseRubricCsv), in rubric order, with the
 * rubric export's columns of the same name (nameKey): `[{ criterion,
 * columnsAt }]`. Throws naming every criterion missing from the export and
 * every export criterion not in the rubric.
 */
export function matchRubricExport(rubricExport, rubric) {
  const rubricKeys = new Set(rubric.criteria.map((c) => nameKey(c.title)));
  const extra = [...rubricExport.criteria.values()]
    .filter((entry) => !rubricKeys.has(nameKey(entry.name)))
    .map((entry) => entry.name);
  const missing = rubric.criteria
    .filter((c) => !rubricExport.criteria.has(nameKey(c.title)))
    .map((c) => c.title);
  if (extra.length > 0 || missing.length > 0) {
    throw new Error(
      [
        `The rubric export does not match the ${rubric.name} rubric.`,
        missing.length > 0 ? `Missing: ${missing.join(", ")}.` : "",
        extra.length > 0 ? `Not in the rubric: ${extra.join(", ")}.` : "",
        "Export the rubric assessments of the assignment this survey grades.",
      ]
        .filter(Boolean)
        .join(" ")
    );
  }
  return rubric.criteria.map((criterion) => ({
    columnsAt: rubricExport.criteria.get(nameKey(criterion.title)),
    criterion,
  }));
}

/** Writes the header and each student's cells back out as CSV. */
export function rubricExportCsv(header, rows) {
  return toCsv([header, ...rows]);
}
