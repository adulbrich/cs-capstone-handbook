#!/usr/bin/env node
// Validates the activity tier system described in .claude/skills/cs46x-activities.
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
//
// Workshop-tier activities are exempt from rule 2: they are assigned centrally
// through assignments/workshop-activities.mdx, not per assignment page.
//
// Run: node scripts/validate-activity-tiers.mjs

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSIGNMENTS_DIR = 'src/content/docs/assignments';
const ACTIVITIES_DIR = 'src/content/docs/activities';
const SECTION_HEADING = '## Activities That Prepare This';

// GitHub-style slugger, matching how Starlight derives heading anchors.
function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Collect every activity: page, heading, slug, and its tier badge (if any).
function readActivities() {
  const activities = new Map(); // "page#slug" -> { page, heading, tier }
  for (const file of readdirSync(ACTIVITIES_DIR)) {
    if (!file.endsWith('.mdx') || file === 'introduction.mdx') {
      continue;
    }
    const page = file.slice(0, -4);
    const lines = readFileSync(join(ACTIVITIES_DIR, file), 'utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('## ')) {
        continue;
      }
      const heading = lines[i].slice(3).trim();
      // The badge line is within the next few lines, before any prose.
      const window = lines.slice(i + 1, i + 5).join('\n');
      let tier = null;
      if (/<Badge[^>]*text="Workshop"/.test(window)) {
        tier = 'Workshop';
      } else if (/<Badge[^>]*text="Recommended"/.test(window)) {
        tier = 'Recommended';
      }
      activities.set(`${page}#${slugify(heading)}`, { page, heading, tier });
    }
  }
  return activities;
}

// Collect every activity link inside an "Activities That Prepare This" section.
function readAssignmentLinks() {
  const links = new Map(); // "page#slug" -> Set of assignment filenames
  for (const file of readdirSync(ASSIGNMENTS_DIR)) {
    if (!file.endsWith('.mdx')) {
      continue;
    }
    const source = readFileSync(join(ASSIGNMENTS_DIR, file), 'utf8');
    const start = source.indexOf(SECTION_HEADING);
    if (start === -1) {
      continue;
    }
    const section = source.slice(start);
    for (const m of section.matchAll(/\/activities\/([a-z-]+)\/#([\w-]+)/g)) {
      const key = `${m[1]}#${m[2]}`;
      if (!links.has(key)) {
        links.set(key, new Set());
      }
      links.get(key).add(file);
    }
  }
  return links;
}

const activities = readActivities();
const links = readAssignmentLinks();
const problems = [];

// Rule 3, then rule 1.
for (const [key, sources] of links) {
  const activity = activities.get(key);
  const from = [...sources].join(', ');
  if (!activity) {
    problems.push(`broken anchor: /activities/${key} linked from ${from} matches no heading`);
    continue;
  }
  if (!activity.tier) {
    problems.push(
      `untiered: "${activity.heading}" (${activity.page}) is linked from ${from} but carries no Workshop or Recommended badge`
    );
  }
}

// Rule 2.
for (const [key, activity] of activities) {
  if (activity.tier === 'Recommended' && !links.has(key)) {
    problems.push(
      `unearned badge: "${activity.heading}" (${activity.page}) is marked Recommended but no assignment page links to it`
    );
  }
}

const counts = { Workshop: 0, Recommended: 0, Library: 0 };
for (const activity of activities.values()) {
  counts[activity.tier ?? 'Library']++;
}

console.log('Activity tiers:');
console.log(`  Workshop:    ${counts.Workshop}`);
console.log(`  Recommended: ${counts.Recommended}`);
console.log(`  Library:     ${counts.Library}`);
console.log(`  Total:       ${activities.size}`);

if (problems.length > 0) {
  console.error(`\n${problems.length} problem(s):`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error('\nSee .claude/skills/cs46x-activities/SKILL.md for the tier rules.');
  process.exit(1);
}
console.log('\nEvery linked activity is tiered, and every Recommended badge is earned.');
