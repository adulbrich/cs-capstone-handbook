// Expands an assignment page's `assignment.canvas` families into the Canvas
// entries they stand for. Shared by `src/components/CanvasEntries.astro`,
// which renders them on the page, and `scripts/validate-outcomes.mjs`, which
// checks them, so the two cannot disagree about what a family means.
//
// A family is one frontmatter item: a name, a Canvas group, and the weeks it
// is due in each term. It expands to one entry per week listed, because each
// Canvas assignment has its own due date, late window, grade and submission.
// "{n}" in the name numbers the entries 1, 2, ... within a term.

export const TERMS = ["fall", "winter", "spring"];

// Percent of the term grade the whole family carries in `term`.
export function familyWeight(family, term) {
  return typeof family.weight === "number"
    ? family.weight
    : family.weight?.[term];
}

// One row per family per term it runs in, in term order then page order.
export function canvasRows(canvas) {
  const rows = [];
  for (const term of TERMS) {
    for (const family of canvas ?? []) {
      const weeks = family.weeks?.[term];
      if (!weeks) {
        continue;
      }
      const weight = familyWeight(family, term);
      rows.push({
        each: weight / weeks.length,
        family,
        names: weeks.map((_, i) => family.name.replace("{n}", `${i + 1}`)),
        submissions: [family.submission].flat(),
        term,
        weeks,
        weight,
      });
    }
  }
  return rows;
}

// The name a row shows: "Sprint Notes 1 to 4" for a numbered family.
export function rowName(row) {
  if (row.names.length === 1) {
    return row.names[0];
  }
  return row.family.name.replace("{n}", `1 to ${row.names.length}`);
}
