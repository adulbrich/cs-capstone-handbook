// Expands an assignment page's `assignment.canvas` families into the Canvas
// entries they stand for. Shared by `src/components/AssignmentSummary.astro`,
// which summarizes them at the top of the page, `scripts/canvas-export.mjs`,
// and `scripts/validate-outcomes.mjs`, which checks them, so none of them can
// disagree about what a family means.
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

// The heading a family's entries share on the page: its name with "{n}"
// written "N" ("Sprint Notes N"). The page's "###" under What You Submit and
// Rubric, the Canvas export, and the validator all match entries by it.
export const familyHeading = (family) => family.name.replace("{n}", "N");

// The slug of the "###" named `name` inside the "##" section titled
// `section`, from the page's headings (Starlight's `{ depth, slug, text }`
// list), or undefined.
export function headingUnder(headings, section, name) {
  const start = headings.findIndex((h) => h.depth === 2 && h.text === section);
  if (start < 0) {
    return;
  }
  const end = headings.findIndex((h, i) => i > start && h.depth <= 2);
  return headings
    .slice(start + 1, end < 0 ? undefined : end)
    .find((h) => h.depth === 3 && h.text === name)?.slug;
}

// The anchor of the rubric that scores a family: its "###" under "## Rubric"
// when its entries have a rubric of their own, else "## Rubric" itself.
export function rubricAnchor(family, headings) {
  return (
    headingUnder(headings, "Rubric", familyHeading(family)) ??
    headings.find((h) => h.depth === 2 && h.text === "Rubric")?.slug
  );
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
// when it is due, and what each entry is worth. Families sharing a name are
// one line (the partner's End-of-Term Survey, one family per term because
// each term has its own rubric). A titled family gets a line per term with
// the term's total ("Workshop 1 to 5 · Fall weeks 2, 3, 7, and 8 · 2% in
// all"), since its entries' shares are fractions nobody plans by. A family
// due the same weeks and worth the same in every term reads as one line; one
// that varies says so per term, unless `due_label` says it in words.
/**
 * @returns {{ due: string, family: any, heading: string, name: string,
 *   peerReview: string | null, repeats: boolean, weight: string }[]}
 */
export function summaryRows(canvas) {
  const rows = canvasRows(canvas);
  const groups = new Map();
  for (const family of canvas ?? []) {
    groups.set(family.name, [...(groups.get(family.name) ?? []), family]);
  }
  return [...groups.values()].flatMap((families) => {
    const [family] = families;
    const mine = rows.filter((r) => families.includes(r.family));
    const line = (rowsOf, weeksText, weight, isRepeated) => ({
      due: family.due_label ?? weeksText,
      family,
      heading: familyHeading(family),
      name: familyName(family, rowsOf),
      peerReview: family.peer_review_week
        ? `peer reviews week ${family.peer_review_week}`
        : null,
      repeats: isRepeated,
      weight,
    });
    if (isTitled(family)) {
      return mine.map((r) =>
        line(
          [r],
          cap(`${r.term} ${weekList([...new Set(r.weeks)]).toLowerCase()}`),
          r.names.length > 1 ? `${pct(r.weight)} in all` : pct(r.weight),
          false
        )
      );
    }
    const sameWeeks = new Set(mine.map((r) => r.weeks.join())).size === 1;
    const due = sameWeeks
      ? weekList(mine[0].weeks)
      : cap(
          mine
            .map((r) => `${r.term} ${weekList(r.weeks).toLowerCase()}`)
            .join("; ")
        );
    const each =
      new Set(mine.map((r) => r.each)).size === 1
        ? pct(mine[0].each)
        : mine.map((r) => `${pct(r.each)} ${r.term}`).join(", ");
    const repeats = mine.some((r) => r.weeks.length > 1);
    return [line(mine, due, repeats ? `${each} each` : each, repeats)];
  });
}

// "Sprint Notes 1 to 12", "Workshop 1 to 5".
function familyName(family, rows) {
  const numbers = [
    ...new Set(rows.flatMap((r) => r.names.map((_, i) => r.first + i))),
  ];
  const span =
    numbers.length > 2
      ? `${numbers[0]} to ${numbers.at(-1)}`
      : termList(numbers.map(String));
  return family.name.replace("{n}", span).replace(TITLE_SUFFIX_RE, "");
}
