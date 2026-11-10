/**
 * PreToolUse on Bash: the text a `gh` command would publish carries no
 * session link, old Claude Code footer, em dash or emoji, checked before it
 * reaches the remote.
 *
 * This is the one place the session-link rule can be enforced: a link in a
 * PR body or an issue comment lands on a public repo, and lefthook never sees
 * `gh` text. These checks look for text no published command may carry, so
 * they run on the whole command and on every body file it names, wherever in
 * the command each appears.
 *
 * The PR title and the `Assisted-by: Claude Code` trailer are not checked
 * here: telling a PR call's own title and body from text that only names a
 * PR call means reading the command as a shell would, which a pattern cannot
 * do (#666). `check-pr.mjs` reads them from the PR itself once it exists.
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
// Every body file a command names, quoted or not, in any call: reading one
// more file only adds checks, and issue text has no CI gate (#666).
const BODY_FILE_FLAG =
  /(?:^|\s)(?:-F|--body-file)(?:=|\s+)(?:"([^"]+)"|'([^']+)'|([^\s;&|)"'`<>]+))/gu;
const OLD_FOOTER = "Generated with [Claude Code]";
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
 * The text of each `--body-file` (or `-F`) a command names that can be read.
 * A throw here would exit 1, which lets the command through, so an unreadable
 * path is skipped: a file not written yet is pr-text's to check.
 */
function bodyFileTexts(text, dir) {
  const texts = new Set();
  for (const file of text.matchAll(BODY_FILE_FLAG)) {
    // Single quotes expand nothing; a bare path also expands a leading `~`.
    const given =
      file[2] ??
      (file[1] === undefined
        ? expandVars(file[3]).replace(LEADING_TILDE, homedir())
        : expandVars(file[1]));
    const path = isAbsolute(given) ? given : join(dir, given);
    try {
      texts.add(readFileSync(path, "utf8"));
    } catch {
      // Not readable yet.
    }
  }
  return texts;
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

const input = readInput();
const command = input.tool_input?.command ?? "";
const cwd = input.cwd ?? process.cwd();

if (!(PUBLISHES.test(command) || API_WITH_BODY.test(command))) {
  process.exit(0);
}

const { findProseViolations } = await loadRuleScripts(repoRoot(cwd));
const problems = textProblems(command, "");

// A body file is published text too, and `gh pr merge --body-file` is how the
// CLI merge passes the part above the template's `---` line.
if (PUBLISHES.test(command)) {
  for (const text of bodyFileTexts(command, cwd)) {
    problems.push(...textProblems(text, "the body file: "));
  }
}

if (problems.length > 0) {
  deny(
    `This gh command would publish text that breaks a rule (AGENTS.md):\n${problems.map((p) => `- ${p}`).join("\n")}`
  );
}
