/**
 * The sidebar is data, and nothing else checks it.
 *
 * Starlight orders a group by each page's `sidebar.order` frontmatter and
 * breaks a tie on the filename. A duplicate `order` inside one content
 * directory is therefore silent: the build passes, the links validator passes,
 * and the group renders in an order nobody chose. That is how Workshop
 * Activities (fall weeks 1 to 3) came to sit between Incident Postmortem
 * (winter week 9) and Release and Metrics (spring week 8).
 *
 * Two rules, both per directory:
 *
 *   1. No two pages share an `order`.
 *   2. Either every page in the directory declares an `order`, or none does.
 *      A directory where some pages are numbered and some are not sorts the
 *      unnumbered ones by title, which is the same silent failure wearing a
 *      different hat.
 *
 * Run: node scripts/validate-sidebar.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = "src/content/docs";
const ORDER_RE = /^sidebar:\n(?:[ \t]+.*\n)*?[ \t]+order:[ \t]*(-?\d+)[ \t]*$/m;

/** The frontmatter block of an MDX file, or "" when it has none. */
function frontmatter(source) {
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  return match ? match[1] : "";
}

const problems = [];

const directories = readdirSync(DOCS_DIR).filter((name) =>
  statSync(join(DOCS_DIR, name)).isDirectory()
);

for (const directory of directories) {
  const pages = readdirSync(join(DOCS_DIR, directory)).filter((name) =>
    name.endsWith(".mdx")
  );
  const byOrder = new Map();
  const unordered = [];

  for (const page of pages) {
    const source = readFileSync(join(DOCS_DIR, directory, page), "utf8");
    const order = ORDER_RE.exec(frontmatter(source))?.[1];
    if (order === undefined) {
      unordered.push(page);
      continue;
    }
    const seen = byOrder.get(order) ?? [];
    seen.push(page);
    byOrder.set(order, seen);
  }

  for (const [order, seen] of byOrder) {
    if (seen.length > 1) {
      problems.push(
        `duplicate order: ${directory}/ has ${seen.length} pages at sidebar.order ${order} (${seen.join(", ")}); Starlight breaks the tie on filename, so the rendered order is not the one declared`
      );
    }
  }

  if (unordered.length > 0 && byOrder.size > 0) {
    problems.push(
      `missing order: ${directory}/ numbers some pages but not ${unordered.join(", ")}; an unnumbered page sorts by title, past the numbered ones`
    );
  }
}

if (problems.length > 0) {
  console.error("Sidebar order problems:\n");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}

console.log(`Sidebar order OK: ${directories.length} content directories.`);
