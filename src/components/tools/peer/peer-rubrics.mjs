// The peer rubrics, read at build time by the peer tools pages. Every
// variant's survey is built once here, so a rubric CSV the generator cannot
// use fails the build rather than the page.

import catmeCsv from "/canvas/assignments/peer-evaluation/catme-rubric.csv?raw";
import peerCsv from "/canvas/assignments/peer-evaluation/peer-evaluation-rubric.csv?raw";
import { variants } from "../../../data/peer-evaluation.mjs";
import { parseRubricCsv } from "../../../lib/rubric-csv.mjs";
import { buildPeerSurvey } from "../../../lib/tools/peer-survey-qsf.mjs";

/** The parsed rubric of each instrument, as the scorer reads them. */
export const byInstrument = {
  catme: parseRubricCsv(catmeCsv, "catme-rubric.csv"),
  regular: parseRubricCsv(peerCsv, "peer-evaluation-rubric.csv"),
};

/** The parsed rubric of each survey variant, as the generator reads them. */
export const byVariant = Object.fromEntries(
  Object.entries(variants).map(([key, { instrument }]) => [
    key,
    byInstrument[instrument],
  ])
);

for (const [variant, rubric] of Object.entries(byVariant)) {
  buildPeerSurvey({ rubric, variant });
}
