import { type CollectionEntry, getEntry } from "astro:content";

/**
 * Shared by Cite.astro and References.astro, so the in-text citation and the
 * reference list cannot disagree about a source's authors, year, or link.
 */

export type Source = CollectionEntry<"sources">;

/** Look up a registry entry, failing the build when the id has no file. */
export async function requireSource(id: string, page: string) {
  const source = await getEntry("sources", id);
  if (!source) {
    throw new Error(
      `Cite: no source "${id}" on ${page}. Add src/data/sources/${id}.yaml (see the cs46x-guides skill, Citing Evidence).`
    );
  }
  return source;
}

/** The family name from a "Family, Initials" author string. */
function family(author: string) {
  return author.split(",")[0].trim();
}

/** "Edmondson", "Smith and Jones", or "Perry et al.". */
export function inTextAuthors(authors: string[]) {
  if (authors.length === 1) {
    return family(authors[0]);
  }
  if (authors.length === 2) {
    return `${family(authors[0])} and ${family(authors[1])}`;
  }
  return `${family(authors[0])} et al.`;
}

/** "Edmondson, A. C.", "Smith, J., and Jones, K.", "A, B, and C". */
export function listAuthors(authors: string[]) {
  if (authors.length === 1) {
    return authors[0];
  }
  if (authors.length === 2) {
    return `${authors[0]}, and ${authors[1]}`;
  }
  return `${authors.slice(0, -1).join(", ")}, and ${authors.at(-1)}`;
}

const ENDS_IN_PUNCTUATION = /[.?!]$/;
const FENCED_BLOCK = /^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm;
const CITE_ID = /<Cite\b[^>]*?\bid=["']([^"']+)["']/g;

/** Close a title with a period unless it already ends in punctuation. */
export function sentence(text: string) {
  return ENDS_IN_PUNCTUATION.test(text) ? text : `${text}.`;
}

/** The DOI link when the source has one, which outlives a publisher URL. */
export function href(source: Source) {
  return source.data.doi
    ? `https://doi.org/${source.data.doi}`
    : source.data.url;
}

/**
 * Every `<Cite id="...">` in an MDX body, in order of first appearance.
 * Fenced code blocks are skipped: a Cite shown as an example is not a
 * citation. Attribute order does not matter.
 */
export function citedIds(body: string) {
  const prose = body.replace(FENCED_BLOCK, "");
  const ids: string[] = [];
  for (const match of prose.matchAll(CITE_ID)) {
    if (!ids.includes(match[1])) {
      ids.push(match[1]);
    }
  }
  return ids;
}
