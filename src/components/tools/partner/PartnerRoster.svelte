<script>
// The Canvas roster on both partner pages: where it comes from, the drop
// zone, and its teams. Unlike the peer roster there is no left-out rule and
// no added student: a team of one still has a partner, and an added student
// changes neither the contact list nor the import. `roster` is the saved
// file (saved.svelte.js); `parsed` is attempt(parseRoster) of it, or null;
// `replace` adds the Score page's Replace action. The wording is in
// src/data/partner-tools.mjs.
import { rosterText as text } from "../../../data/partner-tools.mjs";
import { rosterTeams } from "../../../lib/tools/partner-tables.mjs";
import Callout from "../ui/Callout.svelte";
import ClickPath from "../ui/ClickPath.svelte";
import DataPreview from "../ui/DataPreview.svelte";
import FileDrop from "../ui/FileDrop.svelte";

let { parsed, replace = false, roster, view = "source" } = $props();
const teams = $derived(parsed?.value ? rosterTeams(parsed.value) : null);
</script>

{#if view === "source"}
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
{:else if teams}
  <h4>{text.teams}</h4>
  <DataPreview title={text.teams} table={teams.table} />
  {#if teams.noGroup > 0}<p class="muted">{text.noGroup(teams.noGroup)}</p>{/if}
{:else}
  <p class="muted">{text.empty}</p>
{/if}

<style>
  h4 {
    margin: 1rem 0 0;
    font-size: var(--sl-text-base);
  }
  .note,
  .muted {
    margin: 0.5rem 0 0;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
</style>
