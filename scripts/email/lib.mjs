// Shared by the letter scripts in this folder: read a CSV, escape HTML, and
// write one draft per letter as an .eml plus a preview page with a mailto
// link per letter. Nothing here sends mail. Node 20+, no dependencies.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The formula guard the capstone app's CSV export puts on a cell
// (unguardCell in src/lib/csv.ts of adulbrich/eecs-capstone), reversed, so
// "-Alpha" does not reach a letter as "'-Alpha".
const FORMULA_LEAD = /^[=+\-@\t\r]/;
const unguard = (text) =>
  text.startsWith("'") && FORMULA_LEAD.test(text.slice(1))
    ? text.slice(1)
    : text;

/**
 * RFC 4180 CSV as Canvas, Sheets, Excel and the app's own exports write it:
 * quoted cells may hold commas, line breaks and doubled quotes, and a UTF-8
 * BOM may lead. A header line holding a tab is read as tab-separated, for a
 * range pasted out of a spreadsheet.
 */
// One field and what ends it. A field opening with a quote runs to the
// closing quote, with "" for a quote inside; anything else runs to the next
// separator or line break, stray quotes included.
const FIELD = {
  ",": /(?:"((?:[^"]|"")*)"|([^,\r\n]*))(,|\r\n|\n|\r|$)/g,
  "\t": /(?:"((?:[^"]|"")*)"|([^\t\r\n]*))(\t|\r\n|\n|\r|$)/g,
};

function parseTable(text) {
  const s = text.replace(/^\uFEFF/, "");
  const sep = s.slice(0, s.search(/\r?\n|$/)).includes("\t") ? "\t" : ",";
  const rows = [];
  let row = [];
  for (const m of s.matchAll(FIELD[sep])) {
    row.push(m[1] === undefined ? m[2] : m[1].replaceAll('""', '"'));
    if (m[3] === sep) {
      continue;
    }
    rows.push(row);
    row = [];
    // A trailing line break ends the file; the empty match after it is not
    // another row.
    if (m.index + m[0].length >= s.length) {
      break;
    }
  }
  return rows;
}

/**
 * The rows of a CSV file as objects keyed by header, every cell trimmed and
 * unguarded. Exits naming the file and the columns when a required header is
 * missing, so a renamed column fails loudly rather than reading as empty.
 */
export function readTable(path, required) {
  const [header = [], ...body] = parseTable(readFileSync(path, "utf8"));
  const keys = header.map((h) => h.trim());
  const missing = required.filter((h) => !keys.includes(h));
  if (missing.length) {
    console.error(`${path} is missing columns: ${missing.join(", ")}`);
    process.exit(1);
  }
  return body
    .filter((r) => r.some((c) => c.trim()))
    .map((r) =>
      Object.fromEntries(keys.map((k, i) => [k, unguard((r[i] ?? "").trim())]))
    );
}

export const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Turns bare URLs and addresses in already-escaped text into links. */
export const linkify = (escaped) =>
  escaped
    .replace(/https?:\/\/[^\s<]+[^\s<.,)]/g, (u) => `<a href="${u}">${u}</a>`)
    .replace(/(^|[\s(>])([\w.+-]+@[\w.-]+\w)/g, '$1<a href="mailto:$2">$2</a>');

/**
 * Bolds a paragraph's short lead-in label, as in "Meetings: we ask...", in
 * already-escaped HTML. Up to three words before the colon, so a sentence
 * that merely ends in a colon is left alone. The plain-text body, and so the
 * mailto draft, has no bold.
 */
export const boldLead = (escaped) =>
  escaped.replace(
    /^([A-Z][a-z]+(?: [a-z]+){0,2}:)(?=\s)/,
    "<strong>$1</strong>"
  );

/** A project or team name inside a sentence, in double quotes. */
export const quoted = (name) => `"${name}"`;

/** "a", "a and b", "a, b, and c". */
export const listJoin = (items) =>
  items.length < 3
    ? items.join(" and ")
    : `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;

/** A "--signature" value with its typed `\n` turned into line breaks. */
export const signatureFrom = (value) => value.replaceAll("\\n", "\n");

export const signatureHtml = (signature) =>
  `<p>${esc(signature).replaceAll("\n", "<br>")}</p>`;

const b64 = (s) =>
  Buffer.from(s, "utf8").toString("base64").replace(/.{76}/g, "$&\r\n");

const encodeHeader = (s) =>
  /^[\x20-\x7e]*$/.test(s)
    ? s
    : `=?UTF-8?B?${Buffer.from(s, "utf8").toString("base64")}?=`;

// X-Unsent makes classic Outlook open the file as an editable draft. No From
// and no Date: the mail client fills both from the account that sends it.
function toEml(letter) {
  const boundary = `b${Math.random().toString(36).slice(2)}`;
  return [
    `To: ${letter.to.join(", ")}`,
    letter.cc.length ? `Cc: ${letter.cc.join(", ")}` : null,
    `Subject: ${encodeHeader(letter.subject)}`,
    "X-Unsent: 1",
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(letter.text),
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    b64(`<!doctype html><html><body>${letter.html}</body></html>`),
    `--${boundary}--`,
    "",
  ]
    .filter((line) => line !== null)
    .join("\r\n");
}

function toMailto(letter) {
  const q = new URLSearchParams();
  if (letter.cc.length) {
    q.set("cc", letter.cc.join(","));
  }
  q.set("subject", letter.subject);
  q.set("body", letter.text);
  const to = letter.to.map(encodeURIComponent).join(",");
  // URLSearchParams writes a space as "+", which mail clients keep literally.
  return `mailto:${to}?${q.toString().replaceAll("+", "%20")}`;
}

// Classic Outlook on Windows truncates a mailto URL near 2,000 characters.
const MAILTO_LIMIT = 1900;

const PAGE_STYLE = `
body{font:15px/1.5 system-ui,sans-serif;max-width:56rem;margin:2rem auto;padding:0 1rem;color:#222}
article{border:1px solid #ccc;border-radius:6px;margin:1rem 0;padding:.75rem 1rem}
header{font-size:13px;border-bottom:1px solid #eee;padding-bottom:.4rem;margin-bottom:.4rem}
.n{font-weight:700}.tag{background:#eee;border-radius:3px;padding:0 .3rem}
.blue{background:#e3ecff}.orange{background:#ffe8c7}.green{background:#e6f5e6}.muted{color:#666}
.actions{float:right}.actions a{margin-left:.6rem}.open{font-weight:700}.warn{color:#b00}
.problems{background:#fff6e5;border:1px solid #f0c36d;border-radius:6px;padding:.5rem 1rem}`;

/**
 * Empties `<out>/eml`, then writes `<out>/eml/NNN-<stem>.eml` for every letter and `<out>/index.html`
 * previewing all of them, each with an "Open in mail" mailto link and its
 * .eml beside it.
 *
 * A letter is `{ to, cc, subject, text, html, stem, title, tags?, note? }`:
 * `to` and `cc` are address arrays, `text` and `html` the two bodies, `stem`
 * the file name part, `title` the card heading, `tags` `{ label, tone }`
 * chips (tone is blue, orange or green), and `note` a line shown on the card
 * but never sent. `problems` are strings listed above the letters.
 */
export function writeLetters({ out, title, summary, problems, letters }) {
  // A rerun replaces the drafts rather than leaving last run's files beside
  // them, where a letter since dropped could still be opened and sent.
  rmSync(join(out, "eml"), { force: true, recursive: true });
  mkdirSync(join(out, "eml"), { recursive: true });
  const cards = letters.map((letter, i) => {
    const file = `${String(i + 1).padStart(3, "0")}-${letter.stem.replace(/[^a-z0-9@._-]+/gi, "_")}.eml`;
    writeFileSync(join(out, "eml", file), toEml(letter));
    const link = toMailto(letter);
    const long =
      link.length > MAILTO_LIMIT
        ? ' <strong class="warn">long link, Outlook may cut the body; use the .eml</strong>'
        : "";
    const tags = (letter.tags ?? [])
      .map((t) => `<span class="tag ${t.tone ?? ""}">${esc(t.label)}</span>`)
      .join(" ");
    return `<article>
<header><span class="n">${i + 1}</span> <b>${esc(letter.title)}</b> ${tags}
<span class="actions"><a class="open" href="${esc(link)}">Open in mail</a> <a href="eml/${esc(file)}">.eml</a>${long}</span>
<div><b>To:</b> ${esc(letter.to.join(", "))}</div>
${letter.cc.length ? `<div><b>Cc:</b> ${esc(letter.cc.join(", "))}</div>` : ""}
<div><b>Subject:</b> ${esc(letter.subject)}</div>
${letter.note ? `<div class="muted">Not in the email: ${esc(letter.note)}</div>` : ""}</header>
<div class="letter">${letter.html}</div>
</article>`;
  });
  const problemList = problems.length
    ? `<ul>${problems.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>`
    : "<p>None.</p>";
  const page = join(out, "index.html");
  writeFileSync(
    page,
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>${PAGE_STYLE}</style></head><body>
<h1>${esc(title)}</h1>
<p>${esc(summary)}</p>
<div class="problems"><b>Check before sending (${problems.length})</b>${problemList}</div>
${cards.join("\n")}
</body></html>`
  );
  console.log(summary);
  for (const p of problems) {
    console.log(`  ${p}`);
  }
  console.log(`Preview: ${page}`);
}
