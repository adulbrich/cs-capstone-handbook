// The browser half of the submission PDF builder: what needs a DOM, so
// node --test cannot run it. It sanitizes a file's HTML, points each image
// at the file the student added, draws each Mermaid diagram, and reads a
// dropped folder. The rules it applies are in src/lib/tools/.

import DOMPurify from "dompurify";
import {
  isExternal,
  resolveImage,
} from "../../../lib/tools/submission-images.mjs";

/**
 * Every id a drawn diagram carries starts with this. Each printed or
 * previewed copy of a sheet rewrites it (`copyIds`), so a diagram's arrow
 * markers point into their own copy, never into a hidden one.
 */
const DIAGRAM_ID = "sdgm-x7";

let mermaid = null;
let drawn = 0;
const diagrams = new Map();

async function loadMermaid() {
  if (!mermaid) {
    mermaid = (await import("mermaid")).default;
    // The default theme draws dark on white, as the paper is, whatever
    // theme the handbook shows. Strict keeps scripts and links out.
    mermaid.initialize({
      securityLevel: "strict",
      startOnLoad: false,
      theme: "default",
    });
  }
  return mermaid;
}

/** One diagram's SVG, `{ svg }`, or `{ error }`; each source drawn once. */
function drawDiagram(source) {
  if (!diagrams.has(source)) {
    diagrams.set(
      source,
      (async () => {
        drawn += 1;
        const id = `${DIAGRAM_ID}-${drawn}`;
        try {
          const library = await loadMermaid();
          await library.parse(source);
          const { svg } = await library.render(id, source);
          return { svg };
        } catch (error) {
          // A failed render can leave its scratch element behind.
          document.getElementById(`d${id}`)?.remove();
          const [message] = String(error?.message ?? error).split("\n");
          return { error: message };
        }
      })()
    );
  }
  return diagrams.get(source);
}

/** A sheet's HTML with every diagram id made unique to this `copy`. */
export const copyIds = (html, copy) =>
  html.replaceAll(DIAGRAM_ID, `${DIAGRAM_ID}${copy}-`);

/** A dashed box standing in for what could not be shown. */
function placeholder(text) {
  const box = document.createElement("span");
  box.className = "placeholder";
  box.textContent = text;
  return box;
}

/**
 * One file's printable HTML: `read` from readMarkdown, `path` the file's,
 * `images` the added images as `[{ path, url }]`, `text` the placeholder
 * wording. Returns `{ html, failed }`, `failed` the diagrams that could not
 * be drawn as `{ line, message }`.
 */
export async function renderFile(read, path, images, text) {
  const template = document.createElement("template");
  template.innerHTML = DOMPurify.sanitize(read.html);
  const paths = images.map((image) => image.path);

  for (const img of template.content.querySelectorAll("img")) {
    const src = img.getAttribute("src") ?? "";
    if (!isExternal(src)) {
      const found = resolveImage(src, path, paths);
      if (found) {
        img.src = images.find((image) => image.path === found).url;
      } else {
        img.replaceWith(placeholder(text.missing(src)));
      }
    }
  }

  const failed = [];
  const slots = [...template.content.querySelectorAll("[data-diagram]")];
  const diagramsHere = slots.map(
    (slot) => read.diagrams[Number(slot.dataset.diagram)]
  );
  const results = await Promise.all(
    diagramsHere.map((diagram) =>
      diagram ? drawDiagram(diagram.source) : null
    )
  );
  slots.forEach((slot, i) => {
    const diagram = diagramsHere[i];
    const result = results[i];
    if (result?.svg) {
      // Mermaid sanitizes its own output under securityLevel "strict";
      // DOMPurify would strip the foreignObject its labels need.
      slot.innerHTML = result.svg;
    } else if (diagram) {
      failed.push({ line: diagram.line, message: result.error });
      slot.replaceWith(placeholder(text.diagramFailed(diagram.line)));
    }
  });
  return { failed, html: template.innerHTML };
}

/** Folders a dropped repository holds that are never part of a submission. */
const SKIP_FOLDER = (name) => name.startsWith(".") || name === "node_modules";

const fileOf = (entry) =>
  new Promise((resolve, reject) => entry.file(resolve, reject));

/** Every entry of a folder: readEntries returns them in batches until empty. */
async function readAll(reader) {
  const batch = await new Promise((resolve, reject) =>
    reader.readEntries(resolve, reject)
  );
  return batch.length === 0 ? [] : [...batch, ...(await readAll(reader))];
}

/** One entry's files, a folder's in order, as `[{ file, folder, path }]`. */
async function walk(entry, prefix, folder) {
  if (entry.isFile) {
    return [{ file: await fileOf(entry), folder, path: prefix + entry.name }];
  }
  if (!entry.isDirectory || SKIP_FOLDER(entry.name)) {
    return [];
  }
  const children = await readAll(entry.createReader());
  const found = await Promise.all(
    children.map((child) => walk(child, `${prefix}${entry.name}/`, true))
  );
  return found.flat();
}

/**
 * The files of a drop, a dropped folder's with their path inside it, as
 * `[{ file, path, folder }]`, `folder` true for a file found in a folder.
 * The entries are taken before the first await, since the browser empties
 * the drop's list once the event returns.
 */
export async function droppedFiles(dataTransfer) {
  const items = [...(dataTransfer?.items ?? [])];
  const entries = items
    .filter((item) => item.kind === "file")
    .map((item) => item.webkitGetAsEntry?.())
    .filter(Boolean);
  if (entries.length === 0) {
    return [...(dataTransfer?.files ?? [])].map((file) => ({
      file,
      folder: false,
      path: file.name,
    }));
  }
  const found = await Promise.all(
    entries.map((entry) => walk(entry, "", false))
  );
  return found.flat();
}
