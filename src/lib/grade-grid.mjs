// Turns the grade grid on the Assignments Overview into banded component
// groups. src/components/GradeGrid.astro renders the Markdown table, parses it
// to hast, and hands it here, so the links stay in MDX where the build's link
// validator reads them and the weights stay in the table
// scripts/validate-outcomes.mjs sums.
//
// A row whose first cell opens with bold text is a component: its bold name,
// then a line saying who scores it. A row whose first cell opens with a link,
// and holds no other, is an item in the component above it. The last row is the
// bold Total. Paragraphs after the table become its footer note.

import { toString as textOf } from "hast-util-to-string";
import { h } from "hastscript";
import { tagFor, tagNode } from "./schedule-weeks.mjs";

const WEIGHT_RE = /^\d+$/;

const isEl = (n, tag) => n?.type === "element" && (!tag || n.tagName === tag);
const cellsOf = (tr) => tr.children.filter((c) => isEl(c, "td"));

function linksIn(node) {
  const links = [];
  const collect = (n) => {
    if (isEl(n, "a")) {
      links.push(n);
    }
    for (const c of n.children ?? []) {
      collect(c);
    }
  };
  collect(node);
  return links;
}

// A term column: a weight, or a dot for a term the item does not run in.
function weightCell(td, where) {
  const text = textOf(td).trim();
  if (text === "") {
    return h("td.grade-grid__none", [
      h("span", { ariaHidden: "true" }, "·"),
      h("span.sr-only", "none"),
    ]);
  }
  if (!WEIGHT_RE.test(text)) {
    throw new Error(
      `grade grid: "${text}" in ${where} is not a whole-number weight; leave the cell empty for a term the item does not run in`
    );
  }
  return td;
}

function componentRow(tr, first) {
  const [name, ...who] = first.children.filter(
    (c) => !(c.type === "text" && !c.value.trim())
  );
  return {
    name: textOf(name),
    render: (tag) =>
      h("tr.grade-grid__component", [
        h("td", [
          h("span.grade-grid__name", [name, " ", tagNode(tag)]),
          h("span.grade-grid__who", who),
        ]),
        ...cellsOf(tr).slice(1),
      ]),
  };
}

// The header names the term columns; the first one is blank on the page and
// named for screen readers.
function markHeader(table) {
  const thead = table.children.find((c) => isEl(c, "thead"));
  const headCells = (thead?.children ?? [])
    .filter((c) => isEl(c, "tr"))
    .flatMap((tr) => tr.children.filter((c) => isEl(c, "th")));
  for (const th of headCells) {
    th.properties.scope = "col";
    if (textOf(th).trim() === "") {
      th.children = [h("span.sr-only", "Component")];
    }
  }
}

// Who an item row belongs to, from its one link; every item under a
// component carries the same tag.
function itemTag(lead, links, group, where, levels) {
  if (!isEl(lead, "a") || links.length !== 1 || !group) {
    throw new Error(
      `grade grid: ${where} is neither a bold component nor an item that opens with its one link, under a component`
    );
  }
  const tag = tagFor(links[0].properties.href, levels);
  if (!tag) {
    throw new Error(
      `grade grid: no Team, Individual or Partner tag for ${links[0].properties.href}`
    );
  }
  if (group.tag && group.tag !== tag) {
    throw new Error(
      `grade grid: ${group.component.name} mixes ${group.tag} and ${tag} items; a component carries one tag`
    );
  }
  return tag;
}

function bandRows(rows, levels) {
  const out = [];
  let group = null;
  const closeGroup = () => {
    if (group && group.items.length === 0) {
      throw new Error(
        `grade grid: ${group.component.name} has no item rows under it`
      );
    }
    if (group) {
      out.push(group.component.render(group.tag), ...group.items);
    }
  };
  for (const tr of rows) {
    const [first] = cellsOf(tr);
    const lead = first.children.find(
      (c) => !(c.type === "text" && !c.value.trim())
    );
    const where = `the row "${textOf(first).trim()}"`;
    const weights = cellsOf(tr)
      .slice(1)
      .map((td) => weightCell(td, where));

    if (isEl(lead, "strong") && linksIn(lead).length === 0) {
      closeGroup();
      group = null;
      if (textOf(lead) === "Total") {
        out.push(h("tr.grade-grid__total", [first, ...weights]));
      } else {
        group = { component: componentRow(tr, first), items: [], tag: null };
      }
      continue;
    }
    // Checked before `group` is touched: an item above every component throws.
    const tag = itemTag(lead, linksIn(first), group, where, levels);
    group.tag = tag;
    group.items.push(h("tr.grade-grid__item", [first, ...weights]));
  }
  closeGroup();
  return out;
}

export function gradeGrid(tree, { levels }) {
  const top = tree.children.filter((c) => isEl(c));
  const table = top.find((c) => isEl(c, "table"));
  if (!table) {
    throw new Error("grade grid: no table inside <GradeGrid>");
  }
  const stray = top.find((c) => c !== table && !isEl(c, "p"));
  if (stray) {
    throw new Error(
      `grade grid: a <${stray.tagName}> inside <GradeGrid> would be dropped; only the table and its footer note belong there`
    );
  }
  markHeader(table);
  const tbody = table.children.find((c) => isEl(c, "tbody"));
  if (tbody) {
    tbody.children = bandRows(
      tbody.children.filter((c) => isEl(c, "tr")),
      levels
    );
  }
  return h(null, [
    table,
    ...top
      .filter((c) => isEl(c, "p"))
      .map((p) => h("p.grade-grid__note", p.children)),
  ]);
}
