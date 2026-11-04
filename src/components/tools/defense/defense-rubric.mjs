// The defense rubric and the session length, read at build time from the
// files the handbook renders, so the scoresheets never carry a second copy
// of a question, an item, a red flag, or a point value. A rubric the live
// sheet cannot print fails the build rather than the page.
//
// It lives beside the components, not under src/lib/tools/, because it
// reads the files through Vite's `?raw` imports, which only the build
// resolves; node --test cannot load it. The logic it calls (parseRubricCsv,
// liveSheet, sessionRule) is tested on the same files read from disk
// (defense-sheets.test.mjs).

import defenseCsv from "/canvas/assignments/defense/defense-rubric.csv?raw";
import defenseMdx from "/src/content/docs/assignments/defense.mdx?raw";
import { parseRubricCsv } from "../../../lib/rubric-csv.mjs";
import { liveSheet, sessionRule } from "../../../lib/tools/defense-sheets.mjs";

const LABEL = "canvas/assignments/defense/defense-rubric.csv";

/** The live sheet: `{ criteria, rule, total }`. */
export const sheet = liveSheet(parseRubricCsv(defenseCsv, LABEL), LABEL);

/** Minutes per student, of setup and wrap, and the session weeks, from the defense page. */
export const session = sessionRule(defenseMdx);
