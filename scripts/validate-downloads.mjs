#!/usr/bin/env node
// Validates that every student-facing download in public/ has an owning page.
//
// The handbook ships templates, cheat sheets, and scoresheets from public/,
// linked as root-relative URLs (`/rfc-template.md`). `starlight-links-validator`
// already checks the forward direction: a link to a missing file fails the
// build. Nothing checked the reverse, and six downloads had drifted into
// orphans: shipped, downloadable, and reachable from no page in the handbook.
// An orphan is worse than a missing file, because it goes stale silently while
// still being served, and the assignment it belongs to never notices.
//
// The rule: every download has exactly one owning page, and that page is the
// one that requires the artifact. This checks the "at least one" half; which
// page owns it is an editorial call.
//
// Run: node scripts/validate-downloads.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PUBLIC_DIR = "public";
const DOCS_DIR = "src/content/docs";

// Build assets and site chrome, not student-facing downloads. Anything added
// here is asserting "no page should link this", so keep the list short.
const NOT_A_DOWNLOAD = new Set(["favicon.svg"]);

function collectMdx(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      out.push(...collectMdx(path));
    } else if (entry.endsWith(".mdx") || entry.endsWith(".md")) {
      out.push(path);
    }
  }
  return out;
}

const corpus = collectMdx(DOCS_DIR)
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const downloads = readdirSync(PUBLIC_DIR).filter(
  (f) => statSync(join(PUBLIC_DIR, f)).isFile() && !NOT_A_DOWNLOAD.has(f)
);

if (downloads.length === 0) {
  console.error(
    "validate-downloads: no files found in public/; refusing to pass vacuously."
  );
  process.exit(1);
}

const orphans = downloads.filter((f) => !corpus.includes(`/${f}`));

for (const f of orphans) {
  console.error(
    `ORPHAN public/${f}: shipped as a download but no page under ${DOCS_DIR} links to it. Link it from the page that requires the artifact, or delete it.`
  );
}

if (orphans.length > 0) {
  process.exit(1);
}

console.log(
  `Downloads: ${downloads.length} in public/, every one linked from a handbook page.`
);
