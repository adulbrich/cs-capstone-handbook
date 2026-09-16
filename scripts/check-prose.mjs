/**
 * The prose rule from AGENTS.md (hard rule 3), as a check over named files:
 * no em dash, literal or as an HTML entity, and no emoji. Under the content
 * paths it also rejects the synonyms the glossary (`about/glossary.mdx`,
 * mirrored in `CONTEXT.md`) rules out.
 *
 * `validate-dashes.mjs` walks the content directories whole and runs in CI
 * and pre-commit. This script takes a file list instead, so lefthook can run
 * it on the staged files, CI over every tracked text file (`--all`), and the
 * Claude Code hooks on the one file just edited and on the text of a `gh`
 * command (`--text`, `--stdin`). Both scripts agree on what counts as text.
 *
 * Usage:
 *   node scripts/check-prose.mjs <file>...     check the named files
 *   node scripts/check-prose.mjs --all         check every tracked text file
 *   node scripts/check-prose.mjs --text <str>  check a string (exit 1 on a hit)
 *   node scripts/check-prose.mjs --stdin       check stdin as one string
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const EMDASH = String.fromCodePoint(8212); // U+2014, kept out of the source text
// The three entity spellings validate-dashes.mjs checks. Written as one
// alternation inside the entity so this file does not name the entity.
const EMDASH_ENTITY = /&(?:mdash|#8212|#x2014);/i;

/**
 * The blocks emoji are drawn from: the astral range from Mahjong tiles up
 * through the extended pictographs, Miscellaneous Symbols and Dingbats (the
 * check and cross marks, the warning sign, stars), the emoji subset of
 * Miscellaneous Technical (watch, hourglass, keyboard, eject, the media
 * buttons, alarm clock, stopwatch, timer), the information source, and the
 * few arrows, squares and circles from Miscellaneous Symbols and Arrows that
 * keyboards offer as emoji. Not in here on purpose: the arrows block (U+2190
 * to U+21FF), box drawing, and the command, option and return glyphs a
 * keyboard shortcut doc uses. The rule is about emoji, and a diagram or a
 * shortcut in a doc is not one.
 */
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{2600}-\u{27BF}\u{2139}\u{2B05}-\u{2B07}\u{2B1B}\u{2B1C}\u{2B50}\u{2B55}]/u;

/**
 * The text extensions validate-dashes.mjs reads, plus the code extensions
 * Biome covers. Anything else `git ls-files` reports (images, the PDF, the
 * R and VBA scripts, lockfiles without an extension) is skipped rather than
 * read as UTF-8 and misjudged.
 */
const TEXT_EXTENSIONS = new Set([
  "astro",
  "cjs",
  "css",
  "html",
  "js",
  "json",
  "jsonc",
  "md",
  "mdx",
  "mjs",
  "sh",
  "ts",
  "tsv",
  "tsx",
  "txt",
  "yaml",
  "yml",
]);

/**
 * Paths the rule does not reach: build output, and `validate-dashes.mjs`,
 * which names the em dash and its entities in its own pattern.
 */
const EXCLUDED_PREFIXES = ["node_modules/", "dist/", ".astro/"];
const EXCLUDED_FILES = new Set([
  "package-lock.json",
  "scripts/validate-dashes.mjs",
]);

/**
 * The one line the harness appends to every PR body and nothing here can
 * change. Stripped before checking so the footer is not what fails the PR.
 */
const HARNESS_FOOTER = /\u{1F916} Generated with \[Claude Code\]\([^)]*\)/gu;

/**
 * The glossary's avoid-list (`src/content/docs/about/glossary.mdx`, mirrored
 * in `CONTEXT.md`). Each entry is the synonym the handbook does not use and
 * the word it uses instead. Checked only under VOCABULARY_PATHS, outside
 * fenced code blocks and inline code, and never on the two pages that list
 * or quote the words themselves.
 */
const VOCABULARY = [
  {
    avoid: /\bcohorts?\b/i,
    use: "TA check-in, resume meeting, the class, or grading sheet",
  },
  { avoid: /\bsponsors?\b/i, use: "project partner" },
  {
    allow:
      /(?:api|http|oauth|mcp|thin|graphql|grpc|generated) clients?\b|clients?[- ](?:side|librar|sdk|code|credential|secret|id\b|app\b|application|generation)|the client is generated|on the client\b|client and (?:the )?server/gi,
    avoid: /\bclients?\b/i,
    use: "project partner",
  },
  { avoid: /\bstandups?\b/i, use: "stand-up" },
  { avoid: /\bsprint reports?\b|\bprogress reports?\b/i, use: "sprint note" },
  {
    avoid: /\bproject categor(?:y|ies)\b/i,
    use: "outcome type or project type",
  },
  { avoid: /\bV&V ladders?\b|\bcategory ladders?\b/i, use: "outcome ladder" },
  { avoid: /\blegacy projects?\b|\bbrownfield\b/i, use: "existing codebase" },
  { avoid: /\bTrack [AB]\b/, use: "NDA project, with a local note" },
];
const VOCABULARY_PATHS = [
  "src/content/docs/",
  "canvas/",
  "public/",
  "decks/",
  "STAFF-RUNBOOK.md",
];
const VOCABULARY_EXEMPT = new Set([
  "src/content/docs/about/glossary.mdx",
  "src/content/docs/about/acknowledgments.mdx",
]);

function vocabularyApplies(path) {
  if (!path || VOCABULARY_EXEMPT.has(path)) {
    return false;
  }
  return VOCABULARY_PATHS.some((prefix) => path.startsWith(prefix));
}

/** The line with inline code removed, so `client.post` is not prose. */
function stripInlineCode(line) {
  return line.replace(/`[^`]*`/g, " ");
}

/** The vocabulary hits on one prose line (inline code already stripped). */
function vocabularyViolations(line, lineNumber) {
  const prose = stripInlineCode(line);
  const hits = [];
  for (const rule of VOCABULARY) {
    const cleaned = rule.allow ? prose.replace(rule.allow, " ") : prose;
    const hit = cleaned.match(rule.avoid);
    if (hit) {
      hits.push({
        kind: `vocabulary: "${hit[0]}" is not a handbook word; use ${rule.use}`,
        line: lineNumber,
        snippet: line.trim(),
      });
    }
  }
  return hits;
}

/**
 * Every hit in `text`, as `{ line, kind, snippet }`. `kind` is `em dash` or
 * `emoji`. Exported for the commit-message check, which adds its own rules on
 * top; the CLI below is the same function with a report.
 */
export function findProseViolations(text, path) {
  const violations = [];
  const lines = text.replaceAll(HARNESS_FOOTER, "").split("\n");
  const checkVocabulary = vocabularyApplies(path);
  let inFence = false;
  for (const [index, line] of lines.entries()) {
    if (checkVocabulary) {
      if (/^\s*(?:```|~~~)/.test(line)) {
        inFence = !inFence;
      } else if (!inFence) {
        violations.push(...vocabularyViolations(line, index + 1));
      }
    }
    if (line.includes(EMDASH) || EMDASH_ENTITY.test(line)) {
      violations.push({
        kind: "em dash",
        line: index + 1,
        snippet: line.trim(),
      });
    }
    if (EMOJI.test(line)) {
      violations.push({
        kind: "emoji",
        line: index + 1,
        snippet: line.trim(),
      });
    }
  }
  return violations;
}

export function isCheckedPath(path) {
  if (EXCLUDED_FILES.has(path)) {
    return false;
  }
  if (EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return false;
  }
  const dot = path.lastIndexOf(".");
  if (dot === -1) {
    return false;
  }
  return TEXT_EXTENSIONS.has(path.slice(dot + 1));
}

export function gitLines(args) {
  return execFileSync("git", args, { encoding: "utf8" })
    .split("\n")
    .filter((line) => line.length > 0);
}

function report(label, violations) {
  for (const { line, kind, snippet } of violations) {
    const excerpt =
      snippet.length > 100 ? `${snippet.slice(0, 100)}...` : snippet;
    process.stderr.write(`${label}:${line}: ${kind}: ${excerpt}\n`);
  }
}

function checkFiles(paths) {
  let failed = false;
  for (const path of paths) {
    let text;
    try {
      text = readFileSync(path, "utf8");
    } catch {
      // Deleted in the index but still listed, or unreadable. Not a violation.
      continue;
    }
    const violations = findProseViolations(text, path);
    if (violations.length > 0) {
      failed = true;
      report(path, violations);
    }
  }
  return failed;
}

function main(argv) {
  const [mode, ...rest] = argv;
  let failed = false;

  if (mode === "--text" || mode === "--stdin") {
    const text = mode === "--text" ? rest.join(" ") : readFileSync(0, "utf8");
    const violations = findProseViolations(text);
    failed = violations.length > 0;
    report("text", violations);
  } else if (mode === "--all") {
    failed = checkFiles(gitLines(["ls-files"]).filter(isCheckedPath));
  } else {
    failed = checkFiles(argv.filter(isCheckedPath));
  }

  if (failed) {
    process.stderr.write(
      "Prose rule: no em dash (literal or entity), no emoji, and under the content paths only the glossary's words (about/glossary.mdx, CONTEXT.md). Use a colon, semicolon, comma, or period; use words for a status mark (AGENTS.md, hard rule 3).\n"
    );
    process.exit(1);
  }
}

if (
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].split("/").pop())
) {
  main(process.argv.slice(2));
}
