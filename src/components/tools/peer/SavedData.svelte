<script>
// What the page keeps in this browser, a notice when it cannot, and the
// button that removes it all after a confirm. `what` says what this page
// saves (savedText in src/data/peer-tools.mjs).
import { savedText as text } from "../../../data/peer-tools.mjs";
import Button from "../ui/Button.svelte";
import Callout from "../ui/Callout.svelte";

let { storage, what } = $props();

function clear() {
  // A native confirm: modal, keyboard-ready, and read by screen readers.
  // biome-ignore lint/suspicious/noAlert: the clear needs a confirm, and the native one is accessible
  const sure = window.confirm(text.confirm);
  if (sure) {
    storage.clearAll();
  }
}
</script>

{#if storage.problem}
  <Callout title={text.notSaved} variant="caution">
    <p>{storage.problem}</p>
  </Callout>
{/if}

<div class="saved not-content">
  <p>{what} {text.after}</p>
  <Button variant="secondary" onclick={clear}>{text.clear}</Button>
</div>

<style>
  .saved {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1rem;
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
  .saved p {
    flex: 1 1 20rem;
    margin: 0;
  }
</style>
