/**
 * PostToolUse on Edit and Write: the prose rule, the two content validators
 * and Biome, reported on the edit that caused the problem rather than at
 * commit time.
 *
 * PostToolUse cannot block, but stderr on exit 2 is shown to the model, which
 * is the point: the same finding lefthook would make at pre-commit, a few
 * minutes earlier and one file at a time. `check-prose.mjs` takes the one
 * file. `validate-dashes.mjs` and `validate-dates.mjs` walk their directories
 * whole and are run as they are when the edit lands under one of them; both
 * finish in well under a second. Biome decides for itself which files it
 * covers (`files.includes` in biome.jsonc); `--no-errors-on-unmatched` keeps
 * an excluded path from reading as a failure.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { loadRuleScripts, readInput, repoRelative, repoRoot } from "./lib.mjs";

const BIOME_EXTENSIONS = /\.(?:[cm]?jsx?|tsx?|jsonc?|css|astro)$/;
/** Where validate-dashes.mjs and validate-dates.mjs look. */
const CONTENT_PATH = /^(?:src|canvas|public|decks)\/|^STAFF-RUNBOOK\.md$/;

const input = readInput();
const root = repoRoot(input.cwd ?? process.cwd());
const path = repoRelative(root, input.tool_input?.file_path ?? "");

if (!path || path.startsWith("../") || !existsSync(`${root}/${path}`)) {
  process.exit(0);
}

let failed = false;
const { isCheckedPath } = await loadRuleScripts(root);

/** Run a repo script; on a non-zero exit, relay its output and mark failure. */
function runScript(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(`${result.stdout}${result.stderr}`);
  }
}

if (isCheckedPath(path)) {
  runScript(["scripts/check-prose.mjs", path]);
}

if (CONTENT_PATH.test(path)) {
  runScript(["scripts/validate-dashes.mjs"]);
  runScript(["scripts/validate-dates.mjs"]);
}

const biome = `${root}/node_modules/.bin/biome`;
if (BIOME_EXTENSIONS.test(path) && existsSync(biome)) {
  const result = spawnSync(biome, ["check", "--no-errors-on-unmatched", path], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    failed = true;
    process.stderr.write(
      `Biome reports on ${path} (run \`npm run format\` for the safe fixes):\n${result.stdout}${result.stderr}`
    );
  }
}

process.exit(failed ? 2 : 0);
