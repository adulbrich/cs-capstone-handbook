#!/usr/bin/env node
// Validates ABET outcome coverage from assignment frontmatter.
// Every ABET student outcome (SO1-SO6) must have at least MIN_POINTS
// individual-level data points (rubric items on individual assignments,
// plus the standing peer-evaluation instrument for SO5).
//
// Run: node scripts/validate-outcomes.mjs

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSIGNMENTS_DIR = 'src/content/docs/assignments';
const MIN_POINTS = 2;
const ABET_OUTCOMES = ['SO1', 'SO2', 'SO3', 'SO4', 'SO5', 'SO6'];

// Standing individual instruments not represented as assignment pages:
// peer evaluations run mid + final every term and evidence SO5.
const STANDING_INDIVIDUAL_POINTS = { SO5: 6 };

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
      break; // left the assignment block
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

const counts = Object.fromEntries(ABET_OUTCOMES.map((o) => [o, 0]));
for (const [outcome, n] of Object.entries(STANDING_INDIVIDUAL_POINTS)) {
  counts[outcome] += n;
}
const sources = Object.fromEntries(
  ABET_OUTCOMES.map((o) => [o, counts[o] ? ['peer evaluations'] : []])
);

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
  if (assignment.level !== 'individual') {
    continue; // team-level work is corroboration, not a data point
  }
  const runs = assignment.terms.length || 1;
  for (const [outcome, items] of Object.entries(assignment.outcomes)) {
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

let failed = false;
console.log('ABET individual data points per student per year:');
for (const outcome of ABET_OUTCOMES) {
  const ok = counts[outcome] >= MIN_POINTS;
  console.log(
    `  ${outcome}: ${counts[outcome]} ${ok ? 'ok' : `INSUFFICIENT (need ${MIN_POINTS})`}`
  );
  for (const src of sources[outcome]) {
    console.log(`      - ${src}`);
  }
  if (!ok) {
    failed = true;
  }
}

if (failed) {
  console.error('\nOutcome coverage regression: an ABET outcome has fewer than 2 individual data points.');
  process.exit(1);
}
console.log('\nAll ABET outcomes have sufficient individual coverage.');
