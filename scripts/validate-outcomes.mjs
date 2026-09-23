#!/usr/bin/env node
// Validates learning-outcome coverage from the assignment pages.
//
// Source of truth: the Canvas rubric TSV each page renders (#144). Since the
// handbook no longer holds a second copy of the rubric, there is no mirror to
// reconcile; the file the page renders is the file Canvas imports.
//
// The frontmatter `assignment.outcomes` block must reconcile with the tags in
// that TSV exactly, so neither can silently drift. Coverage minimums:
//   - every ABET outcome (SO1-SO6): >= 2 individual-level data points
//   - every WIC (L07-L09) and Beyond OSU (L10) outcome: >= 1 individual-level point,
//     except the outcomes in CANVAS_EVIDENCED below
// It also checks that each term's Team Deliverables table sums to exactly 25%,
// and that each page imports the TSV that belongs to it rather than another
// assignment's, which Vite cannot catch because both paths resolve.
//
// Run: node scripts/validate-outcomes.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  OUTCOME_TAG_RE,
  parseRubricTsv,
  rubricTagCounts,
  rubricTotal,
} from "../src/lib/rubric-tsv.mjs";

const ASSIGNMENTS_DIR = "src/content/docs/assignments";
const CANVAS_DIR = "canvas/assignments";
const ABET_OUTCOMES = ["SO1", "SO2", "SO3", "SO4", "SO5", "SO6"];
const OTHER_OUTCOMES = ["L07", "L08", "L09", "L10"];
const MIN_ABET = 2;

// Canvas rubric TSV directory -> the handbook page that renders it. The TSV is
// the rubric (#144), so this is not a mirror table: it is how the validator
// tells whether a page imported its own assignment's rubric or a neighbour's.
const CANVAS_TO_HANDBOOK = {
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
  "term-retrospective": "term-retrospective",
};

// Canvas rubrics with no handbook counterpart, by decision rather than
// omission. Both are tagless, both hold one TSV per term because the item
// count differs by term, and neither is a rubric a student is shown on the
// page: `individual-contribution` is the individual half of the Sprint Notes
// points and is described in prose on that page, and `workshop-activities` is
// scored complete/incomplete per item. Rendering either would add tables to a
// page that deliberately has none.
const CANVAS_ONLY = new Set(["individual-contribution", "workshop-activities"]);

// The three pages that render no <RubricTable>, by decision rather than
// omission. `workshop-activities` has no rubric section at all, being scored
// complete/incomplete per item. The two survey instruments run through
// Qualtrics and are the only pages still holding a hand-written Markdown
// table, because theirs carry weights rather than points. Sprint Notes is not an exception: its rubric is the
// nine-field pass/fail TSV and totals 100 like any other (#29, #144).
const RUBRIC_EXCEPTIONS = new Set([
  "workshop-activities",
  "peer-evaluations",
  "project-partner-evaluation",
]);

const CANVAS_DEPRECATED = new Set(["_template"]);

// Outcomes evidenced outside the handbook, exempt from the individual floor.
// L10 came only from Resume and Intent and the Career and Individual
// Retrospective, which the co-instructor now runs entirely in Canvas, so no
// rubric here carries it (#197). A stopgap until #196 decides how L10 is
// recorded. A handbook criterion tagged L10 still counts normally.
const CANVAS_EVIDENCED = new Map([["L10", "evidenced in Canvas, #196"]]);

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

// The Markdown fallback, for the three pages that keep a hand-written table:
// the two Qualtrics instruments, whose tables carry weights rather than
// points, and the pass/fail workshop page. Rows whose LAST cell is a
// comma-separated list of outcome IDs.
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
    if (parts.length > 0 && parts.every((p) => OUTCOME_TAG_RE.test(p))) {
      for (const p of parts) {
        tags[p] = (tags[p] || 0) + 1;
      }
    }
  }
  return tags;
}

// The TSV a page renders, from its `<RubricTable tsv={...} />` and the
// matching `?raw` import. Returns null for a page that renders none.
const RUBRIC_TABLE_RE = /<RubricTable\s[^>]*\btsv=\{(\w+)\}/;
function rubricTsvPath(source) {
  const used = source.match(RUBRIC_TABLE_RE);
  if (!used) {
    return null;
  }
  const imported = source.match(
    new RegExp(`^import\\s+${used[1]}\\s+from\\s+['"]/([^'"?]+)\\?raw['"]`, "m")
  );
  return imported ? imported[1] : { missingImport: used[1] };
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
  const slug = file.replace(/\.mdx$/, "");
  const tsvPath = rubricTsvPath(source);
  let rubricTags;
  if (tsvPath === null) {
    // A page that keeps a hand-written table: the documented exceptions.
    if (!RUBRIC_EXCEPTIONS.has(slug)) {
      console.error(
        `NO RUBRIC TABLE ${file}: renders no <RubricTable> and is not a documented exception. Import its TSV from canvas/assignments/ and render it.`
      );
      failed = true;
    }
    rubricTags = parseRubricTags(body);
  } else if (typeof tsvPath === "string") {
    // The page must import its own assignment's TSV. Vite resolves any real
    // path, so nothing else catches a page rendering a neighbour's rubric.
    // `sourceLabel` is what parse errors name, so a stale one sends the next
    // reader to the wrong file. Nothing else compares it to the real import.
    const label = source.match(/<RubricTable[^>]*\ssourceLabel="([^"]*)"/);
    if (!label) {
      console.error(
        `RUBRIC IMPORT ${file}: <RubricTable> has no sourceLabel. MDX props are not typechecked, so nothing else catches this, and a parse error would name "undefined".`
      );
      failed = true;
    } else if (label[1] !== tsvPath) {
      console.error(
        `RUBRIC IMPORT ${file}: sourceLabel="${label[1]}" but the import reads ${tsvPath}.`
      );
      failed = true;
    }
    const [, , dir] = tsvPath.split("/");
    if (CANVAS_TO_HANDBOOK[dir] !== slug) {
      console.error(
        `RUBRIC IMPORT ${file}: imports ${tsvPath}, which belongs to ${CANVAS_TO_HANDBOOK[dir] ?? "no mapped page"}, not ${slug}.`
      );
      failed = true;
    }
    rubricTags = rubricTagCounts(
      parseRubricTsv(readFileSync(tsvPath, "utf8"), tsvPath)
    );
  } else {
    console.error(
      `RUBRIC IMPORT ${file}: <RubricTable tsv={${tsvPath.missingImport}}> has no matching \`import ${tsvPath.missingImport} from '/...tsv?raw'\`.`
    );
    failed = true;
    rubricTags = {};
  }

  // Reconcile: frontmatter must equal the rubric tags exactly.
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
// in the term tables; the four 25% components (RFC, Defense, and the two
// evaluation instruments) are stated in the Grade Architecture table instead
// and are skipped here deliberately, not by accident. Their weights are
// checked by hand against that table; the Defense varies by term since the
// fall Resume and Intent took 2% of it. Resume and Intent and the Career
// Retrospective run in Canvas and declare no weight here at all (#197).
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

// --- Canvas directory coverage ----------------------------------------------
// There is no mirror left to reconcile: the file a page renders is the file
// Canvas imports. What still needs checking is that no directory has appeared
// claiming outcomes with nothing rendering it, which is how a retired
// assignment's rubric would keep counting toward accreditation coverage.
for (const dir of readdirSync(CANVAS_DIR)) {
  if (
    !statSync(join(CANVAS_DIR, dir)).isDirectory() ||
    CANVAS_DEPRECATED.has(dir) ||
    CANVAS_ONLY.has(dir) ||
    CANVAS_TO_HANDBOOK[dir]
  ) {
    continue;
  }
  const tags = new Set();
  for (const f of readdirSync(join(CANVAS_DIR, dir))) {
    if (!f.endsWith("rubric-details.tsv")) {
      continue;
    }
    const path = join(CANVAS_DIR, dir, f);
    for (const tag of Object.keys(
      rubricTagCounts(parseRubricTsv(readFileSync(path, "utf8"), path))
    )) {
      tags.add(tag);
    }
  }
  if (tags.size > 0) {
    console.error(
      `UNMAPPED canvas/assignments/${dir}: tags ${[...tags].sort().join(", ")} but no handbook page renders it. Add it to CANVAS_TO_HANDBOOK, CANVAS_ONLY or CANVAS_DEPRECATED.`
    );
    failed = true;
  }
}

// --- Page shape -------------------------------------------------------------
// Three rules from the assignments skill that a review found broken by hand
// on pages that otherwise validated. Each is a few lines and pays for itself
// the first time it fires.
//
const DELIVERABLE_HEADING_RE =
  /^## (What .* Must (Produce|Contain)|Structure|Required Sections)/m;
const AI_USE_RE = /^\*\*AI use:\*\*/m;
const META_WEIGHT_RE = /<AssignmentMeta[^>]*\sweight="([^"]*)"/;

for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const assignment = pages.get(slug);
  if (!assignment) {
    continue;
  }
  const source = readFileSync(join(ASSIGNMENTS_DIR, file), "utf8");
  const body = source.slice(source.indexOf("---", 3) + 3);

  // The AssignmentMeta weight text must state every percentage the
  // frontmatter declares. Sprint Notes said "2% each" and never gave the
  // term totals that every other page's meta states.
  const meta = body.match(META_WEIGHT_RE);
  const declared =
    typeof assignment.weight === "number"
      ? [assignment.weight]
      : Object.values(assignment.weight ?? {});
  if (meta) {
    for (const w of new Set(declared)) {
      if (!meta[1].includes(`${w}%`)) {
        console.error(
          `META ${file}: frontmatter declares ${w} but the AssignmentMeta weight text "${meta[1]}" never says ${w}%.`
        );
        failed = true;
      }
    }
  } else {
    console.error(`META ${file}: no <AssignmentMeta weight="..."> found.`);
    failed = true;
  }

  // A page with a written deliverable carries the AI-use paragraph.
  if (DELIVERABLE_HEADING_RE.test(body) && !AI_USE_RE.test(body)) {
    console.error(
      `AI USE ${file}: has a deliverable section but no "**AI use:**" paragraph naming what AI may do and what fails the assignment.`
    );
    failed = true;
  }

  // Rubric points total exactly 100, summed from the rendered TSV.
  if (!RUBRIC_EXCEPTIONS.has(slug)) {
    const tsvPath = rubricTsvPath(source);
    if (typeof tsvPath !== "string") {
      // Already reported as NO RUBRIC TABLE or RUBRIC IMPORT above.
    } else if (/^## Rubric/m.test(body)) {
      const total = rubricTotal(
        parseRubricTsv(readFileSync(tsvPath, "utf8"), tsvPath)
      );
      if (total !== 100) {
        console.error(
          `RUBRIC ${file}: ${tsvPath} totals ${total} points, not 100.`
        );
        failed = true;
      }
    } else {
      console.error(
        `RUBRIC ${file}: renders a <RubricTable> but has no "## Rubric" heading above it.`
      );
      failed = true;
    }
  }
}
if (!failed) {
  console.log(
    "  Every page states its weight in the meta, carries AI use where it has a deliverable, and totals 100 or is a documented exception."
  );
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
  const exempt = CANVAS_EVIDENCED.has(outcome);
  const ok = counts[outcome] >= 1 || exempt;
  let status = "INSUFFICIENT (need 1)";
  if (counts[outcome] >= 1) {
    status = "ok";
  } else if (exempt) {
    status = `exempt (${CANVAS_EVIDENCED.get(outcome)})`;
  }
  console.log(`  ${outcome}: ${counts[outcome]} ${status}`);
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
