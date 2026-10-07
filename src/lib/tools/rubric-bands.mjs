// Which rubric rating a score is named after, for every scorer (#437), and
// the one way a share of a criterion's points is computed. Pure: no DOM, no I/O.

/** `percent` of `points`, multiplied before dividing: 70% of 5 is 3.5. */
export function percentOf(points, percent) {
  return Math.round(points * percent * 100) / 10_000;
}

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
