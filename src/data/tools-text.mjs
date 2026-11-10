// The wording of the tools' shared kit (src/components/tools/ui/), the same
// on every tool's pages. Each tool's own wording is in its module:
// peer-tools.mjs, partner-tools.mjs, submission-pdf.mjs.

/** "1 row", "2 rows": a count and its noun. */
export const plural = (n, one, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

/** "a", "a or b", "a, b, or c". */
export const orList = (items) =>
  items.length < 3
    ? items.join(" or ")
    : `${items.slice(0, -1).join(", ")}, or ${items.at(-1)}`;

/** What a missing file is called in a step's summary. */
export const NO_FILE = "No file";

/** The saved-data box: the tool passes what it saves and its confirm line. */
export const savedText = {
  after: "Leaving the page and coming back picks up where you stopped.",
  clear: "Clear saved data",
  notSaved: "Not saved",
};

/** The survey preview's own labels around the survey's wording. */
export const previewText = {
  criterion: "Criterion",
  page: (n, of) => `Page ${n} of ${of}`,
  region: "Survey preview",
  required: "Required",
  total: "Total",
  when: (answers) => `Shown when the answer is ${orList(answers)}.`,
};
