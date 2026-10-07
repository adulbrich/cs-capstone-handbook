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
  .checkbox {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .checkbox input {
    width: 1.1rem;
    height: 1.1rem;
    margin: 0;
  }
  .disabled {
    color: var(--sl-color-gray-3);
    cursor: not-allowed;
  }
</style>
