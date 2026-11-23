// A list's options narrowed to what a reader has typed, and the comparison
// that ignores case and extra spaces. Pure: no DOM, no I/O.

const SPACES = /\s+/gu;

/** Text trimmed and single-spaced. */
export const singleSpaced = (text) => text.trim().replace(SPACES, " ");

/** Text as compared: trimmed, single-spaced, lower case. */
export const textKey = (text) => singleSpaced(text).toLowerCase();

/** The `options` that contain `text`, as compared (textKey), in their order. */
export const matchingOptions = (options, text) => {
  const key = textKey(text);
  return options.filter((option) => textKey(option).includes(key));
};
