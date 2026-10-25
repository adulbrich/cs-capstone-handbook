// The partner rubrics and the rules both partner tools pages read, at build
// time, from the files the handbook renders, so a page never carries a
// second copy of a rating name, a point value, or the A lower bound.
//
// It lives beside the pages, not under src/lib/tools/, because it reads the
// files through Vite's `?raw` imports, which only the build resolves; node
// --test cannot load it. The logic it calls (parseRubricCsv, pageRules,
// aLowerBound) is tested on the same files read from disk
// (partner-survey-qsf.test.mjs).

import fallCsv from "/canvas/assignments/project-partner-evaluation/partner-final-fall-rubric.csv?raw";
import springCsv from "/canvas/assignments/project-partner-evaluation/partner-final-spring-rubric.csv?raw";
import winterCsv from "/canvas/assignments/project-partner-evaluation/partner-final-winter-rubric.csv?raw";
import pulseCsv from "/canvas/assignments/project-partner-evaluation/partner-pulse-rubric.csv?raw";
import partnerMdx from "/src/content/docs/assignments/project-partner-evaluation.mdx?raw";
import gradingMdx from "/src/content/docs/learning-objectives/grading.mdx?raw";
import { parseRubricCsv } from "../../../lib/rubric-csv.mjs";
import { pageRules } from "../../../lib/tools/partner-facets.mjs";
import { aLowerBound } from "../../../lib/tools/partner-scoring.mjs";

/** The pulse rubric and each term's end-of-term rubric, by survey key. */
export const rubrics = {
  fall: parseRubricCsv(fallCsv, "partner-final-fall-rubric.csv"),
  pulse: parseRubricCsv(pulseCsv, "partner-pulse-rubric.csv"),
  spring: parseRubricCsv(springCsv, "partner-final-spring-rubric.csv"),
  winter: parseRubricCsv(winterCsv, "partner-final-winter-rubric.csv"),
};

/** The no-response score's base, the lower bound of an A. */
export const aBound = aLowerBound(gradingMdx);

/**
 * The between-anchor shares and each facet's "What it looks like" list,
 * from the partner evaluation page.
 */
export const rules = pageRules(partnerMdx);
