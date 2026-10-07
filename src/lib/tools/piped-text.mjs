// Qualtrics piped text as one recipient sees it, for the previews: an
// embedded field (`${e://Field/Team}`) becomes that recipient's value, and a
// link (`${l://SurveyLink?d=Take the survey}`) its display text. Pure: no
// DOM, no I/O.

const PIPE = /\$\{([a-z]+):\/\/([^}]*)\}/g;
const FIELD_PREFIX = /^Field\//;
const HTML_SPECIAL = /[&<>"']/g;

/**
 * The text as segments a page renders without HTML: `{ kind, text }`, kind
 * "text", "field" (a piped value, or `[Name]` when `values` has none), or
 * "link" (a link's display text, or its kind when it has none).
 * `values` maps a field name to the recipient's value.
 */
export function pipedSegments(text, values = {}) {
  const segments = [];
  let at = 0;
  for (const match of text.matchAll(PIPE)) {
    if (match.index > at) {
      segments.push({ kind: "text", text: text.slice(at, match.index) });
    }
    segments.push(pipeSegment(match[1], match[2], values));
    at = match.index + match[0].length;
  }
  if (at < text.length) {
    segments.push({ kind: "text", text: text.slice(at) });
  }
  return segments;
}

function pipeSegment(scheme, path, values) {
  if (scheme === "l") {
    const [kind, query = ""] = path.split("?");
    const display = new URLSearchParams(query).get("d");
    return { kind: "link", text: display || kind };
  }
  const name = decodeURIComponent(path.replace(FIELD_PREFIX, ""));
  return {
    kind: "field",
    text: Object.hasOwn(values, name) ? String(values[name]) : `[${name}]`,
  };
}

const ESCAPES = {
  "'": "&#39;",
  '"': "&quot;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

/** Text safe to place in HTML. */
export const escapeHtml = (text) =>
  String(text).replace(HTML_SPECIAL, (c) => ESCAPES[c]);

/**
 * Question HTML with its embedded fields and loop fields replaced, each
 * value escaped: `values` maps a field name to its value, `loop` maps a
 * Loop & Merge field number to HTML already safe to insert.
 */
export function pipeHtml(html, { loop = {}, values = {} } = {}) {
  return html.replace(PIPE, (whole, scheme, path) => {
    if (scheme === "lm") {
      const n = path.replace(FIELD_PREFIX, "");
      return loop[n] ?? "";
    }
    if (scheme === "e") {
      const name = decodeURIComponent(path.replace(FIELD_PREFIX, ""));
      return escapeHtml(values[name] ?? "");
    }
    return whole;
  });
}
