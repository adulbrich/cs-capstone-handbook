/**
 * Cases for `.claude/hooks/guard-gh.mjs`, which checks the text a `gh`
 * command would publish: inline, and in the `--body-file` it names.
 *
 * Both directions matter here too. A false block on a clean body file stops
 * every PR an agent opens, and a hole lets the old Claude Code footer or a
 * session link onto a public repo, where removing it costs a history rewrite
 * once a squash merge copies the body into `main`.
 *
 * The hook loads the rule scripts from the repository its `cwd` is in, so the
 * cases run with this checkout as `cwd`. The body files are written to a
 * throwaway directory.
 *
 * Run: node scripts/test-guard-gh.mjs
 */

import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

const HOOK = ".claude/hooks/guard-gh.mjs";
const REPO = process.cwd();

/** `process.env` without the `GIT_*` keys a git hook exports. */
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
);

const root = realpathSync(mkdtempSync(join(tmpdir(), "guard-gh-")));
const home = join(root, "home");
mkdirSync(home);

const OLD =
  "Closes #1\n\n- x\n\nGenerated with [Claude Code](https://claude.com/claude-code)\n";
const CLEAN =
  "Closes #1\n\n- x\n\nAssisted-by: Claude Code\n\n---\n\n## Ran locally\n";
// Built from a code point, so the file itself carries no em dash
// (check-prose) and Biome cannot fold an escape back into the character.
const EM_DASH = String.fromCodePoint(0x20_14);
const DASHED = `Closes #1\n\none ${EM_DASH} two\n`;
const BARE = "Closes #1\n\n- x\n\n---\n\n## Ran locally\n";
const BELOW =
  "Closes #1\n\n- x\n\n---\n\n## Ran locally\n\nAssisted-by: Claude Code\n";

const old = join(root, "old.md");
const clean = join(root, "clean.md");
const dashed = join(root, "dashed.md");
const bare = join(root, "bare.md");
const below = join(root, "below.md");
writeFileSync(old, OLD);
writeFileSync(clean, CLEAN);
writeFileSync(dashed, DASHED);
writeFileSync(bare, BARE);
writeFileSync(below, BELOW);
writeFileSync(join(home, "old.md"), OLD);

const T = '--title "fix(x): y"';

/** `[name, command, "allow" | "deny", extra env]`. */
const CASES = [
  // The old footer, inline and in a body file. Without its emoji, so the
  // footer rule is what refuses it, not the emoji rule.
  [
    "old footer inline",
    `gh pr create ${T} --body "Closes #1. Generated with [Claude Code](x)"`,
    "deny",
  ],
  ["old footer in a body file", `gh pr create ${T} --body-file ${old}`, "deny"],
  ["old footer in a -F body file", `gh pr edit 5 -F ${old}`, "deny"],

  // The body file on the CLI merge path, which carries the part above `---`.
  [
    "clean body file on a merge",
    `gh pr merge 5 --squash --subject "fix(x): y" --body-file ${clean}`,
    "allow",
  ],
  [
    "em dash in a body file on a merge",
    `gh pr merge 5 --squash --subject "fix(x): y" --body-file ${dashed}`,
    "deny",
  ],
  [
    "clean body file on an issue",
    `gh issue create --title "x" --body-file ${clean}`,
    "allow",
  ],
  [
    "body file given relative to cwd",
    `gh pr create ${T} --body-file ${relative(REPO, old)}`,
    "deny",
  ],
  ["quoted body file", `gh pr create ${T} --body-file "${old}"`, "deny"],

  // Paths the shell expands before `gh` sees them.
  [
    "body file under $VAR",
    `gh pr create ${T} --body-file $BODY_DIR/old.md`,
    "deny",
    { BODY_DIR: root },
  ],
  [
    "body file under a braced variable in double quotes",
    `gh pr create ${T} --body-file "\${BODY_DIR}/old.md"`,
    "deny",
    { BODY_DIR: root },
  ],
  [
    "body file under ~",
    `gh pr create ${T} --body-file ~/old.md`,
    "deny",
    { HOME: home },
  ],

  // A file the hook cannot read is pr-text's to check, never a throw that
  // drops what the command text already broke.
  [
    "missing body file",
    `gh pr create ${T} --body-file ${join(root, "missing.md")}`,
    "allow",
  ],
  [
    "variable this process lacks",
    `gh pr create ${T} --body-file $NOT_SET_ANYWHERE/old.md`,
    "allow",
  ],
  [
    "directory as the body file",
    `gh pr create ${T} --body-file ${root}`,
    "allow",
  ],
  [
    "directory as the body file, dirty inline body",
    `gh pr create ${T} --body "a ${EM_DASH} b" --body-file ${root}`,
    "deny",
  ],

  // The Assisted-by trailer above `---` on a PR body an agent sets (#665).
  [
    "clean body file on a create",
    `gh pr create ${T} --body-file ${clean}`,
    "allow",
  ],
  ["no trailer on a create", `gh pr create ${T} --body-file ${bare}`, "deny"],
  ["trailer only below ---", `gh pr create ${T} --body-file ${below}`, "deny"],
  ["no trailer on an edit", `gh pr edit 5 --body-file ${bare}`, "deny"],
  // A merge body is a Dependabot first line or the body create already set.
  [
    "merge body without a trailer",
    `gh pr merge 5 --squash --subject "fix(x): y" --body-file ${bare}`,
    "allow",
  ],
  ["no trailer inline", `gh pr create ${T} --body "Closes #1"`, "deny"],
  ["no trailer inline, -b", `gh pr edit 5 -b 'Closes #1'`, "deny"],
  ["edit without a body", "gh pr edit 5 --add-label x", "allow"],
  ["merge without a body", "gh pr merge 5 --squash", "allow"],

  // Inline text the shell rewrites first is a body the hook cannot read.
  ["inline body from a variable", `gh pr create ${T} --body "$BODY"`, "allow"],
  [
    "inline heredoc body with a quote in it",
    `gh pr create ${T} --body "$(cat <<'EOF'\nfixes the "submit" button\n\nAssisted-by: Claude Code\nEOF\n)"`,
    "allow",
  ],
  [
    "inline body with a spliced quote",
    `gh pr create ${T} --body 'It'\\''s done\n\nAssisted-by: Claude Code'`,
    "allow",
  ],

  // Only the PR call's own body counts, not a chained gh call's.
  [
    "issue comment chained after a merge",
    `gh pr merge 5 --squash && gh issue comment 3 --body "Merged in #5"`,
    "allow",
  ],
  [
    "issue comment chained before a label edit",
    `gh issue comment 3 --body "Done in #5" && gh pr edit 5 --add-label ready`,
    "allow",
  ],
  [
    "clean issue body chained before a bare create",
    `gh issue comment 3 --body-file ${clean} && gh pr create ${T} --body-file ${bare}`,
    "deny",
  ],

  // A "gh" inside quoted text neither starts nor ends a PR call.
  [
    "gh in the PR title",
    `gh pr create --title "fix(hooks): make guard-gh check bodies" --body-file ${bare}`,
    "deny",
  ],
  [
    "gh in an inline PR body",
    `gh pr edit 5 --body "Run gh pr view to check."`,
    "deny",
  ],
  [
    "issue comment naming gh pr create",
    `gh issue comment 3 --body "Repro: gh pr create --body-file ${bare}"`,
    "allow",
  ],
  [
    "comment body naming gh pr edit",
    `gh pr comment 5 --body 'Try: gh pr edit 5 -b "x"'`,
    "allow",
  ],
  [
    "heredoc issue body with a PR edit line in it",
    `cat > ${join(root, "z.md")} <<'EOF'\nit's this:\ngh pr edit 5 --body "Closes #1"\nEOF\ngh issue comment 3 --body-file ${bare}`,
    "allow",
  ],
  [
    "env assignment before the PR call",
    `GH_PROMPT_DISABLED=1 gh pr create ${T} --body-file ${bare}`,
    "deny",
  ],
  [
    "PR create captured in a variable",
    `url=$(gh pr create ${T} --body-file ${bare})`,
    "deny",
  ],
  [
    "PR create captured, trailer present",
    `url=$(gh pr create ${T} --body-file ${clean})`,
    "allow",
  ],
  [
    "second PR call in a chain",
    `gh pr edit 5 --add-label x && gh pr create ${T} --body-file ${bare}`,
    "deny",
  ],
  [
    "issue body without a trailer",
    `gh issue create --title "x" --body-file ${bare}`,
    "allow",
  ],
  [
    "PR comment without a trailer",
    `gh pr comment 5 --body-file ${bare}`,
    "allow",
  ],

  // The rules that were already here.
  [
    "session link inline",
    `gh pr comment 5 --body "see claude.ai/code/session_x"`,
    "deny",
  ],
  [
    "title that is not conventional",
    'gh pr create --title "Add a thing"',
    "deny",
  ],
  [
    "clean create with an inline body",
    `gh pr create ${T} --body "Closes #1\n\nAssisted-by: Claude Code"`,
    "allow",
  ],
  ["not a publishing command", "gh pr view 5 --json body", "allow"],
];

let failed = 0;
for (const [name, command, expected, env = {}] of CASES) {
  let code = 0;
  let reason = "";
  try {
    execFileSync("node", [HOOK], {
      encoding: "utf8",
      env: { ...CLEAN_ENV, ...env },
      input: JSON.stringify({ cwd: REPO, tool_input: { command } }),
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    code = error.status;
    reason = (error.stderr || "").trim().split("\n").slice(1).join(" ");
  }
  // Only exit 2 blocks. A throw exits 1, which Claude Code lets through, so
  // it is its own outcome here rather than a pass for a "deny" case.
  const got = { 0: "allow", 2: "deny" }[code] ?? `exit ${code}`;
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
  console.error(`\n${failed} of ${CASES.length} guard-gh cases failed.`);
  process.exit(1);
}

console.log(`guard-gh OK: ${CASES.length} cases.`);
