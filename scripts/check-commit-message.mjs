/**
 * The commit-message rule, as a check: a Conventional Commits subject with a
 * lowercase imperative, no em dash or emoji anywhere, and never a
 * `claude.ai/code/session` link.
 *
 * One implementation, three callers. lefthook runs it at `commit-msg`, CI
 * runs it over every commit a pull request adds (`--range`), and the Claude
 * Code `git` hook runs it on the text of a `git commit` before the commit
 * exists.
 *
 * A PR's title and body, which a squash merge turns into the `main` subject
 * and body, get `checkPrText`: the same rule, plus the trailer. The part above
 * the body's `---` line carries `Assisted-by: Claude Code`, or
 * `Assisted-by: none` when no agent helped (#666). Two callers: `pr-text` in
 * CI (`--pr`), the merge gate, and the `check-pr` hook, on a PR an agent
 * creates or edits, read back from GitHub when the command prints its URL.
 *
 * The session-link rule is the hard one: the repo is public, so a link that
 * lands on a remote costs a history rewrite. It is checked first.
 *
 * Usage:
 *   node scripts/check-commit-message.mjs <file>          the COMMIT_EDITMSG path
 *   node scripts/check-commit-message.mjs --text <str>    a message as a string
 *   node scripts/check-commit-message.mjs --stdin         a message on stdin
 *   node scripts/check-commit-message.mjs --pr            the PR in PR_TITLE, PR_BODY
 *   node scripts/check-commit-message.mjs --range <a..b>  every commit in a range
 *
 * Only the file form strips git's `#` comment lines and the scissors block,
 * because only COMMIT_EDITMSG carries them. A message on stdin is checked as
 * written; a `## Heading` line there is prose, not a comment to drop.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { findProseViolations, gitLines } from "./check-prose.mjs";

export const TYPES = [
  "feat",
  "fix",
  "docs",
  "test",
  "refactor",
  "style",
  "perf",
  "build",
  "ci",
  "chore",
];

/**
 * `type(scope)!: subject`, scope optional. "Lowercase imperative" is checked
 * as "does not start with a capital letter", in any script, so a subject may
 * lead with a digit, a quote or an identifier in backticks.
 */
const SUBJECT = new RegExp(
  `^(?:${TYPES.join("|")})(?:\\([a-z0-9-]+\\))?!?: (?!\\p{Lu})\\S`,
  "u"
);

/**
 * Subjects written by git, GitHub and Dependabot, which the rule does not
 * reach. Dependabot capitalizes "Bump" and offers no setting to change it.
 */
const EXEMPT_SUBJECT =
  /^(?:Merge |Revert |fixup! |squash! |(?:chore|build)\(deps(?:-dev)?\): Bump )/;

const SESSION_LINK = "claude.ai/code/session";
/** The PR footer the harness appends by default; Assisted-by replaced it. */
const OLD_FOOTER = "Generated with [Claude Code]";
const SCISSORS = /^# -{8,} >8 -{8,}$/m;
/** The trailer a PR body carries above its `---` line, written exactly. */
const TRAILER_LINE = /^Assisted-by: (?:Claude Code|none)[ \t]*$/m;
const CUT_LINE = /^---[ \t]*$/m;

/**
 * A COMMIT_EDITMSG without git's comment lines and without anything after the
 * scissors line `git commit --verbose` adds.
 */
function stripCommentary(message) {
  const scissors = SCISSORS.exec(message);
  const body = scissors ? message.slice(0, scissors.index) : message;
  return body
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n");
}

/**
 * Every problem with `message`, as strings a committer can act on. Empty
 * means the message passes.
 */
export function checkCommitMessage(message) {
  const problems = [];

  if (message.includes(SESSION_LINK)) {
    problems.push(`contains a ${SESSION_LINK} link; drop it`);
  }
  if (message.includes(OLD_FOOTER)) {
    problems.push(
      `contains the "${OLD_FOOTER}" footer; replace it with an "Assisted-by: Claude Code" trailer`
    );
  }

  const subject =
    message.split("\n").find((line) => line.trim().length > 0) ?? "";
  if (subject.length === 0) {
    problems.push("the message is empty");
  } else if (!(EXEMPT_SUBJECT.test(subject) || SUBJECT.test(subject))) {
    problems.push(
      `subject "${subject}" is not "type(scope): lowercase imperative" with type one of ${TYPES.join(", ")}`
    );
  }

  for (const { line, kind, snippet } of findProseViolations(message)) {
    problems.push(`line ${line} has an ${kind}: ${snippet}`);
  }

  return problems;
}

/**
 * Every problem with a PR's title and body: the commit-message rule on the
 * squash message they make, with the subject called the title, and the
 * trailer above the body's first `---` line. A body with no `---` is all
 * commit body.
 */
export function checkPrText({ title, body }) {
  const problems = checkCommitMessage(`${title}\n\n${body}`).map((problem) =>
    problem.startsWith("subject")
      ? `the title is the squash-merge subject: ${problem}`
      : problem
  );
  const cut = CUT_LINE.exec(body);
  if (!TRAILER_LINE.test(cut ? body.slice(0, cut.index) : body)) {
    problems.push(
      'the body has no "Assisted-by: Claude Code" line above its --- line ("Assisted-by: none" when no agent helped)'
    );
  }
  return problems;
}

const RULE =
  "Commit rule: type(scope): lowercase imperative subject, no em dash, no emoji, no session link.\n";

function report(label, problems) {
  for (const problem of problems) {
    process.stderr.write(`${label}: ${problem}\n`);
  }
}

function fail() {
  process.stderr.write(RULE);
  process.exit(1);
}

function main(argv) {
  const [mode, ...rest] = argv;

  if (mode === "--range") {
    // Merge commits are walked too: their subject is exempt, their body is
    // where a stray session trailer would sit.
    let failed = false;
    for (const sha of gitLines(["log", "--format=%H", rest[0]])) {
      const message = execFileSync("git", ["log", "-1", "--format=%B", sha], {
        encoding: "utf8",
      });
      const problems = checkCommitMessage(message);
      if (problems.length > 0) {
        failed = true;
        report(sha.slice(0, 7), problems);
      }
    }
    if (failed) {
      fail();
    }
    return;
  }

  if (mode === "--pr") {
    const problems = checkPrText({
      body: process.env.PR_BODY ?? "",
      title: process.env.PR_TITLE ?? "",
    });
    if (problems.length > 0) {
      report("pull request", problems);
      fail();
    }
    return;
  }

  let message;
  if (mode === "--text") {
    message = rest.join(" ");
  } else if (mode === "--stdin") {
    message = readFileSync(0, "utf8");
  } else {
    message = stripCommentary(readFileSync(mode, "utf8"));
  }

  const problems = checkCommitMessage(message);
  if (problems.length > 0) {
    report("commit message", problems);
    fail();
  }
}

if (
  process.argv[1] &&
  import.meta.url.endsWith(process.argv[1].split("/").pop())
) {
  main(process.argv.slice(2));
}
