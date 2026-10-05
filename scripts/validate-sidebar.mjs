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
 * Two rules, per directory, for every directory but activities/:
 *
 *   1. No two pages share an `order`.
 *   2. Either every page in the directory declares an `order`, or none does.
 *      A directory where some pages are numbered and some are not sorts the
 *      unnumbered ones by title, which is the same silent failure wearing a
 *      different hat.
 *
 * The Activities group is listed page by page in
 * `src/lib/activities-sidebar.mjs`, which `astro.config.mjs` renders, so
 * activities/ gets its own rules instead:
 *
 *   3. Every page under activities/ appears exactly once in that list, and
 *      the list names no page that does not exist. An explicit list ignores
 *      `sidebar.order`, so a page left out of it is built and linkable but
 *      missing from the sidebar, and nothing else notices.
 *   4. No page under activities/ declares a `sidebar.order`. The list is the
 *      only ordering, and an `order` there would claim one it never gets.
 *   5. Every entry in the list is a page (`slug`) or a group (`items`). An
 *      entry that is neither would otherwise be skipped without a word.
 *
 * Run: node scripts/validate-sidebar.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { activitiesSidebar } from "../src/lib/activities-sidebar.mjs";
import { parseFrontmatter } from "./lib/content.mjs";

const DOCS_DIR = "src/content/docs";
const ACTIVITIES_DIR = "activities";
const PAGE_RE = /\.mdx?$/;
const ORDER_RE = /^sidebar:\n(?:[ \t]+.*\n)*?[ \t]+order:[ \t]*(-?\d+)[ \t]*$/m;

const problems = [];

const directories = readdirSync(DOCS_DIR).filter((name) =>
  statSync(join(DOCS_DIR, name)).isDirectory()
);

const pagesIn = (directory) =>
  readdirSync(join(DOCS_DIR, directory)).filter((name) => PAGE_RE.test(name));

const orderOf = (directory, page) =>
  ORDER_RE.exec(
    parseFrontmatter(readFileSync(join(DOCS_DIR, directory, page), "utf8"))
      ?.frontmatter ?? ""
  )?.[1];

for (const directory of directories) {
  if (directory === ACTIVITIES_DIR) {
    continue;
  }
  const pages = pagesIn(directory);
  const byOrder = new Map();
  const unordered = [];

  for (const page of pages) {
    const order = orderOf(directory, page);
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

// Rules 3 to 5: the explicit Activities group against the directory.
const SLUG_PREFIX = `${ACTIVITIES_DIR}/`;

function* sidebarSlugs(items, where) {
  for (const entry of items) {
    if (entry.slug) {
      yield entry.slug;
    } else if (entry.items) {
      yield* sidebarSlugs(entry.items, `${where} > ${entry.label}`);
    } else {
      problems.push(
        `unreadable entry: ${where} in src/lib/activities-sidebar.mjs has ${JSON.stringify(entry)}, which is neither a page (slug) nor a group (items)`
      );
    }
  }
}

const listed = new Map();
for (const slug of sidebarSlugs(activitiesSidebar.items, "Activities")) {
  listed.set(slug, (listed.get(slug) ?? 0) + 1);
}
const activityFiles = pagesIn(ACTIVITIES_DIR);
const activityPages = activityFiles.map(
  (name) => `${SLUG_PREFIX}${name.replace(PAGE_RE, "")}`
);

for (const page of activityFiles) {
  if (orderOf(ACTIVITIES_DIR, page) !== undefined) {
    problems.push(
      `stray order: ${ACTIVITIES_DIR}/${page} declares sidebar.order, but the Activities group is ordered only by src/lib/activities-sidebar.mjs; delete it`
    );
  }
}

for (const slug of activityPages) {
  const count = listed.get(slug) ?? 0;
  if (count === 0) {
    problems.push(
      `missing from sidebar: ${slug} is not in the Activities group in src/lib/activities-sidebar.mjs; the explicit list ignores sidebar.order, so the page builds but no sidebar entry leads to it`
    );
  } else if (count > 1) {
    problems.push(
      `listed twice: ${slug} appears ${count} times in the Activities group in src/lib/activities-sidebar.mjs`
    );
  }
}
for (const slug of listed.keys()) {
  if (!activityPages.includes(slug)) {
    problems.push(
      `no such page: the Activities group in src/lib/activities-sidebar.mjs lists ${slug}, but no src/content/docs/${slug}.md or .mdx exists`
    );
  }
}

if (problems.length > 0) {
  console.error("Sidebar problems:\n");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}

console.log(
  `Sidebar OK: ${directories.length} content directories, ${activityPages.length} activity pages each listed once.`
);
