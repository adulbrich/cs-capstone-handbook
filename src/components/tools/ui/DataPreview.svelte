<script>
// A table's first rows inline, and every row in a dialog with a sticky
// header, a sort on each column, and a text filter. The dialog is a native
// <dialog> opened with showModal(): the browser keeps focus inside it, closes
// it on Escape, and returns focus to the button that opened it. The page
// behind is locked from scrolling, and a click outside the dialog closes it,
// as Starlight's search modal (Search.astro) does. The inline table keeps
// Starlight's table styling; `table` is `{ header, rows }` (table-view.mjs).
import { nextSort, viewRows } from "../../../lib/tools/table-view.mjs";
import Button from "./Button.svelte";

let { inline = 5, table, title } = $props();
const id = $props.id();

let dialog = $state();
let filter = $state("");
let sort = $state(null);

const shown = $derived(viewRows(table.rows, { filter, sort }));
const first = $derived(table.rows.slice(0, inline));

function open() {
  dialog.showModal();
  document.body.toggleAttribute("data-tools-modal-open", true);
}

function closed() {
  document.body.toggleAttribute("data-tools-modal-open", false);
}

function backdrop(event) {
  // The frame fills the dialog, so only a click on the backdrop lands on it.
  if (event.target === dialog) {
    dialog.close();
  }
}

const ariaSort = (column) => {
  if (sort?.column !== column) {
    return "none";
  }
  return sort.direction;
};
</script>

<div class="preview">
  {#if table.rows.length === 0}
    <p class="meta">No rows.</p>
  {:else}
    <table class="inline">
      <caption class="visually-hidden">{title}, first rows</caption>
      <thead>
        <tr>
          {#each table.header as cell, c (c)}<th scope="col">{cell}</th>{/each}
        </tr>
      </thead>
      <tbody>
        {#each first as row, r (r)}
          <tr>{#each row as cell, c (c)}<td>{cell}</td>{/each}</tr>
        {/each}
      </tbody>
    </table>
    <p class="meta not-content">
      <span>
        {table.rows.length}
        {table.rows.length === 1 ? "row" : "rows"}{table.rows.length > inline
          ? `, the first ${inline} shown`
          : ""}.
      </span>
      <Button variant="secondary" onclick={open}>
        View all{table.rows.length > 1 ? ` ${table.rows.length} rows` : ""}
        <span class="visually-hidden">of {title}</span>
      </Button>
    </p>
  {/if}
</div>

<!-- Escape closes a native modal dialog; the click handler only adds the backdrop. -->
<dialog
  class="dialog"
  bind:this={dialog}
  aria-labelledby="{id}-title"
  onclose={closed}
  onclick={backdrop}
>
  <div class="frame">
    <header class="head not-content">
      <h2 id="{id}-title">{title}</h2>
      <Button variant="secondary" onclick={() => dialog.close()}>Close</Button>
    </header>
    <div class="controls not-content">
      <label for="{id}-filter">Filter rows</label>
      <input id="{id}-filter" type="search" bind:value={filter} />
      <span role="status">{shown.length} of {table.rows.length} rows shown</span>
    </div>
    <div class="scroll">
      <table class="full">
        <thead>
          <tr>
            {#each table.header as cell, c (c)}
              <th scope="col" aria-sort={ariaSort(c)}>
                <button
                  type="button"
                  class="sort"
                  onclick={() => {
                    sort = nextSort(sort, c);
                  }}
                >
                  {cell}
                  <span class="arrow" aria-hidden="true"
                    >{sort?.column === c
                      ? sort.direction === "ascending"
                        ? "▲"
                        : "▼"
                      : ""}</span
                  >
                </button>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each shown as row (row.index)}
            <tr>{#each row.cells as cell, c (c)}<td>{cell}</td>{/each}</tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</dialog>

<style>
  :global(body[data-tools-modal-open]) {
    overflow: hidden;
  }
  .preview {
    margin-top: 0.5rem;
  }
  .inline {
    font-size: var(--sl-text-sm);
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin: 0.5rem 0 0;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  .dialog {
    width: min(90rem, calc(100vw - 2rem));
    height: calc(100vh - 4rem);
    max-width: none;
    max-height: none;
    margin: 2rem auto;
    padding: 0;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    background: var(--sl-color-bg);
    color: var(--sl-color-text);
    box-shadow: var(--sl-shadow-lg);
  }
  .dialog[open] {
    display: flex;
  }
  .dialog::backdrop {
    background-color: var(--sl-color-backdrop-overlay);
    backdrop-filter: blur(0.25rem);
  }
  .frame {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 0.75rem;
    min-height: 0;
    padding: 1rem 1.25rem;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .head h2 {
    margin: 0;
    font-size: var(--sl-text-h4);
    color: var(--sl-color-white);
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    font-size: var(--sl-text-sm);
  }
  .controls input {
    padding: 0.3rem 0.6rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.25rem;
    background: var(--sl-color-bg);
    color: var(--sl-color-white);
    font: inherit;
  }
  .controls input:focus-visible,
  .sort:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 1px;
  }
  .scroll {
    flex-grow: 1;
    min-height: 0;
    overflow: auto;
    border: 1px solid var(--sl-color-gray-5);
  }
  /* Starlight makes tables blocks that scroll; this one scrolls in .scroll,
     so its header can stick. */
  .full {
    display: table;
    overflow: visible;
    width: 100%;
    margin: 0;
    font-size: var(--sl-text-sm);
    border-collapse: separate;
    border-spacing: 0;
  }
  .full th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 0;
    background: var(--sl-color-gray-6);
    border-bottom: 1px solid var(--sl-color-gray-5);
    vertical-align: bottom;
  }
  .sort {
    display: flex;
    align-items: flex-end;
    gap: 0.25rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 0;
    background: none;
    color: var(--sl-color-white);
    font: inherit;
    font-weight: 600;
    text-align: start;
    cursor: pointer;
  }
  .arrow {
    font-size: 0.7em;
    color: var(--sl-color-text-accent);
  }
  .full td {
    padding: 0.4rem 0.75rem;
    border-bottom: 1px solid var(--sl-color-gray-5);
    vertical-align: top;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
