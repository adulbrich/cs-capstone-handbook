<script>
// A text input with a list of `options` to pick from. The text is the value:
// it may be none of the options, so the form that uses it checks it. The list
// shows every option when opened and narrows as the reader types. Focus stays
// in the input, and src/lib/tools/combobox-keys.mjs says what each key does.
// Goes inside a Field, whose `id` and `describedby` it takes. `listLabel`
// names the list, `openLabel` the button that opens it, and `none` is what
// the list says when it has no option to show.
import { tick } from "svelte";
import { NONE, pressKey } from "../../../lib/tools/combobox-keys.mjs";
import { matchingOptions } from "../../../lib/tools/option-match.mjs";

let {
  describedby,
  id,
  listLabel,
  none,
  openLabel,
  options,
  value = $bindable(""),
} = $props();

let input = $state();
let list = $state();
let open = $state(false);
/** The option the arrow keys are on: itself, since `options` can change. */
let activeOption = $state(null);
// Whether the reader has typed since the list opened. Until then it shows
// every option, so a picked one does not hide the others.
let typed = $state(false);

const shown = $derived(typed ? matchingOptions(options, value) : options);
const active = $derived(shown.indexOf(activeOption));
const listId = $derived(`${id}-list`);
const optionId = (i) => `${id}-option-${i}`;

function show() {
  open = true;
}

function hide() {
  open = false;
  activeOption = null;
  typed = false;
}

function toggle() {
  if (open) {
    hide();
  } else {
    show();
  }
  input.focus();
}

function pick(option) {
  value = option;
  hide();
}

function edit(event) {
  ({ value } = event.currentTarget);
  activeOption = null;
  typed = true;
  show();
}

async function press(event) {
  const next = pressKey(event, {
    active,
    count: shown.length,
    open,
    selected: shown.indexOf(value),
  });
  if (!next) {
    return;
  }
  if (next.prevent) {
    event.preventDefault();
  }
  if (next.picked !== NONE) {
    pick(shown[next.picked]);
  } else if (next.open) {
    activeOption = shown[next.active] ?? null;
    show();
    await tick();
    list?.children[active]?.scrollIntoView({ block: "nearest" });
  } else {
    hide();
  }
}

/** Closes the list when focus leaves the input and its button. */
function leave(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    hide();
  }
}

/** Keeps focus in the input through a press on the list or the button. */
function keepFocus(event) {
  event.preventDefault();
}

/** Brings a list that opens past the window's edge into view. */
function reveal(node) {
  node.scrollIntoView({ block: "nearest" });
}
</script>

<div class="combobox" onfocusout={leave}>
  <input
    {id}
    {value}
    class="text"
    type="text"
    role="combobox"
    autocomplete="off"
    aria-activedescendant={active === NONE ? undefined : optionId(active)}
    aria-autocomplete="list"
    aria-controls={open ? listId : undefined}
    aria-describedby={describedby}
    aria-expanded={open}
    bind:this={input}
    onclick={show}
    oninput={edit}
    onkeydown={press}
  />
  <button
    type="button"
    class="open"
    tabindex="-1"
    aria-controls={open ? listId : undefined}
    aria-expanded={open}
    aria-label={openLabel}
    onclick={toggle}
    onmousedown={keepFocus}
  >
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
  </button>
  {#if open}
    <div
      class="list"
      id={listId}
      role="listbox"
      tabindex="-1"
      aria-label={listLabel}
      bind:this={list}
      onmousedown={keepFocus}
      {@attach reveal}
    >
      {#each shown as option, i (option)}
        <!-- The input has the keys: an option never takes focus. -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
          class={["option", { active: i === active }]}
          id={optionId(i)}
          role="option"
          tabindex="-1"
          aria-selected={option === value}
          onclick={() => pick(option)}
        >
          <span>{option}</span>
          {#if option === value}
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
          {/if}
        </div>
      {:else}
        <div class="message" role="option" tabindex="-1" aria-disabled="true" aria-selected="false">{none}</div>
      {/each}
    </div>
  {/if}
  <span class="visually-hidden" role="status">{open && shown.length === 0 ? none : ""}</span>
</div>

<style>
  .combobox {
    position: relative;
    max-width: 28rem;
  }
  /* Beats Field's own input padding, to leave room for the button. */
  .combobox .text[type="text"] {
    width: 100%;
    padding-inline-end: 2.5rem;
  }
  .open {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    color: var(--sl-color-gray-2);
    cursor: pointer;
  }
  .open:hover {
    color: var(--sl-color-white);
  }
  .open svg {
    transition: transform 0.15s;
  }
  .open[aria-expanded="true"] svg {
    transform: rotate(180deg);
  }
  .list {
    position: absolute;
    inset-block-start: calc(100% + 0.25rem);
    inset-inline: 0;
    z-index: var(--sl-z-index-menu);
    box-sizing: border-box;
    max-height: 18rem;
    padding: 0.25rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.375rem;
    background: var(--sl-color-bg);
    box-shadow: var(--sl-shadow-md);
  }
  .option,
  .message {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    border-radius: 0.25rem;
    color: var(--sl-color-white);
    font-size: var(--sl-text-sm);
    line-height: 1.4;
    cursor: pointer;
    user-select: none;
  }
  .option span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .option svg {
    flex: none;
    color: var(--sl-color-text-accent);
  }
  /* The pointer's cue, apart from the active option's: Enter takes only that. */
  .option:hover {
    background: var(--sl-color-gray-6);
  }
  .option.active {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: -2px;
    background: var(--sl-color-accent-low);
    color: var(--sl-color-accent-high);
  }
  .message {
    color: var(--sl-color-gray-2);
    cursor: default;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  @media (prefers-reduced-motion: reduce) {
    .open svg {
      transition: none;
    }
  }
</style>
