// The project partner surveys as Qualtrics .qsf files: the Midterm Pulse
// (#440) and the End-of-Term Survey of each term (#446). Pure: no DOM, no
// I/O. The rubric CSV gives the questions' criteria, statements, and choices
// (#437), so the labels the export carries are the ones the scorer
// (partner-scoring.mjs) maps; the end-of-term facets' choices and the
// "What it looks like" lists come through partner-facets.mjs, and the rest
// of the wording is in src/data/partner-evaluation.mjs.
//
// Every rated question has comment boxes under it, shown on the same page
// by its answer (#535): at the top answer an optional one, below it a
// required one; a ladder has one optional box on every rung. The scorer
// writes them into the rubric's Comments cells, which the team reads.
//
// Survey Flow, in order:
//   1. Embedded data: the contact list's fields, declared with no value so
//      its values stand, then any field the variant sets to a fixed value
//      (the end-of-term survey's Term, so the export names its term).
//   2. The variant's rating pages.
//   3. The concern and comment questions every partner survey shares: Q2
//      (Yes or No), Q2 Names and Q2 Comments shown on its page on Yes, and Q3,
//      on the last page, whose button reads Submit.

import {
  commentText,
  concernText,
  facetTop,
  finalIntro,
  ladderPrompts,
  pulseIntro,
} from "../../data/partner-evaluation.mjs";
import { facetOffer, facetTag, isLadder } from "./partner-facets.mjs";
import {
  createSurvey,
  descriptive,
  embeddedFields,
  essay,
  lastPageOptions,
  PAGE_BREAK,
  sharedScale,
  shownInPageWhen,
  singleChoice,
  singleLine,
  staticFields,
  surveyName,
} from "./qsf.mjs";
import { descending } from "./rubric-bands.mjs";
import { finalSurvey, TERMS } from "./term-label.mjs";

/**
 * The export tags of the concern questions every partner survey asks, and
 * the field that names an end-of-term survey's term: the scorer
 * (partner-scoring.mjs) reads the export by these names.
 */
export const CONCERN_TAGS = {
  comments: "Q2 Comments",
  flag: "Q2",
  names: "Q2 Names",
  other: "Q3",
};
export const TERM_FIELD = "Term";

/**
 * The export tags of a rated question's comment boxes, from its own tag:
 * `keep`, shown at the top answer, and `comment`, shown below it. A ladder
 * has only `comment`, shown on every rung; its `keep` is null.
 */
export const commentTags = (tag, { ladder = false } = {}) => ({
  comment: `${tag} Comment`,
  keep: ladder ? null : `${tag} Keep`,
});

/**
 * The pulse's one scale, from a rubric whose criteria share it: `ratings`,
 * its rating names highest first, and `lowest` and `highest`.
 * Throws when a criterion has no statement or the criteria's ratings differ.
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
  const ratings = sharedScale(rubric.name, rubric.criteria, (criterion) =>
    descending(criterion).map((r) => r.name)
  );
  return {
    highest: ratings[0],
    lowest: ratings.at(-1),
    ratings,
  };
}

/**
 * Adds one rated question and the comment boxes under it, on the same page,
 * and returns their IDs. `choices` are the answers, the top one first;
 * `numberEntry` a ladder's custom-scale box (singleChoice); `title` the
 * criterion's name; `top` what the required comment asks to reach;
 * `ladder` gives one optional box on every answer instead.
 */
function ratedQuestion(
  survey,
  { choices, ladder = false, numberEntry = null, tag, text, title, top }
) {
  const rating = survey.add((qid) =>
    singleChoice(qid, tag, text, choices, { forced: true, numberEntry })
  );
  const tags = commentTags(tag, { ladder });
  if (ladder) {
    return [
      rating,
      survey.add((qid) => essay(qid, tags.comment, commentText.ladder(title))),
    ];
  }
  const source = survey.payload(rating);
  const below = choices.map((_, i) => i + 1).slice(1);
  return [
    rating,
    survey.add((qid) => ({
      ...essay(qid, tags.keep, commentText.keep(title)),
      ...shownInPageWhen(source, [1]),
    })),
    survey.add((qid) => ({
      ...essay(qid, tags.comment, commentText.improve(title, top), {
        forced: true,
      }),
      ...shownInPageWhen(source, below),
    })),
  ];
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
  return rubric.criteria.map((criterion) => {
    const { choices, custom, tag } = facetOffer(criterion, rules.between);
    const prompt = isLadder(criterion)
      ? ladderPrompts[tag]
      : criterion.description;
    return {
      choices: [
        ...choices.map((choice) => choice.label),
        ...(custom ? [custom.label] : []),
      ],
      custom,
      guide: facetGuide(criterion, rules.guidance[criterion.title]),
      ladder: isLadder(criterion),
      tag,
      text: `${criterion.title}: ${prompt}`,
      title: criterion.title,
    };
  });
}

/**
 * The End-of-Term Survey of one term: `term` names it in the Term field.
 * Each facet is a page of its own, its guide above its question and its
 * comment boxes; the intro shares the first.
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
          ...ratedQuestion(survey, {
            choices: facet.choices,
            ladder: facet.ladder,
            numberEntry: facet.custom,
            tag: facet.tag,
            text: facet.text,
            title: facet.title,
            top: facetTop,
          })
        );
      }
      return elements;
    },
    title: "Project Partner End-of-Term Survey",
    values: { [TERM_FIELD]: term },
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
      const { highest, lowest, ratings } = pulseScale(rubric);
      const intro = pulseIntro({
        finalWeight: weights.final,
        highest,
        lowest,
        pageUrl,
        pulseWeight: weights.pulse,
        statements: rubric.criteria.length,
      });
      const tags = rubric.criteria.map(facetTag);
      const repeated = tags.filter((tag, i) => tags.indexOf(tag) !== i);
      if (repeated.length > 0) {
        throw new Error(
          `The ${rubric.name} survey has the tag ${repeated.join(", ")} twice: two statements' names start with the same word.`
        );
      }
      // One page: the intro, then each statement with its comment boxes.
      return [
        survey.add((qid) => descriptive(qid, "Start", intro)),
        ...rubric.criteria.flatMap((criterion) =>
          ratedQuestion(survey, {
            choices: ratings,
            tag: facetTag(criterion),
            text: `${criterion.title}: ${criterion.description}`,
            title: criterion.title,
            top: highest,
          })
        ),
      ];
    },
    title: "Project Partner Midterm Pulse",
    values: {},
  },
};

/** The concern and comment questions, with the tags the scorer reads. */
function concernQuestions(survey) {
  const flag = survey.add((qid) =>
    singleChoice(qid, CONCERN_TAGS.flag, concernText.flag, ["Yes", "No"])
  );
  const onYes = shownInPageWhen(survey.payload(flag), [1]);
  return [
    flag,
    survey.add((qid) => ({
      ...singleLine(qid, CONCERN_TAGS.names, concernText.names),
      ...onYes,
    })),
    survey.add((qid) => ({
      ...essay(qid, CONCERN_TAGS.comments, concernText.comments),
      ...onYes,
    })),
    survey.add((qid) => essay(qid, CONCERN_TAGS.other, concernText.other)),
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
  const concerns = concernQuestions(survey);

  const { title } = definition;
  const ratingBlock = block(title, rating, { type: "Default" });
  survey.trash();
  const notesBlock = block("Notes", concerns, { options: lastPageOptions });

  // Flow IDs are numbered in flow order, so the elements are built in order.
  const embedded = {
    EmbeddedData: [
      ...embeddedFields(definition.fields),
      ...staticFields(definition.values),
    ],
    FlowID: flowId(),
    Type: "EmbeddedData",
  };
  const ratingFlow = defaultBlock(ratingBlock);
  const notesFlow = standard(notesBlock);

  return survey.finish({
    flow: [embedded, ratingFlow, notesFlow],
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
