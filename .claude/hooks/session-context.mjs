/**
 * SessionStart: the facts every session used to have to be told, printed into
 * context. Branch and whether it is main, uncommitted changes, the Node in
 * use against `.nvmrc`, and whether the lefthook hooks are installed. No
 * network.
 */
import { existsSync, readFileSync } from "node:fs";
import { currentBranch, git, readInput, repoRoot } from "./lib.mjs";

const input = readInput();
const cwd = input.cwd ?? process.cwd();
const root = repoRoot(cwd);
const lines = [];

const branch = currentBranch(cwd) || "(detached)";
lines.push(
  branch === "main"
    ? "Branch: main. Do not commit here: fetch, then branch from origin/main first."
    : `Branch: ${branch}.`
);

const dirty = git(cwd, ["status", "--porcelain"])
  .split("\n")
  .filter(Boolean).length;
lines.push(
  dirty === 0
    ? "Working tree: clean."
    : `Working tree: ${dirty} uncommitted path(s). Stage by name; they may be someone else's work in progress.`
);

let wanted = "";
try {
  wanted = readFileSync(`${root}/.nvmrc`, "utf8").trim();
} catch {
  // No .nvmrc in this checkout.
}
const node = process.version.replace(/^v/, "");
if (wanted && !node.startsWith(wanted.replace(/^v/, ""))) {
  lines.push(
    `Node: ${node} on PATH, .nvmrc wants ${wanted}. Build on the .nvmrc Node; CI does.`
  );
} else {
  lines.push(`Node: ${node}.`);
}

/**
 * `--git-path hooks` follows `core.hooksPath` and, in a worktree, points at
 * the shared hooks directory, which is where lefthook writes.
 */
const preCommit = `${git(cwd, ["rev-parse", "--git-path", "hooks"])}/pre-commit`;
let installed = false;
try {
  installed =
    existsSync(preCommit) &&
    readFileSync(preCommit, "utf8").includes("lefthook");
} catch {
  // Unreadable hook file: report it as not installed.
}
lines.push(
  installed
    ? "Gates: lefthook hooks installed (pre-commit, commit-msg, pre-push), plus the hooks under .claude/hooks in this session."
    : "Gates: lefthook hooks are NOT installed. Run `npx lefthook install` once; until then only CI and the .claude/hooks in this session check the rules."
);

process.stdout.write(`${lines.join("\n")}\n`);
