// The wording of the submission PDF builder (/tools/submission-pdf/): every
// heading, label, help line, warning, and check the page shows. Students
// read it, so it says "submit" and never names where they submit (hard
// rule 7). A function here takes the numbers and names its sentence needs,
// so the page holds no prose.

import { plural } from "./tools-text.mjs";

/** "a", "a and b", "a, b, and c". */
const list = (items) =>
  items.length < 3
    ? items.join(" and ")
    : `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;

/** The Astro page. */
export const page = {
  description:
    "Build the one PDF a submission needs from your Markdown files, with its cover lines, in your browser.",
  intro:
    "Add your Markdown files and the images they link to, fill in the cover lines, and save one PDF in the order you choose. Your files stay in this browser; nothing is uploaded.",
  title: "Build Your Submission PDF",
};

/** Step 1: the cover lines. */
export const coverText = {
  addAuthor: "Add author",
  authorEmail: (n) => `Author ${n} email`,
  authorName: (n) => `Author ${n} name`,
  authors: "Authors",
  documentTitle: "Document title",
  emailPlaceholder: "ONID email",
  forget: "Forget them",
  fromLink: (title) => `Filled in from the link on the ${title} page.`,
  lead: "The document title, your project, and each author: every team member on team work, only you on individual work.",
  namePlaceholder: "Name",
  notSaved:
    "Once filled in, project and authors are saved in this browser for your next PDF.",
  place: {
    legend: "Where the cover lines go",
    page: {
      label: "A page of their own",
      line: "A title page, then the first file on page 2",
    },
    top: {
      label: "Top of page 1",
      line: "Above the first file, as Submitting Your Work shows",
    },
  },
  projectId: "Project ID",
  projectIdPlaceholder: "42",
  projectName: "Project name",
  projectNamePlaceholder: "Beaver Habitat Tracker",
  removeAuthor: (n) => `Remove author ${n}`,
  saved:
    "Project and authors are saved in this browser, so your next PDF starts with them.",
  title: "Cover lines",
};

/** What a blank part of the cover lines shows in the preview. */
export const blankText = {
  email: "[email]",
  name: "[Name]",
  projectId: "[ID]",
  projectName: "[project name]",
  title: "[Document title]",
};

/** Step 2: the files. */
export const filesText = {
  choose: "Choose files",
  drop: "Drop Markdown files and their images here",
  imagesAdded: "Images added:",
  kinds: ".md and .markdown, plus .png, .jpg, .gif, and .svg",
  lead: "Each Markdown file starts on a new page. Add the images your files link to as well, or drop the whole folder.",
  moveDown: (name) => `Move ${name} down`,
  moveUp: (name) => `Move ${name} up`,
  remove: (name) => `Remove ${name}`,
  skipped: (names) =>
    `Not added, since only Markdown files and images go in: ${names.join(", ")}.`,
  title: "Files, in order",
  unreadable: (names) => `Could not read: ${names.join(", ")}.`,
};

/** A file's one-line summary of what it holds. */
export function fileSummary({ code, diagrams, images, sections, tables }) {
  const parts = [
    sections && plural(sections, "section"),
    tables && plural(tables, "table"),
    code && plural(code, "code block"),
    diagrams && plural(diagrams, "Mermaid diagram"),
    images && plural(images, "image"),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Text only";
}

/** A file's warnings, one line each. */
export const fileWarning = {
  diagram: (line, message) =>
    `The Mermaid diagram on line ${line} could not be drawn: ${message}`,
  missing: (line, src) =>
    `Line ${line} links ${src}, which is not added yet. Add it to the drop zone above.`,
  noAlt: (line) => `The image on line ${line} has no alt text.`,
};

const coverGap = {
  authors: () => "at least one author",
  email: ({ author }) => `author ${author}'s email`,
  name: ({ author }) => `author ${author}'s name`,
  projectId: () => "the project ID",
  projectName: () => "the project name",
  title: () => "the document title",
};

/** Step 3's checks, by id: the line and the detail under it. */
export const checkText = {
  alt: (check) =>
    check.ok
      ? {
          detail:
            "Every image describes itself for a reader who cannot see it.",
          text: "Alt text on every image",
        }
      : {
          detail: `${check.noAlt.map((p) => `${p.file}, line ${p.line}`).join("; ")}: describe the image between the brackets of ![ ](...).`,
          text: `${plural(check.noAlt.length, "image has", "images have")} no alt text`,
        },
  cover: (check, lines, authors) => {
    if (check.ok) {
      return {
        detail: `${lines.title}, ${lines.project}, ${plural(authors, "author")}`,
        text: "Cover lines complete",
      };
    }
    const gaps = check.problems.filter((p) => p.field !== "emailFormat");
    const formats = check.problems.filter((p) => p.field === "emailFormat");
    return {
      detail: [
        gaps.length > 0 &&
          `Fill in ${list(gaps.map((p) => coverGap[p.field](p)))}.`,
        ...formats.map(
          (p) => `Author ${p.author}'s email is not an email address.`
        ),
      ]
        .filter(Boolean)
        .join(" "),
      text: "Cover lines incomplete",
    };
  },
  diagrams: (check) => {
    if (!check.ok) {
      return {
        detail: `${check.failed.map((p) => `${p.file}, line ${p.line}`).join("; ")}. Fix the diagram's syntax, or it prints as a placeholder box.`,
        text: `${plural(check.failed.length, "Mermaid diagram")} could not be drawn`,
      };
    }
    return check.count > 0
      ? {
          detail: "The diagram source does not appear in the PDF.",
          text: `${plural(check.count, "Mermaid diagram")} drawn as ${check.count === 1 ? "an image" : "images"}`,
        }
      : {
          detail: "A fenced mermaid code block prints as its diagram.",
          text: "No diagrams to draw",
        };
  },
  files: (check) =>
    check.ok
      ? {
          detail: check.names.join(", then "),
          text: `${plural(check.names.length, "file")}, each starting on a new page`,
        }
      : { detail: "Add at least one Markdown file.", text: "No files yet" },
  images: (check) =>
    check.ok
      ? {
          detail: "Each image a file links to is added.",
          text: "Every linked image found",
        }
      : {
          detail: `${check.missing.map((p) => `${p.file} links ${p.src}`).join("; ")}. Add ${check.missing.length === 1 ? "it" : "them"}, or the PDF shows a placeholder box instead.`,
          text: `${plural(check.missing.length, "image")} not found`,
        },
  status: (ok) => (ok ? "Passed" : "Warning"),
};

/** Step 3: the checks, the paper, and the save. */
export const saveText = {
  button: "Save as PDF",
  drawing: "Drawing the diagrams. Save opens once they are done.",
  help: "Opens your browser's print dialog: choose Save as PDF as the destination, and turn off headers and footers if it offers them.",
  lead: "The PDF shows the rendered document: real headings and tables, diagrams as images, and alt text on every image.",
  locked: "Opens once you add a Markdown file.",
  needs: "Complete the cover lines and add at least one file to save.",
  paper: "Paper",
  papers: { a4: "A4", letter: "US Letter" },
  title: "Check and save",
  warnings: (n) =>
    `Fix the ${plural(n, "warning")} above first, or the PDF keeps ${n === 1 ? "it" : "them"}.`,
};

/** The preview beside the steps. */
export const previewText = {
  cover: "Cover lines",
  diagramFailed: (line) => `Diagram on line ${line} could not be drawn`,
  emptyLine:
    "One page per file, in the order you set, as the PDF will print them.",
  emptyTitle: "Your pages appear here",
  missing: (src) => `${src} not found`,
  page: (n) => `Page ${n}`,
  summary: (pages, paper) => `${plural(pages, "page")}, ${paper}`,
  title: "Preview",
};
