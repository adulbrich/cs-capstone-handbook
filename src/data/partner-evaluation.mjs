// The project partner surveys' wording that no rubric holds. The statements,
// the scale, and the criterion names come from the rubric CSVs under
// canvas/assignments/project-partner-evaluation/; the generator
// (src/lib/tools/partner-survey-qsf.mjs) reads both. Edit the wording here,
// never in a generated .qsf. `${e://...}` is Qualtrics piped text.

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
    "Thank you for partnering with the OSU Computer Science Capstone.",
    "This survey is about one team: <b>${e://Field/Team}</b>",
    `It has ${statements} statements about how the team works with you, each rated from ${lowest} to ${highest}. It takes about two minutes. <b>Please submit it by \${e://Field/MidtermCloseDate}.</b>`,
    `Your answers set ${pulseWeight}% of each student's grade this term. The end-of-term survey sets ${finalWeight}% and goes into more depth. This midterm check exists so the team hears from you while there is still time to change course.`,
    ...notes,
    "If a specific student is not contributing, name them below. That starts a review against peer evaluations and the team's records; it does not change a grade by itself.",
    "You can also leave comments on the course at the end.",
    `<a href="${pageUrl}">Learn more about project partner evaluations and how they are used to assess students.</a>`,
  ].join("<br><br>");
}

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
