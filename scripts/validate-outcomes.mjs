#!/usr/bin/env node
// Validates learning-outcome coverage from the assignment pages.
//
// Source of truth: the Canvas rubric CSV each page renders (#144). Since the
// handbook no longer holds a second copy of the rubric, there is no mirror to
// reconcile; the file the page renders is the file Canvas imports.
//
// The frontmatter `assignment.outcomes` block must reconcile with the tags in
// that CSV exactly, so neither can silently drift. Coverage minimums:
//   - every ABET outcome (SO1-SO6): >= 2 individual-level data points
//   - every WIC (L07-L09) and Beyond OSU (L10) outcome: >= 1 individual-level point,
//     except the outcomes in CANVAS_EVIDENCED below
// It also checks that each term's Team Deliverables table sums to exactly 25%,
// that each page imports the CSVs that belong to it rather than another
// assignment's, which Vite cannot catch because both paths resolve, and that
// each page's `assignment.canvas` entries reconcile with its weight and the
// rubrics it renders (the Canvas entry model record in docs/decisions/).
//
// Run: node scripts/validate-outcomes.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import {
  canvasRows,
  isTitled,
  termWeight,
} from "../src/lib/canvas-entries.mjs";
import {
  OUTCOME_TAG_RE,
  parseRubricCsv,
  RUBRIC_CSV_SUFFIX,
  rubricTagCounts,
  rubricTotal,
} from "../src/lib/rubric-csv.mjs";

const ASSIGNMENTS_DIR = "src/content/docs/assignments";
const CANVAS_DIR = "canvas/assignments";
const ABET_OUTCOMES = ["SO1", "SO2", "SO3", "SO4", "SO5", "SO6"];
const OTHER_OUTCOMES = ["L07", "L08", "L09", "L10"];
const MIN_ABET = 2;

// Canvas rubric CSV directory -> the handbook page that renders it. The CSV is
// the rubric (#144), so this is not a mirror table: it is how the validator
// tells whether a page imported its own assignment's rubric or a neighbour's.
const CANVAS_TO_HANDBOOK = {
  defense: "defense",
  "definition-of-shipped": "definition-of-shipped",
  "incident-postmortem": "incident-postmortem",
  "individual-contribution": "sprint-notes",
  "project-handoff": "project-handoff",
  "project-landing-page": "landing-page",
  "project-retrospective": "project-retrospective",
  "repo-checkpoint": "repo-checkpoints",
  rfc: "rfc",
  "spring-release": "release",
  "sprint-note": "sprint-notes",
  "team-charter": "team-charter",
  "term-retrospective": "term-retrospective",
  "workshop-activities": "workshop-activities",
};

// The two pages that render no <RubricTable>, by decision rather than
// omission. The survey instruments run through Qualtrics and are the only
// pages still holding a hand-written Markdown table, because theirs carry
// weights rather than points; their Canvas entries declare no `rubric`.
// Sprint Notes and Workshop Activities are not exceptions: their CSVs total
// 100 like any other (#29, #144, #259).
const RUBRIC_EXCEPTIONS = new Set([
  "peer-evaluations",
  "project-partner-evaluation",
]);

const CANVAS_DEPRECATED = new Set(["_template"]);

// Each rubric file is read by several checks below; parse it once.
const rubrics = new Map();
function readRubric(path) {
  if (!rubrics.has(path)) {
    rubrics.set(path, parseRubricCsv(readFileSync(path, "utf8"), path));
  }
  return rubrics.get(path);
}

// The rubric CSVs in one directory, as file names. The stray-file check below
// reports everything else.
function rubricCsvsIn(dir) {
  return readdirSync(join(CANVAS_DIR, dir)).filter((f) =>
    f.endsWith(RUBRIC_CSV_SUFFIX)
  );
}

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

// The `assignment:` block, parsed as the YAML it is. The hand-rolled line
// parser this replaced could not read the list of Canvas entries.
function parseAssignment(frontmatter) {
  const assignment = parse(frontmatter)?.assignment;
  if (!assignment) {
    return null;
  }
  return {
    canvas: assignment.canvas ?? null,
    level: assignment.level ?? null,
    outcomes: assignment.outcomes ?? {},
    terms: assignment.terms ?? [],
    weight: assignment.weight ?? null,
  };
}

// The Markdown fallback, for the two pages that keep a hand-written table:
// the Qualtrics instruments, whose tables carry weights rather than points.
// Rows whose LAST cell is a
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

// Every CSV a page renders, one per `<RubricTable csv={...} />`, resolved
// through the matching `?raw` import. A page owning several Canvas entries
// renders one table per distinct rubric. `path` is null when the name has no
// import; `index` is where the tag sits, for the heading check below.
const RUBRIC_TABLE_RE = /<RubricTable\s[^>]*>/g;
function rubricTables(source) {
  return [...source.matchAll(RUBRIC_TABLE_RE)].map((m) => {
    const name = m[0].match(/\bcsv=\{(\w+)\}/)?.[1];
    const imported = name
      ? source.match(
          new RegExp(
            `^import\\s+${name}\\s+from\\s+['"]/([^'"?]+)\\?raw['"]`,
            "m"
          )
        )
      : null;
    return {
      index: m.index,
      label: m[0].match(/\ssourceLabel="([^"]*)"/)?.[1] ?? null,
      name,
      path: imported ? imported[1] : null,
    };
  });
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
// slug -> the page source and the rubric tables it renders, for the Canvas
// entry and page-shape checks below.
const pageSources = new Map();
const pageTables = new Map();

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
  const tables = rubricTables(source);
  pageSources.set(slug, source);
  pageTables.set(slug, tables);
  let rubricTags = {};
  if (tables.length === 0) {
    // A page that keeps a hand-written table: the documented exceptions.
    if (!RUBRIC_EXCEPTIONS.has(slug)) {
      console.error(
        `NO RUBRIC TABLE ${file}: renders no <RubricTable> and is not a documented exception. Import its CSV from canvas/assignments/ and render it.`
      );
      failed = true;
    }
    rubricTags = parseRubricTags(body);
  }
  for (const table of tables) {
    if (!table.path) {
      console.error(
        `RUBRIC IMPORT ${file}: <RubricTable csv={${table.name}}> has no matching \`import ${table.name} from '/...csv?raw'\`.`
      );
      failed = true;
      continue;
    }
    // The page must import its own assignment's CSVs. Vite resolves any real
    // path, so nothing else catches a page rendering a neighbour's rubric.
    // `sourceLabel` is what parse errors name, so a stale one sends the next
    // reader to the wrong file. Nothing else compares it to the real import.
    if (!table.label) {
      console.error(
        `RUBRIC IMPORT ${file}: <RubricTable csv={${table.name}}> has no sourceLabel. MDX props are not typechecked, so nothing else catches this, and a parse error would name "undefined".`
      );
      failed = true;
    } else if (table.label !== table.path) {
      console.error(
        `RUBRIC IMPORT ${file}: sourceLabel="${table.label}" but the import reads ${table.path}.`
      );
      failed = true;
    }
    const [, , dir] = table.path.split("/");
    if (CANVAS_TO_HANDBOOK[dir] !== slug) {
      console.error(
        `RUBRIC IMPORT ${file}: imports ${table.path}, which belongs to ${CANVAS_TO_HANDBOOK[dir] ?? "no mapped page"}, not ${slug}.`
      );
      failed = true;
    }
    // Tags add up across a page's rubrics: the RFC's draft and final
    // together are what the frontmatter declares.
    for (const [tag, n] of Object.entries(
      rubricTagCounts(readRubric(table.path).criteria)
    )) {
      rubricTags[tag] = (rubricTags[tag] || 0) + n;
    }
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
//
// First, every rubric directory holds rubric CSVs and nothing else. Anything
// else, such as a pre-CSV `-rubric-details.tsv`, would be skipped by every
// check here and still look like a rubric to import. Dotfiles are exempt:
// this reads the filesystem, not git, Finder drops a `.DS_Store` into any
// folder it opens, and a hook that blocks on that trains people to skip hooks.
for (const dir of readdirSync(CANVAS_DIR)) {
  if (
    !statSync(join(CANVAS_DIR, dir)).isDirectory() ||
    CANVAS_DEPRECATED.has(dir)
  ) {
    continue;
  }
  for (const f of readdirSync(join(CANVAS_DIR, dir))) {
    if (!(f.startsWith(".") || f.endsWith(RUBRIC_CSV_SUFFIX))) {
      console.error(
        `CANVAS ${CANVAS_DIR}/${dir}/${f}: only <name>${RUBRIC_CSV_SUFFIX} files belong in a rubric directory.`
      );
      failed = true;
    }
  }
}
for (const dir of readdirSync(CANVAS_DIR)) {
  if (
    !statSync(join(CANVAS_DIR, dir)).isDirectory() ||
    CANVAS_DEPRECATED.has(dir) ||
    CANVAS_TO_HANDBOOK[dir]
  ) {
    continue;
  }
  const tags = new Set();
  for (const f of rubricCsvsIn(dir)) {
    const path = join(CANVAS_DIR, dir, f);
    for (const tag of Object.keys(rubricTagCounts(readRubric(path).criteria))) {
      tags.add(tag);
    }
  }
  if (tags.size > 0) {
    console.error(
      `UNMAPPED canvas/assignments/${dir}: tags ${[...tags].sort().join(", ")} but no handbook page renders it. Add it to CANVAS_TO_HANDBOOK or CANVAS_DEPRECATED.`
    );
    failed = true;
  }
}

// --- Canvas entries ---------------------------------------------------------
// Each Canvas assignment has its own due date, late window, grade and
// submission, so a page that owns several declares each family in
// `assignment.canvas` rather than bundling them into one column. The list is
// what the Canvas import will generate from, so it has to agree with the
// page's weight, with the rubrics the page renders, and with Canvas's own
// arithmetic: an assignment group weights its entries by points, so within a
// group every entry must carry the same weight per point.
const TOLERANCE = 1e-6;
// term -> group -> weight per point of the first entry seen, and where.
const groupRates = new Map();
// term -> "group / entry name" -> page that declared it.
const entryNames = new Map();
for (const [slug, assignment] of pages) {
  const file = `${slug}.mdx`;
  const { canvas } = assignment;
  if (!Array.isArray(canvas) || canvas.length === 0) {
    console.error(
      `CANVAS ${file}: no \`assignment.canvas\` entries. Every graded page declares the Canvas assignments it owns.`
    );
    failed = true;
    continue;
  }
  const rendered = new Set(
    pageTables
      .get(slug)
      .map((t) => t.path)
      .filter(Boolean)
  );
  const declaredRubrics = new Set();
  for (const family of canvas) {
    if (family.rubric) {
      const path = `${CANVAS_DIR}/${family.rubric}`;
      declaredRubrics.add(path);
      if (!rendered.has(path)) {
        console.error(
          `CANVAS ${file}: entry "${family.name}" uses ${path}, which the page does not render.`
        );
        failed = true;
      }
    } else if (!RUBRIC_EXCEPTIONS.has(slug)) {
      console.error(
        `CANVAS ${file}: entry "${family.name}" names no rubric, and only the survey pages may omit one.`
      );
      failed = true;
    }
    for (const term of Object.keys(family.weeks ?? {})) {
      if (!assignment.terms.includes(term)) {
        console.error(
          `CANVAS ${file}: entry "${family.name}" runs in ${term}, which the page's terms do not list.`
        );
        failed = true;
      }
    }
  }
  for (const path of rendered) {
    if (!declaredRubrics.has(path)) {
      console.error(
        `CANVAS ${file}: renders ${path}, but no Canvas entry uses it.`
      );
      failed = true;
    }
  }

  const rows = canvasRows(canvas);
  for (const term of assignment.terms) {
    const termRows = rows.filter((r) => r.term === term);
    const pageWeight = termWeight(assignment, term);
    const sum = termRows.reduce((acc, r) => acc + (r.weight ?? 0), 0);
    if (termRows.length === 0) {
      console.error(`CANVAS ${file}: no Canvas entry runs in ${term}.`);
      failed = true;
    } else if (pageWeight === undefined) {
      console.error(
        `CANVAS ${file}: runs in ${term} but its weight map has no ${term} entry.`
      );
      failed = true;
    } else if (Math.abs(sum - pageWeight) > TOLERANCE) {
      console.error(
        `CANVAS ${file}: ${term} entries carry ${sum}% but the page weight is ${pageWeight}%.`
      );
      failed = true;
    }
    const entryCount = termRows.reduce((acc, r) => acc + r.names.length, 0);
    if (entryCount > 1 && !/<CanvasEntries\b/.test(pageSources.get(slug))) {
      console.error(
        `CANVAS ${file}: owns ${entryCount} Canvas entries in ${term} but does not render <CanvasEntries />.`
      );
      failed = true;
    }
  }

  for (const row of rows) {
    const { family, term } = row;
    if (termWeight(family, term) === undefined) {
      console.error(
        `CANVAS ${file}: entry "${family.name}" is due in ${term} but declares no ${term} weight.`
      );
      failed = true;
      continue;
    }
    const titles = family.titles?.[term];
    if (isTitled(family) !== family.name.includes("{title}")) {
      console.error(
        `CANVAS ${file}: entry "${family.name}" must use "{title}" in its name exactly when it declares titles.`
      );
      failed = true;
    } else if (titles && titles.length !== row.weeks.length) {
      console.error(
        `CANVAS ${file}: entry "${family.name}" lists ${titles.length} ${term} titles for ${row.weeks.length} ${term} weeks.`
      );
      failed = true;
    }
    if (
      family.peer_review_week &&
      row.weeks.some((w) => w >= family.peer_review_week)
    ) {
      console.error(
        `CANVAS ${file}: entry "${family.name}" has ${term} peer reviews due in week ${family.peer_review_week}, not after the draft.`
      );
      failed = true;
    }
    if (!groupRates.has(term)) {
      groupRates.set(term, new Map());
      entryNames.set(term, new Map());
    }
    const rate = row.each / family.points;
    const seen = groupRates.get(term).get(family.group);
    if (!seen) {
      groupRates.get(term).set(family.group, { file, name: family.name, rate });
    } else if (Math.abs(seen.rate - rate) > TOLERANCE) {
      console.error(
        `CANVAS ${file}: in the ${term} "${family.group}" group, "${family.name}" is worth ${row.each}% for ${family.points} points, but "${seen.name}" (${seen.file}) carries a different weight per point. Canvas weights a group's entries by points.`
      );
      failed = true;
    }
    for (const name of row.names) {
      const other = entryNames.get(term).get(`${family.group} / ${name}`);
      if (other) {
        console.error(
          `CANVAS ${file}: two ${term} entries in the "${family.group}" group are named "${name}" (also ${other}).`
        );
        failed = true;
      }
      entryNames.get(term).set(`${family.group} / ${name}`, file);
    }
  }
}
// A CSV left in a mapped directory that no entry declares would still be
// imported by hand and still look current. Every file must belong to a family.
const declaredCsvs = new Set(
  [...pages.values()].flatMap((a) =>
    (a.canvas ?? [])
      .filter((f) => f.rubric)
      .map((f) => `${CANVAS_DIR}/${f.rubric}`)
  )
);
// Canvas lists a course's rubrics by the Rubric Name column, so two files
// sharing one import as two rubrics a grader cannot tell apart.
const rubricNames = new Map();
for (const dir of Object.keys(CANVAS_TO_HANDBOOK)) {
  for (const f of rubricCsvsIn(dir)) {
    const path = `${CANVAS_DIR}/${dir}/${f}`;
    if (!declaredCsvs.has(path)) {
      console.error(
        `CANVAS ${path}: no Canvas entry on ${CANVAS_TO_HANDBOOK[dir]}.mdx uses this rubric. Declare it or delete it.`
      );
      failed = true;
    }
    const { name } = readRubric(path);
    if (rubricNames.has(name)) {
      console.error(
        `CANVAS ${path}: Rubric Name "${name}" is also ${rubricNames.get(name)}'s.`
      );
      failed = true;
    }
    rubricNames.set(name, path);
  }
}
if (!failed) {
  console.log(
    "  Canvas entries reconcile with page weights, rendered rubrics, and group points."
  );
}

// --- Page shape -------------------------------------------------------------
// Three rules from the assignments skill that a review found broken by hand
// on pages that otherwise validated. Each is a few lines and pays for itself
// the first time it fires.
//
const DELIVERABLE_HEADING_RE =
  /^## (What .* Must (Produce|Contain)|Structure|Required Sections)/m;
const AI_USE_RE = /^\*\*AI use:\*\*/m;
// Every page with Canvas entries says what to hand in under this heading, and
// a submission format lives there, never in a heading (#288).
const WHAT_YOU_SUBMIT_RE = /^#{2,3} What You Submit$/m;
const FORMAT_HEADING_RE = /^#{2,6} .*(\bPDF\b|submitted as).*$/im;
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

  // Every page with Canvas entries says what to hand in.
  if (assignment.canvas && !WHAT_YOU_SUBMIT_RE.test(body)) {
    console.error(
      `SUBMIT ${file}: has Canvas entries but no "What You Submit" heading saying what to hand in.`
    );
    failed = true;
  }
  const formatHeading = body.match(FORMAT_HEADING_RE);
  if (formatHeading) {
    console.error(
      `SUBMIT ${file}: the heading "${formatHeading[0]}" carries a submission format; state it under "What You Submit" instead.`
    );
    failed = true;
  }

  // A page with a written deliverable carries the AI-use paragraph.
  if (DELIVERABLE_HEADING_RE.test(body) && !AI_USE_RE.test(body)) {
    console.error(
      `AI USE ${file}: has a deliverable section but no "**AI use:**" paragraph naming what AI may do and what fails the assignment.`
    );
    failed = true;
  }

  // Rubric points total exactly 100, summed from each rendered CSV, and
  // each table sits under a rubric heading: its nearest "##" or "###".
  for (const table of pageTables.get(slug)) {
    if (!table.path) {
      continue; // already reported as RUBRIC IMPORT above
    }
    const total = rubricTotal(readRubric(table.path).criteria);
    if (total !== 100) {
      console.error(
        `RUBRIC ${file}: ${table.path} totals ${total} points, not 100.`
      );
      failed = true;
    }
    const headings = [
      ...source.slice(0, table.index).matchAll(/^(#{2,3}) (.*)$/gm),
    ];
    const h2 = headings.findLast((h) => h[1] === "##");
    const h3 = headings.findLast(
      (h) => h[1] === "###" && (!h2 || h.index > h2.index)
    );
    if (![h2, h3].some((h) => h && /Rubric/.test(h[2]))) {
      console.error(
        `RUBRIC ${file}: renders ${table.path} with no "Rubric" heading above it (the nearest ## or ###).`
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
