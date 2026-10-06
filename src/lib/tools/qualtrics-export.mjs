// A Qualtrics response export, CSV with choice labels ("Export labels").
// The tools read the labels export only: a values export (numeric codes) is
// refused, since its answers cannot be matched to rubric rating names.
// Three header rows: the export tags (`Q1_1`, `Team`), the question text,
// then one `{"ImportId":...}` JSON cell per column. Responses follow.
// Pure: no DOM, no I/O, so node --test covers it and the browser runs it.

import { parseCsv } from "./csv.mjs";

const IMPORT_ID = /^\{"ImportId"/;
const PREVIEW = "Survey Preview";
/** A values export writes Finished as 1 or 0; a labels export, True or False. */
const VALUES_FINISHED = new Set(["0", "1"]);

/**
 * Parses the export into its columns and responses. Each column is
 * `{ tag, text }`; each response maps an export tag to its cell. Keeps only
 * finished responses that are not previews, and counts what it dropped.
 * Throws when the file is not a labels export with its three header rows,
 * when it is a values export, and when no finished response remains.
 */
export function parseQualtricsExport(text) {
  const [tags, texts, importIds, ...rows] = parseCsv(text);
  if (!(tags && texts && importIds)) {
    throw new Error(
      "The Qualtrics file has fewer than three header rows. Export the responses as CSV with choice labels."
    );
  }
  if (!importIds.some((cell) => IMPORT_ID.test(cell.trim()))) {
    throw new Error(
      'The third row of the Qualtrics file holds no {"ImportId":...} cells. Export the responses as CSV, not the legacy format.'
    );
  }
  const columns = tags.map((tag, i) => ({
    tag: tag.trim(),
    text: (texts[i] ?? "").trim(),
  }));
  const missing = ["Finished", "Status", "ResponseId"].filter(
    (tag) => !columns.some((column) => column.tag === tag)
  );
  if (missing.length > 0) {
    throw new Error(
      `The Qualtrics file has no ${missing.join(", ")} column. Export every Survey Metadata field.`
    );
  }
  const dropped = { preview: 0, unfinished: 0 };
  const responses = [];
  for (const cells of rows) {
    const response = Object.fromEntries(
      columns.map((column, i) => [column.tag, (cells[i] ?? "").trim()])
    );
    if (VALUES_FINISHED.has(response.Finished)) {
      throw new Error(
        `Response ${response.ResponseId} has Finished "${response.Finished}": this is a values export. Export the responses again with "Use choice text" on (labels export only).`
      );
    }
    if (response.Status === PREVIEW) {
      dropped.preview += 1;
    } else if (response.Finished.toLowerCase() === "true") {
      responses.push(response);
    } else {
      dropped.unfinished += 1;
    }
  }
  if (responses.length === 0) {
    throw new Error(
      `The Qualtrics file holds no finished response (${dropped.preview} previews, ${dropped.unfinished} unfinished dropped). Export the responses once the survey has closed.`
    );
  }
  return { columns, dropped, responses };
}
