// The project partner surveys as Qualtrics .qsf files: the Midterm Pulse
// (#440) and the End-of-Term Survey of each term (#446). Pure: no DOM, no
// I/O. The rubric CSV gives the questions' criteria, statements, and choices
// (#437), so the labels the export carries are the ones the scorer
// (partner-scoring.mjs) maps; the end-of-term facets' choices and the
// "What it looks like" lists come through partner-facets.mjs, and the rest
// of the wording is in src/data/partner-evaluation.mjs.
//
// Survey Flow, in order:
//   1. Embedded data: the contact list's fields, declared with no value so
//      its values stand, then any field the variant sets to a fixed value
//      (the end-of-term survey's Term, so the export names its term).
//   2. Guard: when Team is empty (not a personal link), one page telling the
//      respondent to use the personal link, then the end of the survey.
//   3. The variant's rating page.
//   4. The concern and comment questions every partner survey shares: Q2
//      (Yes or No), Q2 Names and Q2 Comments shown on Yes, and Q3.

import {
  concernText,
  criterionNotes,
  customScaleText,
  finalIntro,
  guardText,
  ladderPrompts,
  pulseIntro,
  pulsePrompt,
} from "../../data/partner-evaluation.mjs";
import {
  customScaleChoice,
  facetChoices,
  facetTag,
  isLadder,
} from "./partner-facets.mjs";
import {
  createSurvey,
  descriptive,
  embeddedFields,
  essay,
  isEmpty,
  likertMatrix,
  PAGE_BREAK,
  sharedScale,
  shownWhenSelected,
  singleChoice,
  singleLine,
  staticFields,
  surveyName,
} from "./qsf.mjs";
import { descending } from "./rubric-bands.mjs";
import { finalSurvey, TERMS } from "./term-label.mjs";

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
  const columns = sharedScale(rubric.name, rubric.criteria, (criterion) =>
    ascending(criterion).map((r) => r.name)
  );
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

/** A facet's rating, as the guidance page lists it. */
const anchorItem = (rating) =>
  rating.description === ""
    ? `<li><b>${rating.name}</b></li>`
    : `<li><b>${rating.name}</b>: ${rating.description}</li>`;

/**
 * The text block above one facet's question: its name, its "What it looks
 * like" list from the partner evaluation page, and its anchors or rungs
 * with the CSV's descriptions, highest first.
 */
function facetGuide(criterion, bullets) {
  const ratings = descending(criterion);
  return [
    `<b>${criterion.title}</b>`,
    `<b>What it looks like</b><ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`,
    `<b>${isLadder(criterion) ? "The rungs" : "The anchors"}</b><ul>${ratings.map(anchorItem).join("")}</ul>`,
  ].join("<br>");
}

/**
 * The end-of-term facets' questions, checked against the rubric and the
 * page's rules (pageRules): every criterion needs a statement, a "What it
 * looks like" list, and a tag no other facet has, and a ladder needs its
 * prompt in ladderPrompts.
 */
function facetQuestions(rubric, rules) {
  const tags = rubric.criteria.map(facetTag);
  const problems = rubric.criteria.flatMap((criterion, i) => [
    ...(criterion.description === ""
      ? [`no statement (Criteria Description) for ${criterion.title}`]
      : []),
    ...(rules?.guidance?.[criterion.title]?.length
      ? []
      : [`no "What it looks like" list for ${criterion.title}`]),
    ...(tags.indexOf(tags[i]) === i
      ? []
      : [`the tag ${tags[i]} twice (${criterion.title})`]),
    ...(isLadder(criterion) && !ladderPrompts[tags[i]]
      ? [`no ladder prompt for ${tags[i]} (${criterion.title})`]
      : []),
  ]);
  if (problems.length > 0) {
    throw new Error(`The ${rubric.name} survey has ${problems.join("; ")}.`);
  }
  return rubric.criteria.map((criterion, i) => {
    const choices = facetChoices(criterion, rules.between);
    const custom = customScaleChoice(criterion, choices);
    const prompt = isLadder(criterion)
      ? ladderPrompts[tags[i]]
      : criterion.description;
    return {
      choices: [
        ...choices.map((choice) => choice.label),
        ...(custom ? [customScaleText(custom)] : []),
      ],
      custom,
      guide: facetGuide(criterion, rules.guidance[criterion.title]),
      tag: tags[i],
      text: `${criterion.title}: ${prompt}`,
    };
  });
}

/**
 * The End-of-Term Survey of one term: `term` names it in the Term field.
 * Each facet is a page of its own, its guide above its question; the intro
 * shares the first.
 */
function finalVariant(term) {
  return {
    closeField: "FinalCloseDate",
    fields: ["Team", "FinalCloseDate"],
    metaDescription:
      "The project partner's end-of-term scores for one capstone team.",
    ratings(survey, { pageUrl, rubric, rules, weights }) {
      const facets = facetQuestions(rubric, rules);
      const intro = finalIntro({
        between: rules.between,
        facets: facets.length,
        finalWeight: weights.final,
        pageUrl,
      });
      const elements = [survey.add((qid) => descriptive(qid, "Start", intro))];
      for (const [i, facet] of facets.entries()) {
        if (i > 0) {
          elements.push(PAGE_BREAK);
        }
        elements.push(
          survey.add((qid) =>
            descriptive(qid, `${facet.tag} Guide`, facet.guide)
          ),
          survey.add((qid) =>
            singleChoice(qid, facet.tag, facet.text, facet.choices, {
              forced: true,
              numberEntry: facet.custom,
            })
          )
        );
      }
      return elements;
    },
    title: "Project Partner End-of-Term Survey",
    values: { Term: term },
  };
}

/**
 * The survey variants, keyed as the scorer's SURVEYS are. `title` is the
 * name partners see; `fields` the embedded data the contact list carries,
 * `Team` first; `closeField` the one of them the close date fills; `values`
 * the embedded data set to a fixed value in the flow; `metaDescription` the
 * survey's one-line summary; `ratings` adds the rating page's questions and
 * returns their IDs in page order, with PAGE_BREAK between pages.
 */
export const VARIANTS = {
  ...Object.fromEntries(
    TERMS.map((term) => [finalSurvey(term), finalVariant(term)])
  ),
  pulse: {
    closeField: "MidtermCloseDate",
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
    values: {},
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
 * `rules` (the end-of-term surveys only: pageRules of that page),
 * `label` (course and term, put in front of the survey name), `now` (a Date,
 * for the file's timestamps), `seed` (a number, for the generated IDs).
 */
export function buildPartnerSurvey({
  label = "",
  now = new Date(),
  pageUrl,
  rubric,
  rules,
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

  const rating = definition.ratings(survey, {
    pageUrl,
    rubric,
    rules,
    weights,
  });
  const guard = survey.add((qid) => descriptive(qid, "Guard", guardText));
  const concerns = concernQuestions(survey);

  const { title } = definition;
  const ratingBlock = block(title, rating, { type: "Default" });
  survey.trash();
  const guardBlock = block("Guard", [guard]);
  const notesBlock = block("Notes", concerns);

  // Flow IDs are numbered in flow order, so the elements are built in order.
  const embedded = {
    EmbeddedData: [
      ...embeddedFields(definition.fields),
      ...staticFields(definition.values),
    ],
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
