// Handbook Markdown made into slide text, for the deck components that
// render a page's own words (src/components/deck/GradeGrid.astro and
// TermSessions.astro), without the bold marks. GradeGrid shows a link's
// text only; TermSessions keeps the links, since the slides are shared with
// the class, and shows each by its name rather than its URL.
const MD_LINK_RE = /\[([^\]]+)\]\(([^)]*)\)/g;
const BOLD_RE = /\*\*([^*]+)\*\*/g;

/** @param {string} text */
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

/** @param {string} md */
export function plainText(md) {
  return md.replace(MD_LINK_RE, "$1").replace(BOLD_RE, "$1");
}

/** The same, with its first letter capitalized, for text that opens a line. */
export function plainLine(md) {
  return capitalize(plainText(md));
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
