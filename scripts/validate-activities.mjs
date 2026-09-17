#!/usr/bin/env node
// Validates the activity pages against .claude/skills/cs46x-activities.
//
// An ACTIVITY is a `##` section carrying an audience badge. That is the whole
// definition, and it is mechanical on purpose: page framing and closing prose
// also use `##`, so counting headings alone silently counts non-activities.
//
// Tiers are expressed as badges on activity pages, but the thing that actually
// makes an activity Recommended is an assignment page linking to it. Those two
// facts live in different files and drift silently, so this reconciles them:
//
//   1. Every activity linked from an assignment page's "Activities That Prepare
//      This" section must carry a Workshop or Recommended badge. A linked
//      activity with no badge reads to students as optional library filler.
//   2. Every Recommended badge must be earned by such a link. A Recommended
//      badge no assignment references is a lie about what prepares what.
//   3. Every anchor an assignment links to must resolve to a real heading.
//      (The Starlight link validator also catches this at build time; this
//      check runs without a build and names the activity, not the URL.)
//   4. Every Workshop or Recommended activity carries a "Feeds:" line naming
//      the rubric criterion it prepares. That line is how a student working
//      backward from a rubric finds the activity, and how a future editor
//      tells whether the activity still earns its tier.
//
//   5. Every activity carries a closing "A good output is..." line. The
//      deliverable line is the only quality signal an activity has, and it is
//      what lets a student self-check. The audience badge itself cannot be
//      required here, because it is the definition of an activity: a `##`
//      section without one is prose. What can be caught is the near miss, a
//      section that carries a tier badge (Workshop or Recommended) and no
//      audience badge, which is an activity someone forgot to label. Those
//      are reported instead of being skipped as prose.
//
//   6. The week-by-week schedule on introduction/schedule.mdx links activities
//      directly, outside any assignment page. Every one of those links must
//      resolve and carry a Workshop or Recommended badge, so the schedule
//      never sends a student to an activity no assignment page still
//      recommends; and every Workshop activity must appear on the schedule,
//      so a workshop cannot exist without a week.
//
// Workshop-tier activities are exempt from rule 2: they are assigned centrally
// through assignments/workshop-activities.mdx, not per assignment page.
//
// Run: node scripts/validate-activities.mjs

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ASSIGNMENTS_DIR = "src/content/docs/assignments";
const ACTIVITIES_DIR = "src/content/docs/activities";
const SECTION_HEADING = "## Activities That Prepare This";
const SCHEDULE_PAGE = "src/content/docs/introduction/schedule.mdx";
const ACTIVITY_LINK_RE = /\/activities\/([a-z-]+)\/#([\w-]+)/g;

// GitHub-style slugger, matching how Starlight derives heading anchors.
function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The badges belong on the line right after the heading. The scan window is
// wider than that one line only so a badge pushed down by a blank line or an
// MDX comment is still found (and, from the same window, reported).
const BADGE_WINDOW_LINES = 4;
const AUDIENCE_BADGE_RE =
  /<Badge[^>]*text="(Individual Activity|Team Activity)"/g;
const TIER_BADGE_RE = /<Badge[^>]*text="(Workshop|Recommended)"/;

// The section body runs to the next h2 or end of file.
function sectionEnd(lines, start) {
  for (let j = start + 1; j < lines.length; j += 1) {
    if (lines[j].startsWith("## ")) {
      return j;
    }
  }
  return lines.length;
}

// The skill fixes the variant per audience; a Team badge in green reads as
// an Individual one at a glance, which is the only reason the colours exist.
const AUDIENCE_VARIANTS = {
  "Individual Activity": "success",
  "Team Activity": "note",
};

// Badges whose variant disagrees with AUDIENCE_VARIANTS, as "text (variant)".
function badVariants(badgeWindow) {
  const bad = [];
  for (const [tag] of badgeWindow.matchAll(/<Badge\b[^>]*>/g)) {
    const text = tag.match(/\btext="([^"]*)"/)?.[1];
    const variant = tag.match(/\bvariant="([^"]*)"/)?.[1];
    const expected = AUDIENCE_VARIANTS[text];
    if (expected && variant !== expected) {
      bad.push(`${text} (${variant ?? "no variant"}, expected ${expected})`);
    }
  }
  return bad;
}

// True when the last "A good output" line is the final non-blank line of
// the section, or is followed only by the Feeds line.
function outputIsClosing(bodyLines) {
  const at = bodyLines.findLastIndex((l) => l.startsWith("A good output"));
  if (at === -1) {
    return true; // reported separately as a missing deliverable
  }
  const after = bodyLines.slice(at + 1).filter((l) => l.trim() !== "");
  return (
    after.length === 0 ||
    (after.length === 1 && after[0].startsWith("**Feeds:**"))
  );
}

function readSection(page, lines, i) {
  const heading = lines[i].slice(3).trim();
  const badgeWindow = lines.slice(i + 1, i + 1 + BADGE_WINDOW_LINES).join("\n");
  const bodyLines = lines.slice(i + 1, sectionEnd(lines, i));
  const body = bodyLines.join("\n");
  return {
    audience: [...badgeWindow.matchAll(AUDIENCE_BADGE_RE)].length,
    // One badge line, on the line after the blank line after the heading.
    badgesOnOneLine:
      lines[i + 1] === "" &&
      (lines[i + 2] ?? "").startsWith("<Badge") &&
      bodyLines.filter((l) => l.startsWith("<Badge")).length === 1,
    badVariants: badVariants(badgeWindow),
    hasFeeds: /^\*\*Feeds:\*\*/m.test(body),
    hasOutput: /^A good output/m.test(body),
    heading,
    outputIsClosing: outputIsClosing(bodyLines),
    page,
    tier: badgeWindow.match(TIER_BADGE_RE)?.[1] ?? null,
  };
}

// Collect every activity: page, heading, slug, and its tier badge (if any).
// Also collect the near misses: sections with a tier badge and no audience
// badge, which rule 5 reports.
function readActivities() {
  const activities = new Map(); // "page#slug" -> { page, heading, tier, ... }
  const unlabeled = [];
  for (const file of readdirSync(ACTIVITIES_DIR)) {
    if (!file.endsWith(".mdx") || file === "introduction.mdx") {
      continue;
    }
    const page = file.slice(0, -4);
    const lines = readFileSync(join(ACTIVITIES_DIR, file), "utf8").split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      if (!lines[i].startsWith("## ")) {
        continue;
      }
      const section = readSection(page, lines, i);
      // No audience badge means this is page prose, not an activity, unless
      // a tier badge says otherwise.
      if (section.audience === 0) {
        if (section.tier) {
          unlabeled.push(section);
        }
        continue;
      }
      activities.set(`${page}#${slugify(section.heading)}`, section);
    }
  }
  return { activities, unlabeled };
}

// Collect every activity link inside an "Activities That Prepare This" section.
function readAssignmentLinks() {
  const links = new Map(); // "page#slug" -> Set of assignment filenames
  for (const file of readdirSync(ASSIGNMENTS_DIR)) {
    if (!file.endsWith(".mdx")) {
      continue;
    }
    const source = readFileSync(join(ASSIGNMENTS_DIR, file), "utf8");
    const start = source.indexOf(SECTION_HEADING);
    if (start === -1) {
      continue;
    }
    const section = source.slice(start);
    for (const m of section.matchAll(ACTIVITY_LINK_RE)) {
      const key = `${m[1]}#${m[2]}`;
      if (!links.has(key)) {
        links.set(key, new Set());
      }
      links.get(key).add(file);
    }
  }
  return links;
}

// Collect every activity link on the schedule page, wherever it sits.
function readScheduleLinks() {
  const source = readFileSync(SCHEDULE_PAGE, "utf8");
  return new Set(
    [...source.matchAll(ACTIVITY_LINK_RE)].map((m) => `${m[1]}#${m[2]}`)
  );
}

const { activities, unlabeled } = readActivities();
const links = readAssignmentLinks();
const scheduled = readScheduleLinks();
const problems = [];

// Rule 5, the audience half: a tier badge with no audience badge.
for (const section of unlabeled) {
  problems.push(
    `no audience badge: "${section.heading}" (${section.page}) carries a ${section.tier} badge but no Individual or Team Activity badge, so it is not counted as an activity`
  );
}

// Rule 3, then rule 1.
for (const [key, sources] of links) {
  const activity = activities.get(key);
  const from = [...sources].join(", ");
  if (!activity) {
    problems.push(
      `broken anchor: /activities/${key} linked from ${from} matches no heading`
    );
    continue;
  }
  if (!activity.tier) {
    problems.push(
      `untiered: "${activity.heading}" (${activity.page}) is linked from ${from} but carries no Workshop or Recommended badge`
    );
  }
}

// Rules 2, 4, and 5.
for (const [key, activity] of activities) {
  if (activity.audience > 2) {
    problems.push(
      `too many audience badges: "${activity.heading}" (${activity.page}) carries ${activity.audience}; legal states are Individual, Team, or both`
    );
  }
  if (!activity.hasOutput) {
    problems.push(
      `missing deliverable: "${activity.heading}" (${activity.page}) has no closing "A good output is..." line`
    );
  }
  if (!activity.outputIsClosing) {
    problems.push(
      `deliverable not last: "${activity.heading}" (${activity.page}) has prose after its "A good output" line; only the Feeds line may follow it`
    );
  }
  for (const bad of activity.badVariants) {
    problems.push(
      `wrong badge variant: "${activity.heading}" (${activity.page}) has ${bad}`
    );
  }
  if (!activity.badgesOnOneLine) {
    problems.push(
      `badge placement: "${activity.heading}" (${activity.page}) must carry all its badges on one line, two lines below the heading (blank line between)`
    );
  }
  if (activity.tier === "Recommended" && !links.has(key)) {
    problems.push(
      `unearned badge: "${activity.heading}" (${activity.page}) is marked Recommended but no assignment page links to it`
    );
  }
  if (activity.tier && !activity.hasFeeds) {
    problems.push(
      `missing Feeds: "${activity.heading}" (${activity.page}) is ${activity.tier} tier but has no "**Feeds:**" line naming the criterion it prepares`
    );
  }
}

// Rule 6: the schedule links only tiered activities, and every workshop.
for (const key of scheduled) {
  const activity = activities.get(key);
  if (!activity) {
    problems.push(
      `broken anchor: /activities/${key} linked from the week-by-week schedule matches no heading`
    );
    continue;
  }
  if (!activity.tier) {
    problems.push(
      `schedule drift: "${activity.heading}" (${activity.page}) is on the week-by-week schedule but no assignment page recommends it and it is not a workshop activity`
    );
  }
}
for (const [key, activity] of activities) {
  if (activity.tier === "Workshop" && !scheduled.has(key)) {
    problems.push(
      `unscheduled workshop: "${activity.heading}" (${activity.page}) is Workshop tier but the week-by-week schedule never links it`
    );
  }
}

// --- Activities and guides: no outcome tags, no grading language -------------
// Outcome tags belong only in assignment rubric tables, where the outcomes
// validator reads them; a tag anywhere else looks like coverage and counts
// as nothing. Point values and percentages next to "grade", "rubric" or
// "criterion" are assignment-page content. A bare "%" or "points" is not
// flagged, because the gen-AI and sprint guides use both legitimately.
const GUIDES_DIR = "src/content/docs/guides";
const OUTCOME_TAG_RE = /\b(SO[1-6]|L0[7-9]|L10)\b/g;
const GRADE_NUMBER_RE = /\b\d+(?:\.\d+)?(?:%| points?\b)/g;
const GRADE_WORD_RE =
  /\b(grad(?:e|ed|es|ing)|rubric|(?<!success )criteri(?:on|a))\b/i;
const GRADE_CONTEXT_CHARS = 60;

for (const dir of [ACTIVITIES_DIR, GUIDES_DIR]) {
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".mdx")) {
      continue;
    }
    const source = readFileSync(join(dir, file), "utf8");
    const where = `${dir.split("/").at(-1)}/${file}`;
    for (const m of source.matchAll(OUTCOME_TAG_RE)) {
      problems.push(
        `outcome tag: ${where} mentions ${m[1]}; tags belong only in assignment rubric tables`
      );
    }
    for (const m of source.matchAll(GRADE_NUMBER_RE)) {
      const context = source.slice(
        Math.max(0, m.index - GRADE_CONTEXT_CHARS),
        m.index + m[0].length + GRADE_CONTEXT_CHARS
      );
      if (GRADE_WORD_RE.test(context)) {
        problems.push(
          `grading language: ${where} says "${m[0]}" next to a grading word: ${JSON.stringify(context.replace(/\s+/g, " ").trim())}`
        );
      }
    }
  }
}

const counts = { Library: 0, Recommended: 0, Workshop: 0 };
for (const activity of activities.values()) {
  counts[activity.tier ?? "Library"] += 1;
}

// Two pages describe the size of the non-workshop library in prose. An exact
// number went stale within a month, so the prose says "more than a hundred"
// and this asserts both that the phrase is still there and that it is still
// true. If the library shrinks below a hundred, change the phrase in both
// places and here, in the same commit.
const LIBRARY_CLAIM = /more than a hundred/i;
const LIBRARY_CLAIM_MIN = 100;
const LIBRARY_CLAIM_PAGES = [
  join(ACTIVITIES_DIR, "introduction.mdx"),
  join(ASSIGNMENTS_DIR, "workshop-activities.mdx"),
];
const nonWorkshop = activities.size - counts.Workshop;
for (const page of LIBRARY_CLAIM_PAGES) {
  if (!LIBRARY_CLAIM.test(readFileSync(page, "utf8"))) {
    problems.push(
      `library count: ${page} no longer says "more than a hundred"; the two prose figures must agree with each other and with the ${nonWorkshop} non-workshop activities`
    );
  }
}
if (nonWorkshop < LIBRARY_CLAIM_MIN) {
  problems.push(
    `library count: the pages claim more than a hundred non-workshop activities but there are ${nonWorkshop}`
  );
}

console.log("Activity tiers:");
console.log(`  Workshop:    ${counts.Workshop}`);
console.log(`  Recommended: ${counts.Recommended}`);
console.log(`  Library:     ${counts.Library}`);
console.log(`  Total:       ${activities.size}`);
console.log(
  `Schedule:      ${scheduled.size} activity links on the week-by-week schedule`
);

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(
    "\nSee .claude/skills/cs46x-activities/SKILL.md for the tier rules."
  );
  process.exit(1);
}
console.log(
  "\nEvery linked activity is tiered, and every Recommended badge is earned."
);
