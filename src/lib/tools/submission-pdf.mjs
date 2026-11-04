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
const EMAIL = /^[^\s@]+@[^\s@]+$/;

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
 * The cover lines Submitting Your Work asks for, with the date the PDF is
 * made under the title (`date`, from generatedOn): the title, the date, the
 * project line
 * (`blank.project(id, name)`, "Project 42: Beaver Habitat Tracker"), and
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
 * could not be drawn as `{ line, message }`. Only `cover` and `files` stop
 * the save (`canSave`); the others warn.
 */
export function submissionChecks(cover, files) {
  const each = (key) =>
    files.flatMap((file) =>
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
      count: files.reduce((sum, file) => sum + file.diagrams, 0),
      failed,
      id: "diagrams",
      ok: failed.length === 0,
    },
  ];
}

/** True when the PDF can be saved: the cover lines and one file. */
export const canSave = (checks) =>
  checks.every((check) => check.ok || !["cover", "files"].includes(check.id));

/**
 * Where the pages of one printed sheet start, in pixels from its top.
 * `blocks` are its parts top to bottom, `{ top, bottom, keepWithNext }`,
 * and `pageHeight` the paper's content height. Like the print CSS, a part
 * that does not fit moves to the next page whole, taking a heading before
 * it along (`keepWithNext`); a part taller than a page is cut at the page
 * edge. The first page always starts at 0.
 */
export function pageStarts(blocks, pageHeight) {
  const starts = [0];
  let start = 0;
  blocks.forEach((block, i) => {
    if (block.bottom - start <= pageHeight) {
      return;
    }
    if (block.top > start && block.bottom - block.top <= pageHeight) {
      let next = block.top;
      for (let j = i - 1; j >= 0; j -= 1) {
        const before = blocks[j];
        if (!before.keepWithNext || before.top <= start) {
          break;
        }
        next = before.top;
      }
      start = next;
      starts.push(start);
    }
    while (block.bottom - start > pageHeight) {
      start += pageHeight;
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
