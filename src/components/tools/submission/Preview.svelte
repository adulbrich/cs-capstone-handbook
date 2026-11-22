<script>
// The pages as they will print. Each sheet is laid out once, unseen, at the
// paper's content width, and its parts and their lines measured; pageStarts
// turns those into page breaks as Chrome's print makes them by the print
// CSS's own rules (document.css). Each page is then
// a scaled copy of its sheet, shifted to its start and cut at the next.
// Measuring is reading the layout, so it runs after each update and when an
// image finishes loading.
import { previewText as text } from "../../../data/submission-pdf.mjs";
import {
  lineBreaks,
  numberPages,
  pageStarts,
} from "../../../lib/tools/submission-pdf.mjs";
import Sheet from "./Sheet.svelte";

let { empty, paper, paperLabel, sheets, words } = $props();

/** Whether this browser prints the page number (document.css), so draws it. */
const NUMBERED = "CSSMarginRule" in window;

let measurer = $state();
let width = $state(0);
let layout = $state.raw({});

/** Parts whose children break separately: a list's items, a table's rows. */
const OPEN = new Set(["OL", "TABLE", "TBODY", "TFOOT", "THEAD", "UL"]);
const HEADING = /^H[1-6]$/u;
/** What document.css keeps on the page of the part after it: break-after: avoid. */
const keptWithNext = (part) =>
  HEADING.test(part.tagName) || part.classList.contains("file-name");

/**
 * The blocks document.css keeps whole (break-inside: avoid), but for an
 * image, whose line belongs to the paragraph it sits in.
 */
const KEPT_WHOLE = "p, li, tr, pre, blockquote, .diagram, .cover";

/**
 * Where print may start a page inside `part`, from the boxes of its text
 * and images, `{ top, bottom, chain }` from the sheet's top at `offset`,
 * `chain` numbering the KEPT_WHOLE blocks inside the part around each,
 * outermost first, and those blocks' own boxes; an svg is one box, as it
 * prints.
 */
function partLines(part, offset) {
  const state = { blocks: new Map(), count: 0, offset, out: [] };
  walk(part, [], state);
  return lineBreaks(state.out, state.blocks);
}

/** Adds the boxes of `node`'s children, inside the blocks of `chain`, to `state.out`. */
function walk(node, chain, state) {
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      addText(child, chain, state);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      addElement(child, chain, state);
    }
  }
}

const boxOf = (rect, chain, offset) => ({
  bottom: rect.bottom - offset,
  chain,
  top: rect.top - offset,
});

/** A text node's boxes, one for each line it runs over. */
function addText(node, chain, state) {
  const range = document.createRange();
  range.selectNodeContents(node);
  for (const rect of range.getClientRects()) {
    state.out.push(boxOf(rect, chain, state.offset));
  }
}

/** An image or svg as one box; any other element's boxes, inside a block of their own if KEPT_WHOLE. */
function addElement(element, chain, state) {
  if (element.matches("img, svg")) {
    state.out.push(boxOf(element.getBoundingClientRect(), chain, state.offset));
  } else if (element.matches(KEPT_WHOLE)) {
    state.count += 1;
    const rect = element.getBoundingClientRect();
    state.blocks.set(state.count, boxOf(rect, [], state.offset));
    walk(element, [...chain, state.count], state);
  } else {
    walk(element, chain, state);
  }
}

function parts(element, out = []) {
  for (const child of element.children) {
    if (OPEN.has(child.tagName)) {
      parts(child, out);
    } else {
      out.push(child);
    }
  }
  return out;
}

/** Each sheet's page starts, from its parts as laid out in the measurer. */
function measure(list, pageHeight) {
  if (!measurer) {
    return;
  }
  const next = {};
  for (const sheet of list) {
    const root = measurer.querySelector(
      `[data-sheet="${CSS.escape(sheet.id)}"] > .submission-doc`
    );
    if (root) {
      const box = root.getBoundingClientRect();
      const blocks = parts(root).map((part) => {
        const rect = part.getBoundingClientRect();
        return {
          bottom: rect.bottom - box.top,
          keepWithNext: keptWithNext(part),
          lines: partLines(part, box.top),
          top: rect.top - box.top,
        };
      });
      next[sheet.id] = pageStarts(blocks, pageHeight);
    }
  }
  layout = next;
}

// After each update to the sheets or the paper, and when an image loads.
$effect(() => measure(sheets, paper.contentHeight));

function watch(node) {
  const observer = new ResizeObserver(() =>
    measure(sheets, paper.contentHeight)
  );
  observer.observe(node);
  return () => observer.disconnect();
}

const pages = $derived.by(() => {
  const startsOf = (sheet) => layout[sheet.id] ?? [0];
  const { firsts, total } = numberPages(sheets.map((s) => startsOf(s).length));
  const list = sheets.flatMap((sheet, i) => {
    const starts = startsOf(sheet);
    return starts.map((start, k) => ({
      height: Math.min(
        (starts[k + 1] ?? Number.POSITIVE_INFINITY) - start,
        paper.contentHeight
      ),
      key: `${sheet.id}-${k}`,
      number: firsts[i] + k,
      sheet,
      start,
    }));
  });
  return { list, total };
});

const scale = $derived(width > 0 ? width / paper.width : 0);
</script>

<aside class="preview not-content" aria-labelledby="preview-heading">
  <div class="head">
    <h2 id="preview-heading">{text.title}</h2>
    {#if !empty}<span class="muted">{text.summary(pages.total, words, paperLabel)}</span>{/if}
  </div>

  {#if empty}
    <div class="empty" style:aspect-ratio="{paper.width} / {paper.height}">
      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path></svg>
      <span class="empty-title">{text.emptyTitle}</span>
      <span class="muted">{text.emptyLine}</span>
    </div>
  {:else}
    <div class="pages" bind:clientWidth={width}>
      {#each pages.list as page (page.key)}
        <figure>
          <div class="page" style:aspect-ratio="{paper.width} / {paper.height}">
            {#if scale > 0}
              <div
                class="paper"
                aria-hidden="true"
                inert
                style:width="{paper.width}px"
                style:height="{paper.height}px"
                style:transform="scale({scale})"
              >
                <div
                  class="window"
                  style:inset-block-start="{paper.margin}px"
                  style:inset-inline-start="{paper.margin}px"
                  style:width="{paper.contentWidth}px"
                  style:height="{page.height}px"
                >
                  <div style:transform="translateY({-page.start}px)">
                    <Sheet
                      copy={`p${page.number}`}
                      cover={page.sheet.cover}
                      html={page.sheet.html}
                      name={page.sheet.label}
                    />
                  </div>
                </div>
                {#if NUMBERED}
                  <div
                    class="submission-folio"
                    style:inset-block-start="{paper.height - paper.margin}px"
                    style:height="{paper.margin}px"
                  >
                    {page.number}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
          <figcaption>
            <span class="mono">{page.sheet.label}</span>
            <span>{text.page(page.number)}</span>
          </figcaption>
        </figure>
      {/each}
    </div>
  {/if}

  <div
    class="measurer"
    aria-hidden="true"
    inert
    style:width="{paper.contentWidth}px"
    bind:this={measurer}
    {@attach watch}
  >
    {#each sheets as sheet, i (sheet.id)}
      <div data-sheet={sheet.id}>
        <Sheet
          copy={`m${i}`}
          cover={sheet.cover}
          html={sheet.html}
          name={sheet.label}
        />
      </div>
    {/each}
  </div>
</aside>

<style>
  .preview {
    position: relative;
    min-width: 0;
    padding: 1.5rem;
    background: var(--sl-color-gray-6);
    border-radius: 0.75rem;
  }
  .head {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    align-items: baseline;
    justify-content: space-between;
  }
  h2 {
    margin: 0;
    font-size: var(--sl-text-h4);
    color: var(--sl-color-white);
  }
  .muted {
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  .empty {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    margin-top: 1rem;
    color: var(--sl-color-gray-2);
    text-align: center;
    border: 2px dashed var(--sl-color-gray-4);
    border-radius: 0.375rem;
  }
  .empty-title {
    font-weight: 600;
    color: var(--sl-color-white);
  }
  .pages {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-top: 1rem;
  }
  figure {
    margin: 0;
  }
  .page {
    position: relative;
    overflow: hidden;
    background: #fff;
    border-radius: 3px;
    box-shadow:
      0 1px 2px rgb(28 25 23 / 0.12),
      0 4px 14px rgb(28 25 23 / 0.08);
  }
  .paper {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    transform-origin: 0 0;
  }
  .window {
    position: absolute;
    overflow: hidden;
  }
  figcaption {
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  .mono {
    font-family: var(--__sl-font-mono, ui-monospace, monospace);
    overflow-wrap: anywhere;
  }
  .measurer {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: -100000px;
    visibility: hidden;
  }
</style>
