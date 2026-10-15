// Handbook Markdown made into slide text, for the decks and deck components
// that render a page's own words, without the bold marks: GradeGrid.astro
// shows a link's text only, and LinkedText.astro (used by TermSessions.astro
// and by decks directly) keeps the links, since the slides are shared with
// the class, and shows each by its name rather than its URL. linkHrefs lists
// a line's link targets, for a deck that finds a schedule line by where it
// points rather than by its wording.
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]*)\)/g;
const BOLD_RE = /\*\*([^*]+)\*\*/g;

/** @param {string} text */
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/** @param {string} md */
export function plainText(md) {
  return md.replace(MD_LINK_RE, "$1").replace(BOLD_RE, "$1");
}

/**
 * A line as text and named links, its first letter capitalized: each part
 * is `{ text }`, or `{ text, href }` with `href` as the page wrote it, so a
 * root-relative link still needs the site's origin.
 * @param {string} md
 * @returns {{ href?: string, text: string }[]}
 */
export function linkedLine(md) {
  const source = md.replace(BOLD_RE, "$1");
  const parts = [];
  let last = 0;
  for (const match of source.matchAll(MD_LINK_RE)) {
    if (match.index > last) {
      parts.push({ text: source.slice(last, match.index) });
    }
    parts.push({ href: match[2], text: match[1] });
    last = match.index + match[0].length;
  }
  if (last < source.length) {
    parts.push({ text: source.slice(last) });
  }
  if (parts.length > 0) {
    parts[0] = { ...parts[0], text: capitalize(parts[0].text) };
  }
  return parts;
}

/**
 * Every link target in a line, as the page wrote it.
 * @param {string} md
 */
export function linkHrefs(md) {
  return linkedLine(md).flatMap((part) => (part.href ? [part.href] : []));
}
