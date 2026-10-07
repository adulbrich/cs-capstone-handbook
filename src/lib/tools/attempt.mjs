// Runs a step that may throw and keeps its error as data, so a page shows
// the message instead of breaking. Pure: no DOM, no I/O.

/**
 * `{ value, error }`: `run()`'s value and "", or null and the message it
 * threw.
 */
export function attempt(run) {
  try {
    return { error: "", value: run() };
  } catch (error) {
    return { error: error.message, value: null };
  }
}
