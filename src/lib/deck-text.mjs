// Handbook Markdown made into slide text, for the deck components that
// render a page's own words (src/components/deck/GradeGrid.astro and
// TermSessions.astro): a slide shows a link's text, not the link, and no
// bold marks.
const MD_LINK_RE = /\[([^\]]+)\]\([^)]*\)/g;
const BOLD_RE = /\*\*([^*]+)\*\*/g;

/** @param {string} md */
export function plainText(md) {
  return md.replace(MD_LINK_RE, "$1").replace(BOLD_RE, "$1");
}

/** The same, with its first letter capitalized, for text that opens a line. */
export function plainLine(md) {
  const text = plainText(md);
  return text.charAt(0).toUpperCase() + text.slice(1);
}
