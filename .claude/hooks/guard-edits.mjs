/**
 * PreToolUse on Edit and Write: the files nobody hand-edits, with the reason
 * each time so the model does the right thing instead.
 *
 * Answers with the JSON deny shape rather than exit 2 so the reason reaches
 * the model verbatim and the turn continues.
 */
import { readInput, repoRelative, repoRoot } from "./lib.mjs";

const PROTECTED = new Map([
  ["CLAUDE.md", "a pointer to AGENTS.md; edit AGENTS.md"],
  [
    "package-lock.json",
    "written by npm; change package.json and run `npm install`, never edit the lock by hand (AGENTS.md, hard rule 2)",
  ],
]);

/**
 * Anything under `data/`: rosters, grades, survey exports. Student PII,
 * gitignored and guarded at commit and in CI (AGENTS.md, hard rule 1). An
 * agent has no business writing there either.
 */
const DATA_DIR = /^data\//;

const input = readInput();
const cwd = input.cwd ?? process.cwd();
const path = repoRelative(repoRoot(cwd), input.tool_input?.file_path ?? "");
const reason = DATA_DIR.test(path)
  ? "student PII under data/, gitignored and guarded; never write there (AGENTS.md, hard rule 1)"
  : PROTECTED.get(path);

if (reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: `${path} is ${reason}.`,
      },
    })
  );
}
