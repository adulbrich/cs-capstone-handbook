// Reading the content tree, shared by the validators so each one walks the
// same files the same way. Paths stay relative to the repository root, as
// the validators print and compare them.

import { readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";

/** The text files the content checks read: everything else is binary. */
export const TEXT_EXTENSIONS = new Set([
  ".astro",
  ".css",
  ".csv",
  ".html",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".svelte",
  ".ts",
  ".txt",
  ".yml",
  ".yaml",
]);

/** Markdown pages, as the docs collection holds them. */
export const PAGE_EXTENSIONS = new Set([".md", ".mdx"]);

/**
 * Every file under `path` whose extension is in `extensions`, depth first in
 * directory order. `path` may itself be a file (`STAFF-RUNBOOK.md`).
 */
export function* walk(path, extensions = TEXT_EXTENSIONS) {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) {
      yield* walk(join(path, name), extensions);
    }
  } else if (extensions.has(extname(path))) {
    yield path;
  }
}

/**
 * A page's frontmatter block and the body after its closing fence, or null
 * when the file does not open with one.
 */
export function parseFrontmatter(source) {
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  return match
    ? { body: source.slice(match[0].length), frontmatter: match[1] }
    : null;
}
