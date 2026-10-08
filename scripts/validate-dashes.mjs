#!/usr/bin/env node
// No em dashes. The house style uses colons, semicolons, commas, and periods
// instead, and the rule was checked by hand until a review found nine
// `&mdash;` entities in the Canvas syllabi. This checks the literal character
// and the three HTML entity spellings in every text file under the content
// directories, and runs in CI and pre-commit.
//
// Run: node scripts/validate-dashes.mjs

import { readFileSync } from "node:fs";
import { walk } from "./lib/content.mjs";

const ROOTS = ["src", "canvas", "public"];
const EM_DASH_RE = /\u2014|&mdash;|&#8212;|&#x2014;/gi;

const hits = [];
let checked = 0;
for (const root of ROOTS) {
  for (const path of walk(root)) {
    checked += 1;
    const lines = readFileSync(path, "utf8").split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const found = lines[i].match(EM_DASH_RE);
      if (found) {
        hits.push(`${path}:${i + 1}: ${found.join(" ")}`);
      }
    }
  }
}

if (hits.length > 0) {
  console.error(`${hits.length} em dash(es) in ${checked} files:`);
  for (const hit of hits) {
    console.error(`  - ${hit}`);
  }
  console.error(
    "\nUse a colon, semicolon, comma, or period instead (AGENTS.md, hard rule 3)."
  );
  process.exit(1);
}
console.log(`No em dashes in ${checked} text files under ${ROOTS.join(", ")}.`);
