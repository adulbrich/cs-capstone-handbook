// Which file a submission's image link points to, for the submission PDF
// builder. A student adds files three ways, and each gives a different path:
// the file picker gives a bare name (`team.png`), a dropped folder gives the
// path inside it (`charter/img/team.png`), and the Markdown links relative to
// itself (`img/team.png`). Paths match when one ends with the other, segment
// by segment, so all three meet. Pure, so node --test covers it.

/** The Markdown files the builder takes, by extension. */
export const MARKDOWN_EXTENSIONS = Object.freeze([".md", ".markdown"]);

/** The image files the builder takes, by extension. */
export const IMAGE_EXTENSIONS = Object.freeze([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
]);

/** The file picker's `accept`, both kinds together. */
export const ACCEPT = [...MARKDOWN_EXTENSIONS, ...IMAGE_EXTENSIONS].join(",");

/** A link with a scheme (https:, data:) or protocol-relative: not a file. */
const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/** A link's query string or fragment, which names no part of the file. */
const QUERY_OR_HASH = /[?#].*$/;

const extension = (path) => {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot).toLowerCase() : "";
};

/** "markdown", "image", or null for a file the builder does not take. */
export function kindOf(path) {
  const ext = extension(path);
  if (MARKDOWN_EXTENSIONS.includes(ext)) {
    return "markdown";
  }
  return IMAGE_EXTENSIONS.includes(ext) ? "image" : null;
}

/** A path's segments with `.` and `..` resolved; `..` past the top is dropped. */
export function segments(path) {
  const out = [];
  for (const part of path.split("/")) {
    if (part === "..") {
      out.pop();
    } else if (part !== "" && part !== ".") {
      out.push(part);
    }
  }
  return out;
}

const decode = (text) => {
  try {
    return decodeURI(text);
  } catch {
    return text;
  }
};

/** True for a link the browser fetches itself, such as an https: image. */
export const isExternal = (src) => EXTERNAL.test(src.trim());

/**
 * The added image a link points to, or null when none was added. `src` is
 * the link as written, `from` the Markdown file's path, `paths` the added
 * images' paths. A link starting with `/` is read from the repository root,
 * as GitHub does. The longest match wins; on a tie, the first added.
 */
export function resolveImage(src, from, paths) {
  const link = decode(src.trim().replace(QUERY_OR_HASH, ""));
  if (link === "") {
    return null;
  }
  const base = link.startsWith("/") ? [] : segments(from).slice(0, -1);
  const wanted = segments([...base, link].join("/"));
  let best = null;
  let bestScore = 0;
  for (const path of paths) {
    const have = segments(path);
    const shorter = Math.min(have.length, wanted.length);
    let score = 0;
    while (score < shorter && have.at(-1 - score) === wanted.at(-1 - score)) {
      score += 1;
    }
    // One whole path must be the end of the other: `img/team.png` matches
    // `team.png` and `docs/img/team.png`, never `other/team.png`.
    if (score === shorter && score > bestScore) {
      best = path;
      bestScore = score;
    }
  }
  return best;
}
