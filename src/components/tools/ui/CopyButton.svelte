<script>
// Copies `text` to the clipboard and says so in a live region, so a screen
// reader hears the confirmation. A browser that refuses the clipboard is
// told to select and copy by hand.
import Button from "./Button.svelte";

let { label = "Copy", text, variant = "secondary" } = $props();
let status = $state("");
let timer;

async function copy() {
  clearTimeout(timer);
  try {
    await navigator.clipboard.writeText(text);
    status = "Copied.";
  } catch {
    status = "Copy failed: select the text and copy it.";
  }
  timer = setTimeout(() => {
    status = "";
  }, 4000);
}
</script>

<span class="copy">
  <Button {variant} onclick={copy}>{label}</Button>
  <span class="status" role="status">{status}</span>
</span>

<style>
  .copy {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .status {
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
</style>
