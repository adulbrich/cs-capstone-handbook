// The default course-and-term label for a generated survey, such as
// CS_461_001_F<year>, from the month alone, as src/lib/term-tabs.js picks
// the current term: no date is written down (AGENTS.md, hard rule 5).

/** Each term's course and letter. */
const TERMS = {
  fall: { course: 461, letter: "F" },
  spring: { course: 463, letter: "S" },
  winter: { course: 462, letter: "W" },
};

/** The term of `date`: getMonth() 0 to 2 is winter, 3 to 5 spring, 6 to 11 fall. */
export function termOf(date) {
  const month = date.getMonth();
  if (month < 3) {
    return "winter";
  }
  return month < 6 ? "spring" : "fall";
}

/**
 * The label for `term` in the course year `date` falls in, section 001:
 * `CS_461_001_F` and the year. A course year runs fall, winter, spring, so
 * winter and spring carry the year after fall's.
 */
export function labelFor(term, date = new Date()) {
  const { course, letter } = TERMS[term];
  const fallYear =
    termOf(date) === "fall" ? date.getFullYear() : date.getFullYear() - 1;
  const year = term === "fall" ? fallYear : fallYear + 1;
  return `CS_${course}_001_${letter}${year}`;
}

/** The label for `date`'s own term. */
export const defaultLabel = (date = new Date()) => labelFor(termOf(date), date);
