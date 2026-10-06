// The Team, Individual and Partner tags shared by the Schedule's week cards
// (src/lib/schedule-weeks.mjs) and the Assignments Overview's grade grid
// (src/lib/grade-grid.mjs): who submits an item, or whose grade it is.

import { h } from "hastscript";

// Links whose page `level` does not say who submits or is scored: the partner
// completes the partner evaluation; the two Canvas-owned stubs carry no
// `assignment:` block; Demo Day and the Expo are team events with no block
// either.
const TAG_BY_PATH = {
  "assignments/career-retrospective": "Individual",
  "assignments/demo-day": "Team",
  "assignments/expo": "Team",
  "assignments/project-partner-evaluation": "Partner",
  "assignments/resume-and-intent": "Individual",
};

const pagePath = (href) => href.split("#")[0].replace(/^\/|\/$/g, "");

// The tag itself, styled in src/styles/global.css.
export const tagNode = (tag) =>
  h(`span.who-tag.who-tag--${tag.toLowerCase()}`, tag);

// Who an item belongs to, from the page its one internal link points at.
export function tagFor(href, levels) {
  const path = pagePath(href);
  const fixed =
    TAG_BY_PATH[`${path}#${href.split("#")[1] ?? ""}`] ?? TAG_BY_PATH[path];
  if (fixed) {
    return fixed;
  }
  const level = levels.get(path);
  if (level === "team") {
    return "Team";
  }
  return level === "individual" ? "Individual" : null;
}
