/**
 * PreToolUse on Bash: the text a `gh` command would publish gets the checks a
 * commit message gets, before it reaches the remote.
 *
 * This is the one place the session-link rule can be enforced: a link in a
 * PR body or an issue comment lands on a public repo, and lefthook never sees
 * `gh` text. A PR title is also the squash-merge subject, so `pr create`,
 * `pr edit` and `pr merge --subject` get the Conventional Commits check.
 *
 * A PR an agent opens or edits carries the `Assisted-by: Claude Code` trailer
 * above its `---` line, the part a squash merge keeps (#665). Only agents run
 * this hook, so a PR a person opens alone is never asked for it.
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
 * `---` line. A body with no `---` is all commit body, as on a CLI merge.
 */
function hasTrailer(body) {
  const cut = CUT_LINE.exec(body);
  return TRAILER_LINE.test(cut ? body.slice(0, cut.index) : body);
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

// The body this PR command sets, when the hook can read it. A command that
// sets none, or names a file not written yet, keeps the body it has.
if (TITLED.test(command)) {
  const inline = BODY_FLAG.exec(command);
  const body = bodyFile ?? (inline ? (inline[1] ?? inline[2]) : null);
  if (body !== null && !hasTrailer(body)) {
    problems.push(
      `the PR body has no "${TRAILER}" line above its --- line; end the commit-body part with it`
    );
  }
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
