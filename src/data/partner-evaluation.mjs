// The project partner surveys' wording that no rubric holds. The statements,
// the scale, and the criterion names come from the rubric CSVs under
// canvas/assignments/project-partner-evaluation/; the generator
// (src/lib/tools/partner-survey-qsf.mjs) reads both. Edit the wording here,
// never in a generated .qsf. `${e://...}` is Qualtrics piped text.

import { finalSurvey, TERMS } from "../lib/tools/term-label.mjs";

/** The matrix question's text: each export column reads "<prompt> - <row>". */
export const pulsePrompt =
  "Please rate your student team on the following dimensions for the current term.";

/**
 * Notes on how to answer one criterion, keyed by its rubric name in lower
 * case. `{middle}` is the scale's middle rating and `{criterion}` the
 * criterion's name, both filled from the rubric CSV.
 */
export const criterionNotes = {
  reflection:
    "If you have not given the team feedback yet, answer {middle} on {criterion}.",
};

/** The lines every partner survey's opening page starts with. */
const introHead = [
  "Thank you for partnering with the OSU Computer Science Capstone.",
  "This survey is about one team: <b>${e://Field/Team}</b>",
];

/** The lines every partner survey's opening page ends with. */
const introTail = (pageUrl) => [
  "If a specific student is not contributing, name them below. That starts a review against peer evaluations and the team's records; it does not change a grade by itself.",
  "You can also leave comments on the course at the end.",
  `<a href="${pageUrl}">Learn more about project partner evaluations and how they are used to assess students.</a>`,
];

/**
 * The pulse's opening page. `statements` is how many the matrix rates,
 * `lowest` and `highest` the scale's ends, `notes` the filled
 * criterionNotes, `pulseWeight` and `finalWeight` the two surveys' percent
 * of the term grade, `pageUrl` the partner evaluation page.
 */
export function pulseIntro({
  finalWeight,
  highest,
  lowest,
  notes,
  pageUrl,
  pulseWeight,
  statements,
}) {
  return [
    ...introHead,
    `It has ${statements} statements about how the team works with you, each rated from ${lowest} to ${highest}. It takes about two minutes. <b>Please submit it by \${e://Field/MidtermCloseDate}.</b>`,
    `Your answers set ${pulseWeight}% of each student's grade this term. The end-of-term survey sets ${finalWeight}% and goes into more depth. This midterm check exists so the team hears from you while there is still time to change course.`,
    ...notes,
    ...introTail(pageUrl),
  ].join("<br><br>");
}

/**
 * The End-of-Term Survey's opening page. `facets` is how many it scores,
 * `between` the between-anchor shares in percent, `finalWeight` its percent
 * of the term grade, `pageUrl` the partner evaluation page.
 */
export function finalIntro({ between, facets, finalWeight, pageUrl }) {
  return [
    ...introHead,
    `It scores the team on ${facets} facets of its work with you this term, one page each. Each facet shows what it looks like and its written anchors; choose the anchor that fits the team. When the team sits between two anchors, choose the between answer, worth ${between.join("% or ")}% of the facet's points. <b>Please submit it by \${e://Field/FinalCloseDate}.</b>`,
    `Your answers set ${finalWeight}% of each student's grade this term.`,
    ...introTail(pageUrl),
  ].join("<br><br>");
}

/**
 * The question a facet scored on a ladder asks, after "<facet>: ", keyed by
 * the facet's export tag (facetTag). It replaces the rubric's description,
 * which speaks about the partner to the student.
 */
export const ladderPrompts = {
  VnV: "Who has run the team's software? Pick the highest rung that is true today; your team's Definition of Shipped says what each rung means for this project. If it records a custom scale, score on that scale with the last choice.",
};

/**
 * The ladder's last choice, for a partner whose Definition of Shipped
 * records a custom scale (#18): its text box takes the share of the points,
 * from `min` to `max` percent.
 */
export const customScaleText = ({ max, min }) =>
  `We agreed a custom scale in the Definition of Shipped. Enter the score as a percent of the points, ${min} to ${max}:`;

/** The end-of-term distribution email: one survey for every term. */
const finalEmail = {
  body: [
    "Hello,",
    "",
    "This is the end-of-term survey for your capstone team ${e://Field/Team}: it scores the team's work with you this term, facet by facet.",
    "",
    "Please answer for ${e://Field/Team} by ${e://Field/FinalCloseDate}.",
    "",
    "${l://SurveyLink?d=Take the survey}",
    "",
    "If you work with more than one team, each team has its own email and its own link.",
    "",
    "Thank you,",
    "The CS Capstone instruction team",
    "",
    "${l://OptOutLink?d=Unsubscribe}",
  ].join("\n"),
  subject: "CS Capstone end-of-term survey: ${e://Field/Team}",
};

/**
 * The distribution email, by survey variant. Qualtrics sets it on the
 * distribution, not in the .qsf, so the tools page shows it to copy. A
 * partner with two teams gets two emails; the team in the subject keeps mail
 * clients from threading them into one. `${l://...}` is Qualtrics's link
 * piped text: the personal survey link and the opt-out link it requires.
 */
export const distributionEmails = {
  ...Object.fromEntries(TERMS.map((term) => [finalSurvey(term), finalEmail])),
  pulse: {
    body: [
      "Hello,",
      "",
      "This is the midterm pulse for your capstone team ${e://Field/Team}: a short survey about how the team works with you, about two minutes.",
      "",
      "Please answer for ${e://Field/Team} by ${e://Field/MidtermCloseDate}.",
      "",
      "${l://SurveyLink?d=Take the survey}",
      "",
      "If you work with more than one team, each team has its own email and its own link.",
      "",
      "Thank you,",
      "The CS Capstone instruction team",
      "",
      "${l://OptOutLink?d=Unsubscribe}",
    ].join("\n"),
    subject: "CS Capstone midterm pulse: ${e://Field/Team}",
  },
};

/** The concern and comment questions every partner survey ends with. */
export const concernText = {
  comments: "Explain your concern for each student listed above.",
  flag: "Do you have any specific concerns with one or more students on your team?",
  names: "Please list the names of the students you wish to comment on.",
  other: "What else would you like to share with the course instructors?",
};

/** The page a respondent sees when the survey opened without a team. */
export const guardText =
  "This survey opens only from your personal link. Use the personal link from your email.";
