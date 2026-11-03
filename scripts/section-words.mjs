#!/usr/bin/env node
// Words per section on the assignment pages a branch changes, before and
// after, against the length tripwires in the cs46x-assignments skill (Length).
// A section counts its own text only: the lines under its heading up to the
// next heading of any level, without the asides inside it, which count on
// their own. A page split into entries is therefore budgeted section by
// section, never as a whole.
//
// It flags a section over its budget that the branch took over, and one
// already over that the branch made longer. Nothing fails: the number starts a
// check for restatement, and the review decides (cs46x-review, Fix by the Ladder).
//
// Run: node scripts/section-words.mjs [--base <ref>] [page.mdx ...]
// With no pages, it reads every assignment page changed since the merge base
// with <ref> (default origin/main), working tree and new files included. It
// prints every section of each page; the two counts differ where the branch
// changed it.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseFrontmatter } from "./lib/content.mjs";

const PAGES_DIR = "src/content/docs/assignments/";
const BUDGET = { aside: 60, intro: 150, section: 200, submit: 40 };

const HEADING_RE = /^(#{2,4}) (.+)$/;
const FENCE_RE = /^\s*(```|~~~)/;
const ASIDE_OPEN_RE = /^:::(\w+)(?:\[(.*)\])?\s*$/;
const ASIDE_CLOSE_RE = /^:::\s*$/;
const IMPORT_RE = /^import .*$/gm;
const COMMENT_RE = /\{\/\*[\s\S]*?\*\/\}/g;
// The summary card's own text is not intro prose.
const CARD_RE =
  /<(AssignmentSummary|AssignmentMeta)\b(?:[^>]*[^/])?>[\s\S]*?<\/\1>/g;
const SELF_CLOSING_RE = /<[A-Za-z][^>]*\/>/g;
const TAG_RE = /<\/?[A-Za-z][^>]*>/g;
const LINK_RE = /!?\[([^\]]*)\]\([^)]*\)/g;
const WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu;

function git(gitArgs) {
  return execFileSync("git", gitArgs, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function words(text) {
  const prose = text
    .replace(IMPORT_RE, "")
    .replace(COMMENT_RE, "")
    .replace(CARD_RE, "")
    .replace(SELF_CLOSING_RE, "")
    .replace(TAG_RE, "")
    .replace(LINK_RE, "$1");
  return (prose.match(WORD_RE) ?? []).length;
}

function budgetFor(path) {
  if (path.at(-1).startsWith("aside")) {
    return BUDGET.aside;
  }
  if (path.length === 1 && path[0] === "(intro)") {
    return BUDGET.intro;
  }
  const inSubmit = path[0] === "## What You Submit";
  return inSubmit && path.length <= 2 ? BUDGET.submit : BUDGET.section;
}

/** The heading path after `heading`: its ancestors, then itself. */
function descend(path, heading) {
  const level = heading.indexOf(" ");
  const ancestors = path.filter(
    (h) => h.startsWith("#") && h.indexOf(" ") < level
  );
  return [...ancestors, heading];
}

/**
 * Own-text word counts keyed by heading path. An aside is keyed under its
 * section by its title, or by its place among the section's untitled asides, so
 * a new aside elsewhere on the page leaves its key alone.
 */
function sections(source) {
  const body = parseFrontmatter(source)?.body ?? source;
  const texts = new Map([["(intro)", []]]);
  const state = { asides: 0, inAside: false, path: ["(intro)"] };
  let current = texts.get("(intro)");
  let outer = current;
  let inFence = false;
  for (const line of body.split("\n")) {
    inFence = FENCE_RE.test(line) ? !inFence : inFence;
    const heading = inFence ? null : HEADING_RE.exec(line);
    const aside = inFence ? null : ASIDE_OPEN_RE.exec(line);
    if (heading) {
      state.path = descend(state.path, line.trim());
      current = [];
      outer = current;
      state.asides = 0;
      texts.set(state.path.join(" > "), current);
    } else if (aside) {
      state.asides += aside[2] ? 0 : 1;
      state.inAside = true;
      current = [];
      const name = aside[2] ? `aside [${aside[2]}]` : `aside ${state.asides}`;
      texts.set([...state.path, name].join(" > "), current);
    } else if (state.inAside && ASIDE_CLOSE_RE.test(line)) {
      state.inAside = false;
      current = outer;
    } else {
      current.push(line);
    }
  }
  return new Map(
    [...texts].map(([key, lines]) => [key, words(lines.join("\n"))])
  );
}

function verdict(budget, before, after) {
  if (after <= budget) {
    return "";
  }
  if (before === undefined || before <= budget) {
    return "OVER";
  }
  return after > before ? "GREW" : "over, not grown";
}

function baseSections(base, page) {
  try {
    return sections(git(["show", `${base}:${page}`]));
  } catch {
    return new Map();
  }
}

/** One line per section, before and after, and how many the branch flagged. */
function report(base, page) {
  const before = baseSections(base, page);
  const after = existsSync(page)
    ? sections(readFileSync(page, "utf8"))
    : new Map();
  const rows = [];
  let flagged = 0;
  for (const [key, count] of after) {
    const budget = budgetFor(key.split(" > "));
    const was = before.get(key);
    const flag = verdict(budget, was, count);
    rows.push(`  ${was ?? "new"} -> ${count} / ${budget}  ${flag}  ${key}`);
    flagged += flag === "OVER" || flag === "GREW" ? 1 : 0;
  }
  for (const [key, count] of before) {
    if (!after.has(key)) {
      rows.push(`  ${count} -> gone  ${key}`);
    }
  }
  return { flagged, rows };
}

const args = process.argv.slice(2);
const baseFlag = args.indexOf("--base");
const baseRef = baseFlag === -1 ? "origin/main" : args[baseFlag + 1];
if (!baseRef || baseRef.startsWith("--")) {
  console.error(
    "Usage: node scripts/section-words.mjs [--base <ref>] [page.mdx ...]"
  );
  process.exit(2);
}
const named =
  baseFlag === -1
    ? args
    : args.filter((_, i) => i !== baseFlag && i !== baseFlag + 1);
const mergeBase = git(["merge-base", baseRef, "HEAD"]);
const changed = [
  git(["diff", "--name-only", mergeBase, "--", PAGES_DIR]),
  git(["ls-files", "--others", "--exclude-standard", "--", PAGES_DIR]),
]
  .join("\n")
  .split("\n")
  .filter((p) => p.endsWith(".mdx"));
const pages = named.length
  ? named.map((page) => relative(process.cwd(), resolve(page)))
  : changed;

let flagged = 0;
for (const page of pages) {
  const result = report(mergeBase, page);
  flagged += result.flagged;
  console.log(page);
  for (const row of result.rows) {
    console.log(row);
  }
}
console.log(
  `\n${flagged} section(s) taken over budget or grown past it, across ${pages.length} page(s), base ${mergeBase.slice(0, 7)}.`
);
