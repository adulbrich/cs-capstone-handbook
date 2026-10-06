// What the generator pages share about files: the label as a file-name
// piece, and reading the file a file input was given. Browser only for
// readPicked, like download.mjs.

/** A label as a file-name piece: lower case, other characters as one hyphen. */
export const slug = (text) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * The file picked in a file input's change event, as `{ name, text }`, or
 * null when none was. Clears the input, so picking the same file again,
 * after an edit, reads it again.
 */
export async function readPicked(event) {
  const input = event.currentTarget;
  const [file] = input.files;
  if (!file) {
    return null;
  }
  const text = await file.text();
  input.value = "";
  return { name: file.name, text };
}
