#!/usr/bin/env node
// Validates learning-outcome coverage from the assignment pages.
//
// Source of truth: the Outcome column of each page's rubric table(s).
// The frontmatter `assignment.outcomes` block must reconcile with the
// rubric tags exactly, so neither can silently drift. Coverage minimums:
//   - every ABET outcome (SO1-SO6): >= 2 individual-level data points
//   - every WIC / Beyond OSU outcome (L07-L10): >= 1 individual-level point
// It also checks that each term's Team Deliverables table sums to exactly 25%,
// and that every Canvas rubric TSV tags the same outcomes as the handbook page
// it mirrors.
//
// Run: node scripts/validate-outcomes.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ASSIGNMENTS_DIR = "src/content/docs/assignments";
const CANVAS_DIR = "canvas/assignments";
const ABET_OUTCOMES = ["SO1", "SO2", "SO3", "SO4", "SO5", "SO6"];
const OTHER_OUTCOMES = ["L07", "L08", "L09", "L10"];
const MIN_ABET = 2;
const TAG_RE = /^(SO[1-6]|L(07|08|09|10))$/;

// Canvas rubric TSV directory -> the handbook page it mirrors.
// Canvas is a mirror; the handbook wins. A TSV that tags an outcome the
// handbook rubric does not claims accreditation evidence that does not exist,
// and nothing else in the toolchain reads Canvas, so it drifts silently.
const CANVAS_TO_HANDBOOK = {
  "career-retrospective": "career-retrospective",
  defense: "defense",
  "definition-of-shipped": "definition-of-shipped",
  "incident-postmortem": "incident-postmortem",
  "project-handoff": "project-handoff",
  "project-landing-page": "landing-page",
  "project-retrospective": "project-retrospective",
  "repo-checkpoint": "repo-checkpoints",
  rfc: "rfc",
  "spring-release": "release",
  "sprint-note": "sprint-notes",
  "team-charter": "team-charter",
  "workshop-activities": "workshop-activities",
};

// Kept for reference, no longer assigned; see canvas/assignments/assignment-readme.md.
const CANVAS_DEPRECATED = new Set([
  "_template",
  "adr-code-review",
  "final-peer-evaluation",
  "individual-contribution",
  "memo",
  "midterm-peer-evaluation",
  "progress-report",
  "requirements-update",
  "research-brief",
  "retrospective",
  "retrospective-and-career",
  "setup",
  "technical-design-update",
]);

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

// One `  key: value` line of the assignment block. Returns the name of the
// nested map (`weight` or `outcomes`) that the following four-space lines
// belong to, or null when the key is a scalar.
function readAssignmentKey(assignment, key, value) {
  if (key === "level") {
    assignment.level = value;
    return null;
  }
  if (key === "terms") {
    assignment.terms = value
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((t) => t.trim());
    return null;
  }
  // `weight` is either a scalar (the page is worth the same in every term it
  // runs) or a per-term map. Sprint Notes and Workshop Activities vary by term,
  // and a scalar silently stated the wrong number for two of the three.
  if (key === "weight") {
    if (value === "") {
      assignment.weight = {};
      return "weight";
    }
    assignment.weight = Number(value);
    return null;
  }
  if (key === "outcomes") {
    assignment.outcomes = {};
    return "outcomes";
  }
  return null;
}

// Minimal targeted parser for the `assignment:` block we control.
function parseAssignment(frontmatter) {
  const lines = frontmatter.split("\n");
  const start = lines.findIndex((l) => /^assignment:\s*$/.test(l));
  if (start === -1) {
    return null;
  }
  const assignment = { level: null, outcomes: {}, terms: [], weight: null };
  let block = null;
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) {
      break;
    }
    const key = line.match(/^\s{2}(\w+):\s*(.*)$/);
    if (key) {
      block = readAssignmentKey(assignment, key[1], key[2].trim());
      continue;
    }
    const item = line.match(/^\s{4}(\w+):\s*(\d+(?:\.\d+)?)/);
    if (block && item) {
      assignment[block][item[1]] = Number(item[2]);
    }
  }
  return assignment;
}

// Extract outcome tags from rubric tables: rows whose LAST cell is a
// comma-separated list of outcome IDs (the "Outcome" column).
function parseRubricTags(body) {
  const tags = {};
  for (const line of body.split("\n")) {
    if (!line.trim().startsWith("|")) {
      continue;
    }
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((c, i, a) => !(c === "" && (i === 0 || i === a.length - 1)));
    if (cells.length < 2) {
      continue;
    }
    const parts = cells
      .at(-1)
      .split(",")
      .map((p) => p.trim());
    if (parts.length > 0 && parts.every((p) => TAG_RE.test(p))) {
      for (const p of parts) {
        tags[p] = (tags[p] || 0) + 1;
      }
    }
  }
  return tags;
}

const counts = {};
const sources = {};
for (const o of [...ABET_OUTCOMES, ...OTHER_OUTCOMES]) {
  counts[o] = 0;
  sources[o] = [];
}
let failed = false;
const files = readdirSync(ASSIGNMENTS_DIR).filter((f) => f.endsWith(".mdx"));
let parsed = 0;
// slug -> parsed assignment block, for the weight reconciliation below.
const pages = new Map();

for (const file of files) {
  const source = readFileSync(join(ASSIGNMENTS_DIR, file), "utf8");
  const frontmatter = parseFrontmatter(source);
  if (!frontmatter) {
    continue;
  }
  const assignment = parseAssignment(frontmatter);
  if (!assignment) {
    continue;
  }
  parsed += 1;
  pages.set(file.replace(/\.mdx$/, ""), assignment);
  const body = source.slice(source.indexOf("---", 3) + 3);
  const rubricTags = parseRubricTags(body);

  // Reconcile: frontmatter must equal the rubric-table tags exactly.
  const keys = new Set([
    ...Object.keys(rubricTags),
    ...Object.keys(assignment.outcomes),
  ]);
  for (const k of keys) {
    const fm = assignment.outcomes[k] || 0;
    const rb = rubricTags[k] || 0;
    if (fm !== rb) {
      console.error(
        `DRIFT ${file}: outcome ${k} declared ${fm} in frontmatter but tagged on ${rb} rubric criteria.`
      );
      failed = true;
    }
  }

  if (assignment.level !== "individual") {
    continue; // team-level work is corroboration, not a data point
  }
  const runs = assignment.terms.length || 1;
  for (const [outcome, items] of Object.entries(rubricTags)) {
    if (outcome in counts) {
      counts[outcome] += items * runs;
      sources[outcome].push(`${file} (${items} item(s) x ${runs} term(s))`);
    }
  }
}

if (parsed === 0) {
  console.error(
    "validate-outcomes: no assignment frontmatter found; refusing to pass vacuously."
  );
  process.exit(1);
}

// --- Term weight arithmetic --------------------------------------------------
// Team Deliverables is one of four equal 25% components, split across several
// assignment pages. The per-term tables on the assignments overview must each
// sum to exactly 25, and nothing else checks it: the weights also appear in
// each page's frontmatter, in three syllabi, and in the Canvas readme, so a
// re-cut that misses one leaves students' grades not adding up.
const overview = readFileSync(
  join(ASSIGNMENTS_DIR, "introduction.mdx"),
  "utf8"
);
const termSections = [
  ...overview.matchAll(
    /### (Fall|Winter|Spring) Team Deliverables \(25%\)([\s\S]*?)(?=\n#{2,3} |$)/g
  ),
];
if (termSections.length !== 3) {
  console.error(
    `TERM WEIGHTS: expected 3 "### <Term> Team Deliverables (25%)" tables in introduction.mdx, found ${termSections.length}.`
  );
  failed = true;
}
// term -> (slug -> percent), harvested from the same rows that get summed.
const tableWeights = new Map();
for (const [, term, table] of termSections) {
  const key = term.toLowerCase();
  tableWeights.set(key, new Map());
  let sum = 0;
  for (const row of table.split("\n")) {
    if (!row.trim().startsWith("|")) {
      continue;
    }
    const cells = row.split("|").map((c) => c.trim());
    const pct = cells.find((c) => /^\d+(\.\d+)?%$/.test(c));
    if (pct) {
      sum += Number.parseFloat(pct);
      const slug = cells[1]?.match(/\]\(\/assignments\/([a-z0-9-]+)\/\)/)?.[1];
      if (slug) {
        tableWeights.get(key).set(slug, Number.parseFloat(pct));
      }
    }
  }
  if (Math.abs(sum - 25) > 0.001) {
    console.error(
      `TERM WEIGHTS: ${term} Team Deliverables sums to ${sum}%, must be exactly 25%.`
    );
    failed = true;
  } else {
    console.log(`  ${term} Team Deliverables: ${sum}% ok`);
  }
}

// --- Frontmatter weight reconciliation ---------------------------------------
// Each page's `assignment.weight` restates what the term tables above already
// say. Nothing read it, so it drifted: Sprint Notes declared 8 while spring is
// 4%, and Workshop Activities declared 2 while winter and spring are 1%.
// `weight` may be a scalar when the page is worth the same in every term it
// runs, or a per-term map when it varies. Only Team Deliverables pages appear
// in the term tables; the four 25% components (RFC, Defense, Career
// Retrospective, and the two evaluation instruments) are stated in the Grade
// Architecture table instead and are skipped here deliberately, not by
// accident. Their weights are uniform across terms and have never drifted.
for (const [slug, assignment] of pages) {
  const inTables = [...tableWeights.entries()].filter(([, m]) => m.has(slug));
  if (inTables.length === 0) {
    continue; // a 25% component, checked by the Grade Architecture table by hand
  }
  const declared = assignment.weight;
  if (declared === null) {
    console.error(
      `WEIGHT ${slug}.mdx: appears in a Team Deliverables table but declares no weight.`
    );
    failed = true;
    continue;
  }
  const varies = new Set(inTables.map(([, m]) => m.get(slug))).size > 1;
  if (varies && typeof declared === "number") {
    console.error(
      `WEIGHT ${slug}.mdx: weight is the scalar ${declared} but the term tables give ${inTables
        .map(([t, m]) => `${t} ${m.get(slug)}%`)
        .join(", ")}. Use a per-term map.`
    );
    failed = true;
    continue;
  }
  for (const [term, m] of inTables) {
    const expected = m.get(slug);
    const actual = typeof declared === "number" ? declared : declared[term];
    if (actual === undefined) {
      console.error(
        `WEIGHT ${slug}.mdx: no ${term} weight declared, but the ${term} table gives ${expected}%.`
      );
      failed = true;
    } else if (Math.abs(actual - expected) > 0.001) {
      console.error(
        `WEIGHT ${slug}.mdx: declares ${actual} for ${term} but the ${term} table gives ${expected}%.`
      );
      failed = true;
    }
  }
  // A declared term the tables do not carry is the same drift in reverse.
  if (typeof declared === "object") {
    for (const term of Object.keys(declared)) {
      if (!tableWeights.get(term)?.has(slug)) {
        console.error(
          `WEIGHT ${slug}.mdx: declares a ${term} weight, but no ${term} table row links it.`
        );
        failed = true;
      }
    }
  }
}
if (!failed) {
  console.log("  Frontmatter weights reconcile with the term tables.");
}

// --- Canvas mirror reconciliation -------------------------------------------
// The set of outcomes tagged in a Canvas rubric TSV must equal the set tagged
// in the handbook rubric table it mirrors.
function canvasTags(dir) {
  const tags = new Set();
  const path = join(CANVAS_DIR, dir);
  for (const file of readdirSync(path)) {
    if (!file.endsWith("rubric-details.tsv")) {
      continue;
    }
    for (const line of readFileSync(join(path, file), "utf8").split("\n")) {
      const [criterion] = line.split("\t");
      for (const m of criterion.matchAll(/\b(SO[1-6]|L0[789]|L10)\b/g)) {
        tags.add(m[1]);
      }
    }
  }
  return tags;
}

for (const dir of readdirSync(CANVAS_DIR)) {
  if (
    !statSync(join(CANVAS_DIR, dir)).isDirectory() ||
    CANVAS_DEPRECATED.has(dir)
  ) {
    continue;
  }
  const page = CANVAS_TO_HANDBOOK[dir];
  const tags = canvasTags(dir);
  if (!page) {
    // An unmapped directory is fine until it starts claiming outcomes.
    if (tags.size > 0) {
      console.error(
        `UNMAPPED canvas/assignments/${dir}: tags ${[...tags].sort().join(", ")} but no handbook page mapped. Add it to CANVAS_TO_HANDBOOK or CANVAS_DEPRECATED.`
      );
      failed = true;
    }
    continue;
  }
  const source = readFileSync(join(ASSIGNMENTS_DIR, `${page}.mdx`), "utf8");
  const handbook = new Set(
    Object.keys(parseRubricTags(source.slice(source.indexOf("---", 3) + 3)))
  );
  const onlyCanvas = [...tags].filter((t) => !handbook.has(t)).sort();
  const onlyHandbook = [...handbook].filter((t) => !tags.has(t)).sort();
  if (onlyCanvas.length > 0) {
    console.error(
      `MIRROR DRIFT canvas/assignments/${dir}: tags ${onlyCanvas.join(", ")} that ${page}.mdx does not. Canvas mirrors the handbook; remove the tag from the TSV.`
    );
    failed = true;
  }
  if (onlyHandbook.length > 0) {
    console.error(
      `MIRROR DRIFT canvas/assignments/${dir}: ${page}.mdx tags ${onlyHandbook.join(", ")} that the TSV does not. Add it to the TSV.`
    );
    failed = true;
  }
}

console.log(
  "Individual data points per student per year (from rubric tables):"
);
for (const outcome of ABET_OUTCOMES) {
  const ok = counts[outcome] >= MIN_ABET;
  console.log(
    `  ${outcome}: ${counts[outcome]} ${ok ? "ok" : `INSUFFICIENT (need ${MIN_ABET})`}`
  );
  for (const src of sources[outcome]) {
    console.log(`      - ${src}`);
  }
  if (!ok) {
    failed = true;
  }
}
for (const outcome of OTHER_OUTCOMES) {
  const ok = counts[outcome] >= 1;
  console.log(
    `  ${outcome}: ${counts[outcome]} ${ok ? "ok" : "INSUFFICIENT (need 1)"}`
  );
  for (const src of sources[outcome]) {
    console.log(`      - ${src}`);
  }
  if (!ok) {
    failed = true;
  }
}

if (failed) {
  console.error(
    "\nOutcome coverage or traceability regression detected (see above)."
  );
  process.exit(1);
}
console.log("\nAll outcomes covered; frontmatter and rubric tables reconcile.");
