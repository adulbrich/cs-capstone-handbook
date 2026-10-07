// The one way a share of a criterion's points is computed, for the
// generators and the scorers alike. Pure: no DOM, no I/O.

/** `percent` of `points`, multiplied before dividing: 70% of 5 is 3.5. */
export function percentOf(points, percent) {
  return Math.round(points * percent * 100) / 10_000;
}
