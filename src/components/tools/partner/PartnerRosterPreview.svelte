<script>
// The roster's teams with their sizes and members, and how many students
// are in no group. No left-out rule, unlike the peer roster: a team of one
// still has a partner. `parsed` is attempt(parseRoster) of the saved
// roster, or null; the wording is in src/data/partner-tools.mjs.
import { rosterText as text } from "../../../data/partner-tools.mjs";
import { rosterTeams } from "../../../lib/tools/partner-tables.mjs";
import DataPreview from "../ui/DataPreview.svelte";

let { parsed } = $props();
const teams = $derived(parsed?.value ? rosterTeams(parsed.value) : null);
</script>

{#if teams}
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
  .muted {
    margin: 0.5rem 0 0;
    font-size: var(--sl-text-sm);
    color: var(--sl-color-gray-2);
  }
</style>
