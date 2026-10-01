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
      const byYear = family.numbering === "year";
      const first = byYear ? (numbered.get(family) ?? 0) + 1 : 1;
      if (byYear) {
        numbered.set(family, first - 1 + weeks.length);
      }
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

// The anchor of the rubric that scores a family, from the page's headings
// (Starlight's `{ depth, slug, text }` list). On the fixed skeleton (#331) it
// is the "###" named for the family under "## Rubric". A page not yet moved
// to it names the rubric in a heading of its own ("End-of-Term Survey
// Rubric"), puts it after the family's own heading ("Midterm Pulse", then
// "Pulse Rubric"), or has one rubric for every entry.
export function rubricAnchor(family, headings) {
  const name = family.name.replace("{n}", "N");
  const isRubric = (h) => h.text.includes("Rubric");
  const startsWithName = (h) =>
    h.text === name || h.text.startsWith(`${name} `);
  const rubricH2 = headings.findIndex(
    (h) => h.depth === 2 && h.text === "Rubric"
  );
  if (rubricH2 >= 0) {
    const end = headings.findIndex((h, i) => i > rubricH2 && h.depth <= 2);
    const under = headings.slice(rubricH2 + 1, end < 0 ? undefined : end);
    return (
      under.find((h) => h.depth === 3 && h.text === name) ?? headings[rubricH2]
    ).slug;
  }
  const own = headings.findIndex(startsWithName);
  return (
    headings.find((h) => startsWithName(h) && isRubric(h)) ??
    (own >= 0 ? headings.slice(own).find(isRubric) : undefined) ??
    headings.find(isRubric)
  )?.slug;
}

const TITLE_SUFFIX_RE = /: \{title\}$/;
const pct = (n) => `${Number.parseFloat(n.toFixed(2))}%`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// "fall", "fall and winter", "fall, winter, and spring".
function termList(terms) {
  return terms.length < 3
    ? terms.join(" and ")
    : `${terms.slice(0, -1).join(", ")}, and ${terms.at(-1)}`;
}

// "Week 4", "Weeks 5 and 10", "Weeks 4, 6, 8, and 10".
function weekList(weeks) {
  if (weeks.length === 1) {
    return `Week ${weeks[0]}`;
  }
  return `Weeks ${termList(weeks.map(String))}`;
}

// What the page as a whole is worth: "15% of each term's grade",
// "3% of the winter grade", "8% fall, 10% winter, 6% spring".
export function pageWeight(assignment) {
  const terms = assignment.terms ?? [];
  const weights = terms.map((t) => termWeight(assignment, t));
  if (new Set(weights).size > 1) {
    return terms.map((t, i) => `${pct(weights[i])} ${t}`).join(", ");
  }
  return terms.length === 1
    ? `${pct(weights[0])} of the ${terms[0]} grade`
    : `${pct(weights[0])} of each term's grade`;
}

// When the page runs: "Fall and winter", "Every term", "Spring".
export function pageTerms(assignment) {
  const terms = assignment.terms ?? [];
  return terms.length === TERMS.length ? "Every term" : cap(termList(terms));
}

// One line per family for the page's summary card: its name across the year,
// when it is due, and what each entry is worth. A family due the same weeks
// and worth the same in every term reads as one line ("Week 4", "5%"); one
// that varies says so per term.
/**
 * @returns {{ due: string, family: any, heading: string, name: string,
 *   peerReview: string | null, weight: string }[]}
 */
export function summaryRows(canvas) {
  const rows = canvasRows(canvas);
  return (canvas ?? []).map((family) => {
    const mine = rows.filter((r) => r.family === family);
    const numbers = [
      ...new Set(mine.flatMap((r) => r.names.map((_, i) => r.first + i))),
    ];
    const span =
      numbers.length > 2
        ? `${numbers[0]} to ${numbers.at(-1)}`
        : termList(numbers.map(String));
    const name = family.name.replace("{n}", span).replace(TITLE_SUFFIX_RE, "");
    const sameWeeks = new Set(mine.map((r) => r.weeks.join())).size === 1;
    const due = sameWeeks
      ? weekList(mine[0].weeks)
      : cap(
          mine
            .map((r) => `${r.term} ${weekList(r.weeks).toLowerCase()}`)
            .join("; ")
        );
    const repeats = mine.some((r) => r.weeks.length > 1);
    const each =
      new Set(mine.map((r) => r.each)).size === 1
        ? pct(mine[0].each)
        : mine.map((r) => `${pct(r.each)} ${r.term}`).join(", ");
    return {
      due,
      family,
      heading: family.name.replace("{n}", "N"),
      name,
      peerReview: family.peer_review_week
        ? `peer reviews week ${family.peer_review_week}`
        : null,
      weight: repeats ? `${each} each` : each,
    };
  });
}
