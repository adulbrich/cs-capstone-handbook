/**
 * Cases for `.claude/hooks/check-pr.mjs`, which reads a pull request back
 * after an agent creates or edits it and reports a title that is no
 * Conventional subject, a body without `Assisted-by: Claude Code` above its
 * `---` line, or the text rules `pr-text` checks.
 *
 * Both directions matter. A false report sends an agent to "fix" a correct
 * PR; a miss lets a PR reach the merge without its trailer, which no CI check
 * asks for.
 *
 * `gh` is a stub on `PATH` that serves the PR from a fixture and logs each
 * call, so no case reaches GitHub. The hook loads the rule scripts from the
 * repository its `cwd` is in, so the cases run with this checkout as `cwd`.
 *
 * Run: node scripts/test-check-pr.mjs
 */

import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

const HOOK = ".claude/hooks/check-pr.mjs";
const REPO = process.cwd();
const URL = "https://github.com/o/r/pull/7";
const ISSUE_URL = "https://github.com/o/r/issues/8";

/** `process.env` without the `GIT_*` keys a git hook exports. */
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
);

const root = realpathSync(mkdtempSync(join(tmpdir(), "check-pr-")));
const bin = join(root, "bin");
mkdirSync(bin);
const fixture = join(root, "pr.json");
const log = join(root, "gh.log");
// Serves the fixture, or fails as `gh` does for a branch with no PR.
writeFileSync(
  join(bin, "gh"),
  `#!/bin/sh
printf '%s\\n' "$*" >> "${log}"
[ -f "${fixture}" ] || { echo "no pull requests found" >&2; exit 1; }
cat "${fixture}"
`
);
chmodSync(join(bin, "gh"), 0o755);

// Built from a code point, so the file itself carries no em dash.
const EM_DASH = String.fromCodePoint(0x20_14);
const TITLE = "fix(x): y";
const SIGNED =
  "Closes #1\n\n- x\n\nAssisted-by: Claude Code\n\n---\n\n## Ran\n";
const BARE = "Closes #1\n\n- x\n\n---\n\n## Ran\n";
const BELOW = "Closes #1\n\n- x\n\n---\n\n## Ran\n\nAssisted-by: Claude Code\n";

/**
 * `[name, command, stdout, pr, expected, calls]`: the PR the stub serves (or
 * null for none), the outcome, and whether the hook should call `gh` at all.
 */
const CASES = [
  // Commands that write no PR are never looked at.
  ["not a PR write", "gh pr view 7", URL, null, "pass", false],
  [
    "issue whose title names gh pr create",
    'gh issue create --title "hook refuses gh pr create" --body-file b.md',
    ISSUE_URL,
    null,
    "pass",
    false,
  ],

  // The PR the command printed, as GitHub holds it.
  [
    "clean PR",
    `gh pr create --title "${TITLE}" --body-file b.md`,
    URL,
    { body: SIGNED, title: TITLE },
    "pass",
    true,
  ],
  [
    "title that is not Conventional",
    'gh pr edit 7 --title "Add a thing"',
    URL,
    { body: SIGNED, title: "Add a thing" },
    "report",
    true,
  ],
  [
    "no trailer",
    "gh pr create --fill",
    URL,
    { body: BARE, title: TITLE },
    "report",
    true,
  ],
  [
    "trailer only below ---",
    "gh pr edit 7 --body-file b.md",
    URL,
    { body: BELOW, title: TITLE },
    "report",
    true,
  ],
  [
    "trailer with no --- line",
    "gh pr edit 7 --body-file b.md",
    URL,
    { body: "Closes #1\n\nAssisted-by: Claude Code  \n", title: TITLE },
    "pass",
    true,
  ],
  [
    "em dash in the body",
    "gh pr edit 7 --body-file b.md",
    URL,
    { body: `one ${EM_DASH} two\n\n${SIGNED}`, title: TITLE },
    "report",
    true,
  ],

  // #666: the PR call chained after an issue call is checked on its own PR.
  [
    "non-conventional PR title after an issue that names a PR call",
    'gh issue comment 8 --body "see gh pr create"; gh pr create --title "Add a thing" --body-file b.md',
    `${ISSUE_URL}\n${URL}`,
    { body: SIGNED, title: "Add a thing" },
    "report",
    true,
  ],

  // Nothing printed: the PR of the branch checked out, if it has one.
  [
    "captured create, branch PR without the trailer",
    `url=$(gh pr create --title "${TITLE}" --body-file b.md)`,
    "",
    { body: BARE, title: TITLE },
    "report",
    true,
  ],
  [
    "captured create, branch with no PR",
    `url=$(gh pr create --title "${TITLE}" --body-file b.md)`,
    "",
    null,
    "pass",
    true,
  ],

  // A printed PR that cannot be read is said so, and let pass.
  [
    "printed PR that cannot be read",
    "gh pr edit 7 --add-label x",
    URL,
    null,
    "error",
    true,
  ],
];

let failed = 0;
for (const [name, command, stdout, pr, expected, calls] of CASES) {
  rmSync(fixture, { force: true });
  rmSync(log, { force: true });
  if (pr) {
    writeFileSync(fixture, JSON.stringify({ ...pr, url: URL }));
  }
  let code = 0;
  let reason = "";
  try {
    execFileSync("node", [HOOK], {
      encoding: "utf8",
      env: { ...CLEAN_ENV, PATH: `${bin}${delimiter}${process.env.PATH}` },
      input: JSON.stringify({
        cwd: REPO,
        tool_input: { command },
        tool_response: { interrupted: false, stderr: "", stdout },
      }),
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (error) {
    code = error.status;
    reason = (error.stderr || "").trim().replaceAll("\n", " ");
  }
  const got = { 0: "pass", 1: "error", 2: "report" }[code] ?? `exit ${code}`;
  const called = existsSync(log) && readFileSync(log, "utf8").length > 0;
  if (got === expected && called === calls) {
    continue;
  }
  failed += 1;
  console.error(
    `FAIL  expected ${expected}${calls ? "" : " without gh"}, got ${got}${called ? "" : " without gh"}: ${name}`
  );
  console.error(`      ${command}`);
  if (reason) {
    console.error(`      ${reason}`);
  }
}

rmSync(root, { force: true, recursive: true });

if (failed > 0) {
  console.error(`\n${failed} of ${CASES.length} check-pr cases failed.`);
  process.exit(1);
}

console.log(`check-pr OK: ${CASES.length} cases.`);
