/**
 * A citation is only as good as the passage behind it.
 *
 * A link checker passes a real paper cited for a claim it does not make. The
 * handbook did exactly that: a guide cited Edmondson 1999 under a misquoted
 * title, for a hospital finding from her 1996 paper. So every source a page
 * cites lives in a registry, `src/data/sources/<id>.yaml`, that records the
 * claims the handbook makes from it, where in the source each one is
 * supported, and whether that was read in the full text or only the abstract.
 * Pages cite with `<Cite id="..." />`; `<References />` lists what they cite.
 *
 * Rules:
 *
 *   1. Every `<Cite id>` on a page names a registry file.
 *   2. Every registry file parses and carries the required fields, a known
 *      `kind` and `verified`, and at least one claim with a locator. The
 *      Astro content schema in src/content.config.ts enforces the same shape
 *      at build time; this copy exists because `astro:content` cannot run in
 *      a pre-commit hook. Change both together.
 *   3. Every registry entry is cited by at least one page. An entry nothing
 *      cites is a stale fact that nobody will re-check.
 *   4. A page that cites has `## References` followed by `<References />`,
 *      before `## Additional Readings`.
 *
 * The "(preprint)" marker is not checked here: Cite.astro appends it from
 * `kind`, so a preprint cannot be cited without it.
 *
 * Passes on a tree with no citations and no registry, so it can land before
 * any page uses it.
 *
 * Run: node scripts/validate-sources.mjs
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { parse } from "yaml";

const DOCS_DIR = "src/content/docs";
const SOURCES_DIR = "src/data/sources";

const KINDS = new Set([
  "peer-reviewed",
  "research-book",
  "preprint",
  "industry-report",
  "standard",
  "documentation",
  "essay",
]);
const VERIFIED = new Set(["full-text", "abstract"]);
const REQUIRED_STRINGS = ["title", "venue", "url"];
const KNOWN_FIELDS = new Set([
  "authors",
  "year",
  "title",
  "venue",
  "kind",
  "url",
  "doi",
  "claims",
  "verified",
]);

function collectMdx(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      out.push(...collectMdx(path));
    } else if (entry.endsWith(".mdx")) {
      out.push(path);
    }
  }
  return out;
}

/** The page with fenced code blocks removed: an example is not a citation. */
function withoutFences(source) {
  return source.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, "");
}

const shown = (value) =>
  value === undefined ? "missing" : JSON.stringify(value);

const isText = (value) => typeof value === "string" && value.trim() !== "";

/** Everything wrong with one parsed registry entry, as strings. */
function entryProblems(data) {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return ["is not a YAML mapping"];
  }
  const problems = [];
  for (const key of Object.keys(data)) {
    if (!KNOWN_FIELDS.has(key)) {
      problems.push(`unknown field \`${key}\``);
    }
  }
  if (
    !(
      Array.isArray(data.authors) &&
      data.authors.length > 0 &&
      data.authors.every(isText)
    )
  ) {
    problems.push('`authors` must be a non-empty list of "Family, Initials"');
  }
  if (!Number.isInteger(data.year)) {
    problems.push("`year` must be an integer, the year only");
  }
  for (const key of REQUIRED_STRINGS) {
    if (!isText(data[key])) {
      problems.push(`\`${key}\` is missing or empty`);
    }
  }
  if (data.doi !== undefined && !isText(data.doi)) {
    problems.push("`doi` is empty; omit it or give the DOI");
  }
  if (!KINDS.has(data.kind)) {
    problems.push(
      `\`kind\` is ${shown(data.kind)}; expected one of ${[...KINDS].join(", ")}`
    );
  }
  if (!VERIFIED.has(data.verified)) {
    problems.push(
      `\`verified\` is ${shown(data.verified)}; expected full-text or abstract (how the claims were checked)`
    );
  }
  if (!Array.isArray(data.claims) || data.claims.length === 0) {
    problems.push(
      "`claims` must list at least one claim the handbook makes from this source"
    );
  } else {
    data.claims.forEach((claim, index) => {
      if (!(isText(claim?.claim) && isText(claim?.locator))) {
        problems.push(
          `claim ${index + 1} needs both \`claim\` and \`locator\` (the section, page, figure, or table that supports it)`
        );
      }
    });
  }
  return problems;
}

const problems = [];

// The registry.
const registry = new Set();
const registryFiles = existsSync(SOURCES_DIR)
  ? readdirSync(SOURCES_DIR).filter((name) => !name.startsWith("."))
  : [];
for (const name of registryFiles) {
  const path = join(SOURCES_DIR, name);
  if (!name.endsWith(".yaml")) {
    problems.push(
      `${path}: not a .yaml file; the registry holds one <id>.yaml per source`
    );
    continue;
  }
  registry.add(basename(name, ".yaml"));
  let data;
  try {
    data = parse(readFileSync(path, "utf8"));
  } catch (error) {
    problems.push(`${path}: does not parse: ${error.message.split("\n")[0]}`);
    continue;
  }
  for (const problem of entryProblems(data)) {
    problems.push(`${path}: ${problem}`);
  }
}

// The pages.
const cited = new Set();
let citingPages = 0;
let citations = 0;
for (const page of collectMdx(DOCS_DIR)) {
  const prose = withoutFences(readFileSync(page, "utf8"));
  const ids = [...prose.matchAll(/<Cite\b[^>]*?\bid=["']([^"']+)["']/g)].map(
    (match) => match[1]
  );
  const tags = prose.match(/<Cite\b/g)?.length ?? 0;
  if (tags > ids.length) {
    problems.push(
      `${page}: a <Cite> without an id="..." attribute; every Cite names a registry entry`
    );
  }
  if (ids.length === 0) {
    continue;
  }
  citingPages += 1;
  citations += ids.length;
  for (const id of ids) {
    cited.add(id);
    if (!registry.has(id)) {
      problems.push(
        `${page}: <Cite id="${id}"> has no registry entry; add ${SOURCES_DIR}/${id}.yaml`
      );
    }
  }

  const lines = prose.split("\n");
  const references = lines.findIndex((line) =>
    /^##\s+References\s*$/.test(line)
  );
  const readings = lines.findIndex((line) =>
    /^##\s+Additional Readings\s*$/.test(line)
  );
  if (references === -1) {
    problems.push(
      `${page}: cites a source but has no \`## References\` heading followed by <References />`
    );
    continue;
  }
  const next = lines.slice(references + 1).find((line) => line.trim() !== "");
  if (!/^<References\s*\/>\s*$/.test(next ?? "")) {
    problems.push(
      `${page}: \`## References\` must be followed directly by <References />`
    );
  }
  if (readings !== -1 && readings < references) {
    problems.push(
      `${page}: \`## References\` must come before \`## Additional Readings\``
    );
  }
}

for (const id of registry) {
  if (!cited.has(id)) {
    problems.push(
      `${SOURCES_DIR}/${id}.yaml: no page cites it; cite it with <Cite id="${id}" /> or delete the entry`
    );
  }
}

if (problems.length > 0) {
  console.error("Source problems:\n");
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}

console.log(
  `Sources OK: ${registry.size} registry entries, ${citations} citation(s) on ${citingPages} page(s).`
);
