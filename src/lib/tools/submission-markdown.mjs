// One Markdown file of a submission, read for the submission PDF builder
// (/tools/submission-pdf/): its HTML as GitHub-flavored Markdown, what it
// holds (for the file's one-line summary), and where its images and Mermaid
// diagrams are (for the checks). Pure, so node --test covers it.
//
// The HTML is NOT sanitized here: DOMPurify needs a DOM, so the page
// sanitizes it before use. A fenced `mermaid` block becomes an empty
// `<div class="diagram" data-diagram="N">` placeholder, never its source, so
// the page can put the drawn diagram there; `diagrams[N]` holds the source.

import { Lexer, Marked } from "marked";

/** A fenced code block whose language is this is drawn as a diagram. */
const DIAGRAM_LANGUAGE = "mermaid";

/** YAML front matter at the very top, which GitHub does not print either. */
const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/;

/** An HTML <img> tag written in the Markdown. */
const IMG_TAG = /<img\b[^>]*>/gi;

/** One attribute of a tag, quoted or not. */
const attribute = (tag, name) => {
  const match = new RegExp(
    `\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    "i"
  ).exec(tag);
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
};

const isDiagram = (token) =>
  token.type === "code" &&
  (token.lang ?? "").trim().toLowerCase() === DIAGRAM_LANGUAGE;

const linesIn = (text) => (text.match(/\n/g) ?? []).length;

/**
 * Replaces front matter with as many blank lines, so line numbers still
 * match the file the student has open.
 */
export function stripFrontMatter(text) {
  const match = FRONT_MATTER.exec(text);
  return match
    ? "\n".repeat(linesIn(match[0])) + text.slice(match[0].length)
    : text;
}

const renderer = new Marked({
  async: false,
  gfm: true,
  renderer: {
    code(token) {
      return isDiagram(token)
        ? `<div class="diagram" data-diagram="${token.diagram}"></div>\n`
        : false;
    },
  },
});

/** The images in an HTML token, each <img> tag's src and alt. */
const imgTags = (token, lineOf) =>
  (token.raw.match(IMG_TAG) ?? []).map((tag) => ({
    alt: (attribute(tag, "alt") ?? "").trim(),
    line: lineOf(tag),
    src: attribute(tag, "src") ?? "",
  }));

/** Tallies one token into `found`; `lineOf(raw)` gives a raw slice's line. */
function visit(token, found, lineOf) {
  const { counts } = found;
  if (isDiagram(token)) {
    token.diagram = found.diagrams.length;
    found.diagrams.push({ line: lineOf(token.raw), source: token.text });
    counts.diagrams += 1;
  } else if (token.type === "code") {
    counts.code += 1;
  } else if (token.type === "heading" && token.depth === 2) {
    counts.sections += 1;
  } else if (token.type === "table") {
    counts.tables += 1;
  } else if (token.type === "image") {
    found.images.push({
      alt: token.text.trim(),
      line: lineOf(token.raw),
      src: token.href,
    });
  } else if (token.type === "html") {
    found.images.push(...imgTags(token, lineOf));
  }
}

const SPACES = /\s+/;
const WORD = /[\p{L}\p{N}]/u;
const COMMENT = /<!--[\s\S]*?-->/g;
const TAG = /<[^>]*>/g;
const BR_TAG = /^<br\b/i;
const NBSP_ENTITY = /&(?:nbsp|#160|#x0*a0);/gi;
const ENTITY = /&(?:#\d+|#x[\da-f]+|[a-z][a-z\d]*);/gi;

/** An HTML entity prints as one character: a space for nbsp, else a symbol. */
const decodeEntities = (text) =>
  text.replace(NBSP_ENTITY, " ").replace(ENTITY, "&");

/** Words in `text`: runs between spaces holding a letter or a digit. */
export function countWords(text) {
  return String(text ?? "")
    .split(SPACES)
    .filter((run) => WORD.test(run)).length;
}

/** Tokens whose children print as their own lines. */
const BLOCKS = new Set([
  "blockquote",
  "heading",
  "list",
  "list_item",
  "paragraph",
]);

/** Tokens that print their child tokens, or their own text when they have none. */
const INLINES = new Set(["del", "em", "link", "strong", "text"]);

const printedAll = (tokens) => (tokens ?? []).map(printedText).join("");

/** The text a token prints, which `countWords` then counts. */
function printedText(token) {
  const { type } = token;
  if (type === "table") {
    const cells = [token.header, ...token.rows].flat();
    return cells.map((cell) => `\n${printedAll(cell.tokens)}\n`).join("");
  }
  if (type === "list") {
    return `\n${printedAll(token.items)}\n`;
  }
  if (BLOCKS.has(type)) {
    return `\n${printedAll(token.tokens)}\n`;
  }
  if (INLINES.has(type)) {
    return token.tokens ? printedAll(token.tokens) : decodeEntities(token.text);
  }
  if (type === "codespan" || type === "escape") {
    return token.text;
  }
  if (type === "code") {
    return isDiagram(token) ? "" : `\n${token.text}\n`;
  }
  if (type === "br") {
    return "\n";
  }
  if (type === "html" && token.block) {
    return `\n${decodeEntities(token.text.replace(COMMENT, "").replace(TAG, " "))}\n`;
  }
  if (type === "html" && BR_TAG.test(token.text)) {
    return "\n";
  }
  return "";
}

/**
 * Reads one Markdown file. Returns `{ html, diagrams, images, counts }`:
 * `diagrams` the Mermaid sources with their `line`, in placeholder order;
 * `images` every image, Markdown or <img>, as `{ src, alt, line }` (`alt`
 * trimmed, "" when missing); `counts` the sections (level-2 headings),
 * tables, code blocks other than diagrams, diagrams, images, and `words`, the
 * words the file prints (no alt text, diagram source, comments, or tags).
 *
 * With `breaks`, a single line break in the text is a line break on the
 * page, as GitHub shows comments; files keep Markdown's own joining.
 */
export function readMarkdown(text, { breaks = false } = {}) {
  const source = stripFrontMatter(String(text ?? "").replace(/\r\n?/g, "\n"));
  const tokens = Lexer.lex(source, { breaks, gfm: true });
  const found = {
    counts: {
      code: 0,
      diagrams: 0,
      images: 0,
      sections: 0,
      tables: 0,
      words: 0,
    },
    diagrams: [],
    images: [],
  };
  const { counts, diagrams, images } = found;

  // A top-level token's `raw` is its exact slice of the source, in order, so
  // the running offset gives each block's first line; an image's own `raw`
  // found inside its block gives its line.
  let offset = 0;
  for (const block of tokens) {
    const start = source.indexOf(block.raw, offset);
    const blockStart = start === -1 ? offset : start;
    offset = blockStart + block.raw.length;
    const firstLine = linesIn(source.slice(0, blockStart)) + 1;
    let cursor = 0;
    const lineOf = (raw) => {
      const at = block.raw.indexOf(raw, cursor);
      if (at === -1) {
        return firstLine;
      }
      cursor = at + raw.length;
      return firstLine + linesIn(block.raw.slice(0, at));
    };

    renderer.walkTokens([block], (token) => visit(token, found, lineOf));
  }
  counts.images = images.length;
  counts.words = countWords(printedAll(tokens));

  return { counts, diagrams, html: renderer.parser(tokens), images };
}
