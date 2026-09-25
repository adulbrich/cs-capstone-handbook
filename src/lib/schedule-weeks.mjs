// Turns one term of the week-by-week schedule into week cards grouped by
// sprint. src/components/WeekCards.astro renders a term's Markdown, parses it
// to hast, and hands it here, so the links stay in MDX where the build's link
// validator and validate-activities.mjs read them.
//
// A week in the source is a `### Week N` heading, an optional TA check-in
// badge, and a list: a `**Due**` item whose nested items are the deliverables,
// then `**In class:**`, `**Read:**` and `**Optional:**` lines.

import { toString as textOf } from "hast-util-to-string";
import { h } from "hastscript";

// The groups outside any sprint: the weeks before the year's first sprint and
// after its last. Any other week outside a sprint is an error, not a guess.
const BEFORE_FIRST_SPRINT = "Term Start";
const AFTER_LAST_SPRINT = "Project Handoff";

// Links whose page `level` does not say who submits the item: the partner
// completes the partner evaluation; the two Canvas-owned stubs carry no
// `assignment:` block; Demo Day and the Expo are team events with no block
// either; the bidding survey is the one section of For Students that is due.
const TAG_BY_PATH = {
  "assignments/career-retrospective": "Individual",
  "assignments/demo-day": "Team",
  "assignments/expo": "Team",
  "assignments/project-partner-evaluation": "Partner",
  "assignments/resume-and-intent": "Individual",
  "introduction/for-students#how-you-get-your-project-and-team": "Individual",
};

// The lines a week may carry, and the icon each one's `data-row` selects.
const LABELS = new Set(["Due", "In class", "Read", "Optional"]);

const WEEK_HEADING_RE = /^Week (\d+)$/;
const LABEL_COLON_RE = /:$/;
const SPRINT_NOTE_RE = /^Sprint Note (\d+)\b/;

const isEl = (n, tag) => n?.type === "element" && (!tag || n.tagName === tag);
const hasClass = (n, c) =>
  isEl(n) && [n.properties?.className ?? []].flat().includes(c);
const pagePath = (href) => href.split("#")[0].replace(/^\/|\/$/g, "");

// Who submits a Due item, from the page its one internal link points at.
export function tagFor(href, levels) {
  const path = pagePath(href);
  const anchored = `${path}#${href.split("#")[1] ?? ""}`;
  if (TAG_BY_PATH[anchored] ?? TAG_BY_PATH[path]) {
    return TAG_BY_PATH[anchored] ?? TAG_BY_PATH[path];
  }
  const level = levels.get(path);
  if (level === "team") {
    return "Team";
  }
  return level === "individual" ? "Individual" : null;
}

// The group label for each week of a term. Sprint N runs from the week after
// the previous note to the week its note is due; a term's first sprint is the
// two weeks ending at its note.
export function sprintLabels(term, weeks, notes) {
  const labels = new Map();
  notes.forEach(({ n, week }, i) => {
    const start = i === 0 ? week - 1 : notes[i - 1].week + 1;
    for (let w = start; w <= week; w += 1) {
      labels.set(w, `Sprint ${n}`);
    }
  });
  const firstStart = notes[0].week - 1;
  const lastEnd = notes.at(-1).week;
  for (const w of weeks) {
    if (labels.has(w)) {
      continue;
    }
    if (w < firstStart && term === "fall") {
      labels.set(w, BEFORE_FIRST_SPRINT);
    } else if (w > lastEnd && term === "spring") {
      labels.set(w, AFTER_LAST_SPRINT);
    } else {
      throw new Error(
        `schedule: ${term} week ${w} is in no sprint and is neither before the year's first sprint nor after its last`
      );
    }
  }
  return labels;
}

// Split the rendered term into weeks: each starts at Starlight's h3 wrapper.
function splitWeeks(children) {
  const weeks = [];
  for (const node of children) {
    if (
      hasClass(node, "sl-heading-wrapper") &&
      node.children.some((c) => isEl(c, "h3"))
    ) {
      const h3 = node.children.find((c) => isEl(c, "h3"));
      const number = Number(textOf(h3).match(WEEK_HEADING_RE)?.[1]);
      if (Number.isNaN(number)) {
        throw new Error(`schedule: unexpected heading "${textOf(h3)}"`);
      }
      weeks.push({ heading: node, id: h3.properties.id, nodes: [], number });
    } else if (isEl(node)) {
      if (weeks.length === 0) {
        throw new Error(
          `schedule: <${node.tagName}> before the first week would not be shown; put it above <WeekCards>`
        );
      }
      weeks.at(-1).nodes.push(node);
    }
  }
  return weeks;
}

// The badge may arrive bare or wrapped in a paragraph.
function findBadge(nodes) {
  for (const n of nodes) {
    if (hasClass(n, "sl-badge")) {
      return n;
    }
    const inner =
      isEl(n, "p") && n.children.find((c) => hasClass(c, "sl-badge"));
    if (inner) {
      return inner;
    }
  }
  return null;
}

// A list line's bold label. A loose list (blank lines between items) wraps
// each item in a paragraph, so look one level in as well.
function labelOf(li) {
  const lead = li.children.find((c) => isEl(c));
  const holder = isEl(lead, "p") ? lead : li;
  const strong = holder.children.find((c) => isEl(c, "strong"));
  return strong ? textOf(strong).replace(LABEL_COLON_RE, "") : null;
}

function dueItem(li, ctx) {
  const where = `${ctx.term} week ${ctx.week}`;
  const links = [];
  const collect = (n) => {
    if (isEl(n, "a") && String(n.properties.href).startsWith("/")) {
      links.push(n);
    }
    for (const c of n.children ?? []) {
      collect(c);
    }
  };
  collect(li);
  if (links.length !== 1) {
    throw new Error(
      `schedule: a Due item in ${where} has ${links.length} internal links; give each item exactly one ("${textOf(li)}")`
    );
  }
  const tag = tagFor(links[0].properties.href, ctx.levels);
  if (!tag) {
    throw new Error(
      `schedule: no Team, Individual or Partner tag for ${links[0].properties.href} in ${where}`
    );
  }
  const note = textOf(li).match(SPRINT_NOTE_RE)?.[1];
  if (note) {
    ctx.seenNotes.push({ n: Number(note), week: ctx.week });
  }
  return h("li", [
    ...li.children,
    " ",
    h(`span.week-tag.week-tag--${tag.toLowerCase()}`, tag),
  ]);
}

function card(week, ctx) {
  const where = `${ctx.term} week ${week.number}`;
  const badge = findBadge(week.nodes);
  const list = week.nodes.find((n) => isEl(n, "ul"));
  // Anything else in a week would be dropped from the card, so it fails.
  const stray = week.nodes.find(
    (n) =>
      n !== list && n !== badge && !(isEl(n, "p") && n.children.includes(badge))
  );
  if (stray) {
    throw new Error(
      `schedule: ${where} has a <${stray.tagName}> the card would drop ("${textOf(stray).slice(0, 60)}"); put it in the week's list`
    );
  }
  const items = list ? list.children.filter((c) => isEl(c, "li")) : [];
  for (const li of items) {
    if (!LABELS.has(labelOf(li))) {
      throw new Error(
        `schedule: ${where} has a line labelled "${labelOf(li)}"; use Due, In class, Read, or Optional`
      );
    }
  }
  const due = items.find((li) => labelOf(li) === "Due");
  const more = items.filter((li) => li !== due);
  const dueItems = due
    ? (due.children.find((c) => isEl(c, "ul"))?.children ?? []).filter((c) =>
        isEl(c, "li")
      )
    : [];
  const itemCtx = { ...ctx, week: week.number };
  return h(
    "div.week-card",
    { ariaLabelledBy: week.id, role: "group" },
    [
      h("div.week-card__head", [week.heading, badge].filter(Boolean)),
      h("p.week-card__label.week-card__label--due", "Due"),
      dueItems.length > 0
        ? h(
            "ul.week-card__due",
            dueItems.map((li) => dueItem(li, itemCtx))
          )
        : h("p.week-card__none", "Nothing due"),
      more.length > 0
        ? h(
            "ul.week-card__more",
            more.map((li) => ({
              ...li,
              properties: {
                ...li.properties,
                dataRow: labelOf(li).toLowerCase().replace(" ", "-"),
              },
            }))
          )
        : null,
    ].filter(Boolean)
  );
}

// The term as sprint groups of week cards. `notes` are the term's sprint
// notes from the Sprint Notes frontmatter, [{ n, week }] in week order;
// `levels` maps "assignments/<page>" to its `level`.
/** @returns {import("hast").Root} */
export function weekCards(tree, { term, notes, levels }) {
  const weeks = splitWeeks(tree.children);
  const labels = sprintLabels(
    term,
    weeks.map((w) => w.number),
    notes
  );
  const ctx = { levels, seenNotes: [], term };
  const groups = [];
  for (const week of weeks) {
    const label = labels.get(week.number);
    if (groups.at(-1)?.label !== label) {
      groups.push({ cards: [], label });
    }
    groups.at(-1).cards.push(card(week, ctx));
  }

  // The hand-typed "Sprint Note N" in a Due item has to be the note the
  // frontmatter puts in that week.
  const key = ({ n, week }) => `${n}@${week}`;
  const expected = notes.map(key).sort().join(" ");
  const seen = ctx.seenNotes.map(key).sort().join(" ");
  if (expected !== seen) {
    throw new Error(
      `schedule: ${term}'s Due items list sprint notes ${seen || "none"} (number@week), but the Sprint Notes frontmatter gives ${expected}`
    );
  }

  return {
    children: groups.map((g) =>
      h("div.sprint-group", [
        h("p.sprint-rail", h("span", g.label)),
        h("div.sprint-group__weeks", g.cards),
      ])
    ),
    type: "root",
  };
}
