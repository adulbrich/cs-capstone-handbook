// Which rubric rating a score is named after, for every scorer (#437).
// Pure: no DOM, no I/O.

/** A criterion's ratings, highest points first. */
export const descending = (criterion) =>
  [...criterion.ratings].sort((a, b) => b.points - a.points);

/**
 * The rating a score between two ratings is named after: the highest rating
 * whose points are at or below `points` (the instructor's rule for every
 * scorer, #437, not Canvas's range reading). The points themselves stay
 * exact. Throws on a score below the lowest rating or above the highest.
 */
export function bandFor(criterion, points) {
  const ratings = descending(criterion);
  const rating = ratings.find((r) => r.points <= points);
  if (!rating || points > criterion.maxPoints) {
    throw new Error(
      `${points} is outside ${criterion.title}'s ${ratings.at(-1).points} to ${criterion.maxPoints} points.`
    );
  }
  return rating;
}
