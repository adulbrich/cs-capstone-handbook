<script>
// The tools kit's button. "primary" is filled with the accent, as
// Starlight's primary LinkButton is; "secondary" is outlined; "link" reads
// as inline text. Colors come only from Starlight's variables, so the theme
// switch restyles it. Any other attribute (onclick, disabled, aria-*) passes
// through to the <button>.
let { children, type = "button", variant = "primary", ...rest } = $props();
</script>

<button {type} class={["button", variant]} {...rest}>{@render children()}</button>

<style>
  .button {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin: 0;
    padding: 0.4rem 0.9rem;
    border: 1px solid var(--sl-color-text-accent);
    border-radius: 0.375rem;
    font: inherit;
    font-size: var(--sl-text-sm);
    line-height: 1.4;
    cursor: pointer;
  }
  .primary {
    background: var(--sl-color-text-accent);
    color: var(--sl-color-black);
  }
  .secondary {
    background: transparent;
    border-color: var(--sl-color-gray-4);
    color: var(--sl-color-white);
  }
  .secondary:hover:not(:disabled) {
    border-color: var(--sl-color-text-accent);
  }
  .link {
    padding: 0;
    border: 0;
    background: none;
    color: var(--sl-color-text-accent);
    text-decoration: underline;
  }
  .button:focus-visible {
    outline: 2px solid var(--sl-color-text-accent);
    outline-offset: 2px;
  }
  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
