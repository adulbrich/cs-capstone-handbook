<script>
// A native checkbox with its label. `checked` comes from the page's state
// and `onchange` writes it back. Starlight's reset sets accent-color, so
// the box takes the site's accent in either theme with no CSS here.
let { checked = false, children, disabled = false, onchange } = $props();
</script>

<label class={["checkbox", { disabled }]}>
  <input type="checkbox" {checked} {disabled} {onchange} />
  <span>{@render children()}</span>
</label>

<style>
  /* The box keeps its size when the label wraps and centers on the first
     line, so a long label lines up with a short one. */
  .checkbox {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.5rem;
    line-height: var(--sl-line-height);
    cursor: pointer;
  }
  .checkbox input {
    flex: none;
    width: 1.1rem;
    height: 1.1rem;
    margin: calc((var(--sl-line-height) * 1em - 1.1rem) / 2) 0 0;
  }
  .disabled {
    color: var(--sl-color-gray-3);
    cursor: not-allowed;
  }
</style>
