<script>
// The roster as teams with their members and sizes, and who gets no survey
// and why. `model` is rosterModel's result; the wording is in
// src/data/peer-tools.mjs.
import { rosterText as text } from "../../../data/peer-tools.mjs";
import {
  leftOutTable,
  surveyedCount,
  teamsTable,
} from "../../../lib/tools/peer-roster.mjs";
import Callout from "../ui/Callout.svelte";
import DataPreview from "../ui/DataPreview.svelte";

let { model } = $props();
const summary = $derived(model.summary);
</script>

{#if summary}
  <p>{text.surveyed({ ...surveyedCount(summary), leftOut: summary.leftOut.length })}</p>
  {#if summary.oversized.length > 0}
    <Callout title={text.oversized.title} variant="danger">
      <p>{text.oversized.body(summary.oversized)}</p>
    </Callout>
  {/if}
  <h4>{text.teams}</h4>
  <DataPreview title={text.teams} table={teamsTable(summary)} />
  {#if summary.leftOut.length > 0}
    <h4>{text.leftOut}</h4>
    <DataPreview title={text.leftOut} table={leftOutTable(summary)} />
  {/if}
{:else}
  <p class="muted">{text.empty}</p>
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
