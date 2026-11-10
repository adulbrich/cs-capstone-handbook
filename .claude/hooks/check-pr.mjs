/**
 * PostToolUse and PostToolUseFailure on Bash: after an agent creates or edits
 * a pull request, read the PR back from GitHub and check what it now says.
 *
 * The title is the squash-merge subject, so it must be a Conventional Commits
 * subject; the body above its `---` line is the `main` commit body, so it ends
 * with the `Assisted-by: Claude Code` trailer (#665); and the title and body
 * carry no em dash, emoji, session link or old footer. These are the checks
 * `pr-text` runs in CI, plus the trailer, which CI cannot ask of a PR a person
 * opens alone. Dependabot's PRs are skipped, as `pr-text` skips them.
 *
 * Which PR: each one whose URL stands alone on a line of the output of a
 * command that names `gh pr create` or `gh pr edit`, as both print it. A
 * comment's URL, or the `url:` line of `gh pr view`, is not one. A command
 * that prints none, such as `url=$(gh pr create ...)` with nothing echoed, is
 * not checked: guessing the PR from the branch reported PRs the command never
 * wrote (#666). A PR URL another call in the same command prints alone on a
 * line, as `gh pr list --json url -q '.[].url'` does, is checked too: the
 * output cannot tell it from the one the write printed.
 *
 * Exit 2 hands stderr to the model, which then fixes the PR with
 * `gh pr edit`; the command has already run, so nothing is blocked.
 */
import { execFileSync } from "node:child_process";
import { loadRuleScripts, readInput, repoRoot } from "./lib.mjs";

const PR_WRITE = /\bgh\s+pr\s+(?:create|edit)\b/;
const PR_URL =
  /^[ \t]*(https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+)[ \t\r]*$/gm;
// The reads share one budget, under the 30 s the settings give the hook: a
// hook cut off at its timeout shows the model nothing.
const BUDGET_MS = 25_000;
const TRAILER = "Assisted-by: Claude Code";
const TRAILER_LINE = /^Assisted-by: Claude Code[ \t]*$/m;
const CUT_LINE = /^---[ \t]*$/m;
const DEPENDABOT = "app/dependabot";

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

/** The PR at `url`, as `gh pr view` gives it, or an Error. */
function readPr(url, dir, timeout) {
  try {
    return JSON.parse(
      execFileSync(
        "gh",
        ["pr", "view", url, "--json", "author,body,title,url"],
        {
          cwd: dir,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
          timeout,
        }
      )
    );
  } catch (error) {
    return error;
  }
}

const input = readInput();
const command = input.tool_input?.command ?? "";
if (!PR_WRITE.test(command)) {
  process.exit(0);
}
// A command that fails after it wrote the PR still printed its URL, into
// the failure's `error` text.
const { stderr = "", stdout = "" } = input.tool_response ?? {};
const output = [stdout, stderr, input.error ?? ""].join("\n");
const urls = [...new Set(Array.from(output.matchAll(PR_URL), (m) => m[1]))];
if (urls.length === 0) {
  process.exit(0);
}

const cwd = input.cwd ?? process.cwd();
const { checkCommitMessage } = await loadRuleScripts(repoRoot(cwd));
const report = [];
const deadline = Date.now() + BUDGET_MS;
for (const [at, url] of urls.entries()) {
  const pr = readPr(url, cwd, Math.max(deadline - Date.now(), 1));
  if (pr instanceof Error) {
    // A read that failed may have spent the budget: the rest go unread.
    report.push(
      `check-pr could not read ${urls.slice(at).join(", ")}; check each title and "${TRAILER}" line with gh pr view.`
    );
    break;
  }
  if (pr.author?.login === DEPENDABOT) {
    continue;
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
