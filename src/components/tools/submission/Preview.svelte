<script>
// The pages as they will print. Each sheet is laid out once, unseen, at the
// paper's content width, and its parts measured; pageStarts turns those into
// page breaks by the print CSS's own rules (document.css). Each page is then
// a scaled copy of its sheet, shifted to its start and cut at the next.
// Measuring is reading the layout, so it runs after each update and when an
// image finishes loading.
import { previewText as text } from "../../../data/submission-pdf.mjs";
import { numberPages, pageStarts } from "../../../lib/tools/submission-pdf.mjs";
import Sheet from "./Sheet.svelte";

let { empty, paper, paperLabel, sheets } = $props();

let measurer = $state();
let width = $state(0);
let layout = $state.raw({});

/** Parts whose children break separately: a list's items, a table's rows. */
const OPEN = new Set(["OL", "TABLE", "TBODY", "TFOOT", "THEAD", "UL"]);
const HEADING = /^H[1-6]$/;

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
          keepWithNext: HEADING.test(part.tagName),
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
    {#if !empty}<span class="muted">{text.summary(pages.total, paperLabel)}</span>{/if}
  </div>

  {#if empty}
    <div class="empty" style:aspect-ratio="{paper.width} / {paper.height}">
      <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"></path><path d="M14 3v5h5"></path></svg>
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
                    />
                  </div>
                </div>
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
