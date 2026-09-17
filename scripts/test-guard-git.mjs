/**
 * Cases for `.claude/hooks/guard-git.mjs`, the only hook with enough parsing
 * to be wrong in a way nobody notices.
 *
 * It is a safety control, so both directions matter: a false block trains an
 * agent to look for an escape, and a hole lets a commit onto `main`. Before
 * the directory fix (#128) this file's cases failed seven ways, five of them
 * holes: `git -C <the main checkout> commit` and `git switch -C main && git
 * commit` both went straight through.
 *
 * The fixtures are a throwaway repository on `main` and a worktree of it on a
 * feature branch, built here rather than assumed, so this runs the same on a
 * laptop and in CI. The two rule scripts the hook loads for the commit-message
 * check are copied in, because the hook reads them from the repository the
 * commit is going to.
 *
 * Run: node scripts/test-guard-git.mjs
 */

import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HOOK = ".claude/hooks/guard-git.mjs";
const RULE_SCRIPTS = ["check-prose.mjs", "check-commit-message.mjs"];

/**
 * `process.env` without the `GIT_*` keys. This runs at pre-push, which is a
 * git hook, and a git hook exports `GIT_DIR` and `GIT_INDEX_FILE`. Building a
 * throwaway repository with those still set builds it in the wrong place.
 * `lib.mjs` strips them for the same reason.
 */
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
);

function run(cwd, args) {
  execFileSync("git", ["-C", cwd, ...args], {
    env: CLEAN_ENV,
    stdio: "ignore",
  });
}

function read(cwd, args) {
  return execFileSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    env: CLEAN_ENV,
  }).trim();
}

/**
 * Refuse to touch a repository that is not the throwaway one. This test
 * commits and adds, so an environment that redirected git somewhere else
 * would rewrite the checkout it is being run from. That is not theoretical:
 * it happened once, through the `GIT_DIR` a pre-push hook exports.
 */
function assertThrowaway(dir, throwaway) {
  const toplevel = read(dir, ["rev-parse", "--show-toplevel"]);
  if (!toplevel.startsWith(throwaway)) {
    console.error(
      `guard-git test refusing to run: git in ${dir} resolves to ${toplevel}, which is outside the throwaway repository at ${throwaway}.`
    );
    process.exit(1);
  }
}

/** A repository on `main`, plus a worktree of it on a feature branch. */
function fixtures() {
  // Resolved, because `git rev-parse` answers with the real path and on
  // macOS the temp directory is reached through a symlink.
  const root = realpathSync(mkdtempSync(join(tmpdir(), "guard-git-")));
  const main = join(root, "checkout");
  const worktree = join(root, "worktree");
  mkdirSync(main);
  run(main, ["init", "--initial-branch=main"]);
  run(main, ["config", "user.email", "test@example.com"]);
  run(main, ["config", "user.name", "Test"]);
  mkdirSync(join(main, "scripts"));
  for (const script of RULE_SCRIPTS) {
    copyFileSync(join("scripts", script), join(main, "scripts", script));
  }
  writeFileSync(join(main, "README.md"), "fixture\n");
  assertThrowaway(main, root);
  run(main, ["add", "README.md", "scripts"]);
  run(main, ["commit", "-m", "chore: fixture"]);
  assertThrowaway(main, root);
  run(main, ["worktree", "add", "-b", "fix/thing", worktree]);
  assertThrowaway(worktree, root);
  return { main, root, worktree };
}

const { main, root, worktree } = fixtures();
const M = main;
const W = worktree;

/** `[name, cwd, command, "allow" | "deny"]`. */
const CASES = [
  // #128: the branch is the branch of the directory git runs in.
  [
    "commit in a worktree via -C, session on main",
    M,
    `git -C ${W} commit -m "feat(x): do a thing"`,
    "allow",
  ],
  [
    "commit in a worktree via cd, session on main",
    M,
    `cd ${W} && git commit -m "feat(x): do a thing"`,
    "allow",
  ],
  [
    "commit in a worktree, session already there",
    W,
    `git commit -m "feat(x): do a thing"`,
    "allow",
  ],
  [
    "commit on main in the shared checkout",
    M,
    `git commit -m "feat(x): do a thing"`,
    "deny",
  ],
  [
    "commit on main via -C, session in a worktree",
    W,
    `git -C ${M} commit -m "feat(x): do a thing"`,
    "deny",
  ],
  [
    "commit on main via cd, session in a worktree",
    W,
    `cd ${M} && git commit -m "feat(x): do a thing"`,
    "deny",
  ],

  // Naming the branch you are already on is not a way onto main.
  [
    "switch -C to main, then commit",
    M,
    `git switch -C main && git commit -m "feat(x): do a thing"`,
    "deny",
  ],
  [
    "switch -C to a quoted main, then commit",
    M,
    `git switch -C "main" && git commit -m "feat(x): do a thing"`,
    "deny",
  ],
  [
    "switch -c to a new branch, then commit",
    M,
    `git switch -c fix/new && git commit -m "feat(x): do a thing"`,
    "allow",
  ],
  [
    "checkout -b, then commit",
    M,
    `git checkout -b fix/new && git commit -m "feat(x): do a thing"`,
    "allow",
  ],

  // A path only the shell can expand is denied, not guessed at.
  [
    "commit with a variable path",
    M,
    'git -C "$WT" commit -m "feat(x): do a thing"',
    "deny",
  ],
  [
    "cd to a variable path, then commit",
    M,
    'cd "$WT" && git commit -m "feat(x): do a thing"',
    "deny",
  ],

  // Stage by name.
  ["git add -A", W, "git add -A", "deny"],
  ["git add .", W, "git add .", "deny"],
  ["git commit -am", W, `git commit -am "feat(x): do a thing"`, "deny"],
  ["git add by name", W, "git add README.md src/index.ts", "allow"],

  // Destructive.
  ["git reset --hard", W, "git reset --hard", "deny"],
  ["git clean -fd", W, "git clean -fd", "deny"],
  ["git branch -D", W, "git branch -D old", "deny"],
  ["git checkout .", W, "git checkout .", "deny"],
  ["git restore .", W, "git restore .", "deny"],
  ["git restore --staged .", W, "git restore --staged .", "allow"],
  ["git rebase", W, "git rebase origin/main", "allow"],
  ["git stash", W, "git stash", "allow"],

  // Push.
  ["force push naming main", W, "git push --force origin main", "deny"],
  [
    "force push naming a quoted main",
    W,
    `git push --force origin "main"`,
    "deny",
  ],
  ["force push with a + refspec at main", W, "git push origin +main", "deny"],
  [
    "force push on a feature branch",
    W,
    "git push --force origin fix/thing",
    "allow",
  ],
  ["force push from the main checkout", M, "git push --force", "deny"],
  [
    "force push with an unresolvable dir",
    M,
    'git -C "$WT" push --force',
    "deny",
  ],
  ["plain push", M, "git push", "allow"],

  // Commit message, read from the repository the commit is going to.
  [
    "subject that is not conventional",
    W,
    `git commit -m "Add a thing"`,
    "deny",
  ],
  ["conventional subject", W, `git commit -m "feat(x): add a thing"`, "allow"],

  // Masking: a command named inside a message is not that command.
  [
    "message naming git add -A",
    W,
    `git commit -m "fix(x): stop using git add -A here"`,
    "allow",
  ],
  [
    "message naming main",
    W,
    `git commit -m "fix(x): rebase onto main"`,
    "allow",
  ],
];

let failed = 0;
for (const [name, cwd, command, expected] of CASES) {
  let code = 0;
  let reason = "";
  try {
    execFileSync("node", [HOOK], {
      encoding: "utf8",
      env: CLEAN_ENV,
      input: JSON.stringify({ cwd, tool_input: { command } }),
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    code = error.status;
    [reason] = (error.stderr || "").trim().split("\n");
  }
  const got = code === 0 ? "allow" : "deny";
  if (got === expected) {
    continue;
  }
  failed += 1;
  console.error(`FAIL  expected ${expected}, got ${got}: ${name}`);
  console.error(`      ${command}`);
  if (reason) {
    console.error(`      ${reason}`);
  }
}

rmSync(root, { force: true, recursive: true });

if (failed > 0) {
  console.error(`\n${failed} of ${CASES.length} guard-git cases failed.`);
  process.exit(1);
}

console.log(`guard-git OK: ${CASES.length} cases.`);
