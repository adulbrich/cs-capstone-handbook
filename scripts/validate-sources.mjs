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
 *   2. Every registry file parses and has the shape the Astro content schema
 *      in src/content.config.ts requires: the required fields, non-blank
 *      text, a known `kind` and `verified`, an http(s) `url`, a bare DOI, and
 *      at least one claim with a locator, with no unknown keys. The schema
 *      fails the build; this copy exists because `astro:content` cannot run
 *      in a pre-commit hook. Change both together.
 *   3. Every registry entry is cited by at least one page. An entry nothing
 *      cites is a stale fact that nobody will re-check.
 *   4. No two entries render the same in-text label ("Edmondson (1999)");
 *      the second needs a `suffix`.
 *   5. A page that cites has `## References` followed by `<References />`,
 *      and the next `##` heading is `## Additional Readings`. A page with
 *      `<References />` and no Cite fails too: its list would be empty.
 *
 * Citations are read the way the site reads them, through
 * src/lib/cite-pattern.mjs, so a Cite inside a code block, an inline code
 * span, or an MDX comment counts for neither.
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
import {
  citableText,
  citedYear,
  citeIds,
  citeTagCount,
  inTextAuthors,
} from "../src/lib/cite-pattern.mjs";

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
const REQUIRED_TEXT = ["title", "venue"];
const KNOWN_FIELDS = new Set([
  "authors",
  "year",
  "suffix",
  "title",
  "venue",
  "kind",
  "url",
  "doi",
  "claims",
  "verified",
]);
const CLAIM_FIELDS = new Set(["claim", "locator"]);

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

const shown = (value) =>
  value === undefined ? "missing" : JSON.stringify(value);

/** Non-blank text, as the schema's `text()` requires. */
const isText = (value) => typeof value === "string" && /\S/.test(value);

const isHttpUrl = (value) =>
  typeof value === "string" &&
  URL.canParse(value) &&
  ["http:", "https:"].includes(new URL(value).protocol);

const isMapping = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function claimProblems(claims) {
  if (!Array.isArray(claims) || claims.length === 0) {
    return [
      "`claims` must list at least one claim the handbook makes from this source",
    ];
  }
  const problems = [];
  claims.forEach((claim, index) => {
    const at = `claim ${index + 1}`;
    if (!isMapping(claim)) {
      problems.push(`${at} is not a mapping of \`claim\` and \`locator\``);
      return;
    }
    for (const key of Object.keys(claim)) {
      if (!CLAIM_FIELDS.has(key)) {
        problems.push(`${at} has unknown field \`${key}\``);
      }
    }
    if (!(isText(claim.claim) && isText(claim.locator))) {
      problems.push(
        `${at} needs both \`claim\` and \`locator\` (the section, page, figure, or table that supports it)`
      );
    }
  });
  return problems;
}

/** Everything wrong with one parsed registry entry, as strings. */
function entryProblems(data) {
  if (!isMapping(data)) {
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
  if (
    data.suffix !== undefined &&
    !(typeof data.suffix === "string" && /^[a-z]$/.test(data.suffix))
  ) {
    problems.push(`\`suffix\` is ${shown(data.suffix)}; one lowercase letter`);
  }
  for (const key of REQUIRED_TEXT) {
    if (!isText(data[key])) {
      problems.push(`\`${key}\` is missing or blank`);
    }
  }
  if (!isHttpUrl(data.url)) {
    problems.push(`\`url\` is ${shown(data.url)}; expected an http(s) URL`);
  }
  if (
    data.doi !== undefined &&
    !(typeof data.doi === "string" && /^10\.\S+$/.test(data.doi))
  ) {
    problems.push(
      `\`doi\` is ${shown(data.doi)}; give the bare DOI starting 10., not a URL`
    );
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
  problems.push(...claimProblems(data.claims));
  return problems;
}

/** The label Cite would render, or null when the entry is too broken to say. */
function inTextLabel(data) {
  if (
    !(
      isMapping(data) &&
      Array.isArray(data.authors) &&
      data.authors.length > 0 &&
      data.authors.every(isText) &&
      Number.isInteger(data.year)
    )
  ) {
    return null;
  }
  return `${inTextAuthors(data.authors)} (${citedYear(data.year, data.suffix)})`;
}

const problems = [];

// The registry.
const registry = new Set();
const labels = new Map();
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
  const id = basename(name, ".yaml");
  registry.add(id);
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
  const label = inTextLabel(data);
  if (label !== null) {
    labels.set(label, [...(labels.get(label) ?? []), id]);
  }
}

for (const [label, ids] of labels) {
  if (ids.length > 1) {
    problems.push(
      `${ids.join(", ")}: all cite as "${label}"; give each a \`suffix\` (a, b, ...) so a reader can tell them apart`
    );
  }
}

// The pages.
const cited = new Set();
let citingPages = 0;
let citations = 0;
for (const page of collectMdx(DOCS_DIR)) {
  const prose = citableText(readFileSync(page, "utf8"));
  const ids = citeIds(prose);
  const hasReferences = /^<References\s*\/>\s*$/m.test(prose);
  if (citeTagCount(prose) > ids.length) {
    problems.push(
      `${page}: a <Cite> without an id="..." attribute; every Cite names a registry entry`
    );
  }
  if (ids.length === 0) {
    if (hasReferences) {
      problems.push(
        `${page}: has <References /> but cites nothing; remove the References section or cite a source`
      );
    }
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
  if (references === -1) {
    problems.push(
      `${page}: cites a source but has no \`## References\` heading followed by <References />`
    );
    continue;
  }
  const after = lines.slice(references + 1);
  const next = after.find((line) => line.trim() !== "");
  if (!/^<References\s*\/>\s*$/.test(next ?? "")) {
    problems.push(
      `${page}: \`## References\` must be followed directly by <References />`
    );
  }
  const nextHeading = after.find((line) => /^##\s/.test(line));
  if (!/^##\s+Additional Readings\s*$/.test(nextHeading ?? "")) {
    problems.push(
      `${page}: \`## References\` must sit directly above \`## Additional Readings\`; the next section is ${nextHeading ? `\`${nextHeading.trim()}\`` : "missing"}`
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
