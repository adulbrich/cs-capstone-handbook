<script>
// Build Your Submission PDF: the cover lines, the files in order, then the
// checks and the save, beside a preview of the pages. Everything stays in
// the browser: the files are read here, the images shown from object URLs,
// and the PDF made by the browser's own print dialog from a print copy
// under <body> (document.css hides the rest of the page on paper). The
// project and authors are kept in localStorage for the next visit; the
// title comes from the link and is never kept.
import {
  blankText,
  checkText,
  coverText,
  fileSummary,
  filesText,
  fileWarning,
  previewText,
  saveText,
} from "../../../data/submission-pdf.mjs";
import { savedText } from "../../../data/tools-text.mjs";
import { ACCEPT, kindOf } from "../../../lib/tools/submission-images.mjs";
import { readMarkdown } from "../../../lib/tools/submission-markdown.mjs";
import {
  blankAuthor,
  COVER_KEY,
  COVER_PLACE,
  canSave,
  coverLines,
  fileProblems,
  fromSaved,
  hasSaved,
  MARGIN_INCHES,
  PAPER,
  sheets,
  submissionChecks,
  titleFromSearch,
  toSaved,
} from "../../../lib/tools/submission-pdf.mjs";
import { SUBMISSION_STORE } from "../../../lib/tools/tool-storage.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";
import Field from "../ui/Field.svelte";
import RadioCards from "../ui/RadioCards.svelte";
import { ToolStorage } from "../ui/saved.svelte.js";
import "./document.css";
import Preview from "./Preview.svelte";
import { droppedFiles, renderFile } from "./render.js";
import Sheet from "./Sheet.svelte";

const storage = new ToolStorage(SUBMISSION_STORE);
const linkTitle = titleFromSearch(window.location.search);

let nextAuthor = 0;
const withId = (author) => {
  nextAuthor += 1;
  return { ...author, id: nextAuthor };
};

const saved = fromSaved(storage.read(COVER_KEY, null));
let cover = $state({
  ...saved,
  authors: saved.authors.map(withId),
  title: linkTitle,
});
let place = $state(COVER_PLACE.top);
let paperId = $state(PAPER.letter.id);
/** The Markdown files in order, `{ path, read }`. */
let files = $state.raw([]);
/** The added images, `{ path, url }`, `url` an object URL. */
let images = $state.raw([]);
/** Each file's printable HTML and failed diagrams, by path. */
let rendered = $state.raw({});
let drawing = $state(false);
let notice = $state.raw({ skipped: [], unreadable: [] });
let dragging = $state(false);

const paper = $derived(PAPER[paperId]);
const lines = $derived(coverLines(cover, blankText));
const isSaved = $derived(hasSaved(cover));
const imagePaths = $derived(images.map((image) => image.path));
const problems = $derived(
  files.map((file) => ({
    ...fileProblems(file.read.images, file.path, imagePaths),
    diagrams: file.read.counts.diagrams,
    failed: rendered[file.path]?.failed ?? [],
    name: file.path,
  }))
);
const checks = $derived(submissionChecks(cover, problems));
const warnings = $derived(
  problems.reduce(
    (sum, p) => sum + p.missing.length + p.noAlt.length + p.failed.length,
    0
  )
);
const ready = $derived(canSave(checks) && !drawing);
const help = $derived.by(() => {
  if (!canSave(checks)) {
    return saveText.needs;
  }
  if (drawing) {
    return saveText.drawing;
  }
  return warnings > 0
    ? `${saveText.help} ${saveText.warnings(warnings)}`
    : saveText.help;
});
const sheetList = $derived(
  sheets(place, files.length).map((sheet) => {
    const file = sheet.file === null ? null : files[sheet.file];
    return {
      ...sheet,
      cover: sheet.coverOnly || sheet.coverTop ? lines : null,
      html: file ? (rendered[file.path]?.html ?? "") : "",
      id: file ? `file:${file.path}` : sheet.id,
      label: file ? file.path : previewText.cover,
    };
  })
);
const placeOptions = [COVER_PLACE.top, COVER_PLACE.page].map((value) => ({
  label: coverText.place[value].label,
  lines: [coverText.place[value].line],
  value,
}));

/** Keeps the project and authors, or forgets them once all are blank. */
function keep() {
  if (isSaved) {
    storage.write(COVER_KEY, toSaved(cover));
  } else {
    storage.remove(COVER_KEY);
  }
}

function forget() {
  storage.remove(COVER_KEY);
  cover.projectId = "";
  cover.projectName = "";
  cover.authors = [withId(blankAuthor())];
}

function addAuthor() {
  cover.authors.push(withId(blankAuthor()));
  keep();
}

function removeAuthor(id) {
  cover.authors = cover.authors.filter((author) => author.id !== id);
  keep();
}

let version = 0;

/** Draws every file again: an image added can fill a gap in any of them. */
async function renderAll() {
  version += 1;
  const mine = version;
  drawing = true;
  const list = files;
  const results = await Promise.all(
    list.map((file) => renderFile(file.read, file.path, images, previewText))
  );
  if (mine === version) {
    rendered = Object.fromEntries(list.map((f, i) => [f.path, results[i]]));
    drawing = false;
  }
}

/** Takes `found` as `{ file, path, folder }`; a same-path file replaces its row. */
async function add(found) {
  const skipped = found
    .filter((entry) => kindOf(entry.path) === null && !entry.folder)
    .map((entry) => entry.path);
  const unreadable = [];
  const markdown = found.filter((e) => kindOf(e.path) === "markdown");
  const texts = await Promise.all(
    markdown.map(({ file }) => file.text().catch(() => null))
  );
  // Built after the await, so an add that finished meanwhile is kept.
  let nextImages = images;
  for (const { file, path } of found.filter(
    (e) => kindOf(e.path) === "image"
  )) {
    const old = nextImages.find((image) => image.path === path);
    if (old) {
      URL.revokeObjectURL(old.url);
    }
    nextImages = [
      ...nextImages.filter((image) => image.path !== path),
      { path, url: URL.createObjectURL(file) },
    ];
  }
  const nextFiles = [...files];
  markdown.forEach(({ path }, i) => {
    if (texts[i] === null) {
      unreadable.push(path);
      return;
    }
    const entry = { path, read: readMarkdown(texts[i]) };
    const at = nextFiles.findIndex((f) => f.path === path);
    if (at === -1) {
      nextFiles.push(entry);
    } else {
      nextFiles[at] = entry;
    }
  });
  images = nextImages;
  files = nextFiles;
  notice = { skipped, unreadable };
  await renderAll();
}

function picked(event) {
  const input = event.currentTarget;
  add(
    [...(input.files ?? [])].map((file) => ({
      file,
      folder: false,
      path: file.name,
    }))
  );
  // Cleared, so choosing the same file again after an edit reads it again.
  input.value = "";
}

async function dropped(event) {
  event.preventDefault();
  dragging = false;
  add(await droppedFiles(event.dataTransfer));
}

function move(i, by) {
  const next = [...files];
  [next[i], next[i + by]] = [next[i + by], next[i]];
  files = next;
}

function removeFile(i) {
  files = files.filter((_, j) => j !== i);
}

/** The PDF's file name is the document title, as Save as PDF suggests it. */
function save() {
  const before = document.title;
  document.title = cover.title.trim();
  window.addEventListener(
    "afterprint",
    () => {
      document.title = before;
    },
    { once: true }
  );
  window.print();
}

/** The print copy lives under <body>, so document.css can print it alone. */
function toBody(node) {
  document.body.append(node);
  return () => node.remove();
}

const pageCss = $derived(
  `<style>@page { size: ${paper.id}; margin: ${MARGIN_INCHES}in; }</style>`
);
</script>

<svelte:head>
  {@html pageCss}
</svelte:head>

<div class="builder not-content">
  <ol class="steps">
    <li class="step" data-number="1">
      <h2>{coverText.title}</h2>
      <p class="lead">{coverText.lead}</p>

      <div class="grid">
        <div class="wide">
          <Field
            label={coverText.documentTitle}
            help={linkTitle && cover.title === linkTitle ? coverText.fromLink(linkTitle) : ""}
          >
            {#snippet children({ describedby, id })}
              <input {id} type="text" class="input" aria-describedby={describedby} bind:value={cover.title} />
            {/snippet}
          </Field>
        </div>
        <Field label={coverText.projectId}>
          {#snippet children({ describedby, id })}
            <input
              {id}
              type="text"
              inputmode="numeric"
              class="input"
              placeholder={coverText.projectIdPlaceholder}
              aria-describedby={describedby}
              bind:value={cover.projectId}
              oninput={keep}
            />
          {/snippet}
        </Field>
        <div class="span3">
          <Field label={coverText.projectName}>
            {#snippet children({ describedby, id })}
              <input
                {id}
                type="text"
                class="input"
                placeholder={coverText.projectNamePlaceholder}
                aria-describedby={describedby}
                bind:value={cover.projectName}
                oninput={keep}
              />
            {/snippet}
          </Field>
        </div>
      </div>

      <fieldset class="authors">
        <legend>{coverText.authors}</legend>
        {#each cover.authors as author, i (author.id)}
          <div class="author">
            <input
              type="text"
              class="input"
              autocomplete="name"
              aria-label={coverText.authorName(i + 1)}
              placeholder={coverText.namePlaceholder}
              bind:value={author.name}
              oninput={keep}
            />
            <input
              type="email"
              class="input"
              autocomplete="email"
              aria-label={coverText.authorEmail(i + 1)}
              placeholder={coverText.emailPlaceholder}
              bind:value={author.email}
              oninput={keep}
            />
            {#if cover.authors.length > 1}
              <button type="button" class="icon" aria-label={coverText.removeAuthor(i + 1)} onclick={() => removeAuthor(author.id)}>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>
              </button>
            {/if}
          </div>
        {/each}
        <div class="row">
          <Button variant="secondary" onclick={addAuthor}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
            {coverText.addAuthor}
          </Button>
        </div>
      </fieldset>

      {#if storage.problem}
        <Callout title={savedText.notSaved} variant="caution">
          <p>{storage.problem}</p>
        </Callout>
      {:else if isSaved}
        <div class="saved">
          <span>{coverText.saved}</span>
          <Button variant="secondary" onclick={forget}>{coverText.forget}</Button>
        </div>
      {:else}
        <p class="note">{coverText.notSaved}</p>
      {/if}

      <div class="place">
        <RadioCards legend={coverText.place.legend} name="cover-place" options={placeOptions} bind:value={place} />
      </div>
    </li>

    <li class="step" data-number="2">
      <h2>{filesText.title}</h2>
      <p class="lead">{filesText.lead}</p>

      <label
        class={["drop", { dragging }]}
        ondragenter={(event) => {
          event.preventDefault();
          dragging = true;
        }}
        ondragover={(event) => event.preventDefault()}
        ondragleave={() => {
          dragging = false;
        }}
        ondrop={dropped}
      >
        <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5"></path><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"></path></svg>
        <span class="drop-title">{filesText.drop}</span>
        <span class="muted">{filesText.kinds}</span>
        <span class="choose" aria-hidden="true">{filesText.choose}</span>
        <input type="file" multiple accept={ACCEPT} aria-label={filesText.choose} onchange={picked} />
      </label>

      {#if notice.skipped.length > 0}
        <p class="note" role="status">{filesText.skipped(notice.skipped)}</p>
      {/if}
      {#if notice.unreadable.length > 0}
        <p class="note" role="alert">{filesText.unreadable(notice.unreadable)}</p>
      {/if}

      {#if files.length > 0}
        <ol class="files">
          {#each files as file, i (file.path)}
            {@const p = problems[i]}
            <li class="file">
              <span class="pos">{i + 1}</span>
              <div class="file-body">
                <div class="mono name">{file.path}</div>
                <div class="muted">{fileSummary(file.read.counts)}</div>
                {#each p.missing as m}
                  <p class="warn">{fileWarning.missing(m.line, m.src)}</p>
                {/each}
                {#each p.noAlt as m}
                  <p class="warn">{fileWarning.noAlt(m.line)}</p>
                {/each}
                {#each p.failed as m}
                  <p class="warn">{fileWarning.diagram(m.line, m.message)}</p>
                {/each}
              </div>
              <div class="actions">
                <button type="button" class="icon" aria-label={filesText.moveUp(file.path)} disabled={i === 0} onclick={() => move(i, -1)}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"></path></svg>
                </button>
                <button type="button" class="icon" aria-label={filesText.moveDown(file.path)} disabled={i === files.length - 1} onclick={() => move(i, 1)}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
                </button>
                <button type="button" class="icon" aria-label={filesText.remove(file.path)} onclick={() => removeFile(i)}>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"></path></svg>
                </button>
              </div>
            </li>
          {/each}
        </ol>
      {/if}
      {#if images.length > 0}
        <p class="note">
          {filesText.imagesAdded}
          {#each images as image, i (image.path)}<span class="mono">{image.path}</span>{i < images.length - 1 ? ", " : ""}{/each}
        </p>
      {/if}
    </li>

    <li class={["step", { locked: files.length === 0 }]} data-number="3">
      <h2>{saveText.title}</h2>
      {#if files.length === 0}
        <p class="lead">{saveText.locked}</p>
      {:else}
        <p class="lead">{saveText.lead}</p>
        <ul class="checks">
          {#each checks as check (check.id)}
            {@const line = checkText[check.id](check, lines, cover.authors.length)}
            <li>
              {#if check.ok}
                <svg role="img" aria-label={checkText.status(true)} class="ok" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M8 12.5l2.7 2.7L16 9.8"></path></svg>
              {:else}
                <svg role="img" aria-label={checkText.status(false)} class="bad" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 17h-19z"></path><path d="M12 10v4M12 17.5v.01"></path></svg>
              {/if}
              <div>
                <div class="check-text">{line.text}</div>
                <div class="muted detail">{line.detail}</div>
              </div>
            </li>
          {/each}
        </ul>
        <div class="save">
          <label class="paper">
            {saveText.paper}
            <select class="input" bind:value={paperId}>
              {#each Object.values(PAPER) as option (option.id)}
                <option value={option.id}>{saveText.papers[option.id]}</option>
              {/each}
            </select>
          </label>
          <Button disabled={!ready} onclick={save} aria-describedby="save-help">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"></path><path d="M14 3v5h5M12 11v6M9 14l3 3 3-3"></path></svg>
            {saveText.button}
          </Button>
        </div>
        <p class="note" id="save-help">{help}</p>
      {/if}
    </li>
  </ol>

  <div class="preview-column">
    <Preview empty={files.length === 0} {paper} paperLabel={saveText.papers[paper.id]} sheets={sheetList} />
  </div>
</div>

<div class="print-holder">
  <div class="submission-print" {@attach toBody}>
    {#each sheetList as sheet, i (sheet.id)}
      <Sheet copy={`print${i}`} cover={sheet.cover} coverOnly={sheet.coverOnly} html={sheet.html} />
    {/each}
  </div>
</div>

<style>
  .builder {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
    align-items: flex-start;
    margin-top: 2rem;
  }
  .steps {
    flex: 999 1 32rem;
    min-width: 0;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .preview-column {
    flex: 1 1 22rem;
    min-width: 0;
  }
  @media (min-width: 72rem) {
    .preview-column {
      position: sticky;
      inset-block-start: calc(var(--sl-nav-height) + 1rem);
      max-height: calc(100vh - var(--sl-nav-height) - 2rem);
      overflow-y: auto;
      border-radius: 0.75rem;
    }
  }

  /* The bullet and guideline, as the kit's Step draws them. */
  .step {
    --bullet-size: 2rem;
    position: relative;
    padding-inline-start: calc(var(--bullet-size) + 1.25rem);
    padding-bottom: 2.25rem;
  }
  .step::before {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    width: var(--bullet-size);
    height: var(--bullet-size);
    font-size: var(--sl-text-sm);
    font-weight: 700;
    line-height: var(--bullet-size);
    color: var(--sl-color-black);
    text-align: center;
    content: attr(data-number);
    background: var(--sl-color-text-accent);
    border-radius: 99rem;
  }
  .step::after {
    position: absolute;
    inset-block: calc(var(--bullet-size) + 0.5rem) 0.5rem;
    inset-inline-start: calc((var(--bullet-size) - 1px) / 2);
    width: 1px;
    content: "";
    background: var(--sl-color-hairline-light);
  }
  .step:last-child {
    padding-bottom: 0;
  }
  .step:last-child::after {
    display: none;
  }
  .locked::before {
    color: var(--sl-color-gray-2);
    background: var(--sl-color-gray-5);
  }
  .locked h2 {
    color: var(--sl-color-gray-2);
  }
  h2 {
    margin: 0;
    font-size: var(--sl-text-h4);
    line-height: 2rem;
    color: var(--sl-color-white);
  }
  .lead {
    margin: 0.25rem 0 1rem;
    color: var(--sl-color-gray-2);
  }
  .muted,
  .note {
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  .note {
    margin: 1rem 0 0;
  }
  .mono {
    font-family: var(--__sl-font-mono, ui-monospace, monospace);
    overflow-wrap: anywhere;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }
  .wide {
    grid-column: span 4;
  }
  .span3 {
    grid-column: span 3;
  }
  .input {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    min-height: 2.75rem;
    padding: 0 0.75rem;
    font: inherit;
    color: var(--sl-color-white);
    background: var(--sl-color-black);
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.375rem;
  }
  .grid :global(input.input) {
    max-width: none;
    min-height: 2.75rem;
  }
  .input:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 1px;
  }
  .authors {
    display: grid;
    gap: 0.6rem;
    padding: 0;
    margin: 1.25rem 0 0;
    border: 0;
  }
  legend {
    padding: 0;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  .author {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 2.75rem;
    gap: 0.6rem;
    align-items: center;
  }
  .row {
    margin-top: 0.15rem;
  }
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    color: var(--sl-color-gray-2);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.375rem;
  }
  .icon:hover:not(:disabled) {
    color: var(--sl-color-white);
    border-color: var(--sl-color-text-accent);
  }
  .icon:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .icon:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
  .saved {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    align-items: center;
    padding: 0.5rem 0.5rem 0.5rem 0.9rem;
    margin-top: 1rem;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
    background: var(--sl-color-gray-6);
    border-radius: 0.5rem;
  }
  .saved span {
    flex: 1 1 16rem;
  }
  .place {
    margin-top: 1.25rem;
  }
  .place :global(.cards) {
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  }

  .drop {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    padding: 1.5rem;
    color: var(--sl-color-gray-2);
    text-align: center;
    cursor: pointer;
    background: var(--sl-color-gray-7, var(--sl-color-bg));
    border: 2px dashed var(--sl-color-gray-4);
    border-radius: 0.625rem;
  }
  .drop:focus-within {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .dragging {
    background: var(--sl-color-accent-low);
    border-color: var(--sl-color-text-accent);
  }
  .drop-title {
    font-weight: 600;
    color: var(--sl-color-white);
  }
  .choose {
    display: inline-flex;
    align-items: center;
    min-height: 2.5rem;
    padding: 0 1rem;
    margin-top: 0.25rem;
    font-weight: 600;
    color: var(--sl-color-white);
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.375rem;
  }
  .drop input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }
  .files {
    display: grid;
    gap: 0.6rem;
    padding: 0;
    margin: 1rem 0 0;
    list-style: none;
  }
  .file {
    display: flex;
    flex-wrap: wrap;
    gap: 0.9rem;
    align-items: flex-start;
    padding: 0.75rem 0.75rem 0.75rem 1rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
  }
  .pos {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    margin-top: 0.1rem;
    font-size: var(--sl-text-sm);
    font-weight: 700;
    background: var(--sl-color-gray-6);
    border-radius: 0.375rem;
  }
  .file-body {
    flex: 1 1 12rem;
    min-width: 0;
  }
  .name {
    font-weight: 600;
    color: var(--sl-color-white);
  }
  .warn {
    padding: 0.5rem 0.6rem;
    margin: 0.5rem 0 0;
    font-size: var(--sl-text-sm);
    line-height: 1.4;
    color: var(--sl-color-orange-high);
    background: var(--sl-color-orange-low);
    border-radius: 0.375rem;
  }
  .actions {
    display: flex;
    flex: none;
    gap: 0.25rem;
  }

  .checks {
    padding: 0;
    margin: 0;
    overflow: hidden;
    list-style: none;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
  }
  .checks li {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    padding: 0.75rem 1rem;
  }
  .checks li + li {
    border-top: 1px solid var(--sl-color-gray-5);
  }
  .checks svg {
    flex: none;
    margin-top: 0.1rem;
  }
  .ok {
    color: var(--sl-color-green-high);
  }
  .bad {
    color: var(--sl-color-orange-high);
  }
  .check-text {
    font-weight: 600;
    color: var(--sl-color-white);
  }
  .detail {
    margin-top: 0.1rem;
    overflow-wrap: anywhere;
  }
  .save {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
    margin-top: 1.25rem;
  }
  .paper {
    display: grid;
    gap: 0.25rem;
    font-weight: 600;
  }
  .paper .input {
    min-width: 9rem;
    font-weight: 400;
  }
  .save :global(.button) {
    min-height: 2.75rem;
    padding-inline: 1.25rem;
    font-size: var(--sl-text-base);
    font-weight: 600;
  }
  .print-holder {
    display: contents;
  }
</style>
