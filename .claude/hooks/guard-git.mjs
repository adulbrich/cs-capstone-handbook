/**
 * PreToolUse on Bash: the git rules from AGENTS.md, enforced before the
 * command runs rather than remembered.
 *
 * - Stage files by name: no `git add -A`, `git add .`, `git commit -a`.
 * - Never commit on main.
 * - No force push at main, no `reset --hard`, `clean -f`, `branch -D`, or a
 *   working-tree wipe through `checkout .` and `restore .`.
 * - A commit message that would fail `commit-msg` fails here first, so a
 *   `--no-verify` cannot get it past lefthook.
 *
 * Everything else, including a plain push, a rebase and a stash, goes through.
 * Exit 2 blocks; stderr is the reason the model reads.
 *
 * The command line is tokenized rather than matched as text: git's global
 * options (`git -C dir add`, `git -c k=v commit`) sit between `git` and the
 * subcommand, flags come in short, long and clustered forms (`-f`, `--force`,
 * `-fd`), and a refspec can carry the force as a `+`. Quoted strings and
 * heredoc bodies are masked before parsing, so a commit message that mentions
 * `git add -A` is not a `git add -A`. There is no `if` filter on the hook in
 * settings.json on purpose: `cd x && git add -A` starts with `cd`.
 *
 * **Which directory the rule is about.** The branch a commit lands on is the
 * branch of the directory git runs in, which is not always the session's
 * `cwd`. The repo's convention is to work in a scratchpad worktree, and the
 * session's `cwd` stays pinned to the shared checkout, which sits on `main`.
 * Reading `cwd` therefore rejected every honest commit from a worktree while
 * passing `git -C <the main checkout> commit`, which is the one case that
 * should never pass. So each segment carries its own directory: `cwd`, moved
 * by any `cd`, then by any `-C` on the git call itself.
 *
 * A path built from a shell variable (`git -C "$WT" commit`) cannot be
 * resolved here, because the hook does not have the shell's variables. Those
 * are denied rather than waved through, with the literal path asked for in
 * the reason. Guessing in either direction is worse: guessing `cwd` blocks
 * honest work, and guessing "not main" is a hole.
 */
import { homedir } from "node:os";
import { resolve } from "node:path";
import {
  currentBranch,
  deny,
  loadRuleScripts,
  readInput,
  repoRoot,
} from "./lib.mjs";

const HEREDOC = /<<-?\s*(["']?)([A-Za-z_][A-Za-z0-9_]*)\1\n([\s\S]*?)\n\2\b/;
const CAT_HEREDOC =
  /(?:-m|--message)(?:=|\s+)"?\$\(\s*cat\s*<<-?\s*["']?[A-Za-z_]/;
const QUOTED = /"(?:[^"\\]|\\.)*"|'[^']*'/g;
const MESSAGE_FLAG =
  /(?:^|\s)(?:-m|--message)(?:=|\s+)(?:"((?:[^"\\]|\\.)*)"|'([^']*)')/g;
const SEGMENT = /\s*(?:&&|\|\||;|\|)\s*|\n/g;
const SHORT_CLUSTER = /^-[A-Za-z]+$/;
const MAIN_REF = /(?:^|[:+])(?:refs\/heads\/)?main$/;
/** A token wrapped in matching shell quotes. */
const QUOTED_WHOLE = /^(["']).*\1$/;
/** The whitespace-separated runs of a masked segment. */
const TOKEN = /\S+/g;
/** A path this hook cannot resolve: a variable, a substitution, or a glob. */
const UNRESOLVABLE = /[$`*?]/;
/** Global options that take a separate argument. */
const GLOBAL_WITH_ARG = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--exec-path",
  "--namespace",
]);

/** The directory of a segment whose path the hook could not work out. */
const UNKNOWN_DIR = null;

const input = readInput();
const command = input.tool_input?.command ?? "";
const cwd = input.cwd ?? process.cwd();

if (!/\bgit\b/.test(command)) {
  process.exit(0);
}

/**
 * `text` with quoted strings and heredoc bodies replaced by a same-length run
 * of a harmless non-space character. Same length, so an offset into the mask
 * is the same offset into the original: the mask decides where the tokens are
 * and the original says what is in them. Non-space, so a quoted string stays
 * one token; not a newline, so a heredoc body cannot invent a segment.
 */
function mask(text) {
  const blank = (match) => "x".repeat(match.length);
  return text.replace(HEREDOC, blank).replace(QUOTED, blank);
}

/**
 * The segments of one command line, each as `{ masked, tokens }`, where a
 * token carries both its masked form (what the rules match on) and its
 * original text (what a path is read from).
 */
function segments(text) {
  const masked = mask(text);
  const out = [];
  let start = 0;
  const push = (end) => {
    const tokens = [];
    for (const m of masked.slice(start, end).matchAll(TOKEN)) {
      const at = start + m.index;
      tokens.push({ masked: m[0], raw: text.slice(at, at + m[0].length) });
    }
    out.push(tokens);
  };
  for (const m of masked.matchAll(SEGMENT)) {
    push(m.index);
    start = m.index + m[0].length;
  }
  push(masked.length);
  return out;
}

/** A token with its surrounding shell quotes removed. */
function unquote(raw) {
  return QUOTED_WHOLE.test(raw) ? raw.slice(1, -1) : raw;
}

/**
 * `raw` as a filesystem path relative to `from`, or UNKNOWN_DIR when it holds
 * something only the shell could expand.
 */
function pathFrom(from, raw) {
  if (from === UNKNOWN_DIR || UNRESOLVABLE.test(raw)) {
    return UNKNOWN_DIR;
  }
  const bare = unquote(raw);
  if (bare === "" || bare === "-") {
    return UNKNOWN_DIR;
  }
  return resolve(from, bare.startsWith("~") ? homedir() + bare.slice(1) : bare);
}

/**
 * `{ sub, args, dir }` for the git invocation in a segment, or null. `dir` is
 * where git will run: the segment's directory moved by each `-C` the command
 * carries. Repeated `-C` are cumulative and each is relative to the last,
 * which is what resolving them in order does.
 */
function parseGit(tokens, from) {
  const at = tokens.findIndex(
    (t) => t.masked === "git" || t.masked.endsWith("/git")
  );
  if (at === -1) {
    return null;
  }
  let dir = from;
  let i = at + 1;
  while (i < tokens.length && tokens[i].masked.startsWith("-")) {
    const takesArg = GLOBAL_WITH_ARG.has(tokens[i].masked);
    if (tokens[i].masked === "-C" && tokens[i + 1]) {
      dir = pathFrom(dir, tokens[i + 1].raw);
    }
    i += takesArg ? 2 : 1;
  }
  const rest = tokens.slice(i + 1);
  return {
    args: rest.map((t) => t.masked),
    dir,
    rawArgs: rest.map((t) => unquote(t.raw)),
    sub: tokens[i]?.masked ?? "",
  };
}

/** The directory a `cd` segment moves to, or `from` when it is not a `cd`. */
function afterCd(tokens, from) {
  if (tokens[0]?.masked !== "cd") {
    return from;
  }
  const target = tokens.find((t, i) => i > 0 && !t.masked.startsWith("-"));
  return target ? pathFrom(from, target.raw) : homedir();
}

const isDot = (t) => t === "." || t === "./";
/** A short flag cluster carrying `letter`, as `-f` or `-fd` carry `f`. */
const shortFlag = (t, letter) =>
  SHORT_CLUSTER.test(t) && t.slice(1).includes(letter);
/** `--long` or the short `letter` in any cluster, as `--force` or `-fd`. */
const hasFlag = (args, long, letter) =>
  args.some((t) => t === long || shortFlag(t, letter));

const UNRESOLVED_REASON =
  "This hook cannot tell which branch that would land on: the directory is built from a shell variable, so only the shell knows it. Write the path literally (`git -C /abs/path/to/worktree commit ...`) and the check can run.";

function stagingRule(sub, args) {
  if (
    sub === "add" &&
    args.some((t) => t === "-A" || t === "--all" || isDot(t))
  ) {
    return "Stage files by name (AGENTS.md): `git add -A` and `git add .` sweep up unrelated work in progress. Name the paths.";
  }
  if (sub === "commit" && hasFlag(args, "--all", "a")) {
    return "Stage files by name (AGENTS.md): `git commit -a` commits every modified file. Stage the paths, then commit.";
  }
  return null;
}

function pushRule(args, rawArgs, dir) {
  const forced =
    hasFlag(args, "--force", "f") ||
    args.some(
      (t) =>
        t.startsWith("--force-with-lease") ||
        t === "--force-if-includes" ||
        t.startsWith("+")
    );
  if (!forced) {
    return null;
  }
  if (rawArgs.some((t) => MAIN_REF.test(t))) {
    return "No force push at main. The ruleset would reject it anyway.";
  }
  if (dir === UNKNOWN_DIR) {
    return `No force push at main. ${UNRESOLVED_REASON}`;
  }
  return currentBranch(dir) === "main"
    ? "No force push at main. The ruleset would reject it anyway."
    : null;
}

function destructiveRule(sub, args) {
  switch (sub) {
    case "reset":
      return args.includes("--hard")
        ? "No `git reset --hard` from an agent: it discards uncommitted work the user may want. Ask them to run it."
        : null;
    case "clean":
      return hasFlag(args, "--force", "f")
        ? "No `git clean -f` from an agent. Ask the user to run it."
        : null;
    case "branch": {
      const forceDelete =
        args.some((t) => shortFlag(t, "D")) ||
        (hasFlag(args, "--delete", "d") && hasFlag(args, "--force", "f"));
      return forceDelete
        ? "No `git branch -D` from an agent. Use `-d`, or ask the user to force-delete."
        : null;
    }
    case "checkout":
      return args.some(isDot)
        ? "No working-tree wipe (`git checkout .`) from an agent. Name the paths to restore."
        : null;
    case "restore": {
      const indexOnly =
        hasFlag(args, "--staged", "S") && !hasFlag(args, "--worktree", "W");
      return args.some(isDot) && !indexOnly
        ? "No working-tree wipe (`git restore .`) from an agent. Name the paths to restore."
        : null;
    }
    default:
      return null;
  }
}

/**
 * The branch a commit in this segment would land on. `pending` is the branch
 * an earlier segment of the same command creates or switches to, which does
 * not exist on disk yet, so it wins over what the directory currently says.
 */
function commitRule(dir, pending) {
  const branch =
    pending ?? (dir === UNKNOWN_DIR ? undefined : currentBranch(dir));
  if (branch === undefined) {
    return `Never commit on main (AGENTS.md). ${UNRESOLVED_REASON}`;
  }
  return branch === "main"
    ? "Never commit on main (AGENTS.md). Fetch, branch from origin/main, then commit."
    : null;
}

function ruleBroken(call, pending) {
  const { sub, args, dir } = call;
  return (
    stagingRule(sub, args) ??
    (sub === "commit" ? commitRule(dir, pending) : null) ??
    (sub === "push"
      ? pushRule(args, call.rawArgs, dir)
      : destructiveRule(sub, args))
  );
}

/**
 * The branch this segment leaves the working tree on, when it creates or
 * switches to one, so a later `git commit` in the same command is judged
 * against the branch that will exist rather than the one that does. Naming
 * `main` here is not an escape: it is a commit on main by a longer route,
 * and naming the branch the tree is already on is not one either.
 *
 * `worktree add` needs no exemption of its own. The commit that follows it
 * is judged from the directory it actually runs in, which is the new
 * worktree when the command says so and the shared checkout when it does not.
 */
function switchesTo(sub, args, rawArgs) {
  const after = (flags) => {
    const at = args.findIndex((t) => flags.includes(t));
    return at === -1 ? null : (rawArgs[at + 1] ?? null);
  };
  if (sub === "checkout") {
    return after(["-b", "-B"]);
  }
  return sub === "switch" ? after(["-c", "-C"]) : null;
}

/**
 * The message a `git commit` would record, or null when it cannot be read
 * here: a file, an editor, or a substitution that is not the one shape the
 * harness writes, `-m "$(cat <<'EOF' ... EOF)"`, whose heredoc body is the
 * message. The heredoc is searched from that `-m`, so a heredoc earlier on
 * the line is not a message. A second `-m` beside the harness shape is not
 * read; the harness never writes one.
 */
function extractCommitMessage(text) {
  const shape = CAT_HEREDOC.exec(text);
  if (shape) {
    return HEREDOC.exec(text.slice(shape.index))?.[3] ?? null;
  }
  const parts = [];
  for (const match of text.matchAll(MESSAGE_FLAG)) {
    parts.push(match[1] ?? match[2]);
  }
  if (parts.length === 0 || parts.some((p) => p.includes("$("))) {
    return null;
  }
  return parts.join("\n\n").replaceAll("\\n", "\n");
}

let pendingBranch = null;
let commitDir;
let segmentDir = cwd;

for (const tokens of segments(command)) {
  segmentDir = afterCd(tokens, segmentDir);
  const call = parseGit(tokens, segmentDir);
  if (!call) {
    continue;
  }
  const reason = ruleBroken(call, pendingBranch);
  if (reason) {
    deny(reason);
  }
  const target = switchesTo(call.sub, call.args, call.rawArgs);
  if (target !== null) {
    pendingBranch = target;
  }
  if (call.sub === "commit") {
    commitDir = call.dir ?? cwd;
  }
}

if (commitDir !== undefined) {
  const message = extractCommitMessage(command);
  if (message !== null) {
    const { checkCommitMessage } = await loadRuleScripts(repoRoot(commitDir));
    const problems = checkCommitMessage(message);
    if (problems.length > 0) {
      deny(
        `Commit message fails the rule (AGENTS.md):\n${problems.map((p) => `- ${p}`).join("\n")}`
      );
    }
  }
}
