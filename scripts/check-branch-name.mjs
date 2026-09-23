/**
 * The branch-name rule, as a check: `<type>/<issue>-<slug>`, where the type is
 * one of the Conventional Commits types, the issue is the number the branch
 * closes, and the slug is lowercase words joined by hyphens:
 * `fix/192-handoff-week`.
 *
 * One implementation, two callers. lefthook runs it at `pre-push` on the
 * current branch, and CI runs it on a pull request's head branch, which
 * catches a push made with the hooks skipped.
 *
 * The check sits at the push, not at branch creation, because the desktop
 * app creates a session's worktree branch (`claude/<slug>-<hash>`) before any
 * hook runs. Rename it before the first push:
 * `git branch -m feat/<issue>-<slug>`.
 *
 * Usage:
 *   node scripts/check-branch-name.mjs                the current branch
 *   node scripts/check-branch-name.mjs --name <str>   a branch name as a string
 */
import { execFileSync } from "node:child_process";
import { TYPES } from "./check-commit-message.mjs";

const BRANCH = new RegExp(
  `^(?:${TYPES.join("|")})/[1-9][0-9]*-[a-z0-9]+(?:-[a-z0-9]+)*$`
);

/** Branches the rule does not reach: Dependabot names its own. */
const EXEMPT_BRANCH = /^dependabot\//;

/**
 * Every problem with `name`, as strings a committer can act on. Empty means
 * the name passes.
 */
export function checkBranchName(name) {
  if (EXEMPT_BRANCH.test(name) || BRANCH.test(name)) {
    return [];
  }
  return [
    `"${name}" is not "type/issue-slug" with type one of ${TYPES.join(", ")}`,
  ];
}

function main(argv) {
  const [mode, ...rest] = argv;
  const name =
    mode === "--name"
      ? rest.join(" ")
      : execFileSync("git", ["branch", "--show-current"], {
          encoding: "utf8",
        }).trim();

  // A detached HEAD has no branch to name; the push names its own refspec.
  if (name.length === 0) {
    return;
  }

  const problems = checkBranchName(name);
  if (problems.length > 0) {
    for (const problem of problems) {
      process.stderr.write(`branch name: ${problem}\n`);
    }
    process.stderr.write(
      "Branch rule: type/issue-slug, such as fix/192-handoff-week. Rename with `git branch -m <new>`. See CONTRIBUTING.md.\n"
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
