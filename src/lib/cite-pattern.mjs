/**
 * How a page's citations are read, and how a source's in-text label is built.
 *
 * Plain JavaScript so that both the site (src/lib/sources.ts, which feeds
 * Cite.astro and References.astro) and scripts/validate-sources.mjs, which
 * runs under node at pre-commit, import the same code. Two copies of these
 * patterns would drift, and the validator would then pass pages the site
 * renders differently.
 */

// A fenced code block, including one indented under a list item. The
// closing fence repeats the opening one at any indentation.
const FENCED_BLOCK = /^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^[ \t]*\1[ \t]*$/gm;
// An MDX comment, {/* ... */}, which renders nothing.
const MDX_COMMENT = /\{\/\*[\s\S]*?\*\/\}/g;
// An inline code span: a run of backticks closed by a run of exactly the same
// length, within one paragraph (never across a blank line).
const INLINE_CODE = /(?<!`)(`+)(?!`)(?:(?!\n[ \t]*\n)[\s\S])*?(?<!`)\1(?!`)/g;
// A Cite tag's id, in either attribute order.
const CITE_ID = /<Cite\b[^>]*?\bid=["']([^"']+)["']/g;
const CITE_TAG = /<Cite\b/g;

/**
 * The page with everything that renders no citation removed: fenced blocks,
 * MDX comments, and inline code. A Cite shown as an example is not a
 * citation.
 *
 * @param {string} body the raw MDX
 * @returns {string}
 */
export function citableText(body) {
  return body
    .replace(FENCED_BLOCK, "")
    .replace(MDX_COMMENT, "")
    .replace(INLINE_CODE, "");
}

/**
 * Every Cite id in the text, in order, repeats included.
 *
 * @param {string} text output of citableText
 * @returns {string[]}
 */
export function citeIds(text) {
  return [...text.matchAll(CITE_ID)].map((match) => match[1]);
}

/**
 * How many Cite tags the text holds, with or without an id.
 *
 * @param {string} text output of citableText
 * @returns {number}
 */
export function citeTagCount(text) {
  return text.match(CITE_TAG)?.length ?? 0;
}

/**
 * The family name from a "Family, Initials" author string.
 *
 * @param {string} author
 * @returns {string}
 */
function family(author) {
  return author.split(",")[0].trim();
}

/**
 * "Edmondson", "Smith and Jones", or "Perry et al.".
 *
 * @param {string[]} authors
 * @returns {string}
 */
export function inTextAuthors(authors) {
  if (authors.length === 1) {
    return family(authors[0]);
  }
  if (authors.length === 2) {
    return `${family(authors[0])} and ${family(authors[1])}`;
  }
  return `${family(authors[0])} et al.`;
}

/**
 * The year as cited: "1999", or "1999a" when two sources would otherwise
 * read the same.
 *
 * @param {number} year
 * @param {string | undefined} suffix
 * @returns {string}
 */
export function citedYear(year, suffix) {
  return `${year}${suffix ?? ""}`;
}
