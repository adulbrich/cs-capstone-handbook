// The submission PDF builder's rules (/tools/submission-pdf/): the cover
// lines, which always open page 1, and what makes them complete, what the browser keeps between visits,
// the checks before saving, the paper, and where the pages break. Pure, so
// node --test covers it; the wording is in src/data/submission-pdf.mjs.

import { isExternal, resolveImage } from "./submission-images.mjs";

/** The storage key that holds the project and the authors. */
export const COVER_KEY = "cover";

/**
 * The generated date's form: the month spelled out, in the reader's locale,
 * since a numeric date reads differently in the US and in Europe.
 */
const DATE_FORM = Object.freeze({
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** The day `date` falls on, in `locale` (the browser's when undefined). */
export const generatedOn = (date, locale) =>
  date.toLocaleDateString(locale, DATE_FORM);

/** A loose email check: something, an @, something with no spaces. */
const EMAIL = /^[^\s@]+@[^\s@]+$/u;

/** CSS pixels per inch, as the browser lays out and prints. */
const PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;

/** The page margin, every side, in inches. */
export const MARGIN_INCHES = 0.75;

const sheet = (id, widthInches, heightInches) => {
  const margin = MARGIN_INCHES * PX_PER_INCH;
  const width = widthInches * PX_PER_INCH;
  const height = heightInches * PX_PER_INCH;
  return Object.freeze({
    contentHeight: height - 2 * margin,
    contentWidth: width - 2 * margin,
    height,
    id,
    margin,
    width,
  });
};

/** The papers offered, in CSS pixels; `id` is also the `@page size`. */
export const PAPER = Object.freeze({
  a4: sheet("a4", 210 / MM_PER_INCH, 297 / MM_PER_INCH),
  letter: sheet("letter", 8.5, 11),
});

/** An author row with nothing typed. */
export const blankAuthor = () => ({ email: "", name: "" });

/** A cover with nothing typed but `title`. */
export const blankCover = (title = "") => ({
  authors: [blankAuthor()],
  projectId: "",
  projectName: "",
  title,
});

/**
 * The document title from the page's query string (`?title=Team%20Charter`),
 * trimmed, or "" when there is none.
 */
export function titleFromSearch(search) {
  try {
    return (new URLSearchParams(search).get("title") ?? "").trim();
  } catch {
    return "";
  }
}

const text = (value) => (typeof value === "string" ? value : "");

/**
 * The project and authors read back from storage, which anything could
 * have written: whatever is not a string becomes "", and no authors at all
 * becomes one empty row.
 */
export function fromSaved(value) {
  const saved = value && typeof value === "object" ? value : {};
  const authors = Array.isArray(saved.authors)
    ? saved.authors.map((author) => ({
        email: text(author?.email),
        name: text(author?.name),
      }))
    : [];
  return {
    authors: authors.length > 0 ? authors : [blankAuthor()],
    projectId: text(saved.projectId),
    projectName: text(saved.projectName),
  };
}

/** What storage keeps of a cover: the project and authors, not the title. */
export const toSaved = ({ authors, projectId, projectName }) => ({
  authors: authors.map(({ email, name }) => ({ email, name })),
  projectId,
  projectName,
});

/** True when the cover has a project or author worth keeping. */
export const hasSaved = ({ authors, projectId, projectName }) =>
  [projectId, projectName, ...authors.flatMap((a) => [a.name, a.email])].some(
    (value) => value.trim() !== ""
  );

/**
 * What the cover lines still lack, in the order they appear:
 * `{ field: "title" | "projectId" | "projectName" | "authors" }`, or
 * `{ field: "name" | "email" | "emailFormat", author }` with `author`
 * counted from 1. An empty list means complete.
 */
export function coverProblems({ authors, projectId, projectName, title }) {
  const problems = [];
  for (const [field, value] of [
    ["title", title],
    ["projectId", projectId],
    ["projectName", projectName],
  ]) {
    if (value.trim() === "") {
      problems.push({ field });
    }
  }
  if (authors.length === 0) {
    problems.push({ field: "authors" });
  }
  authors.forEach(({ email, name }, i) => {
    const author = i + 1;
    if (name.trim() === "") {
      problems.push({ author, field: "name" });
    }
    if (email.trim() === "") {
      problems.push({ author, field: "email" });
    } else if (!EMAIL.test(email.trim())) {
      problems.push({ author, field: "emailFormat" });
    }
  });
  return problems;
}

/**
 * The cover lines Submitting Your Work asks for, with the date line under
 * the title (`date`, from `blankText.dateLine`: the date the PDF is made and
 * the word count): the title, the date line, the project line
 * (`blank.project(id, name)`, "CS.042 Don't Panic Incident Tracker"), and
 * "Name <email>, ..." for each author. A blank part shows `blank`'s
 * stand-in (`title`, `projectId`, `projectName`, `name`, `email`), so the
 * preview shows the gap.
 */
export function coverLines(
  { authors, projectId, projectName, title },
  blank,
  date
) {
  const or = (value, key) => value.trim() || blank[key];
  return {
    authors: authors
      .map((a) => `${or(a.name, "name")} <${or(a.email, "email")}>`)
      .join(", "),
    date,
    project: blank.project(
      or(projectId, "projectId"),
      or(projectName, "projectName")
    ),
    title: or(title, "title"),
  };
}

/**
 * One Markdown file's problems: each image whose file was not added
 * (`missing`) and each image with no alt text (`noAlt`), as
 * `{ src, line }`. `images` comes from readMarkdown, `path` is the file's,
 * `imagePaths` the added images'. An https: image is the browser's to
 * fetch, so it is never missing.
 */
export function fileProblems(images, path, imagePaths) {
  return {
    missing: images
      .filter(
        ({ src }) =>
          !isExternal(src) && resolveImage(src, path, imagePaths) === null
      )
      .map(({ line, src }) => ({ line, src })),
    noAlt: images
      .filter(({ alt }) => alt === "")
      .map(({ line, src }) => ({ line, src })),
  };
}

/**
 * The checks before saving, each `{ id, ok, ... }` in the order the page
 * lists them: `cover` (with `problems`), `files` (with `names`), `images`
 * (with `missing`), `alt` (with `noAlt`), `diagrams` (with `count` and
 * `failed`). Each problem names its `file`. `files` are
 * `{ name, missing, noAlt, diagrams, failed }`, `failed` the diagrams that
 * could not be drawn as `{ line, message }`. `extras` have the same shape
 * and join the image, alt-text, and diagram checks without counting as
 * files (the more cover lines). Only `cover` and `files` stop the save
 * (`canSave`); the others warn.
 */
export function submissionChecks(cover, files, extras = []) {
  const all = [...files, ...extras];
  const each = (key) =>
    all.flatMap((file) =>
      file[key].map((item) => ({ ...item, file: file.name }))
    );
  const problems = coverProblems(cover);
  const missing = each("missing");
  const noAlt = each("noAlt");
  const failed = each("failed");
  return [
    { id: "cover", ok: problems.length === 0, problems },
    {
      id: "files",
      names: files.map((file) => file.name),
      ok: files.length > 0,
    },
    { id: "images", missing, ok: missing.length === 0 },
    { id: "alt", noAlt, ok: noAlt.length === 0 },
    {
      count: all.reduce((sum, file) => sum + file.diagrams, 0),
      failed,
      id: "diagrams",
      ok: failed.length === 0,
    },
  ];
}

/** True when the PDF can be saved: the cover lines and one file. */
export const canSave = (checks) =>
  checks.every((check) => check.ok || !["cover", "files"].includes(check.id));

/** How many blocks two chains of blocks share from the outside in. */
function sharedDepth(a, b) {
  let depth = 0;
  while (depth < a.length && depth < b.length && a[depth] === b[depth]) {
    depth += 1;
  }
  return depth;
}

/**
 * Where print may start a page inside a part, from the boxes of its text and
 * images as `{ top, bottom, chain }`, in any order: halfway between each
 * line's bottom and the next one's top, as `{ y, block, depth }`. A box's
 * `chain` numbers the blocks of the part that print keeps whole around it,
 * outermost first, none for the part's own lines. A break's `depth` counts
 * the blocks it falls inside; between two lines of one block, `block` is that
 * block's number (0 for the part's own lines), and between two blocks it is
 * `null`. Boxes that overlap are one line; a box with no height, unlike a
 * blank code line's, is none.
 */
export function lineBreaks(boxes) {
  const lines = [];
  const found = boxes
    .filter((box) => box.bottom > box.top)
    .toSorted((a, b) => a.top - b.top);
  for (const box of found) {
    const line = lines.at(-1);
    if (line && box.top < line.bottom - 1) {
      line.bottom = Math.max(line.bottom, box.bottom);
    } else {
      lines.push({ bottom: box.bottom, chain: box.chain, top: box.top });
    }
  }
  return lines.slice(1).map((line, k) => {
    const above = lines[k].chain;
    const depth = sharedDepth(above, line.chain);
    const same = depth === above.length && depth === line.chain.length;
    return {
      block: same ? (line.chain.at(-1) ?? 0) : null,
      depth,
      y: (lines[k].bottom + line.top) / 2,
    };
  });
}

/**
 * Lines Chrome's print keeps together at each end of a block it breaks, the
 * part's own lines or a block inside it, where it can: its default `orphans`
 * and `widows`, which document.css leaves alone.
 */
const KEEP_LINES = 2;

/**
 * The top of part `i` with the kept parts right before it, where print
 * breaks to move them together; null when those kept parts reach back to
 * `start`, the current page's top, so moving them would leave it empty.
 */
function keptTop(blocks, i, start) {
  let next = blocks[i].top;
  for (let j = i - 1; j >= 0 && blocks[j].keepWithNext; j -= 1) {
    if (blocks[j].top <= start) {
      return null;
    }
    next = blocks[j].top;
  }
  return next;
}

/**
 * How print ranks a break, higher first: one inside fewer of the part's
 * blocks (`depth`) always ranks higher; at one depth, a break between
 * blocks, or between lines of one block with KEEP_LINES of them `before` and
 * `after` it on the page, ranks above one without.
 */
function breakRank({ block, depth }, before, after) {
  const keeps = block === null || (before >= KEEP_LINES && after >= KEEP_LINES);
  return (keeps ? 1 : 0) - 2 * depth;
}

/** How many breaks each block of `lines` has between its own lines. */
function blockCounts(lines) {
  const counts = new Map();
  for (const { block } of lines) {
    counts.set(block, (counts.get(block) ?? 0) + 1);
  }
  return counts;
}

/**
 * The best-ranked break in `part`, top to bottom in `lines`, that fits the
 * page from `start` to `end`, the last of those; null when no line of the
 * part ends on this page.
 */
function lineBreak(part, start, end) {
  const counts = blockCounts(part.lines);
  const seen = new Map();
  const done = new Map();
  let best = null;
  let bestRank = Number.NEGATIVE_INFINITY;
  for (const line of part.lines) {
    const j = seen.get(line.block) ?? 0;
    seen.set(line.block, j + 1);
    if (line.y <= start) {
      done.set(line.block, j + 1);
    } else if (line.y <= end) {
      const before = j + 1 - (done.get(line.block) ?? 0);
      const rank = breakRank(line, before, counts.get(line.block) - j);
      if (rank >= bestRank) {
        best = line.y;
        bestRank = rank;
      }
    }
  }
  return best;
}

/**
 * Where the page after the one at `start` begins when part `i` does not fit
 * it, by Chrome's print order: before the part with the kept parts before
 * it; inside it, at a line; before it, leaving the kept parts; at the edge.
 */
function nextStart(blocks, i, start, pageHeight) {
  const block = blocks[i];
  const moved = block.top > start ? keptTop(blocks, i, start) : null;
  if (moved !== null) {
    return moved;
  }
  const line = lineBreak(block, start, start + pageHeight);
  if (line !== null) {
    return line;
  }
  return block.top > start ? block.top : start + pageHeight;
}

/**
 * Where the pages of one printed sheet start, in pixels from its top, as
 * Chrome's print breaks them. `blocks` are its parts top to bottom,
 * `{ top, bottom, keepWithNext, lines }`: `lines` the points between a
 * part's lines where print may start a page, from lineBreaks, none for an
 * image or a diagram, which print keeps whole. `pageHeight` is the paper's content
 * height. A part that does not fit moves to the next page with the heading
 * or the file's path before it (`keepWithNext`), whatever its height. When
 * those already start the page, it breaks at its last line that fits, two
 * lines kept at each end where it can and between the blocks inside it
 * before inside one of them, or moves alone if no line fits; a
 * part that starts the page and has no line that fits it is cut at the page
 * edge. The first page always starts at 0.
 */
export function pageStarts(blocks, pageHeight) {
  const starts = [0];
  let start = 0;
  blocks.forEach((block, i) => {
    while (block.bottom - start > pageHeight) {
      start = nextStart(blocks, i, start, pageHeight);
      starts.push(start);
    }
  });
  return starts;
}

/**
 * Numbers every page: given each sheet's page count, in order, the page
 * number each sheet starts on, and the total.
 */
export function numberPages(counts) {
  const firsts = [];
  let next = 1;
  for (const count of counts) {
    firsts.push(next);
    next += Math.max(1, count);
  }
  return { firsts, total: next - 1 };
}
