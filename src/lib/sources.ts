import { type CollectionEntry, getEntry } from "astro:content";
import { citableText, citeIds } from "./cite-pattern.mjs";

/**
 * Shared by Cite.astro and References.astro, so the in-text citation and the
 * reference list cannot disagree about a source's authors, year, or link.
 * How a page's citations are found lives in cite-pattern.mjs, which the
 * validator imports too.
 */

export type Source = CollectionEntry<"sources">;

/**
 * Look up a registry entry, failing the build when the id has no file.
 * `caller` is the component asking; `page` is the MDX file path.
 */
export async function requireSource(
  id: string,
  caller: "Cite" | "References",
  page: string
) {
  const source = await getEntry("sources", id);
  if (!source) {
    throw new Error(
      `${caller}: no source "${id}" in ${page}. Add src/data/sources/${id}.yaml (see the cs46x-guides skill, Citing Evidence).`
    );
  }
  return source;
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

/** Every Cite id in an MDX body, once each, in order of first citation. */
export function citedIds(body: string) {
  return [...new Set(citeIds(citableText(body)))];
}
