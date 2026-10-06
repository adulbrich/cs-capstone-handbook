// The project partner surveys as Qualtrics .qsf files (#440). Pure: no DOM,
// no I/O. The rubric CSV gives the questions' criteria, statements, and
// scale (#437), so the labels the export carries are the rating names the
// scorer (partner-scoring.mjs) maps; the rest of the wording is in
// src/data/partner-evaluation.mjs.
//
// Survey Flow, in order:
//   1. Embedded data, declared with no value so the contact list's values stand.
//   2. Guard: when Team is empty (not a personal link), one page telling the
//      respondent to use the personal link, then the end of the survey.
//   3. The variant's rating page.
//   4. The concern and comment questions every partner survey shares: Q2
//      (Yes or No), Q2 Names and Q2 Comments shown on Yes, and Q3.
//
// One variant so far, the Midterm Pulse. The end-of-term surveys (#446) add
// an entry to VARIANTS with their own rating page and embedded fields.

import {
  concernText,
  criterionNotes,
  guardText,
  pulseIntro,
  pulsePrompt,
} from "../../data/partner-evaluation.mjs";
import {
  createSurvey,
  descriptive,
  embeddedFields,
  essay,
  isEmpty,
  likertMatrix,
  shownWhenSelected,
  singleChoice,
  singleLine,
  surveyName,
} from "./qsf.mjs";

/** A rubric's ratings, lowest points first: the scale's columns, in order. */
const ascending = (criterion) =>
  [...criterion.ratings].sort((a, b) => a.points - b.points);

/**
 * The matrix rows and columns from a rubric whose criteria share one scale:
 * each row "<criterion>: <statement>", each column a rating name, lowest
 * first, and `notes` the criterionNotes filled for the rubric. Throws when
 * a criterion has no statement or the criteria's ratings differ.
 */
export function pulseScale(rubric) {
  const missing = rubric.criteria
    .filter((criterion) => criterion.description === "")
    .map((criterion) => criterion.title);
  if (missing.length > 0) {
    throw new Error(
      `The ${rubric.name} rubric CSV has no statement (Criteria Description) for ${missing.join(", ")}.`
    );
  }
  const names = (criterion) => ascending(criterion).map((r) => r.name);
  const columns = names(rubric.criteria[0]);
  const differing = rubric.criteria
    .filter((criterion) => names(criterion).join("|") !== columns.join("|"))
    .map((criterion) => criterion.title);
  if (differing.length > 0) {
    throw new Error(
      `The ${rubric.name} rubric's criteria must share one scale for the matrix; ${differing.join(", ")} differ from ${rubric.criteria[0].title}.`
    );
  }
  const middle = columns[Math.floor(columns.length / 2)];
  const notes = rubric.criteria
    .filter((criterion) => criterionNotes[criterion.title.toLowerCase()])
    .map((criterion) =>
      criterionNotes[criterion.title.toLowerCase()]
        .replace("{middle}", middle)
        .replace("{criterion}", criterion.title)
    );
  return {
    columns,
    notes,
    rows: rubric.criteria.map(
      (criterion) => `${criterion.title}: ${criterion.description}`
    ),
  };
}

/**
 * The survey variants. `title` is the name partners see; `fields` the
 * embedded data the contact list carries, `Team` first; `metaDescription`
 * the survey's one-line summary; `ratings` adds the rating page's questions
 * and returns their IDs in page order.
 */
export const VARIANTS = {
  pulse: {
    fields: ["Team", "MidtermCloseDate"],
    metaDescription:
      "Statements about how one capstone team works with its project partner.",
    ratings(survey, { pageUrl, rubric, weights }) {
      const { columns, notes, rows } = pulseScale(rubric);
      const intro = pulseIntro({
        finalWeight: weights.final,
        highest: columns.at(-1),
        lowest: columns[0],
        notes,
        pageUrl,
        pulseWeight: weights.pulse,
        statements: rows.length,
      });
      // The matrix is QID1, as in the reference survey, so the export's
      // ImportIds are QID1_1 to QID1_4; the intro shows above it.
      const matrix = survey.add((qid) =>
        likertMatrix(qid, "Q1", pulsePrompt, rows, columns)
      );
      return [survey.add((qid) => descriptive(qid, "Start", intro)), matrix];
    },
    title: "Project Partner Midterm Pulse",
  },
};

/** The concern and comment questions, with the tags the scorer reads. */
function concernQuestions(survey) {
  const flag = survey.add((qid) =>
    singleChoice(qid, "Q2", concernText.flag, ["Yes", "No"])
  );
  const onYes = shownWhenSelected(survey.payload(flag), 1);
  return [
    flag,
    survey.add((qid) => ({
      ...singleLine(qid, "Q2 Names", concernText.names),
      DisplayLogic: onYes,
    })),
    survey.add((qid) => ({
      ...essay(qid, "Q2 Comments", concernText.comments),
      DisplayLogic: onYes,
    })),
    survey.add((qid) => essay(qid, "Q3", concernText.other)),
  ];
}

/**
 * Builds one partner survey as a .qsf object.
 *
 * Options: `variant` (a key of VARIANTS), `rubric` (that survey's rubric,
 * from parseRubricCsv), `weights` (`{ pulse, final }`, percent of the term
 * grade, from the partner evaluation page), `pageUrl` (that page's address),
 * `label` (course and term, put in front of the survey name), `now` (a Date,
 * for the file's timestamps), `seed` (a number, for the generated IDs).
 */
export function buildPartnerSurvey({
  label = "",
  now = new Date(),
  pageUrl,
  rubric,
  seed = now.getTime(),
  variant = "pulse",
  weights,
}) {
  const definition = VARIANTS[variant];
  if (!definition) {
    throw new Error(`Unknown variant "${variant}".`);
  }
  const survey = createSurvey(seed);
  const { block, defaultBlock, flowId, standard } = survey;

  const rating = definition.ratings(survey, { pageUrl, rubric, weights });
  const guard = survey.add((qid) => descriptive(qid, "Guard", guardText));
  const concerns = concernQuestions(survey);

  const { title } = definition;
  const ratingBlock = block(title, rating, { type: "Default" });
  survey.trash();
  const guardBlock = block("Guard", [guard]);
  const notesBlock = block("Notes", concerns);

  // Flow IDs are numbered in flow order, so the elements are built in order.
  const embedded = {
    EmbeddedData: embeddedFields(definition.fields),
    FlowID: flowId(),
    Type: "EmbeddedData",
  };
  const guardId = flowId();
  const guardFlow = {
    BranchLogic: isEmpty("Team"),
    Description: "New Branch",
    Flow: [standard(guardBlock), { FlowID: flowId(), Type: "EndSurvey" }],
    FlowID: guardId,
    Type: "Branch",
  };
  const ratingFlow = defaultBlock(ratingBlock);
  const notesFlow = standard(notesBlock);

  return survey.finish({
    flow: [embedded, guardFlow, ratingFlow, notesFlow],
    metaDescription: definition.metaDescription,
    name: surveyName(label, title),
    now,
    title,
  });
}

/** The survey as .qsf file text. */
export function partnerSurveyQsf(options) {
  return JSON.stringify(buildPartnerSurvey(options));
}
