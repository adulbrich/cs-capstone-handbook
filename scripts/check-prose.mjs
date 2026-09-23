/**
 * The prose rule from AGENTS.md (hard rule 3), as a check over named files:
 * no em dash, literal or as an HTML entity, and no emoji. Under the content
 * paths it also rejects the synonyms the glossary (`about/glossary.mdx`,
 * mirrored in `CONTEXT.md`) rules out.
 *
 * Under `src/content/docs/` it also rejects the voice tells a pattern can see
 * (`docs/agents/voice.md`): the banned words and a bolded whole sentence on
 * every page, and the two banned openers ("Without it:" and "X is the
 * backbone of") in a guide's opening, the text before its first `## `
 * heading. The banned words alone also reach the Canvas rubric CSVs, the
 * syllabi, and the Markdown downloads in `public/` (BANNED_WORD_PATHS),
 * because students read those words in Canvas, in the templates and
 * scoresheet that quote the criteria, and, through `<RubricTable>`, on the
 * pages. None of these run on `--text`
 * or `--stdin` (a PR body may discuss a banned word), and none run on
 * `docs/`, `AGENTS.md`, `.claude/skills/`, or
 * `canvas/assignments/assignment-readme.md`, which quote the patterns to
 * teach them or name the criteria a change renamed.
 *
 * The opener check is waived on a page containing the MDX comment in
 * `LEGACY_OPENER_MARKER` (below). The marker may sit anywhere in the file;
 * by convention it is the first line after the frontmatter. Fourteen guides
 * opened that way when the check landed (#207), and each is rewritten by its
 * own sweep PR. A marker in the page, rather than an allowlist here, lets
 * those PRs land in any order without all editing one array. A marker with
 * nothing to waive fails, so a sweep PR that fixes the opener must delete
 * its marker too, and a marker outside `guides/` always fails.
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
import nodePath from "node:path";
import { readCsvRecords } from "../src/lib/rubric-csv.mjs";

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
  "csv",
  "html",
  "js",
  "json",
  "jsonc",
  "md",
  "mdx",
  "mjs",
  "sh",
  "ts",
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
 * The glossary's avoid-list (`src/content/docs/about/glossary.mdx`): each
 * entry is a synonym the handbook does not use and the word it uses instead.
 * Checked only under VOCABULARY_PATHS, outside fenced code, inline code, and
 * double-quoted phrases (someone else's word, cited), and never on the
 * glossary page itself, which lists the words. `glossaryDrift()` keeps this
 * list and the page's "Not:" items equal in both directions.
 */
const VOCABULARY = [
  {
    avoid: /\bcohorts?\b/i,
    use: "TA check-in, resume meeting, the class, or check-in sheet",
  },
  { avoid: /\bsponsors?\b/i, use: "project partner" },
  {
    allow:
      /\b(?:api|http|oauth|mcp|thin|graphql|grpc|generated|email|desktop|mobile|web|native|git|ssh|database|db) clients?\b|\bclients?[- ](?:side|server|component|librar|sdk|code|credential|secret|id\b|app\b|application|generation)|\bthe client is generated\b|\bon the client\b(?!'s)/gi,
    avoid: /\bclients?\b/i,
    use: "project partner",
  },
  { avoid: /\bstandups?\b/i, use: "stand-up" },
  { avoid: /\bsprint reports?\b|\bprogress reports?\b/i, use: "sprint note" },
  {
    // The handbook named a four-way taxonomy for a year and students kept
    // asking which one they were. It shows examples now and names no category,
    // so all three words for the category are retired together.
    avoid:
      /\boutcome types?\b|\bproject types?\b|\bproject categor(?:y|ies)\b/i,
    use: "what shipped means for the project, or the closest path in the Shipping guide",
  },
  { avoid: /\bV&V ladders?\b|\bcategory ladders?\b/i, use: "outcome ladder" },
  { avoid: /\blegacy projects?\b/i, use: "existing codebase" },
  { avoid: /\bstudent-driven\b/i, use: "student-proposed" },
  { avoid: /\bTrack [AB]\b/, use: "NDA project, with a local note" },
  {
    // Literal multiword phrases for instructors and TAs together. "The
    // instructors" stays legal, because a sentence about the faculty alone
    // (grade questions, late-work exceptions) must not widen to the TAs, and
    // so do the singletons: the glossary's own Instructor entry, "staff
    // mentor", and the co-instructor on the two Canvas-owned stubs.
    avoid:
      /\bteaching staff\b|\bcourse staff\b|\bteaching team\b|\binstruction staff\b/i,
    use: "the instruction team, or the instructors or a TA when only they are meant",
  },
];
const VOCABULARY_PATHS = [
  "src/content/docs/",
  "canvas/",
  "public/",
  "decks/",
  "STAFF-RUNBOOK.md",
];
const GLOSSARY_PATH = "src/content/docs/about/glossary.mdx";

/**
 * BOLD_AND_OPENER_PATH gates only the bolded-sentence and opener rules, which
 * are about how a handbook page is written. The banned words reach further:
 * the rubric CSVs and the syllabus bodies under `canvas/`, and the Markdown
 * downloads in `public/`. A CSV renders on its assignment page and imports
 * into Canvas, a syllabus is pasted into Canvas, and the scoresheet and
 * templates quote the criteria, so a banned word in any of them reaches
 * students as surely as one on a page. The rest of `canvas/` and the runbook
 * keep the vocabulary check alone.
 */
const RUBRIC_CSV_SUFFIX = "-rubric.csv";
const BOLD_AND_OPENER_PATH = "src/content/docs/";
const BANNED_WORD_PATHS = [
  { prefix: "src/content/docs/" },
  { prefix: "canvas/assignments/", suffix: RUBRIC_CSV_SUFFIX },
  { prefix: "canvas/syllabus/", suffix: ".html" },
  { prefix: "public/", suffix: ".md" },
];

/** The senses of "net" that are arithmetic, not the AI policy (BANNED_WORDS). */
const NET_SENSES =
  "worth|present|positive|negative|zero|profit|margin|income|gain|loss|effect|result|promoter|cost|benefit|change";

/**
 * The banned words from `docs/agents/voice.md`, matched on the prose line
 * (inline code and double-quoted phrases removed, so a page can still quote
 * someone else's wording). Each is a tell of the generated voice the handbook
 * drifted into, and each has a plain word that says what it means. The door
 * metaphor and "the net" were the AI policy's own terms until #207 replaced
 * them with "hard-to-reverse decision" and "checks". "The net", "your net",
 * and "that net" skip their money and arithmetic senses (NET_SENSES: "the net
 * effect", "your net worth", "the net present value", "the Net Promoter
 * Score"); "the network" and "the .NET" never match, and "safety net" stays
 * legal as an ordinary phrase.
 */
const BANNED_WORDS = [
  {
    avoid: /\b(?<!\bacademic\s)honest(?:y|ly)?\b/i,
    use: 'the word the sentence means (accurate, candid, complete), or nothing; "academic honesty" stays',
  },
  { avoid: /\bgenuinely\b/i, use: "nothing; delete it" },
  { avoid: /\bworth stealing\b/i, use: '"worth adopting", or say why' },
  {
    avoid: /\bone[- ]way doors?\b/i,
    use: '"hard-to-reverse decision"',
  },
  {
    avoid: /\btwo[- ]way doors?\b/i,
    use: '"easy-to-reverse decision"',
  },
  {
    avoid: new RegExp(
      `\\b(?:the|your|that) net\\b(?!\\s+(?:${NET_SENSES})s?\\b)`,
      "i"
    ),
    use: '"the checks" or "your checks" (tests, CI, review gates, staging, a rollback path)',
  },
];

/**
 * A bolded whole sentence: a `**...**` span that starts the line (after any
 * indentation or blockquote marker) or follows sentence-ending punctuation,
 * and ends in `.`, `!`, or `?` inside the bold or right after it. The
 * lookbehind keeps a numbered-list marker (`1. **Step.**`) from counting as
 * sentence-ending punctuation, and a bullet (`- **Step.**`) never matches, so
 * a list item's bold lead-in stays legal; so does a bold term or phrase
 * inside a sentence, and a colon label (`**AI use:**`). The lookahead
 * requires a space inside the span, so a one-word bold (`**e.g.**`,
 * `**Why?**`, `**Examples.**`) is a label, not a sentence. Table cells start
 * with `|` and are not checked.
 */
const BOLD_SENTENCE =
  /(?:^\s*(?:>\s*)?|(?<!^\s*\d+)[.!?]["')]?\s+)\*\*(?=[^*\n]*?\s[^*\n]*?\*\*)[^*\n]+?(?:[.!?]\*\*|\*\*[.!?])/;

/**
 * The two openers `docs/agents/voice.md` bans: a "Without it:" lead-in to a
 * list of failure modes, and a claim that the topic is the backbone of
 * something. The second also catches "are the backbone of" and "form the
 * backbone of", which is how two of the guides phrased it. Checked only in a
 * guide's opening (GUIDES_PATH, before the first `## ` heading): both are
 * rules about how a guide opens, and "Without X:" is ordinary English in the
 * body of a page.
 */
const GUIDES_PATH = "src/content/docs/guides/";
const BANNED_OPENERS = [
  {
    avoid: /Without [^.:]{0,60}:\s*$/,
    use: "open on the reader's situation and what the page covers",
  },
  {
    avoid:
      /\b(?:is|are|forms?) the (?:backbone|foundation|fundamental unit) of\b/i,
    use: "say what the thing does for the reader, not how important it is",
  },
];
const LEGACY_OPENER_MARKER = "{/* check-prose: legacy-opener */}";

/** A path as `git ls-files` prints it, whatever form the caller passed. */
function repoRelative(filePath) {
  const rel = nodePath.isAbsolute(filePath)
    ? nodePath.relative(process.cwd(), filePath)
    : filePath.replace(/^\.\//, "");
  return rel.split(nodePath.sep).join("/");
}

function vocabularyApplies(filePath) {
  if (!filePath) {
    return false;
  }
  const rel = repoRelative(filePath);
  if (rel === GLOSSARY_PATH) {
    return false;
  }
  return VOCABULARY_PATHS.some((prefix) => rel.startsWith(prefix));
}

function boldAndOpenerRulesApply(filePath) {
  if (!filePath) {
    return false;
  }
  return repoRelative(filePath).startsWith(BOLD_AND_OPENER_PATH);
}

function bannedWordsApply(filePath) {
  if (!filePath) {
    return false;
  }
  const rel = repoRelative(filePath);
  return BANNED_WORD_PATHS.some(
    ({ prefix, suffix = "" }) => rel.startsWith(prefix) && rel.endsWith(suffix)
  );
}

/**
 * The line with inline code and double-quoted phrases removed: `client.post`
 * is not prose, and a quoted "client fee" is someone else's word, cited.
 */
function stripInlineCode(line) {
  return line.replace(/`[^`]*`/g, " ").replace(/"[^"]*"/g, " ");
}

/**
 * The glossary's "Not:" items and VOCABULARY must agree in both directions,
 * or the page promises a check that does not run (or the check rejects a
 * word the page never explains). Returns the mismatches.
 */
export function glossaryDrift() {
  const text = readFileSync(GLOSSARY_PATH, "utf8");
  const items = [...text.matchAll(/Not: ([^.\n]+)\./g)].flatMap((m) =>
    m[1].split(",").map((item) => item.trim())
  );
  const problems = [];
  for (const item of items) {
    if (!VOCABULARY.some((rule) => rule.avoid.test(item))) {
      problems.push(
        `glossary lists "${item}" but check-prose does not reject it`
      );
    }
  }
  for (const rule of VOCABULARY) {
    if (!items.some((item) => rule.avoid.test(item))) {
      problems.push(
        `check-prose rejects ${rule.avoid} but the glossary has no such "Not:" item`
      );
    }
  }
  return problems;
}

/** One hit, in the shape `report()` prints. */
function hit(kind, lineNumber, line) {
  return { kind, line: lineNumber, snippet: line.trim() };
}

/** The vocabulary hits on one prose line (inline code already stripped). */
function vocabularyViolations(line, lineNumber) {
  const prose = stripInlineCode(line);
  const hits = [];
  for (const rule of VOCABULARY) {
    const cleaned = rule.allow ? prose.replace(rule.allow, " ") : prose;
    const match = cleaned.match(rule.avoid);
    if (match) {
      hits.push(
        hit(
          `vocabulary: "${match[0]}" is not a handbook word; use ${rule.use}`,
          lineNumber,
          line
        )
      );
    }
  }
  return hits;
}

/** A line that opens or closes a fenced code block. */
const FENCE = /^\s*(?:```|~~~)/;

/**
 * The banned-opener hits in a guide's opening: every prose line before the
 * first `## ` heading. Empty for any page outside GUIDES_PATH.
 */
function openingHits(lines, path) {
  const hits = [];
  if (!repoRelative(path).startsWith(GUIDES_PATH)) {
    return hits;
  }
  let inFence = false;
  for (const [index, line] of lines.entries()) {
    // Fence state first: a "## " line inside a code block is not the
    // page's first section heading.
    if (FENCE.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) {
      continue;
    }
    if (line.startsWith("## ")) {
      break;
    }
    const prose = stripInlineCode(line);
    for (const rule of BANNED_OPENERS.filter((r) => r.avoid.test(prose))) {
      hits.push({
        kind: `voice: a banned opener; ${rule.use}`,
        line: index + 1,
        snippet: line.trim(),
      });
    }
  }
  return hits;
}

/**
 * The opener hits, waived by LEGACY_OPENER_MARKER. A marker with nothing to
 * waive is itself the hit: the opener was fixed and the marker left behind,
 * or the marker sits on a page the opener check never reads.
 */
function openerViolations(lines, path) {
  const hits = openingHits(lines, path);
  const markerIndex = lines.findIndex((line) =>
    line.includes(LEGACY_OPENER_MARKER)
  );
  if (markerIndex === -1) {
    return hits;
  }
  if (hits.length > 0) {
    return [];
  }
  return [
    {
      kind: "voice: a stale legacy-opener marker; nothing on this page needs it, so delete it",
      line: markerIndex + 1,
      snippet: lines[markerIndex].trim(),
    },
  ];
}

/** The banned-word hits on one prose line (BANNED_WORD_PATHS). */
function bannedWordViolations(line, lineNumber) {
  const prose = stripInlineCode(line);
  const hits = [];
  for (const rule of BANNED_WORDS) {
    const match = prose.match(rule.avoid);
    if (match) {
      hits.push(
        hit(
          `voice: "${match[0]}" is a banned word; use ${rule.use}`,
          lineNumber,
          line
        )
      );
    }
  }
  return hits;
}

/** A bolded whole sentence on one line of a handbook page. */
function boldSentenceViolations(line, lineNumber) {
  // Inline code only: stripping quoted phrases would cut a bold span in two.
  if (!BOLD_SENTENCE.test(line.replace(/`[^`]*`/g, " "))) {
    return [];
  }
  return [
    hit(
      "voice: a bolded whole sentence; unbold it, or bold only the defined term",
      lineNumber,
      line
    ),
  ];
}

/** The line checks that read prose at `path`, and so skip fenced code. */
function proseChecksFor(path) {
  const checks = [];
  if (vocabularyApplies(path)) {
    checks.push(vocabularyViolations);
  }
  if (bannedWordsApply(path)) {
    checks.push(bannedWordViolations);
  }
  if (boldAndOpenerRulesApply(path)) {
    checks.push(boldSentenceViolations);
  }
  return checks;
}

/**
 * A rubric CSV's criteria as prose lines, one per record, fields joined. The
 * CSV quotes every field that holds a comma, and `stripInlineCode` drops a
 * quoted span as someone else's words, so reading raw lines hid most band
 * descriptions from the banned-word check. A phrase quoted inside a field is
 * still a citation and is still skipped. A file that does not parse falls
 * back to raw lines; `validate-outcomes` reports the parse error.
 */
function csvProseLines(text, path) {
  try {
    return readCsvRecords(text, path).map(({ cells, line }) => ({
      line,
      prose: cells.join(" | "),
    }));
  } catch {
    return null;
  }
}

/**
 * The lines the prose checks read, as `{ line, prose }`: a rubric CSV's
 * records, or every line outside a fenced code block.
 */
function proseLines(text, lines, path, proseChecks) {
  if (proseChecks.length === 0) {
    return [];
  }
  const records = path.endsWith(RUBRIC_CSV_SUFFIX)
    ? csvProseLines(text, path)
    : null;
  if (records) {
    return records;
  }
  const out = [];
  let inFence = false;
  for (const [index, line] of lines.entries()) {
    if (FENCE.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      out.push({ line: index + 1, prose: line });
    }
  }
  return out;
}

/**
 * Every hit in `text`, as `{ line, kind, snippet }`. `kind` is `em dash`,
 * `emoji`, or a vocabulary or voice message. Exported for the commit-message
 * check, which adds its own rules on top; the CLI below is the same function
 * with a report. Without a `path`, only the em dash and emoji rules run.
 */
export function findProseViolations(text, path) {
  const violations = [];
  const lines = text.split("\n");
  const proseChecks = proseChecksFor(path);
  if (boldAndOpenerRulesApply(path)) {
    violations.push(...openerViolations(lines, path));
  }
  for (const { line, prose } of proseLines(text, lines, path, proseChecks)) {
    for (const check of proseChecks) {
      violations.push(...check(prose, line));
    }
  }
  for (const [index, line] of lines.entries()) {
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
    const drift = glossaryDrift();
    for (const problem of drift) {
      process.stderr.write(`${GLOSSARY_PATH}: ${problem}\n`);
    }
    failed = failed || drift.length > 0;
  } else {
    failed = checkFiles(argv.filter(isCheckedPath));
  }

  if (failed) {
    process.stderr.write(
      "Prose rule: no em dash (literal or entity), no emoji, and under the content paths only the glossary's words (about/glossary.mdx, CONTEXT.md). Use a colon, semicolon, comma, or period; use words for a status mark (AGENTS.md, hard rule 3). On handbook pages, also no banned word, bolded sentence, or banned opener, and in the rubric CSVs, syllabi, and public/ Markdown no banned word (docs/agents/voice.md).\n"
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
