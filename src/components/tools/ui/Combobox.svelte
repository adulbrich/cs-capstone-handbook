<script>
// A text input with a list of `options` to pick from, on Bits UI's Combobox,
// which handles the keyboard, the focus, and the ARIA attributes. The text is
// the value: it may be none of the options, so the form that uses it checks
// it. The list shows every option when opened and narrows as the reader
// types. Goes inside a Field, whose `id` and `describedby` it takes. `label`
// names the list, `open` the button that opens it; `empty` and `none` are
// what the list says when there are no options and when none matches.
import { Combobox } from "bits-ui";
import { matchingOptions } from "../../../lib/tools/option-match.mjs";

let {
  describedby,
  empty,
  id,
  label,
  none,
  open: openLabel,
  options,
  value = $bindable(""),
} = $props();

let open = $state(false);
// Whether the reader has typed since the list opened. Until then it shows
// every option, so a picked one does not hide the others.
let typed = $state(false);

const shown = $derived(typed ? matchingOptions(options, value) : options);
const message = $derived(options.length > 0 ? none : empty);

function changeOpen(next) {
  if (!next) {
    typed = false;
  }
}

// Bits UI opens the list on a key press, which pasted or dictated text does
// not have.
function input(event) {
  ({ value } = event.currentTarget);
  typed = true;
  open = true;
}

function pick(option) {
  value = option;
}
</script>

<div class="combobox">
  <Combobox.Root
    type="single"
    allowDeselect={false}
    bind:open
    inputValue={value}
    value={options.includes(value) ? value : ""}
    onOpenChange={changeOpen}
    onValueChange={pick}
  >
    <Combobox.Input {id} oninput={input}>
      {#snippet child({ props })}
        <input {...props} class="text" type="text" autocomplete="off" aria-describedby={describedby} />
      {/snippet}
    </Combobox.Input>
    <Combobox.Trigger aria-label={openLabel} tabindex={-1}>
      {#snippet child({ props })}
        <button {...props} class="open">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
        </button>
      {/snippet}
    </Combobox.Trigger>
    <Combobox.Portal>
      <Combobox.Content aria-label={label} sideOffset={4}>
        {#snippet child({ open: isOpen, props, wrapperProps })}
          {#if isOpen}
            <div {...wrapperProps}>
              <div {...props} class="list">
                <Combobox.Viewport>
                  {#each shown as option (option)}
                    <Combobox.Item value={option} label={option}>
                      {#snippet child({ props: itemProps, selected })}
                        <div {...itemProps} class="option">
                          <span>{option}</span>
                          {#if selected}
                            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>
                          {/if}
                        </div>
                      {/snippet}
                    </Combobox.Item>
                  {:else}
                    <div class="option message" role="option" aria-disabled="true" aria-selected="false">{message}</div>
                  {/each}
                </Combobox.Viewport>
              </div>
            </div>
          {/if}
        {/snippet}
      </Combobox.Content>
    </Combobox.Portal>
  </Combobox.Root>
  <span class="visually-hidden" role="status">{open && shown.length === 0 ? message : ""}</span>
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
  .open[data-state="open"] svg {
    transform: rotate(180deg);
  }
  /* In a portal at the end of <body>, above the page but under the header. */
  .list {
    z-index: var(--sl-z-index-menu);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: var(--bits-combobox-anchor-width);
    max-height: min(18rem, var(--bits-combobox-content-available-height));
    padding: 0.25rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.375rem;
    background: var(--sl-color-bg);
    box-shadow: var(--sl-shadow-md);
    outline: none;
  }
  .option {
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
  .option[data-highlighted] {
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
