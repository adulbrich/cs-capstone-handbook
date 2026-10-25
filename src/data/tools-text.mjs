// The wording of the instructor tools' shared kit (src/components/tools/ui/),
// the same on every tool's pages. Each tool's own wording is in its module:
// peer-tools.mjs, partner-tools.mjs.

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
  when: (answers) => `Shown when the answer is ${answers.join(" or ")}.`,
};
