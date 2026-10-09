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

// The pages whose surveys close on the date their invitation states, which
// the instructor sets in the survey generator, so their due lines name the
// week alone. Decided by page rather than by submission type, because the
// Bidding Survey is a survey too and is due by Sunday like any submission
// (Late Work, Absence, and Makeup on assignments/introduction.mdx).
const INVITATION_CLOSE_PAGES = new Set([
  "peer-evaluations",
  "project-partner-evaluation",
]);

// Whether an entry on `page` (its file name, "peer-evaluations") closes on
// its invitation date instead of by Sunday of its week.
export const closesByInvitation = (page) => INVITATION_CLOSE_PAGES.has(page);

// When entries are due, in lowercase after "Sunday": "Sunday of week 4",
// "Sunday of fall weeks 2, 3, 7, and 8", or, for a survey that closes on its
// invitation date, "closes week 6".
export function dueWeeks(weeks, { term, invitation = false } = {}) {
  const which = `${term ? `${term} ` : ""}${weeks.length === 1 ? "week" : "weeks"} ${termList(weeks.map(String))}`;
  return invitation ? `closes ${which}` : `Sunday of ${which}`;
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
// the term's total ("Workshop 1 to 5 · Sunday of fall weeks 2, 3, 7, and 8
// · 2% in all"), since its entries' shares are fractions nobody plans by. A
// family due the same weeks and worth the same in every term reads as one
// line; one that varies says so per term, unless `due_label` says it in
// words. Every due line names Sunday, except on the pages whose surveys close
// on their invitation date (`closesByInvitation`).
/**
 * @returns {{ due: string, family: any, heading: string, name: string,
 *   peerReview: string | null, repeats: boolean, weight: string }[]}
 */
export function summaryRows(canvas, page) {
  const invitation = closesByInvitation(page);
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
        ? `peer reviews Sunday of week ${family.peer_review_week}`
        : null,
      repeats: isRepeated,
      weight,
    });
    if (isTitled(family)) {
      return mine.map((r) =>
        line(
          [r],
          cap(dueWeeks([...new Set(r.weeks)], { invitation, term: r.term })),
          r.names.length > 1 ? `${pct(r.weight)} in all` : pct(r.weight),
          false
        )
      );
    }
    const sameWeeks = new Set(mine.map((r) => r.weeks.join())).size === 1;
    const due = sameWeeks
      ? cap(dueWeeks(mine[0].weeks, { invitation }))
      : cap(
          mine
            .map((r) => dueWeeks(r.weeks, { invitation, term: r.term }))
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

// What a late or missed entry costs, by its family's `late` key. Stated once
// here, so the summary card, the Canvas box, and the late-work table on
// assignments/introduction.mdx cannot disagree. `label` names the rule's row
// in that table. `none` is an entry with nothing to submit of its own (the
// sprint's individual contribution, which follows its note), and shows
// nothing anywhere.
export const LATE = {
  "class-week": {
    label: "Workshops",
    text: "Full credit in class or by Sunday of the week the class met; no late window after that.",
  },
  none: { label: null, text: null },
  "not-accepted": {
    label: "Sprint notes",
    text: "Not accepted late; a missed note scores zero. One missed note per term with a documented reason is excused on request.",
  },
  session: {
    label: "Defense",
    text: "Tell your TA before the session and you're rescheduled that term, with no penalty. An unexcused no-show scores Missing.",
  },
  standard: {
    label: "Most submissions",
    text: "Up to 48 hours late loses one rubric band on each criterion. After that it scores zero, unless you contacted the instructors before the deadline with a documented reason.",
  },
  "survey-closes": {
    label: "Surveys",
    text: "No late window: the survey closes at its posted time.",
  },
};

// The late lines for a page's summary card. One line, naming no entries,
// when every entry that has a rule shares it; one line per rule, naming the
// entries it covers, when a page carries two or more. Entries are named as on
// the card ("Sprint Notes 1 to 12"), families sharing a name once, and joined
// by commas, since a name may hold an "and" of its own ("Draft 1 and 2").
/** @returns {{ names: string | null, text: string }[]} */
export function lateLines(canvas) {
  const rows = canvasRows(canvas);
  const byRule = new Map();
  for (const family of canvas ?? []) {
    if (family.late === "none") {
      continue;
    }
    const sameName = rows.filter((r) => r.family.name === family.name);
    const names = byRule.get(family.late) ?? new Set();
    names.add(familyName(family, sameName));
    byRule.set(family.late, names);
  }
  return [...byRule].map(([rule, names]) => ({
    names: byRule.size > 1 ? [...names].join(", ") : null,
    text: LATE[rule].text,
  }));
}
