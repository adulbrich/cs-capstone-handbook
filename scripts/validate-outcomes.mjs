#!/usr/bin/env node
// Validates learning-outcome coverage from the assignment pages.
//
// Source of truth: the Outcome column of each page's rubric table(s).
// The frontmatter `assignment.outcomes` block must reconcile with the
// rubric tags exactly, so neither can silently drift. Coverage minimums:
//   - every ABET outcome (SO1-SO6): >= 2 individual-level data points
//   - every WIC / Beyond OSU outcome (L07-L10): >= 1 individual-level point
//
// Run: node scripts/validate-outcomes.mjs

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASSIGNMENTS_DIR = 'src/content/docs/assignments';
const CANVAS_DIR = 'canvas/assignments';
const ABET_OUTCOMES = ['SO1', 'SO2', 'SO3', 'SO4', 'SO5', 'SO6'];
const OTHER_OUTCOMES = ['L07', 'L08', 'L09', 'L10'];
const MIN_ABET = 2;
const TAG_RE = /^(SO[1-6]|L(07|08|09|10))$/;

// Standing individual instruments not represented as assignment pages:
// peer evaluations run mid + final every term and evidence SO5.
const STANDING_INDIVIDUAL_POINTS = { SO5: 6 };

// Canvas rubric TSV directory -> the handbook page it mirrors.
// Canvas is a mirror; the handbook wins. A TSV that tags an outcome the
// handbook rubric does not claims accreditation evidence that does not exist,
// and nothing else in the toolchain reads Canvas, so it drifts silently.
const CANVAS_TO_HANDBOOK = {
  'career-retrospective': 'career-retrospective',
  defense: 'defense',
  'definition-of-shipped': 'definition-of-shipped',
  'incident-postmortem': 'incident-postmortem',
  'project-handoff': 'project-handoff',
  'project-landing-page': 'landing-page',
  'project-retrospective': 'project-retrospective',
  'repo-checkpoint': 'repo-checkpoints',
  rfc: 'rfc',
  'spring-release': 'release',
  'sprint-note': 'sprint-notes',
  'team-charter': 'team-charter',
  'workshop-activities': 'workshop-activities',
};

// Kept for reference, no longer assigned; see canvas/assignments/assignment-readme.md.
const CANVAS_DEPRECATED = new Set([
  '_template',
  'adr-code-review',
  'final-peer-evaluation',
  'individual-contribution',
  'memo',
  'midterm-peer-evaluation',
  'progress-report',
  'requirements-update',
  'research-brief',
  'retrospective',
  'retrospective-and-career',
  'setup',
  'technical-design-update',
]);

function parseFrontmatter(source) {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  return match ? match[1] : null;
}

// Minimal targeted parser for the `assignment:` block we control.
function parseAssignment(frontmatter) {
  const lines = frontmatter.split('\n');
  const start = lines.findIndex((l) => /^assignment:\s*$/.test(l));
  if (start === -1) {
    return null;
  }
  const assignment = { level: null, terms: [], outcomes: {} };
  let inOutcomes = false;
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\S/.test(line)) {
      break;
    }
    const level = line.match(/^\s{2}level:\s*(\w+)/);
    if (level) {
      assignment.level = level[1];
      inOutcomes = false;
      continue;
    }
    const terms = line.match(/^\s{2}terms:\s*\[([^\]]*)\]/);
    if (terms) {
      assignment.terms = terms[1].split(',').map((t) => t.trim());
      inOutcomes = false;
      continue;
    }
    if (/^\s{2}outcomes:\s*$/.test(line)) {
      inOutcomes = true;
      continue;
    }
    if (/^\s{2}\w/.test(line)) {
      inOutcomes = false;
      continue;
    }
    if (inOutcomes) {
      const item = line.match(/^\s{4}(\w+):\s*(\d+)/);
      if (item) {
        assignment.outcomes[item[1]] = Number(item[2]);
      }
    }
  }
  return assignment;
}

// Extract outcome tags from rubric tables: rows whose LAST cell is a
// comma-separated list of outcome IDs (the "Outcome" column).
function parseRubricTags(body) {
  const tags = {};
  for (const line of body.split('\n')) {
    if (!line.trim().startsWith('|')) {
      continue;
    }
    const cells = line.split('|').map((c) => c.trim()).filter((c, i, a) => !(c === '' && (i === 0 || i === a.length - 1)));
    if (cells.length < 2) {
      continue;
    }
    const last = cells[cells.length - 1];
    const parts = last.split(',').map((p) => p.trim());
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
for (const [outcome, n] of Object.entries(STANDING_INDIVIDUAL_POINTS)) {
  counts[outcome] += n;
  sources[outcome].push(`peer evaluations (${n} standing)`);
}

let failed = false;
const files = readdirSync(ASSIGNMENTS_DIR).filter((f) => f.endsWith('.mdx'));
let parsed = 0;

for (const file of files) {
  const source = readFileSync(join(ASSIGNMENTS_DIR, file), 'utf8');
  const frontmatter = parseFrontmatter(source);
  if (!frontmatter) {
    continue;
  }
  const assignment = parseAssignment(frontmatter);
  if (!assignment) {
    continue;
  }
  parsed++;
  const body = source.slice(source.indexOf('---', 3) + 3);
  const rubricTags = parseRubricTags(body);

  // Reconcile: frontmatter must equal the rubric-table tags exactly.
  const keys = new Set([...Object.keys(rubricTags), ...Object.keys(assignment.outcomes)]);
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

  if (assignment.level !== 'individual') {
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
  console.error('validate-outcomes: no assignment frontmatter found; refusing to pass vacuously.');
  process.exit(1);
}

// --- Canvas mirror reconciliation -------------------------------------------
// The set of outcomes tagged in a Canvas rubric TSV must equal the set tagged
// in the handbook rubric table it mirrors.
function canvasTags(dir) {
  const tags = new Set();
  const path = join(CANVAS_DIR, dir);
  for (const file of readdirSync(path)) {
    if (!file.endsWith('rubric-details.tsv')) {
      continue;
    }
    for (const line of readFileSync(join(path, file), 'utf8').split('\n')) {
      const criterion = line.split('\t')[0];
      for (const m of criterion.matchAll(/\b(SO[1-6]|L0[789]|L10)\b/g)) {
        tags.add(m[1]);
      }
    }
  }
  return tags;
}

for (const dir of readdirSync(CANVAS_DIR)) {
  if (!statSync(join(CANVAS_DIR, dir)).isDirectory() || CANVAS_DEPRECATED.has(dir)) {
    continue;
  }
  const page = CANVAS_TO_HANDBOOK[dir];
  const tags = canvasTags(dir);
  if (!page) {
    // An unmapped directory is fine until it starts claiming outcomes.
    if (tags.size > 0) {
      console.error(
        `UNMAPPED canvas/assignments/${dir}: tags ${[...tags].sort().join(', ')} but no handbook page mapped. Add it to CANVAS_TO_HANDBOOK or CANVAS_DEPRECATED.`
      );
      failed = true;
    }
    continue;
  }
  const source = readFileSync(join(ASSIGNMENTS_DIR, `${page}.mdx`), 'utf8');
  const handbook = new Set(Object.keys(parseRubricTags(source.slice(source.indexOf('---', 3) + 3))));
  const onlyCanvas = [...tags].filter((t) => !handbook.has(t)).sort();
  const onlyHandbook = [...handbook].filter((t) => !tags.has(t)).sort();
  if (onlyCanvas.length > 0) {
    console.error(
      `MIRROR DRIFT canvas/assignments/${dir}: tags ${onlyCanvas.join(', ')} that ${page}.mdx does not. Canvas mirrors the handbook; remove the tag from the TSV.`
    );
    failed = true;
  }
  if (onlyHandbook.length > 0) {
    console.error(
      `MIRROR DRIFT canvas/assignments/${dir}: ${page}.mdx tags ${onlyHandbook.join(', ')} that the TSV does not. Add it to the TSV.`
    );
    failed = true;
  }
}

console.log('Individual data points per student per year (from rubric tables):');
for (const outcome of ABET_OUTCOMES) {
  const ok = counts[outcome] >= MIN_ABET;
  console.log(`  ${outcome}: ${counts[outcome]} ${ok ? 'ok' : `INSUFFICIENT (need ${MIN_ABET})`}`);
  for (const src of sources[outcome]) {
    console.log(`      - ${src}`);
  }
  if (!ok) {
    failed = true;
  }
}
for (const outcome of OTHER_OUTCOMES) {
  const ok = counts[outcome] >= 1;
  console.log(`  ${outcome}: ${counts[outcome]} ${ok ? 'ok' : 'INSUFFICIENT (need 1)'}`);
  for (const src of sources[outcome]) {
    console.log(`      - ${src}`);
  }
  if (!ok) {
    failed = true;
  }
}

if (failed) {
  console.error('\nOutcome coverage or traceability regression detected (see above).');
  process.exit(1);
}
console.log('\nAll outcomes covered; frontmatter and rubric tables reconcile.');
