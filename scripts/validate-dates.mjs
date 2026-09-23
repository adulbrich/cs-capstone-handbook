#!/usr/bin/env node
// The handbook refers only to terms and weeks: no calendar dates and no
// academic year anywhere in it (#57). The handbook is reused every year, and
// a date is a fact that rots on a schedule. Weeks, terms, weekdays and named
// holidays are fine ("fall week 9, Wednesday before Thanksgiving").
//
// Flagged: a month name, bare or abbreviated ("reviewed each August", "the
// Expo is in June"), which is a calendar fact the same way a date is; a term
// with a year ("Fall 2026"); an ISO date; and an academic-year range
// ("2026-27", "2026/27", "AY 2026").
//
// "May" and "Mar" are the two exceptions, and only to the bare-name rule:
// "may" is a modal verb on almost every page and "Mar" is a fragment of
// ordinary words. Both are still flagged next to a year or a day, which is
// how a calendar writes them, so nothing is lost. Every other month is
// capitalized only as a month, so the bare name is enough and a separate
// month-with-a-year rule would only report the same line twice.
//
// Allowed: bare years in history prose ("around 2014"); URLs; inline code
// spans, because a file name such as `2026-08-17-four-skills.md` is a path,
// not a date; reference-list entries, both the numbered line ("[1] M. W.
// Ohland et al., ... Dec. 2012") and the access date ("Accessed: Mar. 31"),
// because a source's own publication date is not the course calendar; and the
// project years on the showcase page, which are history rather than the
// course calendar. Fenced blocks are checked: the example artifacts in the
// guides are handbook content and follow the rule like the prose. The
// Canvas readme and the skills are out of scope: their decision timestamps
// are provenance.
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
  ".csv",
  ".html",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".txt",
  ".yml",
  ".yaml",
]);

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
// "Sept" precedes "Sep" so the longer abbreviation wins the alternation.
const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const AMBIGUOUS = ["May", "Mar"];
const bare = [...MONTHS, ...MONTH_ABBR].filter(
  (name) => !AMBIGUOUS.includes(name)
);
const ambiguous = AMBIGUOUS.join("|");
const DAY = String.raw`\.?\s+\d{1,2}(st|nd|rd|th)?\b(?!:\d)`;

const PATTERNS = [
  [
    "term with a year",
    /\b(Fall|Winter|Spring|Summer|Autumn)\s+(of\s+)?20\d{2}\b/g,
  ],
  ["month name", new RegExp(String.raw`\b(${bare.join("|")})\b`, "g")],
  [
    "ambiguous month with a year",
    new RegExp(String.raw`\b(${ambiguous})\s+20\d{2}\b`, "g"),
  ],
  [
    "ambiguous month with a day",
    new RegExp(String.raw`\b(${ambiguous})${DAY}`, "g"),
  ],
  [
    "day with an ambiguous month",
    new RegExp(String.raw`\b\d{1,2}\s+(${ambiguous})\b`, "g"),
  ],
  ["ISO date", /\b20\d{2}-\d{2}-\d{2}\b/g],
  ["academic-year range", /\b20\d{2}\s*[-/–]\s*(20)?\d{2}\b/g],
  ["academic year", /\b(AY|academic year)\s+20\d{2}\b/gi],
];
const URL_RE = /https?:\/\/\S+/g;
const CODE_SPAN_RE = /`[^`\n]*`/g;
const CITATION_RE = /\bAccessed:|^\s*(\*\*)?\[\d+\]/;

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
