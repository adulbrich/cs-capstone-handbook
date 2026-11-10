/**
 * Cases for the PR check, `checkPrText` in `scripts/check-commit-message.mjs`,
 * through both its callers: `pr-text` in CI (`--pr`), the merge gate, and
 * `.claude/hooks/check-pr.mjs`, which reads a PR back after an agent creates
 * or edits it. The check reports a title that is no Conventional subject, a
 * body without `Assisted-by: Claude Code` or `Assisted-by: none` above its
 * `---` line, and the text rules.
 *
 * Both directions matter. A false report blocks a correct PR or sends an
 * agent to "fix" one it never wrote; a miss lets a PR merge without its
 * trailer.
 *
 * `gh` is a stub on `PATH` that serves each PR from a fixture by its number
 * and logs its arguments, so each case also says which PRs the hook read, and
 * no case reaches GitHub. The hook loads the rule scripts from the repository
 * its `cwd` is in, so the cases run with this checkout as `cwd`.
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
const pull = (n) => `https://github.com/o/r/pull/${n}`;
const ISSUE_URL = "https://github.com/o/r/issues/8";

/** `process.env` without the `GIT_*` keys a git hook exports. */
const CLEAN_ENV = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_"))
);

const root = realpathSync(mkdtempSync(join(tmpdir(), "check-pr-")));
const bin = join(root, "bin");
const prs = join(root, "prs");
mkdirSync(bin);
const log = join(root, "gh.log");
// Logs its arguments, then serves the PR the URL in them names, or fails as
// `gh` does for a PR it cannot read.
writeFileSync(
  join(bin, "gh"),
  `#!/bin/sh
printf '%s\\n' "$*" >> "${log}"
file="${prs}/\${3##*/}.json"
[ -f "$file" ] || { echo "could not resolve to a PullRequest" >&2; exit 1; }
cat "$file"
`
);
chmodSync(join(bin, "gh"), 0o755);

// Built from a code point, so the file itself carries no em dash.
const EM_DASH = String.fromCodePoint(0x20_14);
const TITLE = "fix(x): y";
const SIGNED =
  "Closes #1\n\n- x\n\nAssisted-by: Claude Code\n\n---\n\n## Ran\n";
const BARE = "Closes #1\n\n- x\n\n---\n\n## Ran\n";
const AGENT = { login: "someone" };
const clean = { author: AGENT, body: SIGNED, title: TITLE };
const stdout = (text) => ({ interrupted: false, stderr: "", stdout: text });

/**
 * `[name, command, input, prs, expected, read, says]`: what the command
 * printed (`tool_response`, or `error` for a failed command), the PRs the
 * stub serves by number, the outcome, the numbers of the PRs the hook reads,
 * and text its report must hold.
 */
const CASES = [
  // Commands that write no PR, or print none, are never looked at.
  ["not a PR write", "gh pr view 7", stdout(pull(7)), { 7: clean }, "pass", []],
  [
    "issue whose title names gh pr create",
    'gh issue create --title "hook refuses gh pr create" --body-file b.md',
    stdout(ISSUE_URL),
    { 7: clean },
    "pass",
    [],
  ],
  [
    "search that names gh pr create",
    "grep -n 'gh pr create' AGENTS.md",
    stdout("37: gh pr create"),
    { 7: clean },
    "pass",
    [],
  ],
  [
    "PR comment whose body names gh pr create",
    "gh pr comment 8 --body 'Repro: gh pr create --title x'",
    stdout(`${pull(8)}#issuecomment-123`),
    { 8: { ...clean, body: BARE } },
    "pass",
    [],
  ],
  [
    "PR viewed after an edit that printed nothing",
    "gh pr edit 9 --add-label x >/dev/null && gh pr view 8",
    stdout(`title:\tAdd a thing\nurl:\t${pull(8)}\n`),
    { 8: { ...clean, body: BARE } },
    "pass",
    [],
  ],
  // The cost of reading only what was printed: a capture with nothing echoed.
  [
    "captured create that prints nothing",
    `url=$(gh pr create --title "${TITLE}" --body-file b.md)`,
    stdout(""),
    { 7: { ...clean, body: BARE } },
    "pass",
    [],
  ],

  // The PR the command printed, as GitHub holds it.
  [
    "clean PR",
    `gh pr create --title "${TITLE}" --body-file b.md`,
    stdout(pull(7)),
    { 7: clean },
    "pass",
    [7],
  ],
  [
    "title that is not Conventional",
    'gh pr edit 7 --title "Add a thing"',
    stdout(pull(7)),
    { 7: { ...clean, title: "Add a thing" } },
    "report",
    [7],
  ],
  [
    "no trailer",
    "gh pr create --fill",
    stdout(pull(7)),
    { 7: { ...clean, body: BARE } },
    "report",
    [7],
  ],
  [
    "trailer only below ---",
    "gh pr edit 7 --body-file b.md",
    stdout(pull(7)),
    { 7: { ...clean, body: `${BARE}\nAssisted-by: Claude Code\n` } },
    "report",
    [7],
  ],
  [
    "trailer inside a line",
    "gh pr edit 7 --body-file b.md",
    stdout(pull(7)),
    { 7: { ...clean, body: "See Assisted-by: Claude Code here.\n" } },
    "report",
    [7],
  ],
  [
    "a PR no agent helped with",
    "gh pr edit 7 --body-file b.md",
    stdout(pull(7)),
    { 7: { ...clean, body: SIGNED.replace("Claude Code", "none") } },
    "pass",
    [7],
  ],
  [
    "trailer naming another tool",
    "gh pr edit 7 --body-file b.md",
    stdout(pull(7)),
    { 7: { ...clean, body: SIGNED.replace("Claude Code", "Codex") } },
    "report",
    [7],
  ],
  [
    "trailer with no --- line",
    "gh pr edit 7 --body-file b.md",
    stdout(pull(7)),
    { 7: { ...clean, body: "Closes #1\n\nAssisted-by: Claude Code  \n" } },
    "pass",
    [7],
  ],
  [
    "em dash in the body",
    "gh pr edit 7 --body-file b.md",
    stdout(pull(7)),
    { 7: { ...clean, body: `one ${EM_DASH} two\n\n${SIGNED}` } },
    "report",
    [7],
  ],

  // #666: the PR call chained after an issue call is checked on its own PR.
  [
    "non-conventional PR title after an issue that names a PR call",
    'gh issue comment 8 --body "see gh pr create"; gh pr create --title "Add a thing" --body-file b.md',
    stdout(`${ISSUE_URL}\n${pull(7)}`),
    { 7: { ...clean, title: "Add a thing" } },
    "report",
    [7],
  ],
  [
    "two PRs printed, the second without the trailer",
    "gh pr edit 7 --add-label x && gh pr edit 9 --body-file b.md",
    stdout(`${pull(7)}\n${pull(9)}`),
    { 7: clean, 9: { ...clean, body: BARE } },
    "report",
    [7, 9],
  ],
  [
    "Dependabot PR an agent labels",
    "gh pr edit 7 --add-label dependencies",
    stdout(pull(7)),
    {
      7: {
        author: { login: "app/dependabot" },
        body: `Release notes ${EM_DASH} upstream\n`,
        title: "Bump x from 1 to 2",
      },
    },
    "pass",
    [7],
  ],

  // A command that fails after it wrote the PR is checked too.
  [
    "create chained to a failing command",
    `gh pr create --title "${TITLE}" --body-file b.md && false`,
    { error: `Exit code 1\n${pull(7)}` },
    { 7: { ...clean, body: BARE } },
    "report",
    [7],
  ],
  // A printed PR that cannot be read is said so, to the model, and the
  // reads stop there.
  [
    "printed PR that cannot be read",
    "gh pr edit 7 --add-label x",
    stdout(pull(7)),
    {},
    "report",
    [7],
  ],
  [
    "first of two printed PRs cannot be read",
    "gh pr edit 7 --add-label x && gh pr edit 9 --add-label x",
    stdout(`${pull(7)}\n${pull(9)}`),
    { 9: clean },
    "report",
    [7],
    `could not read ${pull(7)}, ${pull(9)}`,
  ],
];

let failed = 0;
for (const [
  name,
  command,
  response,
  served,
  expected,
  read,
  says = "",
] of CASES) {
  rmSync(prs, { force: true, recursive: true });
  mkdirSync(prs);
  rmSync(log, { force: true });
  for (const [n, pr] of Object.entries(served)) {
    writeFileSync(
      join(prs, `${n}.json`),
      JSON.stringify({ ...pr, url: pull(n) })
    );
  }
  const { error, ...toolResponse } = response;
  let code = 0;
  let reason = "";
  try {
    execFileSync("node", [HOOK], {
      encoding: "utf8",
      env: { ...CLEAN_ENV, PATH: `${bin}${delimiter}${process.env.PATH}` },
      input: JSON.stringify({
        cwd: REPO,
        tool_input: { command },
        ...(error === undefined ? { tool_response: toolResponse } : { error }),
      }),
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch (thrown) {
    code = thrown.status;
    reason = (thrown.stderr || "").trim().replaceAll("\n", " ");
  }
  const got = { 0: "pass", 2: "report" }[code] ?? `exit ${code}`;
  const calls = existsSync(log)
    ? readFileSync(log, "utf8").trim().split("\n")
    : [];
  const wanted = read.map(
    (n) => `pr view ${pull(n)} --json author,body,title,url`
  );
  const said = reason.includes(says);
  if (got === expected && said && calls.join("\n") === wanted.join("\n")) {
    continue;
  }
  failed += 1;
  console.error(
    `FAIL  expected ${expected}${said ? "" : ` saying "${says}"`}, got ${got}: ${name}`
  );
  console.error(`      ${command}`);
  console.error(`      gh read: ${calls.join(" | ") || "nothing"}`);
  if (reason) {
    console.error(`      ${reason}`);
  }
}

// `pr-text`'s path: the same check, given the PR as the workflow gives it.
const GATE = [
  ["clean PR", TITLE, SIGNED, "pass"],
  [
    "a PR no agent helped with",
    TITLE,
    SIGNED.replace("Claude Code", "none"),
    "pass",
  ],
  ["title that is not Conventional", "Add a thing", SIGNED, "fail"],
  ["no trailer", TITLE, BARE, "fail"],
  [
    "trailer only below ---",
    TITLE,
    `${BARE}\nAssisted-by: Claude Code\n`,
    "fail",
  ],
  [
    "trailer in other case",
    TITLE,
    SIGNED.replace("Claude Code", "claude code"),
    "fail",
  ],
  ["session link", TITLE, `${SIGNED}\nclaude.ai/code/session_x\n`, "fail"],
];
for (const [name, title, body, expected] of GATE) {
  let got = "pass";
  try {
    execFileSync("node", ["scripts/check-commit-message.mjs", "--pr"], {
      env: { ...CLEAN_ENV, PR_BODY: body, PR_TITLE: title },
      stdio: "ignore",
    });
  } catch {
    got = "fail";
  }
  if (got !== expected) {
    failed += 1;
    console.error(`FAIL  pr-text: expected ${expected}, got ${got}: ${name}`);
  }
}

rmSync(root, { force: true, recursive: true });

const total = CASES.length + GATE.length;
if (failed > 0) {
  console.error(`\n${failed} of ${total} PR check cases failed.`);
  process.exit(1);
}

console.log(
  `check-pr OK: ${CASES.length} hook cases, ${GATE.length} pr-text cases.`
);
