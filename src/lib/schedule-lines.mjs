// Reads the week-by-week schedule (introduction/schedule.mdx) as text, line
// by line, for the readers that never render it: scripts/validate-activities.mjs,
// which checks the activity and guide links on each line, and the deck
// component src/components/deck/TermSessions.astro, which lists a term's
// lines week by week. src/lib/schedule-weeks.mjs is the renderer's reader and
// works on the built page instead.

// The schedule heads its term sections "## Fall (CS 461)".
const TERM_HEADING_RE = /^## (Fall|Winter|Spring)\b/;
const WEEK_HEADING_RE = /^### Week (\d+)\b/;
// A schedule line is a list item labelled in bold: Due, In class, Read,
// Optional. A nested item carries no label and belongs to the line above it.
const ROW_LABEL_RE = /^- \*\*([A-Za-z][A-Za-z -]*?):?\*\*/;

// Every source line with where it sits: `term` ("fall", "winter", "spring",
// or null above the first term heading), `week` (null above a term's first
// week heading), and `row`, the label of the line it belongs to (null until a
// week's first labelled line). `labelled` is true when the line carries that
// label itself rather than inheriting it, as a nested item or a wrapped
// continuation does. Headings are consumed, not returned.
export function scheduleLines(source) {
  const lines = [];
  let term = null;
  let week = null;
  let row = null;
  for (const text of source.split("\n")) {
    if (text.startsWith("## ")) {
      term = text.match(TERM_HEADING_RE)?.[1].toLowerCase() ?? null;
      week = null;
      row = null;
      continue;
    }
    const weekHeading = text.match(WEEK_HEADING_RE);
    if (weekHeading) {
      week = Number(weekHeading[1]);
      row = null;
      continue;
    }
    const own = text.match(ROW_LABEL_RE)?.[1] ?? null;
    row = own ?? row;
    lines.push({ labelled: own !== null, row, term, text, week });
  }
  return lines;
}

// A nested item under a labelled line, such as one deliverable under Due.
const NESTED_ITEM_RE = /^\s+- (.*)$/;

const join = (a, b) => (a ? `${a} ${b}` : b);

// One term's weeks in order, for the deck: each week's number and, for each
// label, the text after the label and the nested items under it. A second
// line with a label the week already has adds to it (its text joined with
// "; "), and a wrapped line joins the line or item it continues, as Markdown
// does: a non-blank line right after it that is not a nested item and not
// MDX (a line opening with "<"). A week with no In class line has no
// `In class` entry.
// A labelled line: start the row, or add to the one the week already has.
function labelledRow(rows, line) {
  const own = line.text.replace(ROW_LABEL_RE, "").trim();
  const row = rows.get(line.row) ?? { items: [], text: "" };
  row.text = row.text && own ? `${row.text}; ${own}` : row.text || own;
  rows.set(line.row, row);
  return { item: false, row };
}

// Any other line of a week: a nested item, a wrapped line joining the
// line or item it continues, or a break (blank or MDX). Returns where the
// next wrapped line goes.
function continueRow(rows, line, target) {
  const text = line.text.trim();
  const nested = line.text.match(NESTED_ITEM_RE)?.[1];
  const row = line.row ? rows.get(line.row) : undefined;
  if (nested && row) {
    row.items.push(nested.trim());
    return { item: true, row };
  }
  if (text === "" || text.startsWith("<") || !target) {
    return null;
  }
  if (target.item) {
    const { items } = target.row;
    items[items.length - 1] = join(items.at(-1), text);
  } else {
    target.row.text = join(target.row.text, text);
  }
  return target;
}

/** @returns {{ rows: Map<string, { items: string[], text: string }>, week: number }[]} */
export function termWeeks(source, term) {
  /** @type {Map<number, Map<string, { items: string[], text: string }>>} */
  const weeks = new Map();
  // Where a wrapped line goes: the row's text, or its last item.
  let target = null;
  for (const line of scheduleLines(source)) {
    if (line.term !== term || line.week === null) {
      target = null;
      continue;
    }
    if (!weeks.has(line.week)) {
      weeks.set(line.week, new Map());
    }
    const rows = weeks.get(line.week);
    target = line.labelled
      ? labelledRow(rows, line)
      : continueRow(rows, line, target);
  }
  return [...weeks].map(([week, rows]) => ({ rows, week }));
}
