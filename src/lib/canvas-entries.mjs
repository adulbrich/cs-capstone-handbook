// Expands an assignment page's `assignment.canvas` families into the Canvas
// entries they stand for. Shared by `src/components/CanvasEntries.astro`,
// which renders them on the page, and `scripts/validate-outcomes.mjs`, which
// checks them, so the two cannot disagree about what a family means.
//
// A family is one frontmatter item: a name, a Canvas group, and the weeks it
// is due in each term. It expands to one entry per week listed, because each
// Canvas assignment has its own due date, late window, grade and submission.
// "{n}" in the name numbers the entries 1, 2, ... within a term, or across
// the year when the family sets `numbering: year` (Sprint Notes 1 to 12), and
// "{title}" takes the family's per-term `titles`, one per week listed.

export const TERMS = ["fall", "winter", "spring"];

// A titled family names each entry: "Workshop {n}: {title}".
export function isTitled(family) {
  return Boolean(family.titles);
}

// Percent of the term grade something with a `weight` (a page, or a whole
// family) carries in `term`: a scalar applies to every term.
export function termWeight(item, term) {
  return typeof item.weight === "number" ? item.weight : item.weight?.[term];
}

// One row per family per term it runs in, in term order then page order.
export function canvasRows(canvas) {
  const rows = [];
  // Entries a year-numbered family has already used in earlier terms.
  const numbered = new Map();
  for (const term of TERMS) {
    for (const family of canvas ?? []) {
      const weeks = family.weeks?.[term];
      if (!weeks) {
        continue;
      }
      const weight = termWeight(family, term);
      const first =
        family.numbering === "year" ? (numbered.get(family) ?? 0) + 1 : 1;
      numbered.set(family, first - 1 + weeks.length);
      rows.push({
        each: weight / weeks.length,
        family,
        first,
        names: weeks.map((_, i) =>
          family.name
            .replace("{n}", `${first + i}`)
            .replace("{title}", family.titles?.[term]?.[i] ?? "")
        ),
        submissions: [family.submission].flat(),
        term,
        weeks,
        weight,
      });
    }
  }
  return rows;
}

// The rows the page table shows: a titled family gets one row per entry,
// since "Workshop 1 to 5: {title}" names nothing. Such a row's `weight` is
// its one entry's share, which is also its `each`.
export function tableRows(canvas) {
  return canvasRows(canvas).flatMap((row) =>
    isTitled(row.family)
      ? row.names.map((name, i) => ({
          ...row,
          names: [name],
          weeks: [row.weeks[i]],
          weight: row.each,
        }))
      : [row]
  );
}

// The name a row shows: "Sprint Notes 5 to 9" for a numbered family.
export function rowName(row) {
  if (row.names.length === 1) {
    return row.names[0];
  }
  const last = row.first + row.names.length - 1;
  return row.family.name.replace("{n}", `${row.first} to ${last}`);
}
