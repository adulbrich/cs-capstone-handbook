#!/usr/bin/env node
// The handbook refers only to terms and weeks: no calendar dates and no
// academic year anywhere in it (#57). The handbook is reused every year, and
// a date is a fact that rots on a schedule. Weeks, terms, weekdays and named
// holidays are fine ("fall week 9, Wednesday before Thanksgiving").
//
// Flagged: a term with a year ("Fall 2026"), a month with a year ("August
// 2026"), a month with a day ("Sep 23", "23 September"), an ISO date, and an
// academic-year range ("2026-27", "2026/27", "AY 2026").
//
// Allowed: bare years in history prose ("around 2014"); URLs; inline code
// spans, because a file name such as `2026-08-17-four-skills.md` is a path,
// not a date; citation lines carrying an access date ("Accessed:"); and the
// project years on the showcase page, which are history rather than the
// course calendar. Fenced blocks are checked: the example artifacts in the
// guides are handbook content and follow the rule like the prose. The
// changelogs (IMPLEMENTED.md, the Canvas readme) and the skills are out of
// scope: their decision timestamps are provenance.
//
// Run: node scripts/validate-dates.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const ROOTS = ["src", "canvas", "public", "decks", "STAFF-RUNBOOK.md"];
const SKIP_FILES = new Set([
  "canvas/assignments/assignment-readme.md",
  "src/content/docs/introduction/showcase.mdx",
]);
const TEXT_EXTENSIONS = new Set([
  ".astro",
  ".css",
  ".html",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsv",
  ".txt",
  ".yml",
  ".yaml",
]);

const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December";
const MONTH_ABBR = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";
const PATTERNS = [
  [
    "term with a year",
    /\b(Fall|Winter|Spring|Summer|Autumn)\s+(of\s+)?20\d{2}\b/g,
  ],
  ["month with a year", new RegExp(`\\b(${MONTHS})\\s+20\\d{2}\\b`, "g")],
  [
    "month with a day",
    new RegExp(
      `\\b(${MONTHS}|${MONTH_ABBR})\\.?\\s+\\d{1,2}(st|nd|rd|th)?\\b(?!:\\d)`,
      "g"
    ),
  ],
  ["day with a month", new RegExp(`\\b\\d{1,2}\\s+(${MONTHS})\\b`, "g")],
  ["ISO date", /\b20\d{2}-\d{2}-\d{2}\b/g],
  ["academic-year range", /\b20\d{2}\s*[-/–]\s*(20)?\d{2}\b/g],
  ["academic year", /\b(AY|academic year)\s+20\d{2}\b/gi],
];
const URL_RE = /https?:\/\/\S+/g;
const CODE_SPAN_RE = /`[^`\n]*`/g;
const CITATION_RE = /\bAccessed:/;

function* walk(path) {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) {
      yield* walk(join(path, name));
    }
  } else if (TEXT_EXTENSIONS.has(extname(path))) {
    yield path;
  }
}

const hits = [];
let checked = 0;
for (const root of ROOTS) {
  for (const path of walk(root)) {
    if (SKIP_FILES.has(path)) {
      continue;
    }
    checked += 1;
    const lines = readFileSync(path, "utf8").split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      if (CITATION_RE.test(lines[i])) {
        continue;
      }
      const line = lines[i].replace(URL_RE, "").replace(CODE_SPAN_RE, "");
      for (const [label, re] of PATTERNS) {
        const found = line.match(re);
        if (found) {
          hits.push(`${path}:${i + 1}: ${label}: ${found.join(", ")}`);
        }
      }
    }
  }
}

if (hits.length > 0) {
  console.error(`${hits.length} calendar date(s) in ${checked} files:`);
  for (const hit of hits) {
    console.error(`  - ${hit}`);
  }
  console.error(
    "\nRefer to terms and weeks only; no calendar dates, no academic year (AGENTS.md, hard rule 5)."
  );
  process.exit(1);
}
console.log(
  `No calendar dates in ${checked} text files under ${ROOTS.join(", ")}.`
);
