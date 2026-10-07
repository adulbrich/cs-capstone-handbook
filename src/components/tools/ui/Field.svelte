<script>
// A labelled form control: the label, a line on where the value comes from
// or where it appears, the control, and an error. The control is rendered
// by `children`, which receives `{ id, describedby }` to put on the input,
// so the label and the help are tied to it.
let { children, error = "", help = "", label } = $props();
const id = $props.id();
const describedby = $derived(
  [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined
);
</script>

<div class="field">
  <label for={id}>{label}</label>
  {#if help}<p class="help" id="{id}-help">{help}</p>{/if}
  {@render children({ describedby, id })}
  {#if error}<p class="error" id="{id}-error">{error}</p>{/if}
</div>

<style>
  .field {
    display: grid;
    gap: 0.25rem;
  }
  label {
    font-weight: 600;
  }
  .help,
  .error {
    margin: 0;
    font-size: var(--sl-text-sm);
  }
  .help {
    color: var(--sl-color-gray-2);
  }
  .error {
    color: var(--sl-color-red-high);
  }
  .field :global(:is(input:not([type]), input[type="text"], input[type="email"], input[type="search"])) {
    max-width: 28rem;
    padding: 0.35rem 0.6rem;
    border: 1px solid var(--sl-color-gray-4);
    border-radius: 0.25rem;
    background: var(--sl-color-bg);
    color: var(--sl-color-white);
    font: inherit;
  }
  .field :global(input:focus-visible) {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 1px;
  }
</style>
