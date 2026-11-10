/**
 * PostToolUse on Bash: after an agent creates or edits a pull request, read
 * the PR back from GitHub and check what it now says.
 *
 * The title is the squash-merge subject, so it must be a Conventional Commits
 * subject; the body above its `---` line is the `main` commit body, so it ends
 * with the `Assisted-by: Claude Code` trailer (#665); and the title and body
 * carry no em dash, emoji, session link or old footer. These are the checks
 * `pr-text` runs in CI, plus the trailer, which CI cannot ask of a PR a person
 * opens alone.
 *
 * The hook reads the PR, never the command: whatever the shell made of the
 * command, GitHub holds what was published (#666). The PR is each one whose
 * URL the command printed, which `gh pr create` and `gh pr edit` do. When it
 * printed none, as `url=$(gh pr create ...)` does, it is the PR of the branch
 * checked out in `cwd`; when it printed only an issue's URL, the command was
 * an issue call that names a PR call, and there is nothing to check.
 *
 * Exit 2 hands stderr to the model, which then fixes the PR with
 * `gh pr edit`. The tool call has already run, so nothing is blocked. When
 * the PR cannot be read, the hook says so and exits 1, which Claude Code shows
 * and lets pass.
 */
import { execFileSync } from "node:child_process";
import { loadRuleScripts, readInput, repoRoot } from "./lib.mjs";

const PR_WRITE = /\bgh\s+pr\s+(?:create|edit)\b/;
const PR_URL = /https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+/g;
const ISSUE_URL = /https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/issues\/\d+/;
const TRAILER = "Assisted-by: Claude Code";
const TRAILER_LINE = /^Assisted-by: Claude Code[ \t]*$/m;
const CUT_LINE = /^---[ \t]*$/m;

/**
 * Whether a PR body has the trailer on a line of its own above the first
 * `---` line. A body with no `---` is all commit body.
 */
function hasTrailer(body) {
  const cut = CUT_LINE.exec(body);
  return TRAILER_LINE.test(cut ? body.slice(0, cut.index) : body);
}

/** What the PR `{ title, body }` breaks, as lines the model can act on. */
function prProblems({ title, body }, check) {
  const problems = check(`${title}\n\n${body}`).map((problem) =>
    problem.startsWith("subject")
      ? `the title is the squash-merge subject: ${problem}`
      : problem
  );
  if (!hasTrailer(body)) {
    problems.push(
      `the body has no "${TRAILER}" line above its --- line; end the part above --- with it`
    );
  }
  return problems;
}

/** The PR at `url`, or the current branch's in `dir`, as `{ title, body, url }`. */
function readPr(url, dir) {
  const args = [
    "pr",
    "view",
    ...(url ? [url] : []),
    "--json",
    "title,body,url",
  ];
  return JSON.parse(
    execFileSync("gh", args, {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 20_000,
    })
  );
}

const input = readInput();
const command = input.tool_input?.command ?? "";
if (!PR_WRITE.test(command)) {
  process.exit(0);
}
const cwd = input.cwd ?? process.cwd();
const output = JSON.stringify(input.tool_response ?? "");
const printed = [...new Set(output.match(PR_URL))];
if (printed.length === 0 && ISSUE_URL.test(output)) {
  process.exit(0);
}

const { checkCommitMessage } = await loadRuleScripts(repoRoot(cwd));
const report = [];
for (const url of printed.length > 0 ? printed : [null]) {
  let pr;
  try {
    pr = readPr(url, cwd);
  } catch {
    // A branch with no PR, such as `main`: nothing to check.
    if (url === null) {
      process.exit(0);
    }
    process.stderr.write(
      `check-pr could not read ${url}; check its title and its "${TRAILER}" line yourself.\n`
    );
    process.exit(1);
  }
  const problems = prProblems(pr, checkCommitMessage);
  if (problems.length > 0) {
    report.push(
      `${pr.url} breaks a rule (AGENTS.md); fix it with gh pr edit:\n${problems.map((p) => `- ${p}`).join("\n")}`
    );
  }
}
if (report.length > 0) {
  process.stderr.write(`${report.join("\n")}\n`);
  process.exit(2);
}
