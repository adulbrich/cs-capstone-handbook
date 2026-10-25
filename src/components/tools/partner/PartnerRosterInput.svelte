<script>
// The Canvas roster on both partner pages: where it comes from and the drop
// zone. Unlike the peer roster there is no form for a student from another
// section: an added student changes neither the contact list nor the
// import. `roster` is the saved file (saved.svelte.js); `parsed` is
// attempt(parseRoster) of it, or null; `replace` adds the Score page's
// Replace action. The wording is in src/data/partner-tools.mjs.
import { rosterText as text } from "../../../data/partner-tools.mjs";
import Callout from "../ui/Callout.svelte";
import ClickPath from "../ui/ClickPath.svelte";
import FileDrop from "../ui/FileDrop.svelte";

let { parsed, replace = false, roster } = $props();
</script>

{#if replace}<p>{text.scoreIntro}</p>{/if}
<ClickPath path={text.path} after={text.columns} />
<div class="not-content">
  <FileDrop
    label={text.drop}
    fileName={roster.value?.name ?? ""}
    action={replace && roster.value ? text.replace : ""}
    onfile={(file) => roster.set(file)}
  />
  {#if replace && roster.value}<p class="note">{text.replaceNote}</p>{/if}
</div>
{#if parsed?.error}
  <Callout title={text.unreadable} variant="danger">
    <pre>{parsed.error}</pre>
  </Callout>
{/if}

<style>
  .note {
    margin: 0.5rem 0 0;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
</style>
