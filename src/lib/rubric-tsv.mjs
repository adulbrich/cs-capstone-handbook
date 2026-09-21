/**
 * The one parser for a Canvas rubric TSV (#144).
 *
 * `RubricTable.astro` renders these files and `scripts/validate-outcomes.mjs`
 * reconciles them against each page's frontmatter. Both used to walk the
 * format themselves, which is how they came to disagree about stripping `\r`
 * and about what counts as an outcome tag. One parser, imported by both.
 *
 * The format is Canvas's rubric import ordering, headerless and tab
 * separated:
 *
 *   0: criterion title, with its outcome tags in brackets ("Blameless [SO4]")
 *   1: criterion description, or empty
 *   2: use_range ("true"/"false"); Canvas reads it, the handbook does not
 *   3+: repeating rating groups of three (points, band name, description)
 *
 * Reading the rating groups as a repeating triple rather than a fixed count
 * is what lets one parser serve every shape in this repository: nine fields
 * for a pass/fail rubric, twelve for the usual three bands, and fifteen for
 * `defense`, which carries a fourth `Missing` band.
 */

/** The outcome IDs the accreditation record recognises. Nothing else is a tag. */
export const OUTCOME_TAG_RE = /^(SO[1-6]|L(07|08|09|10))$/;

const TRAILING_BRACKET_RE = /\s*\[([^\]]+)\]\s*$/;
const TRAILING_CR_RE = /\r$/;
const FIRST_RATING = 3;
const RATING_GROUP_WIDTH = 3;

/** The bracketed tag list on a criterion title, or null when there is none. */
function readTags(rawTitle) {
  const bracket = rawTitle.match(TRAILING_BRACKET_RE);
  if (!bracket) {
    return null;
  }
  const candidates = bracket[1].split(",").map((tag) => tag.trim());
  // Only outcome IDs are tags. A trailing bracket holding anything else stays
  // part of the title rather than being published to students as
  // accreditation evidence that does not exist.
  return candidates.every((tag) => OUTCOME_TAG_RE.test(tag))
    ? candidates
    : null;
}

/** The repeating three-field rating groups, in order. */
function readRatings(cells, row, sourceLabel) {
  const ratings = [];
  for (let i = FIRST_RATING; i < cells.length; i += RATING_GROUP_WIDTH) {
    const rawPoints = (cells[i] ?? "").trim();
    const name = (cells[i + 1] ?? "").trim();
    const description = (cells[i + 2] ?? "").trim();
    // Stop at the first wholly empty group, testing the raw points cell rather
    // than Number(): `Number("")` is 0, which is finite, so a trailing tab run
    // would otherwise be pushed as a nameless zero-point band and rendered.
    if (!(rawPoints || name || description)) {
      break;
    }
    const points = Number(rawPoints);
    if (!Number.isFinite(points) || points < 0) {
      throw new Error(
        `rubric TSV ${sourceLabel} row ${row}, band "${name || "(unnamed)"}": points cell is "${rawPoints}". A typo here scores zero silently and, in any band but the top one, still totals 100.`
      );
    }
    ratings.push({ description, name, points });
  }
  return ratings;
}

function parseRow(line, row, sourceLabel) {
  const cells = line.split("\t");

  // A stray tab inside a field shifts every rating group after it and is
  // otherwise silent: the row still parses, just into the wrong columns.
  const ratingCells = cells.length - FIRST_RATING;
  if (ratingCells < RATING_GROUP_WIDTH || ratingCells % RATING_GROUP_WIDTH) {
    throw new Error(
      `rubric TSV ${sourceLabel} row ${row}: ${cells.length} fields, which is not 3 plus a whole number of 3-field rating groups. A tab inside a field will do this.`
    );
  }

  const rawTitle = (cells[0] ?? "").trim();
  const tags = readTags(rawTitle);
  const ratings = readRatings(cells, row, sourceLabel);

  return {
    description: (cells[1] ?? "").trim(),
    maxPoints: Math.max(0, ...ratings.map((r) => r.points)),
    ratings,
    tags: tags ?? [],
    title: tags ? rawTitle.replace(TRAILING_BRACKET_RE, "") : rawTitle,
  };
}

/**
 * @param {string} tsvText raw file contents
 * @param {string} sourceLabel repository-relative path, for error messages
 * @returns {{title: string, tags: string[], description: string,
 *            ratings: {points: number, name: string, description: string}[],
 *            maxPoints: number}[]}
 */
export function parseRubricTsv(tsvText, sourceLabel) {
  if (!tsvText?.trim()) {
    throw new Error(`rubric TSV ${sourceLabel} is empty or missing.`);
  }
  const criteria = tsvText
    .split("\n")
    .map((line) => line.replace(TRAILING_CR_RE, ""))
    .filter((line) => line.trim().length > 0)
    .map((line, index) => parseRow(line, index + 1, sourceLabel));

  return criteria;
}

/** Each criterion's highest band, summed. */
export function rubricTotal(criteria) {
  return criteria.reduce((sum, c) => sum + c.maxPoints, 0);
}

/** Outcome tag -> how many criteria carry it. */
export function rubricTagCounts(criteria) {
  const counts = {};
  for (const c of criteria) {
    for (const tag of c.tags) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }
  return counts;
}
