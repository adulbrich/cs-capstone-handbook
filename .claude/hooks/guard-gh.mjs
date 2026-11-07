/**
 * PreToolUse on Bash: the text a `gh` command would publish gets the checks a
 * commit message gets, before it reaches the remote.
 *
 * This is the one place the session-link rule can be enforced: a link in a
 * PR body or an issue comment lands on a public repo, and lefthook never sees
 * `gh` text. A PR title is also the squash-merge subject, so `pr create`,
 * `pr edit` and `pr merge --subject` get the Conventional Commits check.
 *
 * A PR body an agent sets with `pr create` or `pr edit`, when the hook can read
 * it, carries the `Assisted-by: Claude Code` trailer above its `---` line, the
 * part a squash merge keeps (#665). Only agents run this hook, so a PR a person
 * opens alone is never asked for it.
 *
 * Exit 2 blocks; stderr is the reason the model reads.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { deny, loadRuleScripts, readInput, repoRoot } from "./lib.mjs";

const PUBLISHES =
  /\bgh\s+(?:(?:pr|issue)\s+(?:create|edit|comment|review|close|merge)|release\s+(?:create|edit))\b/;
const API_WITH_BODY = /\bgh\s+api\b[\s\S]*\bbody\b/;
const TITLED = /\bgh\s+pr\s+(?:create|edit|merge)\b/;
const TITLE_FLAG =
  /(?:^|\s)(?:-t|--title|--subject)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|'([^']*)')/;
const BODY_FILE_FLAG =
  /(?:^|\s)(?:-F|--body-file)(?:=|\s+)(?:"([^"]+)"|'([^']+)'|(\S+))/u;
const BODY_FLAG =
  /(?:^|\s)(?:-b|--body)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|'([^']*)')/;
const OLD_FOOTER = "Generated with [Claude Code]";
const PR_CALL = /^\s*\(?\s*gh\s+pr\s+(?:create|edit)\b/;
const CALL_BREAK = new Set([";", "\n", "&", "|"]);
const SHELL_EXPANDS = /[$`]/;
const QUOTE_SPLICE = "'\\''";
const TRAILER = "Assisted-by: Claude Code";
const TRAILER_LINE = /^Assisted-by: Claude Code[ \t]*$/m;
const CUT_LINE = /^---[ \t]*$/m;
const SHELL_VAR = /\$(?:\{(\w+)\}|(\w+))/g;
const LEADING_TILDE = /^~(?=\/|$)/;

/**
 * `$VAR` and `${VAR}` from this process's environment, as the shell expands
 * them inside double quotes or bare. A variable this process lacks stays as
 * written, so the read fails and pr-text is the check that sees the file.
 */
function expandVars(path) {
  return path.replace(
    SHELL_VAR,
    (match, braced, bare) => process.env[braced ?? bare] ?? match
  );
}

/**
 * The text of the `--body-file` (or `-F`) a command names, or null when it
 * names none or the file cannot be read yet. A throw here would exit 1, which
 * lets the command through, so an unreadable path is null instead.
 */
function bodyFileText(text, dir) {
  const file = BODY_FILE_FLAG.exec(text);
  if (!file) {
    return null;
  }
  // Single quotes expand nothing; a bare path also expands a leading `~`.
  const given =
    file[2] ??
    (file[1] === undefined
      ? expandVars(file[3]).replace(LEADING_TILDE, homedir())
      : expandVars(file[1]));
  const path = isAbsolute(given) ? given : join(dir, given);
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

/**
 * What `text` breaks of the rules all published text shares: the session
 * link, the old Claude Code footer, an em dash or an emoji.
 */
function textProblems(text, where) {
  const found = [];
  if (text.includes("claude.ai/code/session")) {
    found.push(
      `${where}contains a claude.ai/code/session link; never publish one`
    );
  }
  if (text.includes(OLD_FOOTER)) {
    found.push(
      `${where}contains the "${OLD_FOOTER}" footer; replace it with an "Assisted-by: Claude Code" trailer`
    );
  }
  for (const { line, kind, snippet } of findProseViolations(text)) {
    found.push(`${where}line ${line} has an ${kind}: ${snippet}`);
  }
  return found;
}

/**
 * Whether a PR body has the trailer on a line of its own above the first
 * `---` line. A body with no `---` is all commit body.
 */
function hasTrailer(body) {
  const cut = CUT_LINE.exec(body);
  return TRAILER_LINE.test(cut ? body.slice(0, cut.index) : body);
}

/**
 * `text` split into the commands it chains, at `;`, `&`, `|` and newlines
 * outside quotes, so a `gh pr create` quoted in an issue body or a title that
 * says "gh" never starts or ends a call.
 */
function shellCalls(text) {
  const calls = [];
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\" && quote === '"') {
        i += 1;
      } else if (ch === quote) {
        quote = null;
      }
    } else if (ch === "\\") {
      i += 1;
    } else if (ch === "'" || ch === '"') {
      quote = ch;
    } else if (CALL_BREAK.has(ch)) {
      calls.push(text.slice(start, i));
      start = i + 1;
    }
  }
  calls.push(text.slice(start));
  return calls;
}

/**
 * The body the `gh pr create` or `gh pr edit` in `text` sets, read from
 * that call's own flags, not a `gh` call chained before or after it. Null when
 * the hook cannot read it: no body given, a file not written yet, or inline
 * text the shell expands or splices before `gh` sees it.
 */
function prBody(text, dir) {
  const call = shellCalls(text).find((c) => PR_CALL.test(c));
  if (!call) {
    return null;
  }
  if (BODY_FILE_FLAG.test(call)) {
    return bodyFileText(call, dir);
  }
  const inline = BODY_FLAG.exec(call);
  if (!inline) {
    return null;
  }
  if (inline[1] !== undefined) {
    return SHELL_EXPANDS.test(inline[1]) ? null : inline[1];
  }
  return call.includes(QUOTE_SPLICE) ? null : inline[2];
}

const input = readInput();
const command = input.tool_input?.command ?? "";
const cwd = input.cwd ?? process.cwd();

if (!(PUBLISHES.test(command) || API_WITH_BODY.test(command))) {
  process.exit(0);
}

const { checkCommitMessage, findProseViolations } = await loadRuleScripts(
  repoRoot(cwd)
);
const problems = textProblems(command, "");

// A body file is published text too, and `gh pr merge --body-file` is how the
// CLI merge passes the part above the template's `---` line. A file not
// written yet is pr-text's to refuse.
const bodyFile = PUBLISHES.test(command) ? bodyFileText(command, cwd) : null;
if (bodyFile) {
  problems.push(...textProblems(bodyFile, "the body file: "));
}

// A merge is left out: its body is the PR body create or edit already set, or
// a Dependabot body cut to its first line, which carries no trailer.
const prText = prBody(command, cwd);
if (prText !== null && !hasTrailer(prText)) {
  problems.push(
    `the PR body has no "${TRAILER}" line above its --- line; end the commit-body part with it`
  );
}

const title = TITLED.test(command) ? TITLE_FLAG.exec(command) : null;
if (title) {
  for (const problem of checkCommitMessage(title[1] ?? title[2])) {
    if (problem.startsWith("subject")) {
      problems.push(`PR title is the squash-merge subject: ${problem}`);
    }
  }
}

if (problems.length > 0) {
  deny(
    `This gh command would publish text that breaks a rule (AGENTS.md):\n${problems.map((p) => `- ${p}`).join("\n")}`
  );
}
