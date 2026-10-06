#!/usr/bin/env node
// Validates the activity pages against .claude/skills/cs46x-activities.
//
// An ACTIVITY is a `##` section carrying an `<ActivityMeta>` badge line. That
// is the whole definition, and it is mechanical on purpose: page framing and
// closing prose also use `##`, so counting headings alone silently counts
// non-activities.
//
// An activity's tier is not written on its page. It is computed, here and in
// the badge line alike, by src/lib/activity-links.mjs from the assignment
// pages: Workshop when a `### Workshop N:` section on
// assignments/workshop-activities.mdx names it, Recommended when an
// assignment's "Activities That Prepare This" section links it, Library
// otherwise. A hand-written tier badge was a second copy of that fact, and
// two rules here existed only to catch the copies drifting.
//
//   1. The badge line sits two lines below its heading (blank line between),
//      once per section, and its `anchor` is the heading's slug, so the
//      component looks up the activity the heading names. `effort`, when
//      present, is on the fixed scale. A hand-written audience or tier badge
//      is reported: those are retired.
//   2. Every anchor an assignment links to must resolve to a real heading.
//      (The Starlight link validator also catches this at build time; this
//      check runs without a build and names the activity, not the URL.)
//   3. An activity or guide page is standalone. It never links an assignment
//      page, never says "workshop", and never places itself in a term, a
//      numbered week, or a "first half" or "second half" (of a class session
//      on an activity page, of the project on a guide). Nor does it measure
//      itself by the course calendar ("three terms", "ten weeks", "this
//      year", "a year left") or name the course staff ("TA"). The patterns are a
//      floor: a spelled-out week or a bare "term" passes them and is still a
//      violation the page's skill asks a human to read for. Activities had
//      drifted to sixty-one backlinks and ten sessions described by the
//      clock. Guides held the assignment-link half by convention (zero
//      backlinks across nineteen files) and still carried about sixty term
//      and week references, the shipping guide built on the course calendar,
//      because nothing checked them. A reader who is not enrolled should be
//      able to use any page in either directory. Guide links and external
//      sources stay, and the direction of travel is one way: assignments link
//      to both. The generated badge line is the one exception: it names the
//      course pages an activity serves, and it is computed, not prose.
//      An activity page also never names an assignment in prose ("an RFC",
//      "your sprint notes"), and every assignment title must be classified
//      in ASSIGNMENT_NAMES, so a new assignment cannot slip past the list.
//
//   4. Every activity carries a closing "A good output is..." line. The
//      deliverable line is the only quality signal an activity has, and it is
//      what lets a student self-check.
//
//   5. The week-by-week schedule on introduction/schedule.mdx links activities
//      directly, outside any assignment page. Every one of those links must
//      resolve. A link on an **Optional** line must be a Workshop or
//      Recommended activity, so the schedule never offers a student an
//      activity no assignment page still recommends. An **In class** line may
//      link a library activity: a class session can run something
//      unassessed, and an icebreaker will never earn a tier because no
//      assignment prepares from it.
//
//   6a. Every guide is scheduled at least once. Nothing used to fail when a
//      guide was read in no term, and two were: accessibility and
//      ai-project-setup, 4,843 words nobody was ever asked to read. This is
//      the guide half of rule 5, with one deliberate exemption.
//
//   6. Every workshop section on assignments/workshop-activities.mdx has a
//      week in its frontmatter, the two agree on each term's count, no two
//      sections share a heading (the Workshop badge links it by anchor, which
//      the build's link validator never sees), and every Workshop activity
//      sits on an In class line, in the same term and week that page gives it. The schedule
//      and the assignment page are two records of one fact, and before this
//      check they disagreed about fall week 3 for weeks: the schedule prose
//      named one activity, its link named another. Reading the page as one
//      flat set of links could not see it.
//
// Run: node scripts/validate-activities.mjs

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import {
  ACTIVITY_LINK_RE,
  activityKey,
  buildActivityIndex,
  EFFORT_SCALE,
  slugify,
  tierOf,
  workshopEntries,
} from "../src/lib/activity-links.mjs";
import { canvasRows, TERMS } from "../src/lib/canvas-entries.mjs";
import { OUTCOME_TAG } from "../src/lib/rubric-csv.mjs";
import { parseFrontmatter } from "./lib/content.mjs";

const ASSIGNMENTS_DIR = "src/content/docs/assignments";
const ACTIVITIES_DIR = "src/content/docs/activities";
const GUIDES_DIR = "src/content/docs/guides";
const SCHEDULE_PAGE = "src/content/docs/introduction/schedule.mdx";
const WORKSHOP_PAGE = "src/content/docs/assignments/workshop-activities.mdx";
const GUIDE_LINK_RE = /\/guides\/([a-z-]+)\//g;
// The schedule heads its term sections "## Fall (CS 461)".
const TERM_HEADING_RE = /^## (Fall|Winter|Spring)\b/;
const WEEK_HEADING_RE = /^### Week (\d+)\b/;
// A schedule line is a list item labelled in bold: Due, In class, Read,
// Optional. A nested item carries no label and belongs to the line above it.
const ROW_LABEL_RE = /^- \*\*([A-Za-z][A-Za-z -]*?):?\*\*/;

// The badge line belongs on the line after the blank line under the heading.
// The scan window is wider than that only so a badge line pushed down by a
// second blank line or an MDX comment is still found and reported.
const BADGE_WINDOW_LINES = 4;
const META_TAG_RE = /<ActivityMeta\b[^>]*>/;
// The badges the badge line replaced. One left on an activity page is a
// hand-written second copy of what the component computes.
const RETIRED_BADGE_RE =
  /<Badge[^>]*text="(Individual Activity|Team Activity|Workshop|Recommended)"/;

// The section body runs to the next h2 or end of file.
function sectionEnd(lines, start) {
  for (let j = start + 1; j < lines.length; j += 1) {
    if (lines[j].startsWith("## ")) {
      return j;
    }
  }
  return lines.length;
}

// True when the last "A good output" line is the final non-blank line of the
// section. Nothing may follow it: the Feeds line used to be the one exception
// and no longer exists.
function outputIsClosing(bodyLines) {
  const at = bodyLines.findLastIndex((l) => l.startsWith("A good output"));
  if (at === -1) {
    return true; // reported separately as a missing deliverable
  }
  return bodyLines.slice(at + 1).every((l) => l.trim() === "");
}

function readSection(page, lines, i) {
  const heading = lines[i].slice(3).trim();
  const badgeWindow = lines.slice(i + 1, i + 1 + BADGE_WINDOW_LINES).join("\n");
  const bodyLines = lines.slice(i + 1, sectionEnd(lines, i));
  const body = bodyLines.join("\n");
  const tag = badgeWindow.match(META_TAG_RE)?.[0] ?? null;
  return {
    anchor: tag?.match(/\banchor="([^"]*)"/)?.[1] ?? null,
    effort: tag?.match(/\beffort="([^"]*)"/)?.[1] ?? null,
    hasOutput: /^A good output/m.test(body),
    heading,
    // One badge line, on the line after the blank line after the heading.
    metaPlaced:
      lines[i + 1] === "" &&
      (lines[i + 2] ?? "").startsWith("<ActivityMeta") &&
      bodyLines.filter((l) => l.includes("<ActivityMeta")).length === 1,
    outputIsClosing: outputIsClosing(bodyLines),
    page,
    retiredBadges: bodyLines.filter((l) => RETIRED_BADGE_RE.test(l)).length,
    slug: slugify(heading),
    tag,
  };
}

// How a message names an activity, or a section that should have been one.
const activityLabel = (section) => `"${section.heading}" (${section.page})`;

// Collect every activity, keyed "page#slug". Also collect the near misses:
// sections still carrying a retired hand-written badge and no badge line,
// which are reported rather than skipped as prose.
function readActivities() {
  const activities = new Map();
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
      if (!section.tag) {
        if (section.retiredBadges > 0) {
          unlabeled.push(section);
        }
        continue;
      }
      activities.set(activityKey(page, section.slug), section);
    }
  }
  return { activities, unlabeled };
}

// Every assignment page as the shared lib reads it: docs id, title, sidebar
// order, and the raw MDX.
function readAssignments() {
  const assignments = [];
  for (const file of readdirSync(ASSIGNMENTS_DIR)) {
    if (!file.endsWith(".mdx")) {
      continue;
    }
    const source = readFileSync(join(ASSIGNMENTS_DIR, file), "utf8");
    const data = parse(parseFrontmatter(source)?.frontmatter ?? "") ?? {};
    assignments.push({
      body: source,
      file,
      id: `assignments/${file.slice(0, -4)}`,
      order: data.sidebar?.order,
      title: data.title ?? file,
    });
  }
  return assignments;
}

// Collect every activity link on the schedule page with the term, week, and
// line label it sits under. A flat set of links cannot tell an In class line from
// an Optional one, which is how the fall week 3 contradiction survived CI.
function readSchedulePlacements() {
  const placements = [];
  let term = null;
  let week = null;
  let label = null;
  for (const line of readFileSync(SCHEDULE_PAGE, "utf8").split("\n")) {
    if (line.startsWith("## ")) {
      term = line.match(TERM_HEADING_RE)?.[1].toLowerCase() ?? null;
      week = null;
      label = null;
      continue;
    }
    const weekHeading = line.match(WEEK_HEADING_RE);
    if (weekHeading) {
      week = Number(weekHeading[1]);
      label = null;
      continue;
    }
    // A nested item or a wrapped continuation belongs to the line above it.
    label = line.match(ROW_LABEL_RE)?.[1] ?? label;
    const row = label;
    if (!row) {
      continue;
    }
    for (const m of line.matchAll(ACTIVITY_LINK_RE)) {
      placements.push({ key: activityKey(m[1], m[2]), row, term, week });
    }
  }
  return placements;
}

// Every workshop entry with the week it runs: entry N's week is the Nth week
// the workshop page's frontmatter lists for that term, or undefined when the
// frontmatter lists fewer. `rows` is the frontmatter's entries per term.
function readWorkshops(source) {
  const rows = canvasRows(
    parse(parseFrontmatter(source).frontmatter).assignment.canvas
  );
  const entries = workshopEntries(source).map((entry) => ({
    ...entry,
    week: rows.find((r) => r.term === entry.term)?.weeks[entry.n - 1],
  }));
  return { entries, rows };
}

const { activities, unlabeled } = readActivities();
const assignments = readAssignments();
const workshopSource = readFileSync(WORKSHOP_PAGE, "utf8");
const index = buildActivityIndex({ assignments, workshopSource });
const tier = (key) => tierOf(index.get(key));
const placements = readSchedulePlacements();
const workshops = readWorkshops(workshopSource);
const problems = [];

// Rule 1, the near miss: a section with a hand-written badge and no badge line.
for (const section of unlabeled) {
  problems.push(
    `no badge line: ${activityLabel(section)} carries a hand-written audience or tier badge and no <ActivityMeta>, so it is not counted as an activity`
  );
}

// Rule 2: every prepared activity resolves.
for (const [key, entry] of index) {
  if (activities.has(key) || entry.prepares.length === 0) {
    continue;
  }
  const from = entry.prepares.map((a) => `${a.id}.mdx`).join(", ");
  problems.push(
    `broken anchor: /activities/${key} linked from ${from} matches no heading`
  );
}

// Rules 1 and 4.
for (const activity of activities.values()) {
  if (!activity.metaPlaced) {
    problems.push(
      `badge placement: ${activityLabel(activity)} must carry one <ActivityMeta> line, two lines below the heading (blank line between)`
    );
  }
  if (activity.anchor !== activity.slug) {
    problems.push(
      `badge anchor: ${activityLabel(activity)} has anchor="${activity.anchor ?? ""}", but its heading's anchor is "${activity.slug}"`
    );
  }
  if (activity.effort !== null && !EFFORT_SCALE.includes(activity.effort)) {
    problems.push(
      `effort off the scale: ${activityLabel(activity)} has effort="${activity.effort}"; use one of ${EFFORT_SCALE.join(", ")}`
    );
  }
  if (activity.retiredBadges > 0) {
    problems.push(
      `hand-written badge: ${activityLabel(activity)} still carries an Individual, Team, Workshop, or Recommended badge; <ActivityMeta> computes the badge line`
    );
  }
  if (!activity.hasOutput) {
    problems.push(
      `missing deliverable: ${activityLabel(activity)} has no closing "A good output is..." line`
    );
  }
  if (!activity.outputIsClosing) {
    problems.push(
      `deliverable not last: ${activityLabel(activity)} has prose after its "A good output" line, which has to close the section`
    );
  }
}

// Rule 5: every scheduled link resolves, and every line but In class offers
// only Workshop or Recommended activities.
for (const placement of placements) {
  const activity = activities.get(placement.key);
  const where = `${placement.term} week ${placement.week}`;
  if (!activity) {
    problems.push(
      `broken anchor: /activities/${placement.key} linked from the week-by-week schedule (${where}) matches no heading`
    );
    continue;
  }
  if (!(tier(placement.key) !== "Library" || placement.row === "In class")) {
    problems.push(
      `schedule drift: ${activityLabel(activity)} is on the ${placement.row} line of ${where} but no assignment page recommends it and it is not a workshop activity`
    );
  }
}

// Rule 6: the schedule and the assignment page agree on every workshop. Each
// direction fails differently, so each is reported separately.
const lectureWeeks = new Map(); // "page#slug" -> [{ term, week }]
for (const placement of placements) {
  if (placement.row !== "In class") {
    continue;
  }
  if (!lectureWeeks.has(placement.key)) {
    lectureWeeks.set(placement.key, []);
  }
  lectureWeeks.get(placement.key).push(placement);
}

// The page and its frontmatter agree on how many workshops each term holds,
// so no section runs in a week nobody listed and no listed week goes without
// its section. A section with no activity link is no entry, so the count
// catches it too.
for (const term of TERMS) {
  const sections = workshops.entries.filter((e) => e.term === term).length;
  const listed = workshops.rows.find((r) => r.term === term)?.names.length ?? 0;
  if (sections !== listed) {
    problems.push(
      `workshop count: assignments/workshop-activities.mdx has ${sections} ${term} "### Workshop N:" section(s) naming an activity, but its frontmatter lists ${listed} ${term} workshop(s)`
    );
  }
}

// The Workshop badge links its section by anchor, outside the build's link
// validator. github-slugger would suffix a repeated heading's anchor with
// "-1" and the lib would not, so a repeat would send a badge to the wrong
// section.
const workshopSlugs = new Set();
for (const entry of workshops.entries) {
  if (workshopSlugs.has(entry.slug)) {
    problems.push(
      `duplicate workshop heading: "${entry.heading}" appears twice on assignments/workshop-activities.mdx, so its Workshop badges cannot both link it`
    );
  }
  workshopSlugs.add(entry.slug);
}

for (const entry of workshops.entries) {
  const where = `${entry.term} ${entry.heading}`;
  if (!Number.isInteger(entry.week)) {
    problems.push(
      `workshop without a week: ${where} on assignments/workshop-activities.mdx has no week ${entry.n} in its frontmatter's ${entry.term} list`
    );
    continue;
  }
  const activity = activities.get(entry.key);
  if (!activity) {
    problems.push(
      `broken anchor: /activities/${entry.key} listed as the ${entry.term} week ${entry.week} workshop matches no heading`
    );
    continue;
  }
  const lectures = lectureWeeks.get(entry.key) ?? [];
  if (lectures.length === 0) {
    problems.push(
      `unscheduled workshop: ${activityLabel(activity)} is Workshop tier but no In class line on the week-by-week schedule links it`
    );
  } else if (
    !lectures.some((l) => l.term === entry.term && l.week === entry.week)
  ) {
    const found = lectures.map((l) => `${l.term} week ${l.week}`).join(", ");
    problems.push(
      `workshop week mismatch: ${activityLabel(activity)} runs in ${entry.term} week ${entry.week} on assignments/workshop-activities.mdx, but the schedule's In class lines put it in ${found}`
    );
  }
}

// Rule 6a: every guide is read in some week. Only Read lines count, because a
// guide named in passing on an In class line is not assigned reading.
const GUIDES_NEVER_SCHEDULED = new Set([
  // The section index, not a guide.
  "introduction",
  // Deliberately unscheduled: students are expected to arrive knowing git, and
  // the guide is kept as reference. Removing it from fall week 3 is what took
  // that week from 11,145 words to about 7,800, in the week before the RFC
  // draft.
  "git-and-github",
]);
const scheduledGuides = new Set();
for (const line of readFileSync(SCHEDULE_PAGE, "utf8").split("\n")) {
  if (line.match(ROW_LABEL_RE)?.[1] !== "Read") {
    continue;
  }
  for (const m of line.matchAll(GUIDE_LINK_RE)) {
    scheduledGuides.add(m[1]);
  }
}
for (const file of readdirSync(GUIDES_DIR)) {
  if (!file.endsWith(".mdx")) {
    continue;
  }
  const guide = file.slice(0, -4);
  if (GUIDES_NEVER_SCHEDULED.has(guide) || scheduledGuides.has(guide)) {
    continue;
  }
  problems.push(
    `unscheduled guide: guides/${file} is in no Read row on the week-by-week schedule, so nobody is ever asked to read it`
  );
}

// --- Rule 3: activity and guide pages are standalone -------------------------
// Each pattern is something a reader outside this course cannot resolve. The
// two exemptions are real external events, not sessions of this course, and
// they are listed rather than pattern-matched so that adding a third is a
// deliberate act. A week number is banned outright, not only a course week:
// the pattern cannot tell "fall week 3" from "a plan made in week 2", and an
// illustration reads as well in durations ("a month later") as in numbers.
const STANDALONE_RULES = [
  [/\]\(\/assignments\//, "links an assignment page"],
  [/\b(?:first|second) half\b/i, 'says "first half" or "second half"'],
  [/\bworkshops?\b/i, 'says "workshop"'],
  [/\bweeks? \d/i, "names a week number"],
  [/\bin (?:the )?(?:fall|winter|spring)\b/i, "places itself in a term"],
  [
    /\b(?:fall|winter|spring) (?:week|term|session|workshop)/i,
    "places itself in a term",
  ],
  [/\bthree terms\b/i, 'says "three terms", the course calendar'],
  [/\bten weeks\b/i, 'says "ten weeks", the length of a term'],
  [
    /\b(?:this|next|last) (?:academic )?year\b/i,
    "places itself in the school year",
  ],
  [/\ba year left\b/i, "measures the project by the school year"],
  // Case-sensitive, so "ta" inside a word and lowercase use do not trip it.
  [/\bTAs?\b/, "names the course staff (TA)"],
];
const STANDALONE_EXEMPT = new Set([
  // The OSU Advantage Accelerator's Iterate program is an external event the
  // team registers for, and calling it anything but a workshop would be wrong.
  "activities/requirements#osu-advantage-accelerators-iterate-program",
  // "Present at a conference or workshop" is an outreach channel.
  "activities/working-with-users#find-users",
]);
// An activity page also never names a course assignment, because a reader
// outside the course has no RFC or Expo to prepare. Every assignment title is
// a key here, so a new assignment fails the check until someone decides how
// prose may name it. A pattern is the course's name for the work; null means
// the title is the industry practice's own name ("team charter", "incident
// postmortem"), which any reader resolves, or is already covered above.
// Guides are not read: they cite the industry names, RFC among them, as
// industry practice.
const ASSIGNMENT_NAMES = new Map([
  ["Assignments Overview", null], // a page, not a piece of work
  ["Bidding Survey", /\bbidding[\s-]surveys?\b/i],
  [
    "Career and Individual Retrospective",
    /\bindividual[\s-]retrospectives?\b/i,
  ],
  // Bare "defense" is ordinary English and opens a quoted attribution.
  ["Defense", /\b(?:design|project|technical|final)[\s-]defen[cs]es?\b/i],
  ["Definition of Shipped", /\bdefinitions?[\s-]of[\s-]shipped\b/i],
  ["Demo Day", /\bdemo[\s-]days?\b/i],
  // Bare "Expo" is also the React Native framework.
  ["Engineering Expo", /\bengineering[\s-]expos?\b|\bat the expo\b/i],
  ["Incident Postmortem", null],
  ["Landing Page", null],
  ["Peer Evaluations", /\bpeer[\s-]evaluations?\b/i],
  ["Project Handoff", null],
  ["Project Partner Evaluation", /\bpartner[\s-]evaluations?\b/i],
  ["Project Retrospective", null],
  ["Release and Metrics", /\brelease[\s-]and[\s-]metrics\b/i],
  ["Repo Checkpoints", /\brepo(?:sitory)?[\s-]checkpoints?\b/i],
  ["Resume and Intent", /\bresume[\s-]and[\s-]intent\b/i],
  [
    "RFC (Request for Comments)",
    /\bRFCs?\b|\brequests?[\s-]for[\s-]comments?\b/i,
  ],
  ["Sprint Notes and Demos", /\bsprint[\s-]notes?\b/i],
  ["Team Charter", null],
  ["Term Retrospective", /\bterm[\s-]retrospectives?\b/i],
  ["Term Startup", /\bterm[\s-]startups?\b/i],
  ["Workshop Activities", null], // the "workshop" rule above covers it
]);
const assignmentTitles = new Set(assignments.map((a) => a.title));
for (const { file, title } of assignments) {
  if (!ASSIGNMENT_NAMES.has(title)) {
    problems.push(
      `unclassified assignment title: assignments/${file} is titled ${JSON.stringify(title)}; add it to ASSIGNMENT_NAMES in scripts/validate-activities.mjs`
    );
  }
}
for (const title of ASSIGNMENT_NAMES.keys()) {
  if (!assignmentTitles.has(title)) {
    problems.push(
      `stale assignment title: ASSIGNMENT_NAMES lists ${JSON.stringify(title)}, which no assignment page is titled`
    );
  }
}
const ASSIGNMENT_NAME_RULES = [...ASSIGNMENT_NAMES]
  .filter(([, pattern]) => pattern)
  .map(([title, pattern]) => [pattern, `names the ${title} assignment`]);
const ACTIVITY_RULES = [...STANDALONE_RULES, ...ASSIGNMENT_NAME_RULES];
// A third-party URL is someone else's slug, not this page's prose: a link
// whose slug ends in "-workshop" is not the page saying "workshop". Internal
// links are kept, because the assignment-link rule reads them.
const EXTERNAL_LINK_TARGET_RE = /\]\(https?:\/\/[^)]*\)/g;

// Every MDX page under activities/ and guides/, with the directory's short
// name for messages and keys. Rule 3 and the outcome-tag and grading-language
// check below both read exactly these pages.
function* activityAndGuidePages() {
  for (const [dir, kind] of [
    [ACTIVITIES_DIR, "activities"],
    [GUIDES_DIR, "guides"],
  ]) {
    for (const file of readdirSync(dir)) {
      if (file.endsWith(".mdx")) {
        yield { dir, file, kind };
      }
    }
  }
}

for (const { dir, kind, file } of activityAndGuidePages()) {
  // The activities index is the page that explains what the badge line
  // means, so it is the one page allowed to say "workshop" and to link the
  // assignment that owns the tier. The guides index gets no such pass.
  if (dir === ACTIVITIES_DIR && file === "introduction.mdx") {
    continue;
  }
  const page = `${kind}/${file.slice(0, -4)}`;
  const pageRules = kind === "activities" ? ACTIVITY_RULES : STANDALONE_RULES;
  let section = null;
  for (const line of readFileSync(join(dir, file), "utf8").split("\n")) {
    if (line.startsWith("## ")) {
      section = `${page}#${slugify(line.slice(3).trim())}`;
    }
    // The generated badge line names course pages by design; it is markup
    // computed from the assignment pages, not prose.
    if (line.startsWith("<ActivityMeta")) {
      continue;
    }
    // An exemption is for an external event's name, so it waives the
    // standalone patterns but never the assignment names.
    let rules = pageRules;
    if (STANDALONE_EXEMPT.has(section)) {
      rules = kind === "activities" ? ASSIGNMENT_NAME_RULES : [];
    }
    const prose = line.replace(EXTERNAL_LINK_TARGET_RE, "]()");
    for (const [pattern, what] of rules) {
      if (pattern.test(prose)) {
        problems.push(
          `not standalone: ${kind}/${file} ${what}: ${JSON.stringify(line.trim().slice(0, 110))}`
        );
      }
    }
  }
}

// --- Activities and guides: no outcome tags, no grading language -------------
// Outcome tags belong only in assignment rubric CSVs, where the outcomes
// validator reads them; a tag anywhere else looks like coverage and counts
// as nothing. Point values and percentages next to "grade", "rubric" or
// "criterion" are assignment-page content. A bare "%" or "points" is not
// flagged, because the gen-AI and sprint guides use both legitimately.
const OUTCOME_TAG_IN_TEXT_RE = new RegExp(
  String.raw`\b(${OUTCOME_TAG})\b`,
  "g"
);
const GRADE_NUMBER_RE = /\b\d+(?:\.\d+)?(?:%| points?\b)/g;
const GRADE_WORD_RE =
  /\b(grad(?:e|ed|es|ing)|rubric|(?<!success )criteri(?:on|a))\b/i;
const GRADE_CONTEXT_CHARS = 60;

for (const { dir, file, kind } of activityAndGuidePages()) {
  const source = readFileSync(join(dir, file), "utf8");
  const where = `${kind}/${file}`;
  for (const m of source.matchAll(OUTCOME_TAG_IN_TEXT_RE)) {
    problems.push(
      `outcome tag: ${where} mentions ${m[1]}; tags belong only in assignment rubric CSVs`
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

const counts = { Library: 0, Recommended: 0, Workshop: 0 };
for (const key of activities.keys()) {
  counts[tier(key)] += 1;
}

// Two pages count the activities other than the workshops (Recommended plus
// Library) in prose, not the Library tier alone. An exact number went stale
// within a month, so the prose says "more than a hundred" and this asserts
// both that the phrase is still there and that it is still true. If the count
// drops below a hundred, change the phrase in both places and here, in the
// same commit.
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
  `Schedule:      ${new Set(placements.map((p) => p.key)).size} activities across ${placements.length} links on the week-by-week schedule`
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
  "\nEvery badge line is placed and anchored, and every linked activity resolves."
);
