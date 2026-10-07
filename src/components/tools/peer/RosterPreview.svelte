<script>
// The roster as teams with their members and sizes, and who gets no survey
// and why. `model` is rosterModel's result.

import { MAX_TEAM_SIZE } from "../../../lib/tools/peer-contacts.mjs";
import { leftOutTable, teamsTable } from "../../../lib/tools/peer-roster.mjs";
import Callout from "../ui/Callout.svelte";
import DataPreview from "../ui/DataPreview.svelte";

let { model } = $props();
const summary = $derived(model.summary);
const surveyed = $derived(
  summary
    ? summary.teams
        .filter((t) => t.size > 1 && t.size <= MAX_TEAM_SIZE)
        .reduce((sum, t) => sum + t.size, 0)
    : 0
);
</script>

{#if summary}
  <p>
    {surveyed} students on
    {summary.teams.filter((t) => t.size > 1 && t.size <= MAX_TEAM_SIZE).length}
    teams get the survey.
    {#if summary.leftOut.length > 0}{summary.leftOut.length} left out.{/if}
  </p>
  {#if summary.oversized.length > 0}
    <Callout title="A team is over {MAX_TEAM_SIZE}" variant="danger">
      <p>
        The survey rates up to {MAX_TEAM_SIZE} people, the respondent
        included. Split {summary.oversized.join(", ")} into smaller groups in
        Canvas and download the roster again; nothing is generated until then.
      </p>
    </Callout>
  {/if}
  <h4>Teams</h4>
  <DataPreview title="Teams" table={teamsTable(summary)} />
  {#if summary.leftOut.length > 0}
    <h4>Left out of the survey</h4>
    <DataPreview title="Left out of the survey" table={leftOutTable(summary)} />
  {/if}
{:else}
  <p class="muted">Drop the roster to see its teams.</p>
{/if}

<style>
  h4 {
    margin: 1rem 0 0;
    font-size: var(--sl-text-base);
  }
  .muted {
    color: var(--sl-color-gray-3);
  }
</style>
