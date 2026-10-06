// Which rubric rating a score is named after, for every scorer (#437).
// Pure: no DOM, no I/O.

/**
 * The rating a score between two ratings is named after: the highest rating
 * whose points are at or below `points` (the instructor's rule for every
 * scorer, #437, not Canvas's range reading). The points themselves stay
 * exact. Throws on a score below the lowest rating or above the highest.
 */
export function bandFor(criterion, points) {
  const descending = [...criterion.ratings].sort((a, b) => b.points - a.points);
  const rating = descending.find((r) => r.points <= points);
  if (!rating || points > criterion.maxPoints) {
    throw new Error(
      `${points} is outside ${criterion.title}'s ${descending.at(-1).points} to ${criterion.maxPoints} points.`
    );
  }
  return rating;
}
