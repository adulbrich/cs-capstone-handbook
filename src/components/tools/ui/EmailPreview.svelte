<script>
// A distribution email as one recipient receives it. `values` are the
// sample recipient's embedded data; the piped values show highlighted, the
// links as their display text. The page puts CopyButtons for the raw
// subject and body where the email goes.
import { pipedSegments } from "../../../lib/tools/piped-text.mjs";

let { body, subject, values = {} } = $props();
const subjectParts = $derived(pipedSegments(subject, values));
const bodyParts = $derived(pipedSegments(body, values));
</script>

{#snippet rendered(parts)}
  {#each parts as part, i (i)}
    {#if part.kind === "link"}
      <span class="link">{part.text}</span>
    {:else if part.kind === "field"}
      <mark>{part.text}</mark>
    {:else}
      {part.text}
    {/if}
  {/each}
{/snippet}

<div class="email">
  <p class="subject">
    <span class="what">Subject:</span>
    {@render rendered(subjectParts)}
  </p>
  <div class="body">{@render rendered(bodyParts)}</div>
</div>

<style>
  .email {
    border: 1px solid var(--sl-color-gray-5);
    border-radius: 0.5rem;
    overflow: hidden;
  }
  .subject {
    margin: 0;
    padding: 0.6rem 1rem;
    background: var(--sl-color-gray-6);
    border-bottom: 1px solid var(--sl-color-gray-5);
    color: var(--sl-color-white);
    font-weight: 600;
  }
  .what {
    font-weight: 400;
    color: var(--sl-color-gray-2);
  }
  .body {
    margin: 0;
    padding: 1rem;
    white-space: pre-wrap;
  }
  mark {
    padding: 0 0.15em;
    border-radius: 0.2em;
    background: var(--sl-color-accent-low);
    color: var(--sl-color-white);
  }
  .link {
    color: var(--sl-color-text-accent);
    text-decoration: underline;
  }
</style>
