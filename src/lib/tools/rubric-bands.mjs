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

/**
 * The rating a points value is named after (bandFor: the highest at or
 * below it). Points outside the bands are named after the nearest band: a
 * peer distribution above 20 points is the top band, a non-completer's 10 on
 * the distribution or a partner score the instructor sets below the lowest
 * rating is the lowest. The points written stay exact.
 */
export function ratingFor(criterion, points) {
  const lowest = Math.min(...criterion.ratings.map((r) => r.points));
  const named = Math.min(Math.max(points, lowest), criterion.maxPoints);
  return bandFor(criterion, named).name;
}
